import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverKeys, UserKeys } from './keys';
import { removeNewRecordId } from '../utils';
import type {
  DriverDTO,
  PutDriverDTO,
  PatchDriverInfoDTO,
  PatchDriverTypeDTO,
  PatchDriverTrucksDTO,
  PatchDriverHaulierDTO,
} from '../types/driver';
import { useDriverStore } from '@/app/stores/driver-store';

export const DriversListQueryOptions = () =>
  queryOptions({
    queryKey: DriverKeys.list(),
    queryFn: () => APIClient.drivers.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const DriverByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: DriverKeys.detail(id),
    queryFn: () => APIClient.drivers.getById(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const DriverAssignmentsQueryOptions = (id: number) =>
  queryOptions({
    queryKey: DriverKeys.assignments(id),
    queryFn: () => APIClient.drivers.getAssignments(id),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!id,
  });

export const DriverStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: DriverKeys.statistics(),
    queryFn: () => APIClient.drivers.statistics(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const DriverPreStartChecklistsQueryOptions = (
  driverId: number,
  params?: { page?: number; size?: number; sort?: string[] },
) =>
  queryOptions({
    queryKey: DriverKeys.checklists(driverId),
    queryFn: () => APIClient.drivers.getPreStartChecklists(driverId, params),
    enabled: !!driverId,
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DriverDTO) => APIClient.drivers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      // TEMP: Invalidate users list so the email→sub map stays fresh for
      // resend invitation. Remove once backend adds userSub to DriverDTO.
      queryClient.invalidateQueries({ queryKey: UserKeys.list() });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutDriverDTO }) =>
      APIClient.drivers.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      useDriverStore.getState().setSelectedDriver(data);
    },
  });
};

export const usePatchDriverInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverInfoDTO }) =>
      APIClient.drivers.patchInfo(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      useDriverStore.getState().setSelectedDriver(data);
    },
  });
};

export const usePatchDriverType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverTypeDTO }) =>
      APIClient.drivers.patchType(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      useDriverStore.getState().setSelectedDriver(data);
    },
  });
};

export const useUnassignTruckFromDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      driverId,
      data,
    }: {
      driverId: number;
      data: { version: number; truckId: number };
    }) => APIClient.drivers.unassignTruck(driverId, data),
    onSuccess: async (_data, { driverId }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(driverId) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      try {
        const updated = await APIClient.drivers.getById(driverId);
        useDriverStore.getState().setSelectedDriver(updated);
      } catch {
        /* non-critical */
      }
    },
  });
};

export const usePatchDriverTrucks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverTrucksDTO }) =>
      APIClient.drivers.patchTrucks(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      useDriverStore.getState().setSelectedDriver(data);
    },
  });
};

export const usePatchDriverHaulier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverHaulierDTO }) =>
      APIClient.drivers.patchHaulier(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      useDriverStore.getState().setSelectedDriver(data);
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.drivers.delete(id),
    onSuccess: (_data, id) => {
      removeNewRecordId('driver_main_data_table', id);
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      useDriverStore.getState().setSelectedDriver(null);
    },
  });
};

export const useDeactivateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.drivers.deactivate(id),
    onSuccess: async (_data, id) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      try {
        const updated = await APIClient.drivers.getById(id);
        useDriverStore.getState().setSelectedDriver(updated);
      } catch {
        /* non-critical */
      }
    },
  });
};

export const useReactivateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.drivers.reactivate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(data.id!) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
      useDriverStore.getState().setSelectedDriver(data);
    },
  });
};
