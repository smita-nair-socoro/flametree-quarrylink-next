import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { QuotationKeys } from './keys';
import { QuotationDTO, QuotationLineItem } from '../types/quotation';
import { convertKeysToSnakeCase } from '../utils/case-conversion';

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

export const QuotationWithLineItemsQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: [...QuotationKeys.detail(quotationId), 'with-line-items'],
    queryFn: () => APIClient.quotations.getWithQuoteItems(quotationId),
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
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};

/**
 * Mutation hook for updating an existing quotation.
 * Automatically invalidates the quotations list and detail cache on success.
 */
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuotationDTO> }) =>
      APIClient.quotations.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: [...QuotationKeys.detail(data.id), 'with-line-items'] });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};

/**
 * Mutation hook for extending the expiry date of a quotation.
 * Automatically invalidates the quotations list and detail cache on success.
 */
export const useExtendExpiryDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, expiryDate }: { id: number; expiryDate: Date }) =>
      APIClient.quotations.extendExpiryDate(id, expiryDate),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: [...QuotationKeys.detail(data.id), 'with-line-items'] });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};

/**
 * Mutation hook for creating a new quote item.
 * Automatically invalidates the quotations cache on success.
 *
 * Note: product_id, quarry_id, and quarry_product_id are temporarily defaulted to 1
 * until the backend implementation is complete.
 */
export const useCreateQuoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<QuotationLineItem>) => {
      const dataWithDefaults = {
        ...data,
        productId: data.productId || 1,
        quarryId: data.quarryId || 1,
        quarryProductId: data.quarryProductId || 1,
      };
      const response = await APIClient.quotations.createQuoteItem(dataWithDefaults);
      return convertKeysToSnakeCase(response) as QuotationLineItem;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.detail(data.quoteId) });
      queryClient.invalidateQueries({ queryKey: [...QuotationKeys.detail(data.quoteId), 'with-line-items'] });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};
