import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { HaulierKeys } from './keys';
import type { HaulierCreateDTO } from '../types/haulier';

export const HauliersListQueryOptions = () => ({
  queryKey: HaulierKeys.list(),
  queryFn: () => APIClient.hauliers.getAll(),
});

export const HaulierDetailQueryOptions = (id: number) => ({
  queryKey: HaulierKeys.detail(id),
  queryFn: () => APIClient.hauliers.getById(id),
  enabled: !!id,
});

export const HaulierDriversQueryOptions = (haulierId: number) =>
  queryOptions({
    queryKey: HaulierKeys.drivers(haulierId),
    queryFn: () => APIClient.hauliers.getDrivers(haulierId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!haulierId,
  });

export const HaulierTrucksQueryOptions = (haulierId: number) =>
  queryOptions({
    queryKey: HaulierKeys.trucks(haulierId),
    queryFn: () => APIClient.hauliers.getTrucks(haulierId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!haulierId,
  });

export const useUpdateHaulier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HaulierCreateDTO }) =>
      APIClient.hauliers.update(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: HaulierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: HaulierKeys.list() });
    },
  });
};

export const useCreateHaulier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HaulierCreateDTO) => APIClient.hauliers.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HaulierKeys.list() });
    },
  });
};
