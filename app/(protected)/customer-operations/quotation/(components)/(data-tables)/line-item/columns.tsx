'use client';

import { ColumnDef } from '@tanstack/react-table';
import { QuotationLineItem } from '@/lib/types/quotation';
import { centsToDollars } from '@/lib/utils/currency';
import { QuotationLineItemTableActions } from './quotation-line-item-actions';
import { QUOTE_TYPE } from '@/lib/types/quotation-enums';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export const quotationLineItemColumns: ColumnDef<QuotationLineItem>[] = [
  {
    id: 'productName',
    accessorFn: (row) => row.productName,
    header: () => {
      return <div>Product</div>;
    },
    cell: (info) => info.getValue(),
    meta: 'Product Name',
    size: 160,
  },
  {
    id: 'quarryName',
    accessorFn: (row) => row.quarryName,
    header: () => {
      return <div>Supplier</div>;
    },
    cell: (info) => info.getValue(),
    meta: 'quarryName',
    size: 200,
  },
  {
    id: 'totalProductCostPrice',
    accessorFn: (row) => row.totalProductCostPrice,
    header: () => {
      return (
        <div className="flex items-center gap-1">
          Total Cost{' '}
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
      const totalProductCostPrice = row.original.totalProductCostPrice
        ? centsToDollars(row.original.totalProductCostPrice)
        : '0';
      return <div>${totalProductCostPrice}</div>;
    },
    meta: 'Total Product Cost Price',
    size: 150,
  },
  {
    id: 'totalProductSellPrice',
    accessorFn: (row) => row.totalProductSellPrice,
    header: () => {
      return (
        <div className="flex items-center gap-1">
          Total Sell{' '}
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
      const totalProductSellPrice = row.original.totalProductSellPrice
        ? centsToDollars(row.original.totalProductSellPrice)
        : '0';
      return <div>${totalProductSellPrice}</div>;
    },
    meta: 'Total Product Sell Price',
    size: 150,
  },
  {
    id: 'productSellQty',
    accessorFn: (row) => row.productSellQty,
    header: () => {
      return <div>QTY</div>;
    },
    cell: ({ row }) => {
      const productSellQty = row.original.productSellQty;
      const productSellUom =
        row.original.productSellUom === 'KG_20'
          ? 'x 20kg'
          : row.original.productSellUom;
      return (
        <div>
          {productSellQty} {productSellUom}
        </div>
      );
    },
    meta: 'Product Sell QTY',
    size: 100,
  },
  {
    id: 'truckType',
    accessorFn: (row) => row.truckType,
    header: () => {
      return <div>Truck</div>;
    },
    cell: ({ row }) => {
      const truckType = row.original.truckType;
      return <div>{truckType}</div>;
    },
    meta: 'Truck Type',
    size: 140,
  },
  {
    id: 'grossProfit',
    accessorFn: (row) => row.grossProfit,
    header: () => {
      return <div>GP</div>;
    },
    cell: ({ row }) => {
      const grossProfit = row.original.grossProfit;
      return <div>{grossProfit.toFixed(2)}%</div>;
    },
    meta: 'Gross Profit',
    size: 40,
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      return (
        <div>
          <QuotationLineItemTableActions quotationLineItem={row.original} />
        </div>
      );
    },
    size: 80,
  },
];

export function getQuotationLineItemColumns(
  quoteType?: QUOTE_TYPE | string | null
) {
  if (quoteType === QUOTE_TYPE.COLLECTION || quoteType === 'COLLECTION') {
    return quotationLineItemColumns.filter((c) => c.id !== 'truckType');
  }
  return quotationLineItemColumns;
}
