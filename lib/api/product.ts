import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { ProductKeys } from './keys';

export const ProductsListQueryOptions = () =>
  queryOptions({
    queryKey: ProductKeys.list(),
    queryFn: () => APIClient.products.getAll(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const ProductDetailWithMaterialQueryOptions = (productId: number) =>
  queryOptions({
    queryKey: ProductKeys.detailWithMaterial(productId),
    queryFn: () => APIClient.products.getByIdWithMaterial(productId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!productId,
  });

export const ProductDetailWithQuarrySupplierProductQueryOptions = (
  productId: number
) =>
  queryOptions({
    queryKey: ProductKeys.detailWithQuarrySupplierProduct(productId),
    queryFn: () =>
      APIClient.products.getByIdWithQuarrySupplierProduct(productId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!productId,
  });
