import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { QuotationKeys } from './keys';
import {
  PublicQuoteLinkResponse,
  QuotationDTO,
  QuotationLineItem,
} from '../types/quotation';
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

export const fetchPublicQuoteByToken = async (
  token: string
): Promise<PublicQuoteLinkResponse> => {
  const response = await APIClient.quotations.getByPublicLinkToken(token);
  console.log('[Quotation][public link] response:', response);
  return response;
};

export const QuotationWithLineItemsQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: [...QuotationKeys.detail(quotationId), 'with-line-items'],
    queryFn: async () => {
      const data = await APIClient.quotations.getWithQuoteItems(quotationId);
      const converted = convertKeysToCamelCase(data);
      return converted;
    },
    staleTime: 5_000,
    enabled: !!quotationId && quotationId > 0,
  });

export const QuotationReportingQueryOptions = () =>
  queryOptions({
    queryKey: QuotationKeys.reporting(),
    queryFn: () => APIClient.quotations.reporting(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useConvertToDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.quotations.convertToDraft(id),
    onSuccess: (_data, quotationId) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({
        queryKey: QuotationKeys.detail(quotationId),
      });
      queryClient.invalidateQueries({
        queryKey: [...QuotationKeys.detail(quotationId), 'with-line-items'],
      });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};
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
 * Mutation hook for sending a quotation to customer.
 * Automatically invalidates the quotations list and detail cache on success.
 */
export const useSendToCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.quotations.sendToCustomer(id),

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
 * Query options for fetching a quotation preview.
 * Returns the same data structure as the public quote link,
 * but using authenticated access.
 */
export const QuotationPreviewQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: [...QuotationKeys.detail(quotationId), 'preview'],
    queryFn: async () => {
      const data = await APIClient.quotations.preview(quotationId);
      console.log('[Quotation][preview] response:', data);
      return convertKeysToCamelCase(data) as PublicQuoteLinkResponse;
    },
    staleTime: 5_000,
    enabled: !!quotationId && quotationId > 0,
  });

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

/**
 * Mutation hook for updating public quote status (approve/decline).
 * Used on the public quote review page where customers are not authenticated.
 */
export const useUpdatePublicQuoteStatus = () => {
  return useMutation({
    mutationFn: async ({
      status,
      token,
    }: {
      status: 'APPROVED' | 'DECLINED';
      token: string;
    }) => {
      const response = await APIClient.quotations.updatePublicQuoteStatus(
        status,
        token
      );
      return response;
    },
  });
};
