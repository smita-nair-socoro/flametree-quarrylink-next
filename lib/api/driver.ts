import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverKeys } from './keys';
import type { DriverDTO, PutDriverDTO, PatchDriverInfoDTO, PatchDriverTypeDTO, PatchDriverTrucksDTO, PatchDriverHaulierDTO } from '../types/driver';

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
    mutationFn: ({ id, data }: { id: number; data: PutDriverDTO }) =>
      APIClient.drivers.update(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};

export const usePatchDriverInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverInfoDTO }) =>
      APIClient.drivers.patchInfo(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};

export const usePatchDriverType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverTypeDTO }) =>
      APIClient.drivers.patchType(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};

export const usePatchDriverTrucks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverTrucksDTO }) =>
      APIClient.drivers.patchTrucks(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};

export const usePatchDriverHaulier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDriverHaulierDTO }) =>
      APIClient.drivers.patchHaulier(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DriverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: DriverKeys.list() });
    },
  });
};
