'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
import { HelpCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { centsToDollars } from '@/lib/utils/currency';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const bulkaPricingColumn: ColumnDef<QuarriesWithProduct>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.quarrySupplier?.name,
    header: ({}) => {
      return <div>Supplier</div>;
    },
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Name',
    size: 180,
  },
  {
    id: 'cost_price',
    accessorFn: (row) => row.perBulkaCostPrice,
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
      if (row.original.availableForSaleBulka === false) {
        return <div>N/A</div>;
      } else {
        const costPrice = row.original.perBulkaCostPrice
          ? centsToDollars(row.original.perBulkaCostPrice)
          : '0';
        return <div>${costPrice}</div>;
      }
    },
    meta: 'cost price',
    size: 130,
  },
  {
    id: 'sell_price',
    accessorFn: (row) => row.perBulkaSellPrice,
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
      if (row.original.availableForSaleBulka === false) {
        return <div>N/A</div>;
      } else {
        const sellPrice = row.original.perBulkaSellPrice
          ? centsToDollars(row.original.perBulkaSellPrice)
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
      const costPrice = row.perBulkaCostPrice || 0;
      const sellPrice = row.perBulkaSellPrice || 0;
      if (costPrice === 0) return 0;
      return (sellPrice - costPrice) / costPrice;
    },
    header: ({}) => {
      return <div>Margin</div>;
    },
    cell: ({ row }) => {
      if (row.original.availableForSaleBulka === false) {
        return <div>0.00%</div>;
      }
      const costPrice = row.original.perBulkaCostPrice || 0;
      const sellPrice = row.original.perBulkaSellPrice || 0;

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
    id: 'available_for_sale_bulka',
    accessorFn: (row) => row.availableForSaleBulka,
    header: ({}) => {
      return <div className="text-left">Available</div>;
    },
    cell: ({ row }) => {
      const availableForSale =
        row.original.availableForSaleBulka === true ? 'Yes' : 'No';
      return <div className="text-left">{availableForSale}</div>;
    },
    meta: 'available for sale',
    size: 100,
  },
];
