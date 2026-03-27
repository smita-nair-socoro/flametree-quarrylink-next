import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverKeys } from './keys';
import type { DriverDTO } from '../types/driver';

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
    mutationFn: (data: DriverDTO) => APIClient.drivers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DriverDTO }) =>
      APIClient.drivers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};

export const useAssignTrucks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driverId,
      truckIds,
    }: {
      driverId: number;
      truckIds: number[];
    }) => APIClient.drivers.assignTrucks(driverId, truckIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};

export const useUnassignTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driverId,
      truckId,
    }: {
      driverId: number;
      truckId: number;
    }) => APIClient.drivers.unassignTruck(driverId, truckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};
