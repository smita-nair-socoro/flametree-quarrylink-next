'use client';

import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
import { TableTwoDataInOneCell } from '@/components/table-two-data-in-one-cell';
import { SupplierTableActions } from '@/app/(protected)/inventory/products/(components)/(data-tables)/supplier/supplier-table-actions';
import { centsToDollars } from '@/lib/utils/currency';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const supplierColumns: ColumnDef<QuarrySupplierProduct>[] = [
  {
    id: 'quarry_name',
    accessorFn: (row) => row.quarry_name,
    header: ({}) => {
      return <div>Supplier Name</div>;
    },
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Quarry Name',
  },
  {
    id: 'supplier_product_name',
    accessorFn: (row) => row.supplier_product_name,
    header: ({}) => {
      return <div>Supplier Product Name</div>;
    },
    cell: ({ row }) => (
      <TableTwoDataInOneCell
        primaryData={row.original.supplier_product_name}
        secondaryData={row.original.supplier_product_code}
      />
    ),
    meta: 'Supplier Product',
  },
  {
    id: 'per_tn_cost_price',
    accessorFn: (row) => row.per_tn_cost_price,
    header: ({}) => {
      return <div>Cost Price (TN)</div>;
    },
    cell: ({ row }) => {
      return (
        <div>
          $
          {row.original.per_tn_cost_price
            ? centsToDollars(row.original.per_tn_cost_price)
            : '0'}
        </div>
      );
    },
    meta: 'cost price',
  },
  {
    id: 'sell_price',
    accessorFn: (row) => row.per_tn_sell_price,
    header: ({}) => {
      return <div>Sell Price (TN)</div>;
    },
    cell: ({ row }) => (
      <div>
        $
        {row.original.per_tn_sell_price
          ? centsToDollars(row.original.per_tn_sell_price)
          : '0'}
      </div>
    ),
    meta: 'sell price',
  },
  // {
  //   id: 'margin',
  //   accessorFn: (row) => row.price.margin_tn,
  //   header: ({}) => {
  //     return <div>Margin</div>;
  //   },
  //   cell: ({ row }) => {
  //     const margin = row.original.price.margin_tn || 0;
  //     return (
  //       <div
  //         className={cn(
  //           margin < 0 ? 'text-red-600' : 'text-green-600',
  //           'flex justify-start gap-1'
  //         )}
  //       >
  //         {margin < 0 && <TrendingDown className="w-4 h-4 text-red-600" />}
  //         {margin > 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
  //         {((margin || 0) * 100).toFixed(2)}%
  //       </div>
  //     );
  //   },
  //   meta: 'Margin',
  // },
  {
    id: 'action',
    accessorFn: (row) => row.quarry_supplier_id,
    header: ({}) => {
      return <div>Actions</div>;
    },
    cell: ({ row }) => <SupplierTableActions quarry={row.original} />,
    meta: 'Action',
  },
];
