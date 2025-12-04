import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { QuarrySupplierProductKeys } from './keys';
import { ProductKeys } from './keys';
import { QuarrySupplierProduct } from '../types/quarry';

export const QuarrySupplierProductDetailQueryOptions = (
  quarrySupplierId: number,
  productId: number
) =>
  queryOptions({
    queryKey: QuarrySupplierProductKeys.detail(quarrySupplierId, productId),
    queryFn: () =>
      APIClient.quarrySupplierProducts.getById(quarrySupplierId, productId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    enabled: !!quarrySupplierId && !!productId,
  });

export const useCreateQuarrySupplierProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<QuarrySupplierProduct>) =>
      APIClient.quarrySupplierProducts.create(data),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: QuarrySupplierProductKeys.all,
      });
      // Invalidate product details with suppliers
      const productId =
        (variables as unknown as { productId?: number }).productId ??
        (variables as unknown as { product_id?: number }).product_id;
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ProductKeys.detailWithQuarrySupplierProduct(productId),
        });
      }
    },
  });
};

export const useUpdateQuarrySupplierProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quarrySupplierId,
      productId,
      data,
    }: {
      quarrySupplierId: number;
      productId: number;
      data: Partial<QuarrySupplierProduct>;
    }) =>
      APIClient.quarrySupplierProducts.update(
        quarrySupplierId,
        productId,
        data
      ),
    onSuccess: (_, variables) => {
      // Invalidate the specific quarry-supplier-product
      queryClient.invalidateQueries({
        queryKey: QuarrySupplierProductKeys.detail(
          variables.quarrySupplierId,
          variables.productId
        ),
      });
      // Invalidate all quarry-supplier-products
      queryClient.invalidateQueries({
        queryKey: QuarrySupplierProductKeys.all,
      });
      // Invalidate product details with suppliers
      queryClient.invalidateQueries({
        queryKey: ProductKeys.detailWithQuarrySupplierProduct(
          variables.productId
        ),
      });
    },
  });
};

export const useDeleteQuarrySupplierProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { blockingQuoteDtos?: unknown[] },
    Error,
    { quarrySupplierId: number; productId: number }
  >({
    mutationFn: ({
      quarrySupplierId,
      productId,
    }: {
      quarrySupplierId: number;
      productId: number;
    }) => APIClient.quarrySupplierProducts.delete(quarrySupplierId, productId),
    onMutate: (variables) => {
      console.log('[Mutation] Delete quarry-supplier-product vars:', variables);
    },
    onSuccess: (response, variables) => {
      console.log(
        '[Mutation] Delete quarry-supplier-product response:',
        response
      );
      const blocking = Array.isArray(response?.blockingQuoteDtos)
        ? response.blockingQuoteDtos
        : [];
      console.log('[Mutation] blockingQuoteDtos length:', blocking.length);
      // If not blocked (empty list), deletion occurred -> invalidate caches
      if (blocking.length === 0) {
        queryClient.invalidateQueries({
          queryKey: QuarrySupplierProductKeys.detail(
            variables.quarrySupplierId,
            variables.productId
          ),
        });
        queryClient.invalidateQueries({
          queryKey: QuarrySupplierProductKeys.all,
        });
        queryClient.invalidateQueries({
          queryKey: ProductKeys.detailWithQuarrySupplierProduct(
            variables.productId
          ),
        });
      }
      // If blocked, we intentionally do not invalidate; caller will handle UI
    },
    onError: (error, variables) => {
      console.error('[Mutation] Delete quarry-supplier-product failed:', {
        error,
        variables,
      });
    },
  });
};
