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

export const InvoicesListQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: InvoicesKeys.list(jobId),
    queryFn: () => APIClient.invoices.getAll(jobId),
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
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      mode: 'INDIVIDUAL' | 'BULK';
      docketIds: number[];
      inclDeliveryCost: boolean;
    }) => APIClient.invoices.create(data),
    onSuccess: () => {
      toast.success('Invoices created successfully');
      options?.onSuccess?.();
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
    mutationFn: (jobId: number) => APIClient.invoices.retrySync(jobId),
    onSuccess: () => {
      toast.success('Retry sync successful');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
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
