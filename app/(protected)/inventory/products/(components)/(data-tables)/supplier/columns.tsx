'use client';

import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
// import { TableTwoDataInOneCell } from '@/components/table-two-data-in-one-cell';
import { SupplierTableActions } from '@/app/(protected)/inventory/products/(components)/(data-tables)/supplier/supplier-table-actions';
import { centsToDollars } from '@/lib/utils/currency';
import { HelpCircle, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Allow passing the parent productId so actions can call detail APIs correctly
export const supplierColumns = (
  productId?: number
): ColumnDef<
  QuarrySupplierProduct & { quarry_supplier?: { id: number } }
>[] => [
  {
    id: 'name',
    accessorFn: (row) => row.quarrySupplier?.name || 'N/A',
    header: ({}) => {
      return <div>Supplier Name</div>;
    },
    cell: (info) => {
      const name = (info.getValue() as string) || 'N/A';
      return (
        <div
          className="truncate block w-[60px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[140px]"
          title={name}
        >
          {name}
        </div>
      );
    },
    meta: 'Name',
  },
  {
    id: 'supplier_product_name',
    accessorFn: (row) => row.supplierProductName,
    header: ({}) => {
      return <div>Supplier Product Name</div>;
    },
    cell: ({ row }) => {
      const value = row.original.supplierProductName || 'N/A';
      return (
        <div
          className="truncate block w-[60px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[140px]"
          title={value}
        >
          {value}
        </div>
      );
    },
    meta: 'Supplier Product Name',
  },
  {
    id: 'per_tn_cost_price',
    accessorFn: (row) => row.perTnCostPrice,
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
      const costPrice = row.original.perTnCostPrice || 0;
      return <div>${centsToDollars(costPrice)}</div>;
    },
    meta: 'Cost Price per TN',
  },
  {
    id: 'per_tn_sell_price',
    accessorFn: (row) => row.perTnSellPrice,
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
    cell: ({ row }) => {
      const sellPrice = row.original.perTnSellPrice || 0;
      return <div>${centsToDollars(sellPrice)}</div>;
    },
    meta: 'Sell Price per TN',
  },
  {
    id: 'margin',
    accessorFn: (row) => {
      const costPrice = row.perTnCostPrice || 0;
      const sellPrice = row.perTnSellPrice || 0;
      if (sellPrice === 0) return 0;
      return (sellPrice - costPrice) / sellPrice;
    },
    header: ({}) => {
      return <div>Margin</div>;
    },
    cell: ({ row }) => {
      const costPrice = row.original.perTnCostPrice || 0;
      const sellPrice = row.original.perTnSellPrice || 0;

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
    accessorFn: (row) => row.quarrySupplierId,
    header: ({}) => {
      return <div></div>;
    },
    cell: ({ row }) => (
      <SupplierTableActions
        quarry={row.original}
        productId={productId ?? row.original.productId}
      />
    ),
    meta: 'Action',
  },
];
