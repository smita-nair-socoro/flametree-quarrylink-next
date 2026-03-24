import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys } from './keys';
import { DocketDTO } from '../types/docket';

export const DocketsListQueryOptions = () =>
  queryOptions({
    queryKey: DocketKeys.list(),
    queryFn: () => APIClient.dockets.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateDocket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DocketDTO>) => APIClient.dockets.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
    },
  });
};

export const DocketsByJobIdQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: DocketKeys.byJobId(jobId),
    queryFn: () => APIClient.dockets.getByJobId(jobId),
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
    },
  });
};
