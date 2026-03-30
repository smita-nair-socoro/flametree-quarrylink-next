import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { HaulierKeys } from './keys';
import type { HaulierCreateDTO } from '../types/haulier';

export const useGetAllHauliers = () => {
  return useQuery({
    queryKey: HaulierKeys.list(),
    queryFn: () => APIClient.hauliers.getAll(),
  });
};

export const useGetHaulierById = (id: number) => {
  return useQuery({
    queryKey: HaulierKeys.detail(id),
    queryFn: () => APIClient.hauliers.getById(id),
    enabled: !!id,
  });
};

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
