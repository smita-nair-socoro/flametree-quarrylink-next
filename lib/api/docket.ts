import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys } from './keys';

export const DocketsListQueryOptions = () =>
  queryOptions({
    queryKey: DocketKeys.list(),
    queryFn: () => APIClient.dockets.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
