'use client';

import { ColumnDef } from '@tanstack/react-table';
import { QuotationLineItem } from '@/lib/types/quotation';
import { centsToDollars } from '@/lib/utils/currency';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  getCurrencySymbol,
  getExTaxLabel,
} from '@/lib/utils/tenant-config-helper';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { formatUomLabel } from '@/lib/utils/docket-helper';
import { QuotationLineItemTableActions } from './quotation-line-item-actions';
import { QUOTE_ITEM_TYPE } from '@/lib/types/quotation-enums';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';

export const getQuotationLineItemColumnsBase = (
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
): ColumnDef<QuotationLineItem>[] => [
  {
    id: 'productName',
    accessorFn: (row) => row.productName,
    header: () => {
      return <div>Product</div>;
    },
    cell: ({ row }) => {
      const productName = row.original.productName || 'N/A';
      const deliveryAddress =
        row.original.customerDeliveryAddress?.address?.formattedAddress || '';
      return (
        <div className="min-w-0 w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px]">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {productName}
              </p>
            </TooltipTrigger>
            <TooltipContent variant="white">
              <p>{productName}</p>
            </TooltipContent>
          </Tooltip>
          {deliveryAddress && (
            <p
              className="text-gray-500 text-xs whitespace-normal"
              title={deliveryAddress}
            >
              {deliveryAddress}
            </p>
          )}
        </div>
      );
    },
    meta: 'Product Name',
  },
  {
    id: 'quarryName',
    accessorFn: (row) => row.quarryName,
    header: () => {
      return <div>Quarry / Supplier</div>;
    },
    cell: (info) => {
      const value = (info.getValue() as string) || 'N/A';
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block w-[60px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[140px]">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'quarryName',
  },
  {
    id: 'totalCostPrice',
    accessorFn: (row) => row.totalProductCostPrice + row.totalTruckCostPrice,
    header: () => {
      return (
        <div className="flex items-center gap-1">
          Total Cost{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getExTaxLabel(taxLabel)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const total =
        (row.original.totalProductCostPrice ?? 0) +
        (row.original.totalTruckCostPrice ?? 0);
      return (
        <div>
          {getCurrencySymbol(currencyCode)}
          {centsToDollars(total)}
        </div>
      );
    },
    meta: 'Total Cost Price',
  },
  {
    id: 'totalSellPrice',
    accessorFn: (row) => row.totalProductSellPrice + row.totalTruckSellPrice,
    header: () => {
      return (
        <div className="flex items-center gap-1">
          Total Sell{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getExTaxLabel(taxLabel)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const total =
        (row.original.totalProductSellPrice ?? 0) +
        (row.original.totalTruckSellPrice ?? 0);
      return (
        <div>
          {getCurrencySymbol(currencyCode)}
          {centsToDollars(total)}
        </div>
      );
    },
    meta: 'Total Sell Price',
  },
  {
    id: 'productSellQty',
    accessorFn: (row) => row.productSellQty,
    header: () => {
      return <div>QTY</div>;
    },
    cell: ({ row }) => {
      const productSellQty = row.original.productSellQty;
      const productSellUom = formatUomLabel(row.original.productSellUom || '');
      const displayText = `${formatNumberThousandSeparator(productSellQty)} ${productSellUom}`;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block w-[30px] sm:w-[40px] md:w-[50px] lg:w-[60px] xl:w-[70px]">
              {displayText}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{displayText}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Product Sell QTY',
  },
  {
    id: 'quoteLineItemType',
    accessorFn: (row) => row.quoteItemType,
    header: () => {
      return <div>Type</div>;
    },
    cell: ({ row }) => {
      return (
        <TableBadges names={[row.original.quoteItemType]} visibleCount={1} />
      );
    },
    meta: 'Quote Item Type',
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
  },
];

export function getQuotationLineItemColumns(
  quoteItemType?: QUOTE_ITEM_TYPE | string | null,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
) {
  const columns = getQuotationLineItemColumnsBase(currencyCode, taxLabel);
  if (
    quoteItemType === QUOTE_ITEM_TYPE.COLLECTION ||
    quoteItemType === 'COLLECTION'
  ) {
    return columns.filter((c) => c.id !== 'truckType');
  }
  return columns;
}
