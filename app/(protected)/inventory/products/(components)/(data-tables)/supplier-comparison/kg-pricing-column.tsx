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
import { TableBadges } from '@/components/table-badges';

export const kgPricingColumn: ColumnDef<QuarriesWithProduct>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.quarrySupplier?.name,
    header: ({}) => {
      return <div>Supplier</div>;
    },
    cell: (info) => (
      <div
        className="truncate block w-[60px] sm:w-[80px] md:w-[90px] lg:w-[100px] xl:w-[120px]"
        title={info.getValue() as string}
      >
        {info.getValue() as string}
      </div>
    ),
    meta: 'Name',
  },
  {
    id: 'cost_price',
    accessorFn: (row) => row.per20kgCostPrice,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
          Cost Price
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
      const costPrice = row.original.per20kgCostPrice
        ? centsToDollars(row.original.per20kgCostPrice)
        : '0.00';
      return <div>${costPrice}</div>;
    },
    meta: 'cost price',
  },
  {
    id: 'sell_price',
    accessorFn: (row) => row.per20kgSellPrice,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
          Sell Price
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
      const sellPrice = row.original.per20kgSellPrice
        ? centsToDollars(row.original.per20kgSellPrice)
        : '0.00';
      return <div>${sellPrice}</div>;
    },
    meta: 'sell price',
  },
  {
    id: 'margin',
    accessorFn: (row) => {
      const costPrice = row.per20kgCostPrice || 0;
      const sellPrice = row.per20kgSellPrice || 0;
      if (sellPrice === 0) return 0;
      return (sellPrice - costPrice) / sellPrice;
    },
    header: ({}) => {
      return <div className="w-[90px]">Profit Margin</div>;
    },
    cell: ({ row }) => {
      const costPrice = row.original.per20kgCostPrice || 0;
      const sellPrice = row.original.per20kgSellPrice || 0;

      // Calculate margin: (Sell Price - Cost Price) / Sell Price
      const margin = sellPrice === 0 ? 0 : (sellPrice - costPrice) / sellPrice;

      return (
        <div
          className={cn(
            margin < 0
              ? 'text-red-600'
              : margin > 0
              ? 'text-green-600'
              : 'text-gray-600',
            'flex justify-start items-center gap-1 w-[90px]'
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
    id: 'available_for_sale_kg',
    accessorFn: (row) => row.availableForSale20kg,
    header: ({}) => {
      return <div className="text-left w-[120px]">Availability</div>;
    },
    cell: ({ row }) => {
      const availableForSale =
        row.original.availableForSale20kg === true ? (
          <TableBadges names={['AVAILABLE']} />
        ) : (
          <TableBadges names={['UNAVAILABLE']} />
        );
      return <div className="text-left w-[120px]">{availableForSale}</div>;
    },
    meta: 'available for sale',
  },
];
