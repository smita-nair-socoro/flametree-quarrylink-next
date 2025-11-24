import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { CategoryKeys, ProductKeys, QuarryKeys } from './keys';
import { Quarry } from '../types/quarry';
import { Address } from '../types/address';

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

/**
 * Mutation hook for creating a new quarry or supplier.
 * Automatically invalidates the quarries list cache on success.
 */
export const useCreateQuarry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Quarry) => APIClient.quarries.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuarryKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.all });
    },
  });
};

/**
 * Mutation hook for updating an existing quarry or supplier.
 * Automatically invalidates the quarries list and detail cache on success.
 */
export const useUpdateQuarry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      APIClient.quarries.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QuarryKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QuarryKeys.all });
    },
  });
};
