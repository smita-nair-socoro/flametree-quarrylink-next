import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { UserKeys } from './keys';
import { UserCreateDTO, UserDelete, UserUpdateDTO } from '../types/user';

export const UsersListQueryOptions = () =>
  queryOptions({
    queryKey: UserKeys.list(),
    queryFn: () => APIClient.users.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const UserDetailQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: UserKeys.detail(userId),
    queryFn: () => APIClient.users.getById(userId),
    staleTime: 5_000,
    enabled: !!userId,
  });

/**
 * Mutation hook for creating a new user.
 * Automatically invalidates the users list cache on success.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreateDTO) => APIClient.users.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UserKeys.list() });
      queryClient.invalidateQueries({ queryKey: UserKeys.all });
    },
  });
};

/**
 * Mutation hook for updating an existing user.
 * Automatically invalidates the users list and detail cache on success.
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateDTO }) =>
      APIClient.users.update(id, data),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: UserKeys.list() });
      queryClient.invalidateQueries({
        queryKey: UserKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: UserKeys.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserDelete }) =>
      APIClient.users.delete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UserKeys.list() });
      queryClient.invalidateQueries({ queryKey: UserKeys.all });
    },
  });
};
