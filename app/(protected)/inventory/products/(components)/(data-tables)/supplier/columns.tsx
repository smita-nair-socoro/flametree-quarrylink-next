'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
import { TableTwoDataInOneCell } from '@/components/table-two-data-in-one-cell';
import { SupplierTableActions } from '@/app/(protected)/inventory/products/(components)/(data-tables)/supplier/supplier-table-actions';
import { centsToDollars } from '@/lib/utils/currency';
import { HelpCircle, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const supplierColumns: ColumnDef<QuarriesWithProduct>[] = [
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
    id: 'cost_price',
    accessorFn: (row) => row.price.tn_cost_price,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
          Cost Price (TN){' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          $
          {row.original.price.tn_cost_price
            ? centsToDollars(row.original.price.tn_cost_price)
            : '0'}
        </div>
      );
    },
    meta: 'cost price',
  },
  {
    id: 'sell_price',
    accessorFn: (row) => row.price.tn_sell_price,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
          Sell Price (TN)
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => (
      <div>
        $
        {row.original.price.tn_sell_price
          ? centsToDollars(row.original.price.tn_sell_price)
          : '0'}
      </div>
    ),
    meta: 'sell price',
  },
  {
    id: 'margin',
    accessorFn: (row) => row.price.margin_tn,
    header: ({}) => {
      return <div>Margin</div>;
    },
    cell: ({ row }) => {
      const margin = row.original.price.margin_tn || 0;
      return (
        <div
          className={cn(
            margin < 0 ? 'text-red-600' : 'text-green-600',
            'flex justify-start gap-1'
          )}
        >
          {margin < 0 && <TrendingDown className="w-4 h-4 text-red-600" />}
          {margin > 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
          {((margin || 0) * 100).toFixed(2)}%
        </div>
      );
    },
    meta: 'Margin',
  },
  {
    id: 'action',
    accessorFn: (row) => row.id,
    header: ({}) => {
      return <div></div>;
    },
    cell: ({ row }) => <SupplierTableActions quarry={row.original} />,
    meta: 'Action',
  },
];
