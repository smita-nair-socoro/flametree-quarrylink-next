import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { QuotationKeys } from './keys';
import { QuotationDTO, QuotationLineItem } from '../types/quotation';
import { convertKeysToCamelCase } from '../utils/case-conversion';

export const QuotationsListQueryOptions = () =>
  queryOptions({
    queryKey: QuotationKeys.list(),
    queryFn: async () =>
      convertKeysToCamelCase(await APIClient.quotations.getAll()),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const QuotationDetailQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: QuotationKeys.detail(quotationId),
    queryFn: async () =>
      convertKeysToCamelCase(await APIClient.quotations.getById(quotationId)),
    staleTime: 5_000,
    enabled: !!quotationId && quotationId > 0,
  });

export const QuotationWithLineItemsQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: [...QuotationKeys.detail(quotationId), 'with-line-items'],
    queryFn: async () => {
      const data = await APIClient.quotations.getWithQuoteItems(quotationId);
      console.log('🔍 [QuotationWithLineItems] Raw API Response:', data);
      const converted = convertKeysToCamelCase(data);
      return converted;
    },
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
    mutationFn: (data: Partial<QuotationDTO>) =>
      APIClient.quotations.update(data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({
        queryKey: QuotationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...QuotationKeys.detail(data.id), 'with-line-items'],
      });
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
      queryClient.invalidateQueries({
        queryKey: QuotationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...QuotationKeys.detail(data.id), 'with-line-items'],
      });
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
        quarrySupplierId: data.quarrySupplierId || 1,
        quarryProductId: data.quarryProductId || 1,
      };
      const response = await APIClient.quotations.createQuoteItem(
        dataWithDefaults
      );
      return convertKeysToCamelCase(response) as QuotationLineItem;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({
        queryKey: QuotationKeys.detail(data.quoteId),
      });
      queryClient.invalidateQueries({
        queryKey: [...QuotationKeys.detail(data.quoteId), 'with-line-items'],
      });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};

/**
 * Mutation hook for updating an existing quote item.
 * Automatically invalidates the quotations cache on success.
 */
export const useUpdateQuoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<QuotationLineItem>;
    }) => {
      const response = await APIClient.quotations.updateQuoteItem(id, data);
      return convertKeysToCamelCase(response) as QuotationLineItem;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({
        queryKey: QuotationKeys.detail(data.quoteId),
      });
      queryClient.invalidateQueries({
        queryKey: [...QuotationKeys.detail(data.quoteId), 'with-line-items'],
      });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};

/**
 * Mutation hook for deleting a quote item.
 * Automatically invalidates the quotations cache on success.
 */
export const useDeleteQuoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quoteId }: { id: number; quoteId: number }) => {
      await APIClient.quotations.deleteQuoteItem(id);
      return { id, quoteId };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({
        queryKey: QuotationKeys.detail(data.quoteId),
      });
      queryClient.invalidateQueries({
        queryKey: [...QuotationKeys.detail(data.quoteId), 'with-line-items'],
      });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};
