import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, JobKeys } from './keys';
import type {
  JobDTO,
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
  /** Restrict results to specific job ids (e.g. linking from a converted quotation/docket). */
  ids?: number[];
};

const JOB_COLUMN_TO_API_SORT: Record<string, string> = {
  jobNumber: 'jobNumber',
  customerName: 'customerName',
  projectName: 'projectName',
  status: 'jobStatus',
  uninvoicedDockets: 'uninvoicedDocketsAmount',
  accountManagerName: 'accountManagerName',
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
): Pick<JobsListParams, 'statuses' | 'customerIds' | 'accountManagerSubs'> {
  const statusValues = getFacetFilterValues(filters, 'status');
  const customerValues = getFacetFilterValues(filters, 'customerName');
  const accountManagerValues = getFacetFilterValues(filters, 'accountManagerName');

  const customerIds = customerValues
    .map(Number)
    .filter((n) => Number.isFinite(n));

  return {
    statuses: statusValues.length ? statusValues : undefined,
    customerIds: customerIds.length ? customerIds : undefined,
    accountManagerSubs: accountManagerValues.length ? accountManagerValues : undefined,
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

export const JobItemsQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: JobKeys.items(jobId),
    queryFn: () => APIClient.jobs.getJobItems(jobId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.jobId) });
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
      deliveryPauseStrategy: 'STOP_ALL_DELIVERY_DOCKETS' | 'ALLOW_DRIVERS_TO_COMPLETE';
      collectionPauseStrategy: 'STOP_ACTIVE_COLLECTION_DOCKETS' | 'ALLOW_ACTIVE_COLLECTIONS_TO_COMPLETE';
    }) => APIClient.jobs.pause(id, deliveryPauseStrategy, collectionPauseStrategy),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
      queryClient.refetchQueries({ queryKey: DocketKeys.byJobId(data.id) });
      useJobStore.getState().setSelectedJob(data);
    },
  });
};
