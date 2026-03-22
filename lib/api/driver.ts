import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverKeys } from './keys';
import type { DriverCreateDTO } from '../types/driver';

export const DriversListQueryOptions = () =>
  queryOptions({
    queryKey: DriverKeys.list(),
    queryFn: () => APIClient.drivers.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DriverCreateDTO) => APIClient.drivers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};
