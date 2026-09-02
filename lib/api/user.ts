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
  AccountManager,
} from '../types/user';

export const UsersListQueryOptions = () =>
  queryOptions({
    queryKey: UserKeys.list(),
    queryFn: () => APIClient.users.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const AccountManagersListQueryOptions = () =>
  queryOptions<AccountManager[]>({
    queryKey: UserKeys.accountManagers(),
    queryFn: () => APIClient.users.getAccountManagers(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const OperationsListQueryOptions = () =>
  queryOptions<AccountManager[]>({
    queryKey: UserKeys.operations(),
    queryFn: () => APIClient.users.getOperations(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

/**
 * Mutation hook for adding a user to the Operations notification group.
 * Cache invalidation is handled by the caller so that batched adds only
 * trigger a single refetch.
 */
export const useAddUserToOperations = () =>
  useMutation({
    mutationFn: (id: string) => APIClient.users.addToOperations(id),
  });

/**
 * Mutation hook for removing a user from the Operations notification group.
 * Cache invalidation is handled by the caller.
 */
export const useRemoveUserFromOperations = () =>
  useMutation({
    mutationFn: (id: string) => APIClient.users.removeFromOperations(id),
  });

export const VoidTransactionsListQueryOptions = () =>
  queryOptions<AccountManager[]>({
    queryKey: UserKeys.voidTransactions(),
    queryFn: () => APIClient.users.getVoidTransactions(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useAddUserToVoidTransactions = () =>
  useMutation({
    mutationFn: (id: string) => APIClient.users.addToVoidTransactions(id),
  });

export const useRemoveUserFromVoidTransactions = () =>
  useMutation({
    mutationFn: (id: string) => APIClient.users.removeFromVoidTransactions(id),
  });

export const UserDetailQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: UserKeys.detail(userId),
    queryFn: () => APIClient.users.getById(userId),
    staleTime: 5_000,
    enabled: !!userId,
    retry: (failureCount, error) => {
      // Don't retry 404s — the user doesn't exist in the orchestrator DB
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { status?: number } }).response;
        if (response?.status === 404) return false;
      }
      return failureCount < 3;
    },
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

export const useResendUserInvitation = () => {
  return useMutation({
    mutationFn: (sub: string) => APIClient.users.resendInvitation(sub),
  });
};
