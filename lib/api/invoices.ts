import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, InvoicesKeys, JobKeys } from './keys';
import { useJobStore } from '@/app/stores/job-store';
import { toast } from 'sonner';
import { CreateInvoiceResponseDTO } from '@/lib/types/job';
import { useInvoiceRetryProgressStore } from '@/app/stores/invoice-retry-progress-store';

export type InvoicesListParams = {
  /** 0-based page index from UI tables (converted to 1-based for the API). */
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
};

const INVOICE_COLUMN_TO_API_SORT: Record<string, string> = {
  invoice: 'invoiceNumber',
  amount: 'amount',
  'Due Date': 'dueDate',
};

export function toInvoiceApiSortParams(
  sorting: {
    id: string;
    desc: boolean;
  }[],
): Pick<InvoicesListParams, 'sortBy' | 'sortOrder'> {
  const sort = sorting[0];
  if (!sort) {
    return { sortBy: 'invoiceNumber', sortOrder: 'asc' };
  }

  return {
    sortBy: INVOICE_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
    sortOrder: sort.desc ? 'desc' : 'asc',
  };
}

/** Invoices API pagination is 1-based (page 1 = first page). */
function toApiPage(page: number): number {
  return page + 1;
}

export const InvoicesListQueryOptions = (
  jobId: number,
  params?: InvoicesListParams,
) =>
  queryOptions({
    queryKey: [...InvoicesKeys.list(jobId), params],
    queryFn: () =>
      APIClient.invoices.getAll(jobId, {
        ...params,
        page: params?.page !== undefined ? toApiPage(params.page) : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const InvoiceByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: InvoicesKeys.detail(id),
    queryFn: () => APIClient.invoices.getById(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateInvoice = (options?: {
  jobId?: number;
  onSuccess?: (invoiceId: number | undefined) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      mode: 'INDIVIDUAL' | 'BULK';
      docketIds: number[];
      inclDeliveryCost: boolean;
    }) => APIClient.invoices.create(data),
    onSuccess: (data: CreateInvoiceResponseDTO) => {
      toast.success('Invoices created successfully');
      const invoiceId = data?.invoices?.[0]?.internalInvoiceId;
      options?.onSuccess?.(invoiceId);
    },
    onError: (error) => {
      toast.error('Failed to create invoices');
      console.error('Failed to create invoices:', error);
      options?.onError?.(error);
    },
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: InvoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      const jobIdToRefresh =
        options?.jobId ?? useJobStore.getState().selectedJob?.id;
      if (jobIdToRefresh) {
        try {
          const updatedJob = await APIClient.jobs.getJobItems(jobIdToRefresh);
          useJobStore.getState().setSelectedJob(updatedJob);
        } catch {
          useJobStore.getState().setSelectedJob(null);
        }
      }
    },
  });
};

export const useRetrySync = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['retrySync'],
    mutationFn: (jobId: number) => {
      useInvoiceRetryProgressStore.getState().startRetry();
      return APIClient.invoices.retrySync(jobId);
    },
    onSuccess: (response) => {
      useInvoiceRetryProgressStore.getState().completeRetry(response);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      useInvoiceRetryProgressStore.getState().failRetry(error.message);
      toast.error('Failed to retry sync');
      console.error('Failed to retry sync:', error);
      options?.onError?.(error);
    },
  });
};

export const InvoiceUrlQueryOptions = (id: number) =>
  queryOptions({
    queryKey: InvoicesKeys.url(id),
    queryFn: () => APIClient.invoices.getUrl(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const InvoicePdfQueryOptions = (id: number) =>
  queryOptions({
    queryKey: InvoicesKeys.pdf(id),
    queryFn: () => APIClient.invoices.getPdf(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const usePullFromAccSoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: InvoicesKeys.all });
    },
    mutationFn: () => APIClient.invoices.pullFromAccSoftware(),
  });
};
