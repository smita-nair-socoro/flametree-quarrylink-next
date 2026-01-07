import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { ProductKeys } from './keys';
import { Product } from '../types/product';

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

export const ProductReportingQueryOptions = () =>
  queryOptions({
    queryKey: ProductKeys.reporting(),
    queryFn: () => APIClient.products.reporting(),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      APIClient.products.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProductKeys.list() });
      queryClient.invalidateQueries({ queryKey: ProductKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      APIClient.products.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ProductKeys.list() });
      queryClient.invalidateQueries({ queryKey: ProductKeys.all });
      queryClient.invalidateQueries({
        queryKey: ProductKeys.detailWithMaterial(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ProductKeys.detailWithQuarrySupplierProduct(variables.id),
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, number>({
    mutationFn: (id: number) => APIClient.products.deleteProduct(id),
    onMutate: (variables) => {
      console.log('[Mutation] Delete product vars:', { id: variables });
    },
    onSuccess: (response, variables) => {
      console.log('[Mutation] Delete product response:', response);
      console.log('[Mutation] Delete product variables:', { id: variables });
      queryClient.invalidateQueries({ queryKey: ProductKeys.list() });
      queryClient.invalidateQueries({ queryKey: ProductKeys.all });
      queryClient.invalidateQueries({
        queryKey: ProductKeys.detailWithMaterial(variables),
      });
      queryClient.invalidateQueries({
        queryKey: ProductKeys.detailWithQuarrySupplierProduct(variables),
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });
};
