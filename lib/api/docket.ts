import {
  keepPreviousData,
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, JobKeys, SchedulerKeys } from './keys';

function getCurrentISOWithOffset(): string {
  const d = new Date();
  const tzOffset = -d.getTimezoneOffset();
  const sign = tzOffset >= 0 ? '+' : '-';
  const absOffset = Math.abs(tzOffset);
  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(Math.floor(absOffset / 60));
  const mm = pad(absOffset % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${hh}:${mm}`;
}
import {
  DocketAssignRequest,
  DocketDTO,
  DocketOperationalUpdateRequest,
  ConflictCheckRequest,
  DuplicateDocketRequest,
  DocketsListResponse,
  DocketsPage,
} from '../types/docket';
import { DOCKET_STATUS } from '../types/docket-enums';
import { useJobStore } from '@/app/stores/job-store';
import { useDocketStore } from '@/app/stores/docket-store';

export const DocketStatisticsQueryOptions = () => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  return queryOptions({
    queryKey: [...DocketKeys.statistics(), dateKey],
    queryFn: () => APIClient.dockets.statistics(getCurrentISOWithOffset()),
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
  status?: string;
  type?: string;
  customerId?: number;
  productId?: number;
};

const DOCKET_COLUMN_TO_API_SORT: Record<string, string> = {
  docketNumber: 'docketNumber',
  docketType: 'jobItemType',
  jobReference: 'jobReference',
  customer: 'customer',
  product: 'product',
  deliveryDate: 'deliveryCollectionDate',
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
    return { sortBy: 'deliveryCollectionDate', sortOrder: 'asc' };
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
  return filter.value.map((v) => String(v));
}

export function toDocketApiFilterParams(
  filters: { id: string; value: unknown }[],
): Pick<DocketsListParams, 'status' | 'type' | 'customerId' | 'productId'> {
  const statusValues = getFacetFilterValues(filters, 'status');
  const typeValues = getFacetFilterValues(filters, 'docketType');
  const customerValues = getFacetFilterValues(filters, 'customer');
  const productValues = getFacetFilterValues(filters, 'product');

  const customerIdRaw = customerValues[0];
  const customerId =
    customerIdRaw && Number.isFinite(Number(customerIdRaw))
      ? Number(customerIdRaw)
      : undefined;

  const productIdRaw = productValues[0];
  const productId =
    productIdRaw && Number.isFinite(Number(productIdRaw))
      ? Number(productIdRaw)
      : undefined;

  return {
    status: statusValues.length ? statusValues.join(',') : undefined,
    type: typeValues.length ? typeValues.join(',') : undefined,
    customerId,
    productId,
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

export function getDocketsPageFromListResponse(
  data: DocketsListResponse | null | undefined,
): DocketsPage | null {
  return data?.dockets ?? null;
}

export function getDocketItemsFromListResponse(
  data: DocketsListResponse | null | undefined,
): DocketDTO[] {
  return data?.dockets?.content ?? [];
}

export function getDocketItemsFromJobPage(
  page: DocketsPage | null | undefined,
): DocketDTO[] {
  return page?.content ?? [];
}

export function buildDocketFacetOptions(response?: DocketsListResponse | null) {
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
        page: params?.page !== undefined ? toApiPage(params.page) : undefined,
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
      const nextPage = (lastPageParam as number) + 1;
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
  'page' | 'pageSize' | 'size' | 'sortBy' | 'sortOrder'
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
        page: params?.page !== undefined ? toApiPage(params.page) : undefined,
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
      const updatedDocket = data?.id ? data : await APIClient.dockets.getById(id);

      queryClient.setQueryData(DocketKeys.detail(updatedDocket.id), updatedDocket);
      useDocketStore.getState().setSelectedDocket(updatedDocket);
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(updatedDocket.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
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
        response.docket ?? (await APIClient.dockets.getById(id));

      if (updatedDocket) {
        queryClient.setQueryData(
          DocketKeys.detail(updatedDocket.id),
          updatedDocket,
        );
        useDocketStore.getState().setSelectedDocket(updatedDocket);
        queryClient.invalidateQueries({
          queryKey: DocketKeys.detail(updatedDocket.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
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
