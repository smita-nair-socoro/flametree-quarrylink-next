import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { QuotationKeys } from './keys';
import { QuotationDTO } from '../types/quotation';

export const QuotationsListQueryOptions = () =>
  queryOptions({
    queryKey: QuotationKeys.list(),
    queryFn: () => APIClient.quotations.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const QuotationDetailQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: QuotationKeys.detail(quotationId),
    queryFn: () => APIClient.quotations.getById(quotationId),
    staleTime: 5_000,
    enabled: !!quotationId && quotationId > 0,
  });

/**
 * Mutation hook for creating a new quotation.
 * Automatically invalidates the quotations list cache on success.
 */
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<QuotationDTO>) =>
      APIClient.quotations.create(data),

    onSuccess: () => {
      // Invalidate and refetch quotations list to show the new quotation
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};
