'use client';

import React from 'react';
import { ProductDetails } from '@/lib/types/product';
import { productColumns } from './(components)/(data-tables)/products/columns';
import { Plus, Gem, PackageX, TrendingUp, Package } from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from './(components)/forms/product-form';
import { useQuery } from '@tanstack/react-query';
import {
  ProductsListQueryOptions,
  ProductReportingQueryOptions,
} from '@/lib/api/product';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { centsToDollars } from '@/lib/utils/currency';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import {
  useProductStore,
  useSelectedProduct,
} from '@/app/stores/product-store';
import { useProductActions } from '@/hooks/use-product-actions';
import { ProductCard } from '@/components/mobile/product-card';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSelectedProduct = useProductStore(
    (state) => state.setSelectedProduct,
  );
  const selectedProductForActions = useSelectedProduct();

  // Statistics cards data

  const { actions, confirmDialogs, viewDialog } = useProductActions(
    selectedProductForActions?.id,
    selectedProductForActions,
  );

  // Use React Query to fetch products data
  const {
    data: productsData,
    isLoading,
    error,
    isError,
  } = useQuery(ProductsListQueryOptions());

  const { data: reportingData } = useQuery(ProductReportingQueryOptions());

  const statsCards: StatsCardData[] = [
    {
      title: 'Highest Revenue Product',
      value: reportingData?.mostQuotedProductName || '',
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
        reportingData?.averageProductMarginChangePercent || 0
      }% vs last month`,
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

  // Handle row click to open product details
  const handleRowClick = (product: ProductDetails) => {
    setSelectedProduct(product);
    actions.view();
  };

  // Mobile card renderer
  const renderProductCard = React.useCallback(
    (product: ProductDetails, onViewDetails?: () => void) => {
      return (
        <ProductCard
          id={product.id}
          productName={product.productName}
          productCode={product.productCode}
          status={product.status}
          materialName={product.material?.name || ''}
          onViewDetails={onViewDetails}
        />
      );
    },
    [],
  );

  // Transform the API data to match our component expectations
  const items: ProductDetails[] = React.useMemo(
    () =>
      productsData?.map((product) => {
        // Convert API response to snake_case if needed

        return {
          ...product,
          productId: product.id,
          // Ensure material is properly mapped for facet filtering
          material: product.material || { id: 0, name: '', version: 0 },
        } as ProductDetails;
      }) || [],
    [productsData],
  );

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

  const filteredItems = React.useMemo(() => {
    if (!linkedProductIdsSet) return items;
    return items.filter((p) => linkedProductIdsSet.has(p.id));
  }, [items, linkedProductIdsSet]);

  const facetDefs: FacetDefinition[] = [
    { column: 'material_type', title: 'Material Type', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl">Products</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog dialogTitle="Add New Product" buttonTitle="Add Product">
            <ProductForm />
          </FormDialog>
        </div>
      </div>
      {/* Statistics Cards */}
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
              facetDefination={facetDefs}
              searchPlaceHolder="Search products..."
              onRowClick={handleRowClick}
              defaultSorting={[{ id: 'product_name', desc: false }]}
              mobileCardRenderer={renderProductCard}
            />
          </>
        )}
      </div>
    </div>
  );
}
