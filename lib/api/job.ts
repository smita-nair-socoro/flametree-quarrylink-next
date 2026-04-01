import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { JobKeys } from './keys';
import type { JobDTO, JobItem } from '../types/job';

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

export const useCreateJobItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<JobItem>) => {
      const response = await APIClient.jobs.createJobItem(data);
      return response;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({
        queryKey: JobKeys.detail(data.jobId),
      });
      queryClient.invalidateQueries({
        queryKey: [...JobKeys.detail(data.jobId), 'with-line-items'],
      });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JobDTO }) =>
      APIClient.jobs.updateJob(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
    },
  });
};

export const useUpdateJobItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JobItem> }) =>
      APIClient.jobs.updateJobItem(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JobKeys.list() });
      queryClient.invalidateQueries({ queryKey: JobKeys.detail(data.jobId) });
      queryClient.invalidateQueries({ queryKey: JobKeys.all });
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
