import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { InvoicesKeys, PaymentsKeys } from './keys';
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
    mutationFn: (invoiceId: number) => APIClient.invoices.retryOne(invoiceId),
    onSuccess: () => {
      toast.success('Retry started');
      queryClient.invalidateQueries({ queryKey: InvoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: PaymentsKeys.all });
    },
    onError: (error) => {
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
