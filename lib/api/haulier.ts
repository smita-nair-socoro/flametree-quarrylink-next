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

export const useCreateHaulier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HaulierCreateDTO) => APIClient.hauliers.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HaulierKeys.list() });
    },
  });
};
