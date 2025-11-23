import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { CategoryKeys, ProductKeys, QuarryKeys } from './keys';

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

export const QuarryDetailQueryOptions = (quarryId: number) =>
  queryOptions({
    queryKey: QuarryKeys.detail(quarryId),
    queryFn: () => APIClient.quarries.getById(quarryId),
    staleTime: 5_000,
    enabled: !!quarryId && quarryId > 0,
  });

export const SuburbsListQueryOptions = () =>
  queryOptions({
    queryKey: QuarryKeys.suburbs(),
    queryFn: () => APIClient.quarries.getSuburbs(),
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
