'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DepartmentKeys } from './keys';
import { Department } from '../types/department';
import { APIClient } from './APIClient';

export const useGetDepartments = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: DepartmentKeys.list(),
    queryFn: () => APIClient.departments.getDepartments(),
    enabled: options?.enabled ?? true,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Pick<Department, 'departmentName'>) =>
      APIClient.departments.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.list() });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Pick<Department, 'departmentName'>;
    }) => APIClient.departments.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.list() });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => APIClient.departments.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.list() });
    },
  });
};
