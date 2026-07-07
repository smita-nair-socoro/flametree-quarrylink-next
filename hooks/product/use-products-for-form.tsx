'use client';

import React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  ProductDetailWithMaterialQueryOptions,
  ProductsInfiniteListQueryOptions,
  getProductItemsFromInfinitePages,
} from '@/lib/api/product';
import { ProductDetails, ProductListItem } from '@/lib/types/product';
import { FormSelectOption } from '@/components/ui/form-select';
import { QuotationLineItem } from '@/lib/types/quotation';
import { JobItem } from '@/lib/types/job';
import { useDebounce } from '@/hooks/use-debounce';

function toProductSelectOption(
  product: ProductListItem,
): FormSelectOption | null {
  if (!product.id) {
    return null;
  }

  return {
    label: product.productName || `Product #${product.id}`,
    value: product.id,
  };
}

export function buildProductSelectOptions(
  products: ProductListItem[],
): FormSelectOption[] {
  return products
    .map(toProductSelectOption)
    .filter((option): option is FormSelectOption => option != null)
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Map quotation line item fields into a ProductListItem for the form select. */
export function productListItemFromQuotationLineItem(
  lineItem: QuotationLineItem,
): ProductListItem | null {
  if (!lineItem.productId) return null;

  return {
    id: lineItem.productId,
    productName: lineItem.productName,
    productCode: '',
    isActive: true,
  };
}

/** Map job line item fields into a ProductListItem for the form select. */
export function productListItemFromJobItem(
  jobItem: JobItem,
): ProductListItem | null {
  if (!jobItem.productId) return null;

  const product = jobItem.product;
  if (product) {
    return {
      id: product.id,
      productName: product.productName,
      productCode: product.productCode,
      isActive: product.isActive,
      densityTonnagePerM3: product.densityTonnagePerM3,
      productDescription: product.productDescription,
      version: product.version,
    };
  }

  return {
    id: jobItem.productId,
    productName: '',
    productCode: '',
    isActive: true,
  };
}

function mergePaginatedWithLinkedProduct(
  paginated: ProductListItem[],
  linked?: ProductListItem | null,
): ProductListItem[] {
  if (!linked?.id) return paginated;

  const seenIds = new Set<number>();
  const merged: ProductListItem[] = [];

  for (const product of paginated) {
    if (product.id == null || seenIds.has(product.id)) continue;
    seenIds.add(product.id);
    merged.push(product);
  }

  if (!seenIds.has(linked.id)) {
    merged.push(linked);
  }

  return merged;
}

function ensureProductInList(
  products: ProductListItem[],
  product?: ProductListItem | null,
): ProductListItem[] {
  if (!product?.id) return products;
  if (products.some((item) => item.id === product.id)) return products;
  return [...products, product];
}

type UseProductsForFormOptions = {
  isEditing: boolean;
  productId?: number;
  enabled?: boolean;
  /**
   * When true during edit, loads paginated products and ensures the linked
   * product is included even if not on the first page.
   */
  allowProductChangeWhileEditing?: boolean;
  /** Pre-loaded linked product (e.g. from line item detail). Skips getById fetch. */
  linkedProduct?: ProductListItem | null;
  /** When false, blocks fetchNextPage until the select dropdown is open. */
  loadMoreEnabled?: boolean;
  /** Keeps the selected product visible in options while searching. */
  selectedProductId?: number;
};

function selectAsProductListItem(data: ProductDetails): ProductListItem {
  return {
    id: data.id,
    productName: data.productName,
    productCode: data.productCode,
    material: data.material,
    densityTonnagePerM3: data.densityTonnagePerM3,
    productDescription: data.productDescription,
    isActive: data.isActive,
    version: data.version,
  };
}

export function useProductsForForm({
  isEditing,
  productId,
  enabled = true,
  allowProductChangeWhileEditing = false,
  linkedProduct: linkedProductProp,
  loadMoreEnabled = false,
  selectedProductId,
}: UseProductsForFormOptions) {
  const [productSearch, setProductSearch] = React.useState('');
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const knownProductsRef = React.useRef<Map<number, ProductListItem>>(new Map());

  React.useEffect(() => {
    if (!loadMoreEnabled) {
      setProductSearch('');
    }
  }, [loadMoreEnabled]);

  const mergeLinkedProduct =
    enabled &&
    allowProductChangeWhileEditing &&
    isEditing &&
    Boolean(productId);

  const loadSingleProductOnly =
    enabled && isEditing && Boolean(productId) && !allowProductChangeWhileEditing;

  const loadPaginatedProducts = enabled && !loadSingleProductOnly;

  const { data: singleProduct, isLoading: isLoadingSingle } = useQuery({
    ...ProductDetailWithMaterialQueryOptions(productId ?? 0),
    enabled: loadSingleProductOnly,
    select: selectAsProductListItem,
  });

  const { data: fetchedLinkedProduct, isLoading: isLoadingLinkedProduct } =
    useQuery({
      ...ProductDetailWithMaterialQueryOptions(productId ?? 0),
      enabled: mergeLinkedProduct && !linkedProductProp,
      select: selectAsProductListItem,
    });

  const resolvedLinkedProduct =
    linkedProductProp ?? fetchedLinkedProduct ?? null;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
    isFetching,
  } = useInfiniteQuery({
    ...ProductsInfiniteListQueryOptions({
      pageSize: 25,
      isActive: [true],
      search: debouncedProductSearch.trim() || undefined,
      sortBy: 'productName',
      sortOrder: 'asc',
    }),
    enabled: loadPaginatedProducts,
  });

  const products = React.useMemo(() => {
    if (loadSingleProductOnly) {
      return singleProduct ? [singleProduct] : [];
    }

    const paginated = getProductItemsFromInfinitePages(infiniteData?.pages);
    const hasActiveSearch = debouncedProductSearch.trim().length > 0;

    let merged = paginated;

    if (mergeLinkedProduct && !hasActiveSearch) {
      merged = mergePaginatedWithLinkedProduct(
        paginated,
        resolvedLinkedProduct,
      );
    }

    if (selectedProductId) {
      const selectedFromKnown = knownProductsRef.current.get(selectedProductId);
      const selectedFallback =
        resolvedLinkedProduct?.id === selectedProductId
          ? resolvedLinkedProduct
          : (selectedFromKnown ?? null);
      merged = ensureProductInList(merged, selectedFallback);
    }

    for (const product of merged) {
      if (product.id != null) {
        knownProductsRef.current.set(product.id, product);
      }
    }

    return merged;
  }, [
    loadSingleProductOnly,
    singleProduct,
    infiniteData?.pages,
    mergeLinkedProduct,
    resolvedLinkedProduct,
    debouncedProductSearch,
    selectedProductId,
  ]);

  const productOptions = React.useMemo(
    () => buildProductSelectOptions(products),
    [products],
  );

  const onProductOptionsScrollEnd = React.useCallback(() => {
    if (
      loadSingleProductOnly ||
      !loadMoreEnabled ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return;
    }
    void fetchNextPage();
  }, [
    loadSingleProductOnly,
    loadMoreEnabled,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const isLoadingLinked =
    mergeLinkedProduct && !linkedProductProp && isLoadingLinkedProduct;

  const isSearchingProducts =
    productSearch.trim() !== debouncedProductSearch.trim() ||
    (debouncedProductSearch.trim().length > 0 && isFetching);

  return {
    products,
    productOptions,
    productSearch,
    onProductSearchChange: setProductSearch,
    isSearchingProducts,
    isLoadingProducts: loadSingleProductOnly
      ? isLoadingSingle
      : isLoadingInfinite || isLoadingLinked,
    isFetchingProducts: loadSingleProductOnly
      ? isLoadingSingle
      : isFetching || isLoadingLinked,
    hasMoreProductOptions: loadPaginatedProducts && !!hasNextPage,
    isLoadingMoreProductOptions: isFetchingNextPage,
    onProductOptionsScrollEnd: loadSingleProductOnly
      ? undefined
      : onProductOptionsScrollEnd,
  };
}
