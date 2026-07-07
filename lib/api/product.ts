import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { ProductKeys } from './keys';
import { PostEligibilityCheckResponse } from '../types/eligibility-check';
import {
  Product,
  ProductListItem,
  ProductsListResponse,
  ProductsPage,
} from '../types/product';
import { extractEligibilityBlockingDependencies } from '../utils/error-message-helper';
import { removeNewRecordId } from '../utils';

export type ProductsListParams = {
  /** 0-based page index from UI tables (converted to 1-based for the API). */
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  materialIds?: number[];
  isActive?: boolean[];
  /** Restrict results to specific product ids (e.g. linking from a quarry/supplier). */
  ids?: number[];
};

const PRODUCT_COLUMN_TO_API_SORT: Record<string, string> = {
  product_name: 'productName',
  product_code: 'productCode',
  material_type: 'materialName',
  status: 'isActive',
};

export function toProductApiSortParams(
  sorting: {
    id: string;
    desc: boolean;
  }[],
): Pick<ProductsListParams, 'sortBy' | 'sortOrder'> {
  const sort = sorting[0];
  if (!sort) {
    return { sortBy: 'productName', sortOrder: 'asc' };
  }

  return {
    sortBy: PRODUCT_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
    sortOrder: sort.desc ? 'desc' : 'asc',
  };
}

function getFacetFilterValues(
  filters: { id: string; value: unknown }[],
  columnId: string,
): string[] {
  const filter = filters.find((f) => f.id === columnId);
  if (!filter || !Array.isArray(filter.value)) return [];
  return filter.value.map((v) => String(v));
}

export function toProductApiFilterParams(
  filters: { id: string; value: unknown }[],
): Pick<ProductsListParams, 'materialIds' | 'isActive'> {
  const statusValues = getFacetFilterValues(filters, 'status');
  const materialValues = getFacetFilterValues(filters, 'material_type');

  const isActive = statusValues
    .map((value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    })
    .filter((value): value is boolean => value !== undefined);

  const materialIds = materialValues
    .map(Number)
    .filter((n) => Number.isFinite(n));

  return {
    materialIds: materialIds.length ? materialIds : undefined,
    isActive: isActive.length ? isActive : undefined,
  };
}

/** Products API pagination is 1-based (page 1 = first page). */
function toApiPage(page: number): number {
  return page + 1;
}

export function isProductsListResponse(
  data: unknown,
): data is ProductsListResponse {
  return (
    typeof data === 'object' &&
    data != null &&
    'products' in data &&
    typeof (data as ProductsListResponse).products === 'object'
  );
}

export function buildProductFacetOptions(response?: ProductsListResponse | null) {
  return {
    materials: (response?.materials ?? []).map((material) => ({
      value: String(material.id),
      label: material.name,
    })),
    statuses: (response?.statuses ?? []).map((isActive) => ({
      value: String(isActive),
      label: isActive ? 'Available' : 'Unavailable',
    })),
  };
}

export function getProductsPageFromListResponse(
  data:
    | ProductsListResponse
    | ProductsPage
    | ProductListItem[]
    | null
    | undefined,
): ProductsPage | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
    };
  }
  if ('products' in data && data.products) {
    return data.products;
  }
  if ('content' in data) {
    return data;
  }
  return null;
}

export function getProductItemsFromListResponse(
  data:
    | ProductsListResponse
    | ProductsPage
    | ProductListItem[]
    | null
    | undefined,
): ProductListItem[] {
  return getProductsPageFromListResponse(data)?.content ?? [];
}

export function getProductItemsFromInfinitePages(
  pages:
    | (
        | ProductsListResponse
        | ProductsPage
        | ProductListItem[]
        | null
        | undefined
      )[]
    | undefined,
): ProductListItem[] {
  const seenIds = new Set<number>();
  const result: ProductListItem[] = [];

  for (const page of pages ?? []) {
    for (const product of getProductItemsFromListResponse(page)) {
      if (product.id == null || seenIds.has(product.id)) continue;
      seenIds.add(product.id);
      result.push(product);
    }
  }

  return result;
}

export const ProductsListQueryOptions = (params?: ProductsListParams) =>
  queryOptions({
    queryKey: [...ProductKeys.list(), params],
    queryFn: () =>
      APIClient.products.getAll({
        ...params,
        page: params?.page !== undefined ? toApiPage(params.page) : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });

export const ProductsSelectListQueryOptions = () =>
  ProductsListQueryOptions({ page: 0, pageSize: 1000 });

export const ProductsInfiniteListQueryOptions = (
  params: Omit<ProductsListParams, 'page'>,
) =>
  infiniteQueryOptions({
    queryKey: [...ProductKeys.list(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      APIClient.products.getAll({
        ...params,
        page: pageParam as number,
        pageSize: params.pageSize ?? 25,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const page = getProductsPageFromListResponse(lastPage);
      if (!page) return undefined;
      const content = page.content ?? [];
      if (content.length === 0) return undefined;
      const nextPage = (lastPageParam as number) + 1;
      if (nextPage > page.totalPages) return undefined;
      return nextPage;
    },
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
  return useMutation<PostEligibilityCheckResponse, Error, number>({
    mutationFn: (id: number) => APIClient.products.deleteProduct(id),
    onSuccess: (response, variables) => {
      const blocking = extractEligibilityBlockingDependencies(response);

      if (!blocking.hasBlockingDependencies) {
        removeNewRecordId('product_main_data_table', variables);

        queryClient.invalidateQueries({ queryKey: ProductKeys.list() });
        queryClient.invalidateQueries({ queryKey: ProductKeys.all });
        queryClient.invalidateQueries({
          queryKey: ProductKeys.detailWithMaterial(variables),
        });
        queryClient.invalidateQueries({
          queryKey: ProductKeys.detailWithQuarrySupplierProduct(variables),
        });
      }
    },
  });
};
