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
      if (variables.product_id) {
        queryClient.invalidateQueries({
          queryKey: ProductKeys.detailWithQuarrySupplierProduct(
            variables.product_id
          ),
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
