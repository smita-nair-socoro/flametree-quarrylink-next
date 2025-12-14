import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { UserKeys } from './keys';

export const UsersListQueryOptions = () =>
  queryOptions({
    queryKey: UserKeys.list(),
    queryFn: () => APIClient.users.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
