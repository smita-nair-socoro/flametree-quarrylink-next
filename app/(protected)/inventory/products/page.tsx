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
  RefreshCw,
} from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from './(components)/forms/product-form';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  ProductsListQueryOptions,
  ProductReportingQueryOptions,
  ProductsInfiniteListQueryOptions,
  getProductItemsFromInfinitePages,
  getProductsPageFromListResponse,
  toProductApiFilterParams,
  toProductApiSortParams,
  buildProductFacetOptions,
  isProductsListResponse,
  usePullFromAccSoftware,
  useProductSyncStatus,
} from '@/lib/api/product';
import {
  LinkedProductsListQueryOptions,
  LinkedProductsInfiniteListQueryOptions,
} from '@/lib/api/quarries';
import { useIsMobile } from '@/hooks/use-mobile';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  useAccountingSoftwareProvider,
  useTenantCurrencyTax,
} from '@/lib/utils/tenant-config-helper';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { useProductActions } from '@/hooks/use-product-actions';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';
import { ProductTableActions } from './(components)/(data-tables)/products/product-table-actions';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { SyncProgressBar } from '@/components/sync-progress-bar';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { actions, confirmDialogs, viewDialog } = useProductActions();
  const accSoftwareProvider = useAccountingSoftwareProvider();
  const readOnly = accSoftwareProvider === 'MYOB_ACUMATICA';

  const syncProductFromAcumatica = usePullFromAccSoftware();

  // Track whether a sync has been triggered during this page session so we
  // only start polling the status endpoint after the user clicks Sync.
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { data: productSyncStatus } = useProductSyncStatus(isSyncing);

  // Stop polling and reset the syncing flag once the sync reaches a terminal state.
  React.useEffect(() => {
    if (productSyncStatus && (productSyncStatus.state === 'COMPLETED' || productSyncStatus.state === 'FAILED')) {
      const timer = setTimeout(() => setIsSyncing(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [productSyncStatus]);

  const [isSyncDisabled, setIsSyncDisabled] = React.useState(false);
  const syncCooldownTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  React.useEffect(() => {
    return () => {
      if (syncCooldownTimeoutRef.current) {
        clearTimeout(syncCooldownTimeoutRef.current);
      }
    };
  }, []);

  const handleSyncProductFromAcumatica = React.useCallback(async () => {
    if (syncProductFromAcumatica.isPending || isSyncDisabled) {
      return;
    }

    setIsSyncDisabled(true);
    syncCooldownTimeoutRef.current = setTimeout(() => {
      setIsSyncDisabled(false);
      syncCooldownTimeoutRef.current = null;
    }, 10000);

    try {
      await syncProductFromAcumatica.mutateAsync();
      setIsSyncing(true);
      notifySuccess('Product sync started');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  }, [syncProductFromAcumatica, isSyncDisabled]);
  const { formatCentsToCurrency } = useTenantCurrencyTax();

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

  const linkedProductIds = React.useMemo(
    () => (linkedProductIdsSet ? Array.from(linkedProductIdsSet) : undefined),
    [linkedProductIdsSet],
  );

  const linkedQuarrySupplierId = React.useMemo(() => {
    if (!linkedQuarrySupplierIdParam) return undefined;
    const id = Number(linkedQuarrySupplierIdParam);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  }, [linkedQuarrySupplierIdParam]);

  const isLinkedQuarryView = linkedQuarrySupplierId != null;
  const isLegacyLinkedIdsView = linkedProductIdsSet != null;
  const isLinkedView = isLinkedQuarryView || isLegacyLinkedIdsView;

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

  const listParams = React.useMemo(
    () => ({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ...apiSortParams,
      ...apiFilterParams,
    }),
    [pageIndex, pageSize, search, apiSortParams, apiFilterParams],
  );

  const infiniteListParams = React.useMemo(
    () => ({
      pageSize: 25,
      search: search.trim() || undefined,
      ...apiFilterParams,
    }),
    [search, apiFilterParams],
  );

  React.useEffect(() => {
    setPageIndex(0);
  }, [linkedProductIdsParam, linkedQuarrySupplierIdParam]);

  const linkedProductsQuery = useQuery({
    ...LinkedProductsListQueryOptions(linkedQuarrySupplierId ?? 0, listParams),
    enabled: isLinkedQuarryView,
  });

  const mainProductsQuery = useQuery({
    ...ProductsListQueryOptions({
      ...listParams,
      ids: linkedProductIds,
    }),
    enabled: !isLinkedQuarryView,
  });

  const productsData = isLinkedQuarryView
    ? linkedProductsQuery.data
    : mainProductsQuery.data;
  const isLoading = isLinkedQuarryView
    ? linkedProductsQuery.isLoading
    : mainProductsQuery.isLoading;
  const isFetching = isLinkedQuarryView
    ? linkedProductsQuery.isFetching
    : mainProductsQuery.isFetching;
  const error = isLinkedQuarryView
    ? linkedProductsQuery.error
    : mainProductsQuery.error;
  const isError = isLinkedQuarryView
    ? linkedProductsQuery.isError
    : mainProductsQuery.isError;

  const { data: reportingData } = useQuery(ProductReportingQueryOptions());

  const isMobile = useIsMobile();

  const linkedProductsInfiniteQuery = useInfiniteQuery({
    ...LinkedProductsInfiniteListQueryOptions(
      linkedQuarrySupplierId ?? 0,
      infiniteListParams,
    ),
    enabled: isMobile && isLinkedQuarryView,
  });

  const mainProductsInfiniteQuery = useInfiniteQuery({
    ...ProductsInfiniteListQueryOptions({
      ...infiniteListParams,
      ids: linkedProductIds,
    }),
    enabled: isMobile && !isLinkedQuarryView,
  });

  const infiniteData = isLinkedQuarryView
    ? linkedProductsInfiniteQuery.data
    : mainProductsInfiniteQuery.data;
  const fetchNextPage = isLinkedQuarryView
    ? linkedProductsInfiniteQuery.fetchNextPage
    : mainProductsInfiniteQuery.fetchNextPage;
  const hasNextPage = isLinkedQuarryView
    ? linkedProductsInfiniteQuery.hasNextPage
    : mainProductsInfiniteQuery.hasNextPage;
  const isFetchingNextPage = isLinkedQuarryView
    ? linkedProductsInfiniteQuery.isFetchingNextPage
    : mainProductsInfiniteQuery.isFetchingNextPage;
  const infiniteIsFetching = isLinkedQuarryView
    ? linkedProductsInfiniteQuery.isFetching
    : mainProductsInfiniteQuery.isFetching;

  const mobileItems = React.useMemo(
    () => getProductItemsFromInfinitePages(infiniteData?.pages),
    [infiniteData?.pages],
  );

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
      description: `${formatCentsToCurrency(reportingData?.mostQuotedProductValueThisMonth || 0)} this month`,
      icon: Gem,
      iconBgColor: 'bg-[#FEF3C6]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Unavailable Products',
      value: reportingData?.unavailableProductsCount || 0,
      description: `${
        reportingData?.unavailableProductsPercentOfInventory || 0
      }% of inventory`,
      icon: PackageX,
      iconBgColor: 'bg-[#FFE2E2]',
      iconColor: 'text-[#9F0712]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Average Product Margin',
      value: `${reportingData?.averageProductMarginThisMonth || 0}%`,
      description: `${
        reportingData?.averageProductMarginChangeVsLastMonth || 0
      }% last month`,
      icon: TrendingUp,
      iconBgColor: 'bg-[#D0FAE5]',
      iconColor: 'text-[#00A63E]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Total Products',
      value: reportingData?.totalProducts || 0,
      description: `+${
        reportingData?.productsAddedThisMonth || 0
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
    const status = product.isActive === true ? 'AVAILABLE' : 'UNAVAILABLE';
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
            <TableBadges names={[status]} visibleCount={1} />
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

  const totalElements = productPage?.totalElements ?? items.length;
  const totalPages =
    productPage?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

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
      newSorting.length > 0 ? newSorting : [{ id: 'productName', desc: false }],
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

  let linkedFilterSuffix: React.ReactNode = null;
  if (linkedQuarrySupplierNameParam) {
    linkedFilterSuffix = (
      <>
        <span>{' for '}</span>
        <span className="font-semibold text-foreground">
          {linkedQuarrySupplierNameParam}
        </span>
      </>
    );
  } else if (linkedQuarrySupplierIdParam) {
    linkedFilterSuffix = (
      <span>{` for quarry/supplier #${linkedQuarrySupplierIdParam}`}</span>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <SyncProgressBar syncStatus={productSyncStatus} entityType="Product" />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl">Products</h1>
        {readOnly ? (
          <Button
            onClick={handleSyncProductFromAcumatica}
            disabled={syncProductFromAcumatica.isPending || isSyncDisabled}
          >
            <div className="flex items-center gap-2">
              <RefreshCw
                className={`h-4 w-4 ${syncProductFromAcumatica.isPending ? 'animate-spin' : ''}`}
              />
              {syncProductFromAcumatica.isPending ? 'Syncing' : 'Sync Product'}
            </div>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <FormDialog
              dialogTitle="Add New Product"
              buttonTitle="Add Product"
              hideButton={readOnly}
            >
              <ProductForm />
            </FormDialog>
          </div>
        )}
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
              {isLinkedView && (
                <div className="mt-1 text-sm text-muted-foreground">
                  <span>Showing linked products</span>
                  {linkedFilterSuffix}
                </div>
              )}
              {isLinkedView && (
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
                isLinkedView
                  ? `product_linked_${linkedQuarrySupplierIdParam ?? 'unknown'}`
                  : 'product_main_data_table'
              }
              data={items ?? []}
              columns={productColumns}
              facetDefinition={facetDefs}
              searchPlaceHolder="Search products..."
              onRowClick={handleRowClick}
              defaultSorting={[{ id: 'productName', desc: false }]}
              mobileCardRenderer={renderProductCard}
              mobileInfinite={{
                items: mobileItems as unknown as ProductDetails[],
                hasNextPage,
                isFetchingNextPage,
                isLoading: infiniteIsFetching,
                fetchNextPage,
              }}
              totalElements={totalElements}
              totalPages={totalPages}
              externalPageIndex={pageIndex}
              externalPageSize={pageSize}
              externalSorting={sorting}
              onPaginationChange={handlePaginationChange}
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
