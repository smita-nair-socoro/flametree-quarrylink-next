'use client';

import React from 'react';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/productResponseData.json';
import { ProductDetails } from '@/lib/types/product';
import { productColumns } from './(components)/(data-tables)/products/columns';
import { Plus } from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from './(components)/forms/product-form';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { useProductStore } from '@/app/stores/product-store';
import { useProductActions } from '@/hooks/use-product-actions';

export default function ProductsPage() {
  const convertedJson = convertKeysToSnakeCase(rawJson);

  const { items: rawItems } = convertedJson as unknown as {
    items: Array<
      Omit<ProductDetails, 'productId'> & {
        productId: number;
      }
    >;
  };

  const items: ProductDetails[] = rawItems.map((item) => ({
    ...item,
    productId: item.id,
  }));

  const setSelectedProduct = useProductStore(
    (state) => state.setSelectedProduct
  );
  const [selectedProductForActions, setSelectedProductForActions] =
    React.useState<ProductDetails | null>(null);

  const { actions, confirmDialogs, viewDialog } = useProductActions(
    selectedProductForActions?.id,
    selectedProductForActions
  );

  const handleRowClick = (product: ProductDetails) => {
    setSelectedProduct(product);
    setSelectedProductForActions(product);
    actions.view();
  };

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
        <DataTableClient
          tableId="product_main_data_table"
          data={items ?? []}
          columns={productColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search products..."
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
