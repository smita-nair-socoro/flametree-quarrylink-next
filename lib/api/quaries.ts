import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { ProductsQueryParams } from '../types/product';
import { APIClient } from './APIClient';
import { ProductKeys } from './query_keys';

export const ProductsListQueryOptions = (params: ProductsQueryParams) =>
  queryOptions({
    queryKey: ProductKeys.list_v2(params),
    queryFn: () => APIClient.products.list(params),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
