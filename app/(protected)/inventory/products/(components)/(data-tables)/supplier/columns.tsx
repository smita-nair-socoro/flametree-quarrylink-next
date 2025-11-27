'use client';

import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
// import { TableTwoDataInOneCell } from '@/components/table-two-data-in-one-cell';
import { SupplierTableActions } from '@/app/(protected)/inventory/products/(components)/(data-tables)/supplier/supplier-table-actions';
import { centsToDollars } from '@/lib/utils/currency';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Allow passing the parent productId so actions can call detail APIs correctly
export const supplierColumns = (
  productId?: number
): ColumnDef<
  QuarrySupplierProduct & { quarry_supplier?: { id: number } }
>[] => [
  {
    id: 'quarry_name',
    accessorFn: (row) => row.quarry_name || 'N/A',
    header: ({}) => {
      return <div>Supplier Name</div>;
    },
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Supplier Name',
  },
  {
    id: 'supplier_product_name',
    accessorFn: (row) => row.supplier_product_name,
    header: ({}) => {
      return <div>Supplier Product Name</div>;
    },
    cell: ({ row }) => <div>{row.original.supplier_product_name}</div>,
    meta: 'Supplier Product Name',
  },
  {
    id: 'per_tn_cost_price',
    accessorFn: (row) => row.per_tn_cost_price,
    header: ({}) => {
      return <div>Cost Price per TN</div>;
    },
    cell: ({ row }) => {
      const costPrice = row.original.per_tn_cost_price || 0;
      return <div>${centsToDollars(costPrice)}</div>;
    },
    meta: 'Cost Price per TN',
  },
  {
    id: 'per_tn_sell_price',
    accessorFn: (row) => row.per_tn_sell_price,
    header: ({}) => {
      return <div>Sell Price per TN</div>;
    },
    cell: ({ row }) => {
      const sellPrice = row.original.per_tn_sell_price || 0;
      return <div>${centsToDollars(sellPrice)}</div>;
    },
    meta: 'Sell Price per TN',
  },
  {
    id: 'margin',
    accessorFn: (row) => {
      const costPrice = row.per_tn_cost_price || 0;
      const sellPrice = row.per_tn_sell_price || 0;
      if (costPrice === 0) return 0;
      return (sellPrice - costPrice) / costPrice;
    },
    header: ({}) => {
      return <div>Margin</div>;
    },
    cell: ({ row }) => {
      const costPrice = row.original.per_tn_cost_price || 0;
      const sellPrice = row.original.per_tn_sell_price || 0;

      // Calculate margin: (Sell Price - Cost Price) / Cost Price
      const margin = costPrice === 0 ? 0 : (sellPrice - costPrice) / costPrice;

      return (
        <div
          className={cn(
            margin < 0
              ? 'text-red-600'
              : margin > 0
              ? 'text-green-600'
              : 'text-gray-600',
            'flex justify-start items-center gap-1'
          )}
        >
          {margin < 0 && <TrendingDown className="w-4 h-4" />}
          {margin > 0 && <TrendingUp className="w-4 h-4" />}
          <span>{(margin * 100).toFixed(2)}%</span>
        </div>
      );
    },
    meta: 'Margin',
  },
  {
    id: 'action',
    accessorFn: (row) => row.quarry_supplier_id,
    header: ({}) => {
      return <div>Actions</div>;
    },
    cell: ({ row }) => (
      <SupplierTableActions
        quarry={row.original}
        productId={productId ?? row.original.product_id}
      />
    ),
    meta: 'Action',
  },
];
