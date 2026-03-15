import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { JobKeys } from './keys';
import type { JobDTO, JobDetails } from '../types/job';

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
