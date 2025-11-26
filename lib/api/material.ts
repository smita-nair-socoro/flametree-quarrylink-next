import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { MaterialsKeys } from './keys';

export const MaterialsListQueryOptions = () =>
  queryOptions({
    queryKey: MaterialsKeys.list(),
    queryFn: () => APIClient.materials.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
