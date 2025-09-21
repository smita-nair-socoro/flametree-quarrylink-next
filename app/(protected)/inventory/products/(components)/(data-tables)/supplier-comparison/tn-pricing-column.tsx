'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { centsToDollars } from '@/lib/utils/currency';

export const tnPricingColumn: ColumnDef<QuarriesWithProduct>[] = [
  {
    id: 'quarry_name',
    accessorFn: (row) => row.quarry_name,
    header: ({}) => {
      return <div>Supplier</div>;
    },
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Quarry Name',
    size: 180,
  },
  {
    id: 'cost_price',
    accessorFn: (row) => row.price.tn_cost_price,
    header: ({}) => {
      return <div>Cost Price</div>;
    },
    cell: ({ row }) => {
      if (row.original.price.available_for_sale_tn === false) {
        return <div>N/A</div>;
      } else {
        const costPrice = row.original.price.tn_cost_price
          ? centsToDollars(row.original.price.tn_cost_price)
          : '0';
        return <div>${costPrice}</div>;
      }
    },
    meta: 'cost price',
    size: 120,
  },
  {
    id: 'sell_price',
    accessorFn: (row) => row.price.tn_sell_price,
    header: ({}) => {
      return <div>Sell Price</div>;
    },
    cell: ({ row }) => {
      if (row.original.price.available_for_sale_tn === false) {
        return <div>N/A</div>;
      } else {
        const sellPrice = row.original.price.tn_sell_price
          ? centsToDollars(row.original.price.tn_sell_price)
          : '0';
        return <div>${sellPrice}</div>;
      }
    },
    meta: 'sell price',
    size: 120,
  },
  {
    id: 'margin',
    accessorFn: (row) => row.price.margin_tn,
    header: ({}) => {
      return <div>Margin</div>;
    },
    cell: ({ row }) => {
      if (row.original.price.available_for_sale_tn === false) {
        return <div>N/A</div>;
      } else {
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
      }
    },
    meta: 'Margin',
    size: 140,
  },
  {
    id: 'available_for_sale_tn',
    accessorFn: (row) => row.price.available_for_sale_tn,
    header: ({}) => {
      return <div className="text-left">Available</div>;
    },
    cell: ({ row }) => {
      const availableForSale =
        row.original.price.available_for_sale_tn === true ? 'true' : 'false';
      return <div className="text-left">{availableForSale}</div>;
    },
    meta: 'available for sale',
    size: 100,
  },
];
