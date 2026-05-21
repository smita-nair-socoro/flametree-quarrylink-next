import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { InvoicesKeys } from './keys';
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
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dockets'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to create invoices');
      console.error('Failed to create invoices:', error);
      options?.onError?.(error);
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
