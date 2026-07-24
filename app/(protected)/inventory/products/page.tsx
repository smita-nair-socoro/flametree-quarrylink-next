'use client';

import React from 'react';
import { ProductDetails } from '@/lib/types/product';
import { productColumns } from './(components)/(data-tables)/products/columns';
import {
  Gem,
  PackageX,
  TrendingUp,
  Package,
  Tag,
  Box,
} from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from './(components)/forms/product-form';
import { useQuery } from '@tanstack/react-query';
import {
  ProductsListQueryOptions,
  ProductReportingQueryOptions,
  getProductsPageFromListResponse,
  toProductApiFilterParams,
  toProductApiSortParams,
  buildProductFacetOptions,
  isProductsListResponse,
} from '@/lib/api/product';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { centsToDollars } from '@/lib/utils/currency';
import { useAccountingSoftwareProvider } from '@/lib/utils/tenant-config-helper';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { useProductActions } from '@/hooks/use-product-actions';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { ProductTableActions } from './(components)/(data-tables)/products/product-table-actions';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { actions, confirmDialogs, viewDialog } = useProductActions();
  const accSoftwareProvider = useAccountingSoftwareProvider();
  const readOnly = accSoftwareProvider === 'MYOB_ACUMATICA';
  const linkedProductIdsParam = searchParams.get('linkedProductIds');
  const linkedQuarrySupplierIdParam = searchParams.get(
    'linkedQuarrySupplierId',
  );
  const linkedQuarrySupplierNameParam = searchParams.get(
    'linkedQuarrySupplierName',
  );

  const linkedProductIdsSet = React.useMemo(() => {
    if (!linkedProductIdsParam) return null;
    const ids = linkedProductIdsParam
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return new Set(ids);
  }, [linkedProductIdsParam]);

  const isLinkedFilter = !!linkedProductIdsSet;

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [facetFilters, setFacetFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'productName', desc: false },
  ]);

  const apiSortParams = React.useMemo(
    () => toProductApiSortParams(sorting),
    [sorting],
  );

  const apiFilterParams = React.useMemo(
    () => toProductApiFilterParams(facetFilters),
    [facetFilters],
  );

  const {
    data: productsData,
    isLoading,
    isFetching,
    error,
    isError,
  } = useQuery(
    ProductsListQueryOptions({
      page: isLinkedFilter ? 0 : pageIndex,
      pageSize: isLinkedFilter ? 1000 : pageSize,
      search: search.trim() || undefined,
      ...apiSortParams,
      ...apiFilterParams,
    }),
  );

  const { data: reportingData } = useQuery(ProductReportingQueryOptions());

  const productPage = React.useMemo(
    () => getProductsPageFromListResponse(productsData),
    [productsData],
  );

  const facetOptions = React.useMemo(
    () =>
      buildProductFacetOptions(
        isProductsListResponse(productsData) ? productsData : null,
      ),
    [productsData],
  );

  const statsCards: StatsCardData[] = [
    {
      title: 'Highest Revenue Product',
      value: reportingData?.mostQuotedProductName || 'QuarryLink Product',
      description: `$${centsToDollars(
        reportingData?.mostQuotedProductValueThisMonth || 0,
      )} this month`,
      icon: Gem,
      iconBgColor: 'bg-[#FEF3C6]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Unavailable Products',
      value: reportingData?.unavailableProductsCount || 0,
      description: `${reportingData?.unavailableProductsPercentOfInventory || 0
        }% of inventory`,
      icon: PackageX,
      iconBgColor: 'bg-[#FFE2E2]',
      iconColor: 'text-[#9F0712]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Average Product Margin',
      value: `${reportingData?.averageProductMarginThisMonth || 0}%`,
      description: `${reportingData?.averageProductMarginChangeVsLastMonth || 0
        }% last month`,
      icon: TrendingUp,
      iconBgColor: 'bg-[#D0FAE5]',
      iconColor: 'text-[#00A63E]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Total Products',
      value: reportingData?.totalProducts || 0,
      description: `+${reportingData?.productsAddedThisMonth || 0
        } added this month`,
      icon: Package,
      iconBgColor: 'bg-[#CEFAFE]',
      iconColor: 'text-[#0891B2]',
      descriptionColor: 'text-[#00A63E]',
    },
  ];

  React.useEffect(() => {
    if (isError && error) {
      console.error('Product API Error:', error);
    }
  }, [isError, error]);

  const handleRowClick = (product: ProductDetails) => {
    actions.view(product);
  };

  const renderProductCard = React.useCallback((product: ProductDetails) => {
    const materialName = product.material?.name || '';

    return (
      <MobileCard
        title={product.productName}
        description={
          <>
            <Tag className="h-3.5 w-3.5" />
            <span className="truncate">{product.productCode}</span>
          </>
        }
        badges={
          <>
            {product.status && (
              <TableBadges names={[product.status]} visibleCount={1} />
            )}
            {materialName && (
              <TableBadges names={[materialName]} visibleCount={1} />
            )}
          </>
        }
        actions={<ProductTableActions product={product} />}
        fields={[
          {
            icon: <Box className="h-4 w-4" />,
            label: 'Material',
            value: materialName,
          },
        ]}
      />
    );
  }, []);

  const items: ProductDetails[] = React.useMemo(
    () =>
      (productPage?.content ?? []).map(
        (product) =>
          ({
            ...product,
            productId: product.id,
            material: product.material || { id: 0, name: '', version: 0 },
          }) as unknown as ProductDetails,
      ),
    [productPage],
  );

  const filteredItems = React.useMemo(() => {
    if (!linkedProductIdsSet) return items;
    return items.filter((p) => linkedProductIdsSet.has(p.id));
  }, [items, linkedProductIdsSet]);

  const totalElements = isLinkedFilter
    ? filteredItems.length
    : (productPage?.totalElements ?? items.length);
  const totalPages = isLinkedFilter
    ? 1
    : (productPage?.totalPages ??
      Math.max(1, Math.ceil(totalElements / pageSize)));

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPageIndex(0);
  }, []);

  const facetFiltersKeyRef = React.useRef('[]');
  const handleFacetFiltersChange = React.useCallback(
    (filters: ColumnFiltersState) => {
      const serialized = JSON.stringify(filters);
      if (facetFiltersKeyRef.current !== serialized) {
        facetFiltersKeyRef.current = serialized;
        setPageIndex(0);
      }
      setFacetFilters(filters);
    },
    [],
  );

  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(
      newSorting.length > 0
        ? newSorting
        : [{ id: 'productName', desc: false }],
    );
    setPageIndex(0);
  }, []);

  const handlePaginationChange = React.useCallback(
    (newPage: number, newSize: number) => {
      setPageIndex(newPage);
      setPageSize(newSize);
    },
    [],
  );

  const facetDefs: FacetDefinition[] = React.useMemo(
    () => [
      {
        column: 'materialType',
        title: 'Material Type',
        options: facetOptions.materials,
      },
      {
        column: 'status',
        title: 'Status',
        options: facetOptions.statuses,
      },
    ],
    [facetOptions],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl">Products</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog dialogTitle="Add New Product" buttonTitle="Add Product" hideButton={readOnly}>
            <ProductForm />
          </FormDialog>
        </div>
      </div>
      <StatsCards cards={statsCards} />
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading products...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Error loading products</div>
          </div>
        ) : (
          <>
            <div className="flex flex-row sm:flex-row sm:items-center gap-5 mb-3">
              {linkedProductIdsSet && (
                <div className="mt-1 text-sm text-muted-foreground">
                  <span>Showing linked products</span>
                  {linkedQuarrySupplierNameParam ? (
                    <>
                      <span>{' for '}</span>
                      <span className="font-semibold text-foreground">
                        {linkedQuarrySupplierNameParam}
                      </span>
                    </>
                  ) : linkedQuarrySupplierIdParam ? (
                    <span>{` for quarry/supplier #${linkedQuarrySupplierIdParam}`}</span>
                  ) : null}
                </div>
              )}
              {linkedProductIdsSet && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/inventory/products')}
                >
                  Reset Filter
                </Button>
              )}
            </div>

            <DataTableClient
              tableId={
                linkedProductIdsSet
                  ? `product_linked_${linkedQuarrySupplierIdParam ?? 'unknown'}`
                  : 'product_main_data_table'
              }
              data={filteredItems ?? []}
              columns={productColumns}
              facetDefinition={facetDefs}
              searchPlaceHolder="Search products..."
              onRowClick={handleRowClick}
              defaultSorting={[{ id: 'productName', desc: false }]}
              mobileCardRenderer={renderProductCard}
              totalElements={totalElements}
              totalPages={totalPages}
              externalPageIndex={isLinkedFilter ? 0 : pageIndex}
              externalPageSize={isLinkedFilter ? filteredItems.length || 10 : pageSize}
              externalSorting={sorting}
              onPaginationChange={isLinkedFilter ? undefined : handlePaginationChange}
              onSearchChange={handleSearchChange}
              onFacetFiltersChange={handleFacetFiltersChange}
              onSortingChange={handleSortingChange}
              isLoading={isFetching}
            />
          </>
        )}
      </div>
    </div>
  );
}
