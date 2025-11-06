'use client';

import React from 'react';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { ProductDetails } from '@/lib/types/product';
import { productColumns } from './(components)/(data-tables)/products/columns';
import { Plus } from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from './(components)/forms/product-form';
import { useQuery } from '@tanstack/react-query';
import { ProductsListQueryOptions } from '@/lib/api/product';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { useProductStore } from '@/app/stores/product-store';
import { useProductActions } from '@/hooks/use-product-actions';

export default function ProductsPage() {
  const setSelectedProduct = useProductStore(
    (state) => state.setSelectedProduct
  );
  const [selectedProductForActions, setSelectedProductForActions] =
    React.useState<ProductDetails | null>(null);

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
    setSelectedProductForActions(product);
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
      } as ProductDetails;
    }) || [];

  console.log(items);

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
