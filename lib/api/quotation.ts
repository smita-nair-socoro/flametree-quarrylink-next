import {
  infiniteQueryOptions,
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
  QuotesListResponse,
  QuotesFilterOptions,
  QuotesPage,
} from '../types/quotation';
import { convertKeysToCamelCase } from '../utils/case-conversion';
import { JobDTO } from '../types/job';

export type QuotesListParams = {
  /** 0-based page index from UI tables (converted to 1-based for the API). */
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  statuses?: string[];
  customerIds?: number[];
  accountManagerSubs?: string[];
  ids?: number[];
};

const QUOTE_COLUMN_TO_API_SORT: Record<string, string> = {
  quote_number: 'quoteNumber',
  customer_name: 'customerName',
  created_at: 'createdAt',
  expiry_date: 'expiryDate',
  total_sell_price: 'totalSellPrice',
  account_manager: 'accountManager',
  status: 'quoteStatus',
};

export function toQuoteApiSortParams(
  sorting: { id: string; desc: boolean }[],
): Pick<QuotesListParams, 'sortBy' | 'sortOrder'> {
  const sort = sorting[0];
  if (!sort) return { sortBy: 'createdAt', sortOrder: 'desc' };
  return {
    sortBy: QUOTE_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
    sortOrder: sort.desc ? 'desc' : 'asc',
  };
}

function getFacetFilterValues(
  filters: { id: string; value: unknown }[],
  columnId: string,
): string[] {
  const filter = filters.find((f) => f.id === columnId);
  if (!filter || !Array.isArray(filter.value)) return [];
  return filter.value.map((v) => String(v));
}

export function toQuoteApiFilterParams(
  filters: { id: string; value: unknown }[],
): Pick<QuotesListParams, 'statuses' | 'customerIds' | 'accountManagerSubs'> {
  const statusValues = getFacetFilterValues(filters, 'status');
  const customerValues = getFacetFilterValues(filters, 'customer_name');
  const accountManagerValues = getFacetFilterValues(filters, 'account_manager');

  const customerIds = customerValues
    .map(Number)
    .filter((n) => Number.isFinite(n));

  return {
    statuses: statusValues.length ? statusValues : undefined,
    customerIds: customerIds.length ? customerIds : undefined,
    accountManagerSubs: accountManagerValues.length
      ? accountManagerValues
      : undefined,
  };
}

/** Quotes API pagination is 1-based (page 1 = first page). */
function toApiPage(page: number): number {
  return page + 1;
}

function formatFacetEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function getQuotesPageFromListResponse(
  data: QuotesListResponse | null | undefined,
): QuotesPage | null {
  return data?.quotes ?? null;
}

export function getQuoteItemsFromListResponse(
  data: QuotesListResponse | null | undefined,
): QuotationDTO[] {
  return (data?.quotes?.content ?? []) as QuotationDTO[];
}

export function buildQuoteFacetOptions(
  response?: QuotesListResponse | QuotesFilterOptions | null,
) {
  return {
    statuses: (response?.statuses ?? []).map((status) => ({
      value: status,
      label: formatFacetEnumLabel(status),
    })),
    customers: (response?.customers ?? []).map((customer) => ({
      value: customer.id,
      label: customer.name,
    })),
    accountManagers: (response?.accountManagers ?? []).map((manager) => ({
      value: manager.id,
      label: manager.name,
    })),
  };
}

export const QuotationsListQueryOptions = (params?: QuotesListParams) =>
  queryOptions({
    queryKey: [...QuotationKeys.list(), params],
    queryFn: async () =>
      convertKeysToCamelCase(
        await APIClient.quotations.getAll({
          ...params,
          page: params?.page !== undefined ? toApiPage(params.page) : undefined,
        }),
      ) as QuotesListResponse,
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const QuotesFilterQueryOptions = () =>
  queryOptions({
    queryKey: QuotationKeys.filters(),
    queryFn: () => APIClient.quotations.getFilters(),
    staleTime: 60_000,
  });

export const QuotationsInfiniteListQueryOptions = (
  params: Omit<QuotesListParams, 'page'> = {},
) =>
  infiniteQueryOptions({
    queryKey: [...QuotationKeys.list(), 'infinite', params],
    queryFn: async ({ pageParam }) =>
      convertKeysToCamelCase(
        await APIClient.quotations.getAll({
          ...params,
          page: pageParam as number,
          pageSize: params.pageSize ?? 25,
        }),
      ) as QuotesListResponse,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getQuotesPageFromListResponse(lastPage);
      if (!page) return undefined;
      if ((page.content ?? []).length === 0) return undefined;
      const nextPage = (lastPageParam as number) + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export function getQuotesFromInfinitePages(
  pages: (QuotesListResponse | null | undefined)[] | undefined,
): QuotationDTO[] {
  const seenIds = new Set<number>();
  const result: QuotationDTO[] = [];

  for (const page of pages ?? []) {
    for (const quote of page?.quotes?.content ?? []) {
      if (quote.id == null || seenIds.has(quote.id)) continue;
      seenIds.add(quote.id);
      result.push(quote as QuotationDTO);
    }
  }

  return result;
}

export const QuotationDetailQueryOptions = (quotationId: number) =>
  queryOptions({
    queryKey: QuotationKeys.detail(quotationId),
    queryFn: async () =>
      convertKeysToCamelCase(await APIClient.quotations.getById(quotationId)),
    staleTime: 5_000,
    enabled: !!quotationId && quotationId > 0,
  });

export const fetchPublicQuoteByToken = async (
  token: string,
): Promise<PublicQuoteLinkResponse> => {
  const response = await APIClient.quotations.getByPublicLinkToken(token);
  console.log('[Quotation][public link] response:', response);
  return response;
};

/**
 * Fetch quote preview data for authenticated preview mode.
 * Used when admin previews a quote before sending to customer.
 */
export const fetchQuotePreview = async (
  quoteId: number,
): Promise<PublicQuoteLinkResponse> => {
  const response = await APIClient.quotations.preview(quoteId);
  console.log('[Quotation][preview] response:', response);
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
    staleTime: 60_000,
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
    mutationFn: (data: Partial<QuotationDTO>) => {
      const dataWithDefaults = {
        inclDeliveryCost: false,
        ...data,
      };
      return APIClient.quotations.create(dataWithDefaults);
    },

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
    mutationFn: (data: Partial<QuotationDTO>) => {
      const dataWithDefaults = {
        inclDeliveryCost: false,
        ...data,
      };
      return APIClient.quotations.update(dataWithDefaults);
    },

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
    mutationFn: ({
      id,
      inclDeliveryCost,
      emailRecipients,
    }: {
      id: number;
      inclDeliveryCost: boolean;
      emailRecipients: string[];
    }) =>
      APIClient.quotations.sendToCustomer(
        id,
        inclDeliveryCost,
        emailRecipients,
      ),

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
      const response =
        await APIClient.quotations.createQuoteItem(dataWithDefaults);
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

export const useDuplicateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuotationDTO> }) => {
      const dataWithDefaults = {
        inclDeliveryCost: false,
        ...data,
      };
      return APIClient.quotations.duplicate(id, dataWithDefaults);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};
/**
 * Query options for fetching a quote item by id.
 */
export const useGetQuoteItemById = (id: number) =>
  queryOptions({
    queryKey: QuotationKeys.quoteItem(id),
    queryFn: async () => {
      const data = await APIClient.quotations.getQuoteItemById(id);
      return data as QuotationLineItem;
    },
  });

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
type UpdatePublicQuoteStatusParams =
  | {
      status: 'APPROVED';
      token: string;
      declineReason?: string;
      decisionMakerName?: string;
      // Mandatory: customers must supply a PO number to approve via the public link .
      poNumber: string;
    }
  | {
      status: 'DECLINED';
      token: string;
      declineReason?: string;
      decisionMakerName?: string;
    };

export const useUpdatePublicQuoteStatus = () => {
  return useMutation({
    mutationFn: async (params: UpdatePublicQuoteStatusParams) => {
      const { status, token, declineReason, decisionMakerName } = params;
      const response = await APIClient.quotations.updatePublicQuoteStatus(
        status,
        token,
        declineReason,
        decisionMakerName,
        status === 'APPROVED' ? params.poNumber : undefined,
      );
      return response;
    },
  });
};

/**
 * Mutation hook for updating quote decision (approve/decline) with authentication.
 * Used on the admin side for authenticated users.
 */
export const useUpdateQuoteDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      declineReason,
      decisionMakerName,
      poNumber,
    }: {
      id: number;
      status: 'APPROVED' | 'DECLINED';
      declineReason?: string;
      decisionMakerName?: string;
      poNumber?: string;
    }) => {
      const response = await APIClient.quotations.updateQuoteDecision(
        id,
        status,
        declineReason,
        decisionMakerName,
        poNumber,
      );
      return response;
    },
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
 * Mutation hook for converting a quotation to a job.
 * Automatically invalidates the quotations list and detail cache on success.
 */
export const useConvertToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<JobDTO> =>
      APIClient.quotations.convertToJob(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.detail(id) });
      queryClient.invalidateQueries({
        queryKey: [...QuotationKeys.detail(id), 'with-line-items'],
      });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};

/**
 * Mutation hook for bulk archiving quotations.
 * Automatically invalidates the quotations list cache on success.
 */
export const useBulkArchiveQuotations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => APIClient.quotations.bulkArchive(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuotationKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuotationKeys.all });
    },
  });
};
