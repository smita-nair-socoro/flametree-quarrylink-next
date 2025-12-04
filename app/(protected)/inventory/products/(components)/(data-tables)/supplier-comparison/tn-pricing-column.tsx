'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
import { TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { centsToDollars } from '@/lib/utils/currency';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const tnPricingColumn: ColumnDef<QuarriesWithProduct>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.quarry_supplier?.name,
    header: ({}) => {
      return <div>Supplier</div>;
    },
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Name',
    size: 180,
  },
  {
    id: 'cost_price',
    accessorFn: (row) => row.per_tn_cost_price,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
          Cost Price{' '}
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
      if (row.original.available_for_sale_tn === false) {
        return <div>N/A</div>;
      } else {
        const costPrice = row.original.per_tn_cost_price
          ? centsToDollars(row.original.per_tn_cost_price)
          : '0';
        return <div>${costPrice}</div>;
      }
    },
    meta: 'cost price',
    size: 130,
  },
  {
    id: 'sell_price',
    accessorFn: (row) => row.per_tn_sell_price,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
          Sell Price{' '}
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
      if (row.original.available_for_sale_tn === false) {
        return <div>N/A</div>;
      } else {
        const sellPrice = row.original.per_tn_sell_price
          ? centsToDollars(row.original.per_tn_sell_price)
          : '0';
        return <div>${sellPrice}</div>;
      }
    },
    meta: 'sell price',
    size: 130,
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
      if (row.original.available_for_sale_tn === false) {
        return <div>0.00%</div>;
      }
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
    id: 'available_for_sale_tn',
    accessorFn: (row) => row.available_for_sale_tn,
    header: ({}) => {
      return <div className="text-left">Available</div>;
    },
    cell: ({ row }) => {
      const availableForSale =
        row.original.available_for_sale_tn === true ? 'Yes' : 'No';
      return <div className="text-left">{availableForSale}</div>;
    },
    meta: 'available for sale',
    size: 100,
  },
];
