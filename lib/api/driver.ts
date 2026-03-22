import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DriverKeys } from './keys';

export const DriversListQueryOptions = () =>
  queryOptions({
    queryKey: DriverKeys.list(),
    queryFn: () => APIClient.drivers.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
