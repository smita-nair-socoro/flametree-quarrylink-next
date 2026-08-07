import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { CustomerKeys } from './keys';
import {
  CustomerDTO,
  ArchiveCustomerResponseDTO,
  UnarchiveCustomerResponseDTO,
  AdditionalContactDTO,
} from '../types/customer';
import type { CustomersListResponse, CustomersPage } from '../types/customer';
import { formatCustomerStatus } from '../utils/customer-helper';
import {
  mapAdditionalContactFromApi,
  mapAdditionalContactToApiPayload,
} from '../utils/additional-contact-helper';

export type CustomersListParams = {
  /** 0-based page index from UI tables (converted to 1-based for the API). */
  page?: number;
  pageSize?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  statuses?: string[];
  types?: string[];
  accountManagerSubs?: string[];
  /** Restrict results to specific customer ids. */
  ids?: number[];
};

const CUSTOMER_COLUMN_TO_API_SORT: Record<string, string> = {
  customer_name: 'customerName',
  customer_type: 'customerType',
  contact_name: 'contactName',
  email: 'email',
  credit_limit: 'creditLimit',
  status: 'customerStatus',
  account_manager: 'accountManager',
};

export function toCustomerApiSortParams(
  sorting: {
    id: string;
    desc: boolean;
  }[],
): Pick<CustomersListParams, 'sortBy' | 'sortOrder'> {
  const sort = sorting[0];
  if (!sort) {
    return { sortBy: 'customerName', sortOrder: 'asc' };
  }

  return {
    sortBy: CUSTOMER_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
    sortOrder: sort.desc ? 'desc' : 'asc',
  };
}

function getFacetFilterValues(
  filters: { id: string; value: unknown }[],
  columnId: string,
): string[] {
  const filter = filters.find((f) => f.id === columnId);
  if (!filter || !Array.isArray(filter.value)) return [];
  return filter.value.map(String);
}

export function toCustomerApiFilterParams(
  filters: { id: string; value: unknown }[],
): Pick<CustomersListParams, 'statuses' | 'types' | 'accountManagerSubs'> {
  const statusValues = getFacetFilterValues(filters, 'status');
  const typeValues = getFacetFilterValues(filters, 'customer_type');
  const accountManagerValues = getFacetFilterValues(filters, 'account_manager');

  return {
    statuses: statusValues.length ? statusValues : undefined,
    types: typeValues.length ? typeValues : undefined,
    accountManagerSubs: accountManagerValues.length
      ? accountManagerValues
      : undefined,
  };
}

/** Customers API pagination is 1-based (page 1 = first page). */
function toApiPage(page: number): number {
  return page + 1;
}

function formatFacetEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function getCustomersPageFromListResponse(
  data:
    | CustomersListResponse
    | CustomersPage
    | CustomerDTO[]
    | null
    | undefined,
): CustomersPage | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
    };
  }
  if ('customers' in data && data.customers) {
    return data.customers;
  }
  if ('content' in data) {
    return data;
  }
  return null;
}

export function getCustomerItemsFromListResponse(
  data:
    | CustomersListResponse
    | CustomersPage
    | CustomerDTO[]
    | null
    | undefined,
): CustomerDTO[] {
  return getCustomersPageFromListResponse(data)?.content ?? [];
}

export function getCustomerItemsFromInfinitePages(
  pages:
    | (
        | CustomersListResponse
        | CustomersPage
        | CustomerDTO[]
        | null
        | undefined
      )[]
    | undefined,
): CustomerDTO[] {
  const seenIds = new Set<number>();
  const result: CustomerDTO[] = [];

  for (const page of pages ?? []) {
    for (const customer of getCustomerItemsFromListResponse(page)) {
      if (customer.id == null || seenIds.has(customer.id)) continue;
      seenIds.add(customer.id);
      result.push(customer);
    }
  }

  return result;
}

export function isCustomersListResponse(
  data: unknown,
): data is CustomersListResponse {
  return (
    typeof data === 'object' &&
    data != null &&
    'customers' in data &&
    typeof (data as CustomersListResponse).customers === 'object'
  );
}

export function buildCustomerFacetOptions(
  response?: CustomersListResponse | null,
) {
  return {
    statuses: (response?.statuses ?? []).map((status) => ({
      value: status,
      label: formatCustomerStatus(status),
    })),
    types: (response?.types ?? []).map((type) => ({
      value: type,
      label: formatFacetEnumLabel(type),
    })),
    accountManagers: (response?.accountManagers ?? []).map((manager) => ({
      value: manager.id,
      label: manager.name,
    })),
  };
}

export const CustomersListQueryOptions = (params?: CustomersListParams) =>
  queryOptions({
    queryKey: [...CustomerKeys.list(), params],
    queryFn: () =>
      APIClient.customers.getAll({
        ...params,
        page: params?.page === undefined ? undefined : toApiPage(params.page),
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const CustomersInfiniteListQueryOptions = (
  params: Omit<CustomersListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...CustomerKeys.list(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.customers.getAll({
        ...params,
        page: pageParam,
        pageSize: params.pageSize ?? 25,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getCustomersPageFromListResponse(lastPage);
      if (!page) return undefined;
      const content = page.content ?? [];
      if (content.length === 0) return undefined;
      const nextPage = lastPageParam + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export const CustomerDetailQueryOptions = (customerId: number) =>
  queryOptions({
    queryKey: CustomerKeys.detail(customerId),
    queryFn: () => APIClient.customers.getById(customerId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });

export const CustomerReportingQueryOptions = () =>
  queryOptions({
    queryKey: CustomerKeys.reporting(),
    queryFn: () => APIClient.customers.reporting(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const CustomerDeliveryAddressesQueryOptions = (
  customerId: number,
  limit?: number,
) =>
  queryOptions({
    queryKey: CustomerKeys.deliveryAddresses(customerId, limit),
    queryFn: () => APIClient.customers.getDeliveryAddresses(customerId, limit),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });

/**
 * Mutation hook for updating delivery address usage (inUse status).
 * Used when removing a delivery address from suggestions.
 */
export const useUpdateDeliveryAddressUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      customerDeliveryAddressId,
      inUse,
    }: {
      customerId: number;
      customerDeliveryAddressId: number;
      inUse: boolean;
    }) =>
      APIClient.customers.updateDeliveryAddressUsage(
        customerId,
        customerDeliveryAddressId,
        inUse,
      ),

    onSuccess: (_data, variables) => {
      // Invalidate all delivery addresses queries for this customer (partial match)
      queryClient.invalidateQueries({
        queryKey: [
          ...CustomerKeys.all,
          'delivery-addresses',
          variables.customerId,
        ],
      });
    },
  });
};

/**
 * Mutation hook for creating a new customer.
 * Automatically invalidates the customers list cache on success.
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CustomerDTO>): Promise<CustomerDTO> =>
      APIClient.customers.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CustomerKeys.list() });
      queryClient.invalidateQueries({ queryKey: CustomerKeys.all });
    },
  });
};

/**
 * Mutation hook for updating an existing customer.
 * Automatically invalidates the customers list and detail cache on success.
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CustomerDTO>): Promise<CustomerDTO> =>
      APIClient.customers.update(data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CustomerKeys.list() });
      if (data.id) {
        queryClient.invalidateQueries({
          queryKey: CustomerKeys.detail(data.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: CustomerKeys.all });
    },
  });
};

export const useArchiveCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: number): Promise<ArchiveCustomerResponseDTO> =>
      APIClient.customers.archive(customerId),

    onSuccess: (_data, customerId) => {
      queryClient.invalidateQueries({ queryKey: CustomerKeys.list() });
      queryClient.invalidateQueries({
        queryKey: CustomerKeys.detail(customerId),
      });
      queryClient.invalidateQueries({ queryKey: CustomerKeys.all });
    },
  });
};

export const useUnarchiveCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: number): Promise<UnarchiveCustomerResponseDTO> =>
      APIClient.customers.unarchive(customerId),

    onSuccess: (_data, customerId) => {
      queryClient.invalidateQueries({ queryKey: CustomerKeys.list() });
      queryClient.invalidateQueries({
        queryKey: CustomerKeys.detail(customerId),
      });
      queryClient.invalidateQueries({ queryKey: CustomerKeys.all });
    },
  });
};

export const useGetCustomerAttachments = (customerId: number) =>
  queryOptions({
    queryKey: CustomerKeys.attachments(customerId),
    queryFn: () => APIClient.customers.getAttachments(customerId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });

export type UploadCustomerAttachmentParams = {
  customerId: number;
  category: string;
  fileName: string;
  file: File;
};

export const useUploadCustomerAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      category,
      fileName,
      file,
    }: UploadCustomerAttachmentParams) =>
      APIClient.customers.uploadAttachment(customerId, {
        category,
        fileName,
        file,
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CustomerKeys.attachments(variables.customerId),
      });
    },
  });
};

export const useDeleteCustomerAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      attachmentId,
    }: {
      customerId: number;
      attachmentId: number;
    }) => APIClient.customers.deleteAttachment(customerId, attachmentId),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CustomerKeys.attachments(variables.customerId),
      });
    },
  });
};

export type AdditionalContactsListParams = {
  page?: number;
  pageSize?: number;
};

export const useGetAdditionalContacts = (
  customerId: number,
  params?: AdditionalContactsListParams,
) =>
  queryOptions({
    queryKey: CustomerKeys.additionalContacts(customerId, params),
    queryFn: async () => {
      const response = await APIClient.customers.getAdditionalContacts(
        customerId,
        params,
      );

      return {
        ...response,
        content: (response.content ?? []).map((contact) =>
          mapAdditionalContactFromApi(contact, customerId),
        ),
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!customerId,
  });

export const AdditionalContactDetailQueryOptions = (
  customerId: number,
  contactId: number,
  enabled = true,
) =>
  queryOptions({
    queryKey: CustomerKeys.additionalContactDetail(customerId, contactId),
    queryFn: async () => {
      const response = await APIClient.customers.getAdditionalContact(
        customerId,
        contactId,
      );
      return mapAdditionalContactFromApi(response, customerId);
    },
    enabled: enabled && !!customerId && !!contactId,
  });

export const useCreateAdditionalContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: number;
      data: AdditionalContactDTO;
    }) =>
      APIClient.customers.createAdditionalContact(
        customerId,
        mapAdditionalContactToApiPayload(data),
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...CustomerKeys.all,
          'additional-contacts',
          variables.customerId,
        ],
      });
    },
  });
};

export const useUpdateAdditionalContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      contactId,
      data,
    }: {
      customerId: number;
      contactId: number;
      data: AdditionalContactDTO;
    }) =>
      APIClient.customers.updateAdditionalContact(
        customerId,
        contactId,
        mapAdditionalContactToApiPayload(data),
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...CustomerKeys.all,
          'additional-contacts',
          variables.customerId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: CustomerKeys.additionalContactDetail(
          variables.customerId,
          variables.contactId,
        ),
      });
    },
  });
};

export const useDeleteAdditionalContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      contactId,
    }: {
      customerId: number;
      contactId: number;
    }) => APIClient.customers.deleteAdditionalContact(customerId, contactId),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...CustomerKeys.all,
          'additional-contacts',
          variables.customerId,
        ],
      });
    },
  });
};

export const usePullFromAccSoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CustomerKeys.all });
      queryClient.invalidateQueries({ queryKey: CustomerKeys.list() });
    },
    mutationFn: () => APIClient.customers.syncAllFromAccSoftware(),
  });
};
