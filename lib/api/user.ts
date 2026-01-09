import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { UserKeys } from './keys';
import {
  UserCreateDTO,
  UserDelete,
  UserUpdateDTO,
  ChangePasswordRequest,
} from '../types/user';

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

export const useGetUserDependencies = (id: string) =>
  queryOptions({
    queryKey: UserKeys.dependencies(id),
    queryFn: () => APIClient.users.getDependencies(id),
    staleTime: 5_000,
    enabled: !!id,
  });

/**
 * Mutation hook for changing user password.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      APIClient.users.changePassword(data),
  });
};

/**
 * Mutation hook for super admin to reset a user's password.
 * Does not invalidate any caches as password reset doesn't affect user data displayed in UI.
 *
 * @param userSub - The user's sub (Cognito user ID) from User.sub
 */
export const useResetPasswordBySuperAdmin = () => {
  return useMutation({
    mutationFn: (userSub: string) =>
      APIClient.users.resetPasswordBySuperAdmin(userSub),
  });
};
