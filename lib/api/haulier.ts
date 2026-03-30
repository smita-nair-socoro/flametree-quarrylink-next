import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { HaulierKeys } from './keys';
import type { HaulierCreateDTO } from '../types/haulier';

export const useCreateHaulier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HaulierCreateDTO) => APIClient.hauliers.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HaulierKeys.list() });
    },
  });
};
