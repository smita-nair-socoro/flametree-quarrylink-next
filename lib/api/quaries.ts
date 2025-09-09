import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { CategoryKeys, ProductKeys, QuarryKeys } from './query_keys';

export const ProductsListQueryOptions = () =>
  queryOptions({
    queryKey: ProductKeys.list(),
    queryFn: () => APIClient.products.list(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const QuarryListQueryOptions = () =>
  queryOptions({
    queryKey: QuarryKeys.list(),
    queryFn: () => APIClient.quarries.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const CategoryListQueryOptions = () =>
  queryOptions({
    queryKey: CategoryKeys.list(),
    queryFn: () => APIClient.categories.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
