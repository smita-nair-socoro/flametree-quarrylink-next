'use client';

import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/productResponseData.json';
import { ProductDetails } from '@/lib/types/product';
import { productColumns } from './(components)/(data-tables)/products/columns';
import { Plus } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';

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

  const facetDefs: FacetDefinition[] = [
    { column: 'material_type', title: 'Material Type', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Products</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* TODO: QLINK-659 Add New Product Form And View / Edit */}
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="product_main_data_table"
          data={items ?? []}
          columns={productColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search products..."
        />
      </div>
    </div>
  );
}
