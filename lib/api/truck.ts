import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { TruckKeys } from './keys';
import type { TruckDTO } from '../types/truck';

export const TrucksListQueryOptions = () =>
  queryOptions({
    queryKey: TruckKeys.list(),
    queryFn: () => APIClient.trucks.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const TruckByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: TruckKeys.detail(id),
    queryFn: () => APIClient.trucks.getById(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const TruckByIdWithDriversQueryOptions = (id: number) =>
  queryOptions({
    queryKey: TruckKeys.drivers(id),
    queryFn: () => APIClient.trucks.getByIdWithDrivers(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TruckDTO) => APIClient.trucks.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TruckKeys.list() });
    },
  });
};

export const useUpdateTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TruckDTO }) =>
      APIClient.trucks.update(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: TruckKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: TruckKeys.list() });
    },
  });
};

export const useDeleteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.trucks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TruckKeys.list() });
    },
  });
};

export const useUnassignDriverFromTruck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ truckId, data }: { truckId: number; data: { version: number; driverId: number } }) =>
      APIClient.trucks.unassignDriver(truckId, data),
    onSuccess: (_data, { truckId }) => {
      queryClient.invalidateQueries({ queryKey: TruckKeys.detail(truckId) });
      queryClient.invalidateQueries({ queryKey: TruckKeys.drivers(truckId) });
    },
  });
};

export const useAssignDriversToTruck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ truckId, data }: { truckId: number; data: { version: number; driverIds: number[] } }) =>
      APIClient.trucks.assignDrivers(truckId, data),
    onSuccess: (_data, { truckId }) => {
      queryClient.invalidateQueries({ queryKey: TruckKeys.detail(truckId) });
      queryClient.invalidateQueries({ queryKey: TruckKeys.drivers(truckId) });
    },
  });
};

export const useDeactivateTruck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.trucks.deactivate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: TruckKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: TruckKeys.list() });
    },
  });
};

export const TruckInspectionsQueryOptions = (truckId: number, params?: { page?: number; size?: number; sort?: string[] }) =>
  queryOptions({
    queryKey: TruckKeys.inspections(truckId),
    queryFn: () => APIClient.trucks.getInspections(truckId, params),
    enabled: !!truckId,
  });

export const useReactivateTruck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.trucks.reactivate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: TruckKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: TruckKeys.list() });
    },
  });
};
