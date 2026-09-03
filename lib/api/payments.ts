import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, InvoicesKeys, PaymentsKeys } from './keys';
import { useInvoiceRetryProgressStore } from '@/app/stores/invoice-retry-progress-store';
import { toast } from 'sonner';

export type PaymentsListParams = {
  search?: string;
  fromDate?: string;
  toDate?: string;
  failedOnly?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
};

function toApiPage(page: number): number {
  return page + 1;
}

function withApiPage(params?: PaymentsListParams): PaymentsListParams {
  if (!params) return {};
  return {
    ...params,
    page: params.page !== undefined ? toApiPage(params.page) : undefined,
  };
}

export const PaymentsInvoicesQueryOptions = (params?: PaymentsListParams) =>
  queryOptions({
    queryKey: InvoicesKeys.payments(params),
    queryFn: () => APIClient.invoices.listPayments(withApiPage(params)),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const PaymentsInvoiceStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: InvoicesKeys.statistics(),
    queryFn: () => APIClient.invoices.statistics(),
    staleTime: 5_000,
  });

export const PaymentsCashSalesQueryOptions = (params?: PaymentsListParams) =>
  queryOptions({
    queryKey: PaymentsKeys.cashSales(params),
    queryFn: () => APIClient.payments.cashSales(withApiPage(params)),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const PaymentsInternalTransfersQueryOptions = (
  params?: PaymentsListParams,
) =>
  queryOptions({
    queryKey: PaymentsKeys.internalTransfers(params),
    queryFn: () => APIClient.payments.internalTransfers(withApiPage(params)),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const PaymentsFailedCountQueryOptions = () =>
  queryOptions({
    queryKey: PaymentsKeys.failedCount(),
    queryFn: () => APIClient.payments.failedCount(),
    staleTime: 15_000,
  });

export const useRetryInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: number) => {
      useInvoiceRetryProgressStore.getState().startRetry();
      return APIClient.invoices.retryOne(invoiceId);
    },
    onSuccess: (response) => {
      useInvoiceRetryProgressStore.getState().completeRetry(response);
      queryClient.invalidateQueries({ queryKey: InvoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: PaymentsKeys.all });
    },
    onError: (error) => {
      useInvoiceRetryProgressStore.getState().failRetry(error.message);
      toast.error('Failed to retry invoice sync');
      console.error(error);
    },
  });
};

export const useRetryInternalTransferJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (journalId: number) =>
      APIClient.payments.retryInternalTransferJournal(journalId),
    onSuccess: () => {
      toast.success('Retry started');
      queryClient.invalidateQueries({ queryKey: PaymentsKeys.all });
    },
    onError: (error) => {
      toast.error('Failed to retry journal sync');
      console.error(error);
    },
  });
};

export const JobCashSalesQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: PaymentsKeys.cashSalesByJob(jobId),
    queryFn: () => APIClient.payments.cashSalesByJob(jobId),
    enabled: jobId > 0,
    staleTime: 5_000,
  });

export const CashSaleDetailQueryOptions = (id: number | null) =>
  queryOptions({
    queryKey: PaymentsKeys.cashSaleDetail(id ?? 0),
    queryFn: () => APIClient.payments.cashSale(id!),
    enabled: !!id,
    staleTime: 5_000,
  });

function invalidateCashSales(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: PaymentsKeys.all });
  queryClient.invalidateQueries({ queryKey: InvoicesKeys.all });
  queryClient.invalidateQueries({ queryKey: DocketKeys.all });
}

export const useCreateCashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { docketIds: number[]; paymentType: string }) =>
      APIClient.payments.createCashSale(data),
    onSuccess: () => {
      toast.success('Cash sale recorded');
      invalidateCashSales(queryClient);
    },
    onError: (error) => {
      toast.error('Failed to record cash sale');
      console.error(error);
    },
  });
};

export const useAmendCashSalePaymentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentType }: { id: number; paymentType: string }) =>
      APIClient.payments.amendCashSalePaymentType(id, paymentType),
    onSuccess: () => {
      toast.success('Payment type updated');
      invalidateCashSales(queryClient);
    },
    onError: (error) => {
      toast.error('Failed to amend payment type');
      console.error(error);
    },
  });
};

export const useVoidCashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      reasonDetail,
    }: {
      id: number;
      reason: string;
      reasonDetail?: string;
    }) => APIClient.payments.voidCashSale(id, { reason, reasonDetail }),
    onSuccess: () => {
      toast.success('Cash sale voided');
      invalidateCashSales(queryClient);
    },
    onError: (error) => {
      toast.error('Failed to void cash sale');
      console.error(error);
    },
  });
};

export const useRetryCashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.payments.retryCashSale(id),
    onSuccess: () => {
      toast.success('Retry started');
      invalidateCashSales(queryClient);
    },
    onError: (error) => {
      toast.error('Failed to retry cash sale sync');
      console.error(error);
    },
  });
};
