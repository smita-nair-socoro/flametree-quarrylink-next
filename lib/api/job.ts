import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, JobKeys } from './keys';
import type {
  JobDTO,
  JobDetails,
  JobItem,
  JobsListResponse,
  JobsPage,
  SettleJobResponse,
} from '../types/job';
import { useJobStore } from '@/app/stores/job-store';

export type JobsListParams = {
  /** 0-based page index from UI tables (converted to 1-based for the API). */
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  statuses?: string[];
  customerIds?: number[];
  accountManagerSubs?: string[];
  quarrySupplierIds?: number[];
  poNumbers?: string[];
  /** Restrict results to specific job ids (e.g. linking from a converted quotation/docket). */
  ids?: number[];
};

const JOB_COLUMN_TO_API_SORT: Record<string, string> = {
  jobNumber: 'jobNumber',
  customerName: 'customerName',
  projectName: 'projectName',
  uninvoicedDockets: 'uninvoicedDocketsAmount',
  status: 'jobStatus',
  quarrySupplierName: 'quarrySupplierName',
  poNumber: 'poNumber',
  fromSiteName: 'fromSiteName',
  toSiteName: 'toSiteName',
  docketCount: 'docketCount',
};

export function toJobApiSortParams(
  sorting: { id: string; desc: boolean }[],
): Pick<JobsListParams, 'sortBy' | 'sortOrder'> {
  const sort = sorting[0];
  if (!sort) return { sortBy: 'jobNumber', sortOrder: 'desc' };
  return {
    sortBy: JOB_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
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

export function toJobApiFilterParams(
  filters: { id: string; value: unknown }[],
): Pick<
  JobsListParams,
  | 'statuses'
  | 'customerIds'
  | 'accountManagerSubs'
  | 'quarrySupplierIds'
  | 'poNumbers'
> {
  const statusValues = getFacetFilterValues(filters, 'status');
  const customerValues = getFacetFilterValues(filters, 'customerName');
  const accountManagerValues = getFacetFilterValues(
    filters,
    'accountManagerName',
  );
  const quarrySupplierValues = getFacetFilterValues(
    filters,
    'quarrySupplierName',
  );
  const poNumberValues = getFacetFilterValues(filters, 'poNumber');

  const customerIds = customerValues
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const quarrySupplierIds = quarrySupplierValues
    .map(Number)
    .filter((n) => Number.isFinite(n));

  return {
    statuses: statusValues.length ? statusValues : undefined,
    customerIds: customerIds.length ? customerIds : undefined,
    accountManagerSubs: accountManagerValues.length
      ? accountManagerValues
      : undefined,
    quarrySupplierIds: quarrySupplierIds.length
      ? quarrySupplierIds
      : undefined,
    poNumbers: poNumberValues.length ? poNumberValues : undefined,
  };
}

/** Jobs API pagination is 1-based (page 1 = first page). */
function toApiPage(page: number): number {
  return page + 1;
}

function formatFacetEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function getJobsPageFromListResponse(
  data: JobsListResponse | null | undefined,
): JobsPage | null {
  return data?.jobs ?? null;
}

export function getJobItemsFromListResponse(
  data: JobsListResponse | null | undefined,
): JobDTO[] {
  return data?.jobs?.content ?? [];
}

export function buildJobFacetOptions(response?: JobsListResponse | null) {
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
    quarrySuppliers: (response?.quarrySuppliers ?? []).map((quarry) => ({
      value: quarry.id,
      label: quarry.name,
    })),
  };
}

/**
 * Mutation hook for creating a new job.
 * Automatically invalidates the jobs list cache on success.
 */
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<JobDTO, 'id' | 'jobNumber'>) =>
      APIClient.jobs.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
    },
  });
};

export const JobsListQueryOptions = (params?: JobsListParams) =>
  queryOptions({
    queryKey: [...JobKeys.list(), params],
    queryFn: () =>
      APIClient.jobs.getAll({
        ...params,
        page: params?.page !== undefined ? toApiPage(params.page) : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const InternalTransferJobsListQueryOptions = (
  params?: JobsListParams,
) =>
  queryOptions({
    queryKey: JobKeys.internalTransfers(params),
    queryFn: () =>
      APIClient.jobs.getInternalTransfers({
        ...params,
        page: params?.page !== undefined ? toApiPage(params.page) : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateInternalTransferJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      fromSiteId: number;
      toSiteId: number;
      notes?: string;
    }) => APIClient.jobs.createInternalTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
    },
  });
};

export const useUpdateInternalTransferJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        version: number;
        fromSiteId?: number;
        toSiteId?: number;
        notes?: string;
      };
    }) => APIClient.jobs.updateInternalTransfer(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      queryClient.invalidateQueries({ queryKey: JobKeys.items(variables.id) });
    },
  });
};

export const useCreateInternalTransferJobItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      productId,
      quantity,
    }: {
      jobId: number;
      productId: number;
      quantity: number;
    }) =>
      APIClient.jobs.createInternalTransferJobItem(jobId, {
        productId,
        quantity,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: JobKeys.items(variables.jobId),
      });
    },
  });
};

/** Jobs API pagination is 1-based, matching JobsListQueryOptions. */
export const JobsInfiniteListQueryOptions = (
  params: Omit<JobsListParams, 'page'> = {},
) =>
  infiniteQueryOptions({
    queryKey: [...JobKeys.list(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.jobs.getAll({
        ...params,
        page: pageParam as number,
        pageSize: params.pageSize ?? 25,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getJobsPageFromListResponse(lastPage);
      if (!page) return undefined;
      if ((page.content ?? []).length === 0) return undefined;
      const nextPage = (lastPageParam as number) + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export function getJobsFromInfinitePages(
  pages: (JobsListResponse | null | undefined)[] | undefined,
): JobDTO[] {
  const seenIds = new Set<number>();
  const result: JobDTO[] = [];

  for (const page of pages ?? []) {
    for (const job of page?.jobs?.content ?? []) {
      if (job.id == null || seenIds.has(job.id)) continue;
      seenIds.add(job.id);
      result.push(job);
    }
  }

  return result;
}

export type JobItemsParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
};

export const JobItemsQueryOptions = (jobId: number, params?: JobItemsParams) =>
  queryOptions({
    queryKey: params ? [...JobKeys.items(jobId), params] : JobKeys.items(jobId),
    queryFn: () => APIClient.jobs.getJobItems(jobId, params),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const JobItemsInfiniteQueryOptions = (
  jobId: number,
  params: Omit<JobItemsParams, 'page'> = {},
) =>
  infiniteQueryOptions({
    queryKey: [...JobKeys.items(jobId), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.jobs.getJobItems(jobId, {
        ...params,
        page: pageParam as number,
        pageSize: params.pageSize ?? 25,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = lastPage?.jobItems;
      if (!page) return undefined;
      if ((page.content ?? []).length === 0) return undefined;
      const nextPage = (lastPageParam as number) + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
    staleTime: 5_000,
  });

export function getJobLineItemsFromInfinitePages(
  pages: (JobDetails | null | undefined)[] | undefined,
): JobItem[] {
  const seenIds = new Set<number>();
  const result: JobItem[] = [];

  for (const page of pages ?? []) {
    for (const item of page?.jobItems?.content ?? []) {
      if (item.id == null || seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      result.push(item);
    }
  }

  return result;
}

export const JobItemByIdQueryOptions = (jobItemId: number) =>
  queryOptions({
    queryKey: JobKeys.item(jobItemId),
    queryFn: () => APIClient.jobs.getJobItemById(jobItemId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const JobStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: JobKeys.statistics(),
    queryFn: () => APIClient.jobs.statistics(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCancelJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      cancelReason,
      additionalNotes,
    }: {
      id: number;
      cancelReason: string;
      additionalNotes: string;
    }) => APIClient.jobs.cancelJob(id, cancelReason, additionalNotes),

    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      try {
        const updatedJob = await APIClient.jobs.getJobItems(data.id);
        useJobStore.getState().setSelectedJob(updatedJob);
      } catch {
        useJobStore.getState().setSelectedJob(data);
      }
    },
  });
};

export const useCreateJobItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<JobItem>) => {
      const response = await APIClient.jobs.createJobItem(data);
      return response;
    },

    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({
        queryKey: JobKeys.detail(data.jobId),
      });
      queryClient.invalidateQueries({
        queryKey: [...JobKeys.detail(data.jobId), 'with-line-items'],
      });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });

      // Sync Zustand store so the FormDialog status badge reflects the
      // backend-driven transition (e.g. COMPLETED/SETTLED → IN_PROGRESS)
      try {
        const updatedJob = await APIClient.jobs.getJobItems(data.jobId);
        useJobStore.getState().setSelectedJob(updatedJob);
      } catch {
        // non-critical — badge will catch up on next open
      }
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JobDTO }) =>
      APIClient.jobs.updateJob(id, data),

    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      try {
        const updatedJob = await APIClient.jobs.getJobItems(data.id);
        useJobStore.getState().setSelectedJob(updatedJob);
      } catch {
        useJobStore.getState().setSelectedJob(data);
      }
    },
  });
};

export const useSettleJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await APIClient.jobs.settle(id);
      if (!response.job) {
        const error = new Error('Settlement blocked') as Error & {
          response: {
            status: number;
            statusText: string;
            data: SettleJobResponse;
          };
        };
        error.response = { status: 200, statusText: 'OK', data: response };
        throw error;
      }
      return response;
    },

    onSuccess: async (data, id) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      try {
        const updatedJob = await APIClient.jobs.getJobItems(id);
        useJobStore.getState().setSelectedJob(updatedJob);
      } catch {
        useJobStore.getState().setSelectedJob(data.job!);
      }
    },
  });
};

export const useUpdateJobItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JobItem> }) =>
      APIClient.jobs.updateJobItem(id, data),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.jobId) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });

      // Sync Zustand store so the FormDialog status badge reflects the
      // backend-driven transition (e.g. COMPLETED/SETTLED → IN_PROGRESS)
      try {
        const updatedJob = await APIClient.jobs.getJobItems(data.jobId);
        useJobStore.getState().setSelectedJob(updatedJob);
      } catch {
        // non-critical — badge will catch up on next open
      }
    },
  });
};

export const useDeleteJobItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.jobs.deleteJobItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
    },
  });
};

export const useResumeJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => APIClient.jobs.resume(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      queryClient.invalidateQueries({ queryKey: DocketKeys.byJobId(data.id) });
      useJobStore.getState().setSelectedJob(data);
    },
  });
};

export const useCompleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.jobs.complete(id),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.job.id) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      useJobStore.getState().setSelectedJob(data.job);
    },
  });
};

export const usePauseJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      deliveryPauseStrategy,
      collectionPauseStrategy,
    }: {
      id: number;
      deliveryPauseStrategy:
        | 'STOP_ALL_DELIVERY_DOCKETS'
        | 'ALLOW_DRIVERS_TO_COMPLETE';
      collectionPauseStrategy:
        | 'STOP_ACTIVE_COLLECTION_DOCKETS'
        | 'ALLOW_ACTIVE_COLLECTIONS_TO_COMPLETE';
    }) =>
      APIClient.jobs.pause(id, deliveryPauseStrategy, collectionPauseStrategy),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      queryClient.refetchQueries({ queryKey: DocketKeys.byJobId(data.id) });
      useJobStore.getState().setSelectedJob(data);
    },
  });
};

export const JobAttachmentsQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: JobKeys.attachments(jobId),
    queryFn: () => APIClient.jobs.getAttachments(jobId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!jobId,
  });

export type UploadJobAttachmentParams = {
  jobId: number;
  category: string;
  fileName: string;
  file: File;
};

export const useUploadJobAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      category,
      fileName,
      file,
    }: UploadJobAttachmentParams) =>
      APIClient.jobs.uploadAttachment(jobId, {
        category,
        fileName,
        file,
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: JobKeys.attachments(variables.jobId),
      });
    },
  });
};

export const useDeleteJobAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      attachmentId,
    }: {
      jobId: number;
      attachmentId: number;
    }) => APIClient.jobs.deleteAttachment(jobId, attachmentId),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: JobKeys.attachments(variables.jobId),
      });
    },
  });
};
