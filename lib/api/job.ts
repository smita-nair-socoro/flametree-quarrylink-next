import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys, JobKeys } from './keys';
import type { JobDTO, JobItem, SettleJobResponse } from '../types/job';
import { useJobStore } from '@/app/stores/job-store';

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

export const JobsListQueryOptions = () =>
  queryOptions({
    queryKey: JobKeys.list(),
    queryFn: () => APIClient.jobs.getAll(),
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
      useJobStore.getState().setSelectedJob(data);
    },
  });
};
