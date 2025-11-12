'use client';

import React from 'react';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import rawJson from '@/lib/tests/productResponseData.json';
import { ProductDetails } from '@/lib/types/product';
import { productColumns } from './(components)/(data-tables)/products/columns';
import { Plus, Gem, PackageX, TrendingUp, Package } from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from './(components)/forms/product-form';
import { Card, CardContent } from '@/components/ui/card';

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

  // Statistics cards data
  const statsCards = [
    {
      title: 'Most Quoted Product',
      value: 'Premium Granite',
      description: '$287,450 this month',
      icon: Gem,
      iconBgColor: 'bg-[#FEF3C6]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Unavailable Products',
      value: 12,
      description: '8% of inventory',
      icon: PackageX,
      iconBgColor: 'bg-[#FFE2E2]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Average Product Margin',
      value: '34.5%',
      description: '+2.3% vs last month',
      icon: TrendingUp,
      iconBgColor: 'bg-[#D0FAE5]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Total Products',
      value: 156,
      description: '+8 added this month',
      icon: Package,
      iconBgColor: 'bg-[#CEFAFE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#00A63E]',
    },
  ];

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-5">
              <CardContent className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">{card.title}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${card.iconBgColor}`}>
                    <Icon className={`h-5 w-5 opacity-70 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="text-2xl font-semibold pt-2">{card.value}</div>
                <div className={`text-sm ${card.descriptionColor}`}>
                  {card.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
