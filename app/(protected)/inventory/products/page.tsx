'use client';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { AddProductDrawerDialog } from './(components)/add-product-dialog';
import { productColumns } from './(components)/(data-tables)/products/columns';
import rawData from '@/lib/tests/productData.json';
import { ProductWithCategoriesAndQuarry } from '@/lib/types/product';
import { Activity, Factory, Tags } from 'lucide-react';

const productData: ProductWithCategoriesAndQuarry[] =
  rawData.items as ProductWithCategoriesAndQuarry[];

export default function ProductsPage() {
  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Activity },
    { column: 'category', title: 'Categories', icon: Tags },
    { column: 'quarries', title: 'Quarry', icon: Factory },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl">Products</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <AddProductDrawerDialog />
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min p-2">
        <DataTableClient
          data={productData}
          columns={productColumns}
          facetDefination={facetDefs}
        />
      </div>
    </div>
  );
}
