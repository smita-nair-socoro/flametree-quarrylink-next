'use client';

import React from 'react';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { ProductDetails } from '@/lib/types/product';
import { productColumns } from './(components)/(data-tables)/products/columns';
import { Plus, Gem, PackageX, TrendingUp, Package } from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from './(components)/forms/product-form';
import { useQuery } from '@tanstack/react-query';
import { ProductsListQueryOptions } from '@/lib/api/product';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import {
  useProductStore,
  useSelectedProduct,
} from '@/app/stores/product-store';
import { useProductActions } from '@/hooks/use-product-actions';

export default function ProductsPage() {
  const setSelectedProduct = useProductStore(
    (state) => state.setSelectedProduct
  );
  const selectedProductForActions = useSelectedProduct();

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Most Quoted Product',
      value: 'Premium Granite',
      description: '$287,450 this month',
      icon: Gem,
      iconBgColor: 'bg-[#FEF3C6]',
      iconColor: 'text-[#733E0A]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Unavailable Products',
      value: 12,
      description: '8% of inventory',
      icon: PackageX,
      iconBgColor: 'bg-[#FFE2E2]',
      iconColor: 'text-[#9F0712]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Average Product Margin',
      value: '34.5%',
      description: '+2.3% vs last month',
      icon: TrendingUp,
      iconBgColor: 'bg-[#D0FAE5]',
      iconColor: 'text-[#00A63E]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Total Products',
      value: 156,
      description: '+8 added this month',
      icon: Package,
      iconBgColor: 'bg-[#CEFAFE]',
      iconColor: 'text-[#0891B2]',
      descriptionColor: 'text-[#00A63E]',
    },
  ];

  const { actions, confirmDialogs, viewDialog } = useProductActions(
    selectedProductForActions?.id,
    selectedProductForActions
  );

  // Use React Query to fetch products data
  const {
    data: productsData,
    isLoading,
    error,
    isError,
  } = useQuery(ProductsListQueryOptions());

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

  // Transform the API data to match our component expectations
  const items: ProductDetails[] =
    productsData?.map((product) => {
      // Convert API response to snake_case if needed
      const convertedProduct = convertKeysToSnakeCase(product);

      return {
        ...convertedProduct,
        productId: convertedProduct.id,
        // Ensure material is properly mapped for facet filtering
        material: convertedProduct.material || { id: 0, name: '', version: 0 },
      } as ProductDetails;
    }) || [];

  const facetDefs: FacetDefinition[] = [
    { column: 'material_type', title: 'Material Type', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Products</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Product"
            buttonTitle="Add Product"
            headerSeparator={true}
          >
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
          <DataTableClient
            tableId="product_main_data_table"
            data={items ?? []}
            columns={productColumns}
            facetDefination={facetDefs}
            searchPlaceHolder="Search products..."
            onRowClick={handleRowClick}
          />
        )}
      </div>
    </div>
  );
}
