'use client';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Activity, Factory, Tags } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ProductsListQueryOptions } from '@/lib/api/quaries';
import { LoadingSpinner } from '@/components/loading-spinner';
import { notifyError } from '@/lib/toast';
import { productColumns } from '@/app/(protected)/inventory/products/(components)/(data-tables)/products/columns';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from '../../inventory/products/(components)/product-form';

export default function ProductsPage() {
  const productQuery = useQuery(ProductsListQueryOptions());

  if (productQuery.isLoading) {
    return <LoadingSpinner message="Loading Products" />;
  }

  if (productQuery.error) {
    notifyError('Quotation', { description: 'Error loading products' });
  }

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Activity },
    { column: 'category', title: 'Categories', icon: Tags },
    { column: 'quarries', title: 'Quarry', icon: Factory },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Quotations</h1>
          <p className="text-sm text-muted-foreground">Manage your quotation</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <FormDialog
            dialogTitle="Add New Product"
            buttonTitle="Add New Product"
          >
            <ProductForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          data={productQuery.data?.items ?? []}
          columns={productColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search products..."
        />
      </div>
    </div>
  );
}
