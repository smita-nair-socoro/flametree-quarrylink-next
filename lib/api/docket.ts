import {
  keepPreviousData,
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, JobKeys, SchedulerKeys } from './keys';
import {
  DocketAssignRequest,
  DocketDTO,
  DocketOperationalUpdateRequest,
  ConflictCheckRequest,
  DuplicateDocketRequest,
  DocketsListResponse,
  DocketsPage,
  DocketsTableResponse,
  DocketTableRow,
  UnassignedDocketListItem,
  UnassignedDocketsPage,
} from '../types/docket';
import { DOCKET_STATUS } from '../types/docket-enums';
import { useJobStore } from '@/app/stores/job-store';
import { useDocketStore } from '@/app/stores/docket-store';
import {
  mapDocketDtoToTableRow,
  mapDocketTableItemToRow,
} from '@/lib/utils/docket-table-helpers';

export const DocketStatisticsQueryOptions = () => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  return queryOptions({
    queryKey: [...DocketKeys.statistics(), dateKey],
    queryFn: () => APIClient.dockets.statistics(dateKey),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
};

export type DocketsListParams = {
  /** 0-based page index from UI tables (converted to 1-based for the API). */
  page?: number;
  pageSize?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  statuses?: string[];
  types?: string[];
  customerIds?: number[];
  productIds?: number[];
  /** Restrict results to specific docket ids (e.g. linking from a job/customer dialog). */
  ids?: number[];
};

export type UnassignedDocketsListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export function getUnassignedDocketsFromPage(
  page: UnassignedDocketsPage | null | undefined,
): UnassignedDocketListItem[] {
  return page?.content ?? [];
}

export function getUnassignedDocketsFromInfinitePages(
  pages: (UnassignedDocketsPage | null | undefined)[] | undefined,
): UnassignedDocketListItem[] {
  const seenIds = new Set<number>();
  const result: UnassignedDocketListItem[] = [];
  for (const page of pages ?? []) {
    for (const item of getUnassignedDocketsFromPage(page)) {
      if (item.id != null && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        result.push(item);
      }
    }
  }
  return result;
}

const DOCKET_COLUMN_TO_API_SORT: Record<string, string> = {
  docketNumber: 'docketNumber',
  docketType: 'type',
  jobReference: 'jobReference',
  customer: 'customer',
  product: 'product',
  deliveryDate: 'deliveryDate',
  loadSize: 'actualLoadSize',
  totalInvoice: 'totalInvoiceAmount',
};

export function toDocketApiSortParams(
  sorting: {
    id: string;
    desc: boolean;
  }[],
): Pick<DocketsListParams, 'sortBy' | 'sortOrder'> {
  const sort = sorting[0];
  if (!sort) {
    return { sortBy: 'deliveryDate', sortOrder: 'asc' };
  }

  return {
    sortBy: DOCKET_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
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

export function toDocketApiFilterParams(
  filters: { id: string; value: unknown }[],
): Pick<
  DocketsListParams,
  'statuses' | 'types' | 'customerIds' | 'productIds'
> {
  const statusValues = getFacetFilterValues(filters, 'status');
  const typeValues = getFacetFilterValues(filters, 'docketType');
  const customerValues = getFacetFilterValues(filters, 'customer');
  const productValues = getFacetFilterValues(filters, 'product');

  const customerIds = customerValues
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const productIds = productValues
    .map(Number)
    .filter((n) => Number.isFinite(n));

  return {
    statuses: statusValues.length ? statusValues : undefined,
    types: typeValues.length ? typeValues : undefined,
    customerIds: customerIds.length ? customerIds : undefined,
    productIds: productIds.length ? productIds : undefined,
  };
}

/** Dockets API pagination is 1-based (page 1 = first page). */
function toApiPage(page: number): number {
  return page + 1;
}

function formatFacetEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

/** Nested DocketDTO list shapes (job/driver/truck endpoints). */
type DocketListPayload = DocketsListResponse | DocketsPage | DocketDTO[];

type DocketFacetSource = Pick<
  DocketsListResponse,
  'customers' | 'products' | 'statuses' | 'types'
>;

/** Normalizes any of the 3 shapes a docket list endpoint can return into a single DocketsPage. */
export function getDocketsPageFromListResponse(
  data: DocketListPayload | null | undefined,
): DocketsPage | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1 };
  }
  if ('dockets' in data) {
    return data.dockets ?? null;
  }
  return data;
}

export function getDocketItemsFromListResponse(
  data: DocketListPayload | null | undefined,
): DocketDTO[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('dockets' in data) {
    return data.dockets?.content ?? [];
  }
  return data.content ?? [];
}

export function getDocketItemsFromInfinitePages(
  pages: (DocketListPayload | null | undefined)[] | undefined,
): DocketDTO[] {
  const seenIds = new Set<number>();
  const result: DocketDTO[] = [];
  for (const page of pages ?? []) {
    for (const item of getDocketItemsFromListResponse(page)) {
      if (item.id != null && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        result.push(item);
      }
    }
  }
  return result;
}

export function getDocketsTablePage(
  data: DocketsTableResponse | null | undefined,
): DocketsTableResponse['dockets'] | null {
  return data?.dockets ?? null;
}

export function getDocketTableRowsFromTableResponse(
  data: DocketsTableResponse | null | undefined,
): DocketTableRow[] {
  return (data?.dockets?.content ?? []).map(mapDocketTableItemToRow);
}

export function getDocketTableRowsFromDtoPayload(
  data: DocketListPayload | null | undefined,
): DocketTableRow[] {
  return getDocketItemsFromListResponse(data).map(mapDocketDtoToTableRow);
}

export function getDocketTableRowsFromInfinitePages(
  pages:
    | (DocketListPayload | DocketsTableResponse | null | undefined)[]
    | undefined,
  source: 'table' | 'dto',
): DocketTableRow[] {
  const seenIds = new Set<number>();
  const result: DocketTableRow[] = [];
  for (const page of pages ?? []) {
    const rows =
      source === 'table'
        ? getDocketTableRowsFromTableResponse(page as DocketsTableResponse)
        : getDocketTableRowsFromDtoPayload(page as DocketListPayload);
    for (const row of rows) {
      if (row.id != null && !seenIds.has(row.id)) {
        seenIds.add(row.id);
        result.push(row);
      }
    }
  }
  return result;
}

export function buildDocketFacetOptions(response?: DocketFacetSource | null) {
  return {
    statuses: (response?.statuses ?? []).map((status) => ({
      value: status,
      label: formatFacetEnumLabel(status),
    })),
    products: (response?.products ?? []).map((product) => ({
      value: String(product.id),
      label: product.name,
    })),
    customers: (response?.customers ?? []).map((customer) => ({
      value: String(customer.id),
      label: customer.name,
    })),
    types: (response?.types ?? []).map((type) => ({
      value: type,
      label: formatFacetEnumLabel(type),
    })),
  };
}

export const DocketsListQueryOptions = (params?: DocketsListParams) =>
  queryOptions({
    queryKey: [...DocketKeys.list(), params],
    queryFn: () =>
      APIClient.dockets.getAll({
        ...params,
        page: params?.page === undefined ? undefined : toApiPage(params.page),
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

/** Default dockets page list — flat GET /dockets/table projection. */
export const DocketsTableQueryOptions = (params?: DocketsListParams) =>
  queryOptions({
    queryKey: [...DocketKeys.table(), params],
    queryFn: () =>
      APIClient.dockets.getTable({
        ...params,
        page: params?.page === undefined ? undefined : toApiPage(params.page),
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const DocketsInfiniteListQueryOptions = (
  params: Omit<DocketsListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...DocketKeys.list(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.dockets.getAll({
        ...params,
        page: pageParam,
        pageSize: params.pageSize ?? 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getDocketsPageFromListResponse(lastPage);
      if (!page) return undefined;
      const content = page.content ?? [];
      if (content.length === 0) return undefined;
      const nextPage = lastPageParam + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export const UnassignedDocketsInfiniteQueryOptions = (
  params: Omit<UnassignedDocketsListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...DocketKeys.unassigned(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.dockets.getUnassignedAll({
        ...params,
        page: pageParam,
        pageSize: params.pageSize ?? 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage?.content?.length) return undefined;
      const nextPage = lastPageParam + 1;
      if (nextPage > lastPage.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export const DocketsTableInfiniteQueryOptions = (
  params: Omit<DocketsListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...DocketKeys.table(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.dockets.getTable({
        ...params,
        page: pageParam,
        pageSize: params.pageSize ?? 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getDocketsTablePage(lastPage);
      if (!page) return undefined;
      const content = page.content ?? [];
      if (content.length === 0) return undefined;
      const nextPage = lastPageParam + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export const useCreateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DocketDTO>) => APIClient.dockets.create(data),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      if (data.jobId) {
        queryClient.invalidateQueries({ queryKey: JobKeys.list() });
        try {
          const updatedJob = await APIClient.jobs.getJobItems(data.jobId);
          useJobStore.getState().setSelectedJob(updatedJob);
        } catch {
          useJobStore.getState().setSelectedJob(null);
        }
      }
    },
  });
};

export type DocketsByJobIdParams = Pick<
  DocketsListParams,
  | 'page'
  | 'pageSize'
  | 'size'
  | 'search'
  | 'sortBy'
  | 'sortOrder'
  | 'statuses'
  | 'types'
  | 'customerIds'
  | 'productIds'
>;

export const DocketsByJobIdQueryOptions = (
  jobId: number,
  params?: DocketsByJobIdParams,
) =>
  queryOptions({
    queryKey: [...DocketKeys.byJobId(jobId), params],
    queryFn: () =>
      APIClient.dockets.getByJobId(jobId, {
        ...params,
        page: params?.page === undefined ? undefined : toApiPage(params.page),
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const DocketByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: DocketKeys.detail(id),
    queryFn: () => APIClient.dockets.getById(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useUpdateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocketDTO> }) =>
      APIClient.dockets.update(id, data),
    onSuccess: async (data, { id }) => {
      // The PUT response omits job.jobNumber, which dialogs display. Fetch the
      // full docket once through the query cache so the open detail query
      // shares the result instead of refetching after invalidation
      const updatedDocket =
        data?.id && data.job?.jobNumber
          ? data
          : await queryClient.fetchQuery({
              ...DocketByIdQueryOptions(id),
              staleTime: 0,
            });

      queryClient.setQueryData(
        DocketKeys.detail(updatedDocket.id),
        updatedDocket,
      );
      useDocketStore.getState().setSelectedDocket(updatedDocket);
      // Refresh all other docket queries, skipping the detail we just wrote
      queryClient.invalidateQueries({
        queryKey: DocketKeys.all,
        predicate: (query) =>
          !(
            query.queryKey[1] === 'detail' &&
            query.queryKey[2] === updatedDocket.id
          ),
      });
    },
  });
};

export const useAssignDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DocketAssignRequest) => APIClient.dockets.assign(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: SchedulerKeys.all });
    },
  });
};

export const useUnassignDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { docketId: number }) =>
      APIClient.dockets.unassign(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: SchedulerKeys.all });
    },
  });
};

export const useUpdateDocketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      docketId,
      docketStatus,
      reason,
      notes,
      latitude,
      longitude,
      deliveredProductsConfirmed,
      receiverOnSite,
      receiverName,
      signatureImage,
      unloadedPhoto,
      receiptPhoto,
    }: {
      docketId: number;
      docketStatus: DOCKET_STATUS;
      reason?: string;
      notes?: string;
      latitude?: string;
      longitude?: string;
      deliveredProductsConfirmed?: boolean;
      receiverOnSite?: boolean;
      receiverName?: string;
      signatureImage?: File | null;
      unloadedPhoto?: File | null;
      receiptPhoto?: File | null;
    }) => {
      const formData = new FormData();
      formData.append('docketStatus', docketStatus);
      if (reason !== undefined) formData.append('reason', reason);
      if (notes !== undefined) formData.append('notes', notes);
      if (latitude !== undefined) formData.append('latitude', latitude);
      if (longitude !== undefined) formData.append('longitude', longitude);
      if (deliveredProductsConfirmed !== undefined) {
        formData.append(
          'deliveredProductsConfirmed',
          String(deliveredProductsConfirmed),
        );
      }
      if (receiverOnSite !== undefined) {
        formData.append('receiverOnSite', String(receiverOnSite));
      }
      if (receiverName !== undefined)
        formData.append('receiverName', receiverName);
      if (signatureImage) formData.append('signatureImage', signatureImage);
      if (unloadedPhoto) formData.append('unloadedPhotos', unloadedPhoto);
      if (receiptPhoto) formData.append('receivedPhotos', receiptPhoto);

      return APIClient.dockets.updateStatus(docketId, formData);
    },

    onSuccess: async (_data, { docketId, docketStatus }) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(docketId) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      if (
        _data.jobId &&
        (docketStatus === DOCKET_STATUS.DELIVERED ||
          docketStatus === DOCKET_STATUS.COLLECTED ||
          docketStatus === DOCKET_STATUS.VOIDED ||
          docketStatus === DOCKET_STATUS.CANCELLED)
      ) {
        queryClient.invalidateQueries({ queryKey: JobKeys.list() });
        try {
          const updatedJob = await APIClient.jobs.getJobItems(_data.jobId);
          useJobStore.getState().setSelectedJob(updatedJob);
        } catch {
          useJobStore.getState().setSelectedJob(null);
        }
      }
    },
  });
};

export const useOperationalUpdateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DocketOperationalUpdateRequest;
    }) => APIClient.dockets.operationalUpdate(id, data),
    onSuccess: async (response, { id }) => {
      const updatedDocket =
        response.docket?.job?.jobNumber == null
          ? await queryClient.fetchQuery({
              ...DocketByIdQueryOptions(id),
              staleTime: 0,
            })
          : response.docket;

      if (updatedDocket) {
        queryClient.setQueryData(
          DocketKeys.detail(updatedDocket.id),
          updatedDocket,
        );
        useDocketStore.getState().setSelectedDocket(updatedDocket);
      }
      // Refresh all other docket queries, skipping the detail we just wrote
      queryClient.invalidateQueries({
        queryKey: DocketKeys.all,
        predicate: (query) =>
          !(
            query.queryKey[1] === 'detail' &&
            query.queryKey[2] === updatedDocket?.id
          ),
      });
      queryClient.invalidateQueries({ queryKey: SchedulerKeys.all });
    },
  });
};

export const useDuplicateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DuplicateDocketRequest }) =>
      APIClient.dockets.duplicate(id, data),
    onSuccess: async (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({
        queryKey: JobKeys.items(data.dockets[0]?.jobId),
      });
    },
  });
};

export const DocketConflictCheckQueryOptions = (
  docketId: number | undefined,
  request: ConflictCheckRequest | null,
) =>
  queryOptions({
    queryKey: [
      'docket-conflict-check',
      docketId,
      request?.truckId,
      request?.driverId,
    ],
    queryFn: () => APIClient.dockets.conflictCheck(docketId!, request!),
    enabled: !!request && !!docketId,
    staleTime: 0,
  });

export const DocketsByTruckIdQueryOptions = (
  truckId: number,
  params?: DocketsListParams,
) =>
  queryOptions({
    queryKey: [...DocketKeys.docketsByTruckId(truckId), params],
    queryFn: () =>
      APIClient.dockets.getDocketsByTruckId(truckId, {
        ...params,
        page: params?.page === undefined ? undefined : toApiPage(params.page),
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!truckId,
  });

export const DocketsByDriverIdQueryOptions = (
  driverId: number,
  params?: DocketsListParams,
) =>
  queryOptions({
    queryKey: [...DocketKeys.docketsByDriverId(driverId), params],
    queryFn: () =>
      APIClient.dockets.getDocketsByDriverId(driverId, {
        ...params,
        page: params?.page === undefined ? undefined : toApiPage(params.page),
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!driverId,
  });

export const DocketsByJobIdInfiniteQueryOptions = (
  jobId: number,
  params?: Pick<
    DocketsListParams,
    | 'pageSize'
    | 'search'
    | 'sortBy'
    | 'sortOrder'
    | 'statuses'
    | 'types'
    | 'customerIds'
    | 'productIds'
  >,
) =>
  infiniteQueryOptions({
    queryKey: [...DocketKeys.byJobId(jobId), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.dockets.getByJobId(jobId, {
        ...params,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getDocketsPageFromListResponse(lastPage);
      if (!page?.content?.length) return undefined;
      const nextPage = lastPageParam + 1;
      return nextPage > page.totalPages ? undefined : nextPage;
    },
    staleTime: 5_000,
  });

export const DocketsByDriverIdInfiniteQueryOptions = (
  driverId: number,
  params?: Omit<DocketsListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...DocketKeys.docketsByDriverId(driverId), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.dockets.getDocketsByDriverId(driverId, {
        ...params,
        page: pageParam,
        pageSize: params?.pageSize ?? 25,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getDocketsPageFromListResponse(lastPage);
      if (!page?.content?.length) return undefined;
      const nextPage = lastPageParam + 1;
      return nextPage > page.totalPages ? undefined : nextPage;
    },
    staleTime: 5_000,
  });

export const DocketsByTruckIdInfiniteQueryOptions = (
  truckId: number,
  params?: Omit<DocketsListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...DocketKeys.docketsByTruckId(truckId), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.dockets.getDocketsByTruckId(truckId, {
        ...params,
        page: pageParam,
        pageSize: params?.pageSize ?? 25,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getDocketsPageFromListResponse(lastPage);
      if (!page?.content?.length) return undefined;
      const nextPage = lastPageParam + 1;
      return nextPage > page.totalPages ? undefined : nextPage;
    },
    staleTime: 5_000,
  });
