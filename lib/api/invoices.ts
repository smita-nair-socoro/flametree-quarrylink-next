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
