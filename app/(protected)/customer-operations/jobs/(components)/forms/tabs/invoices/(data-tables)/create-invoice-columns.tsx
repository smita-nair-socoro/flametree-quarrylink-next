'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DocketDTO } from '@/lib/types/docket';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DateCell } from '@/components/date-cell';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { centsToDollars } from '@/lib/utils/currency';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  getCurrencySymbol,
  getExTaxLabel,
} from '@/lib/utils/tenant-config-helper';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { formatUomLabel } from '@/lib/utils/docket-helper';
import { HelpCircle } from 'lucide-react';

export const getCreateInvoiceColumns = (
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
): ColumnDef<DocketDTO>[] => [
  {
    id: 'docketNumber',
    accessorFn: (row) => row.docketNumber,
    header: () => {
      return <div>Docket Number</div>;
    },
    cell: ({ row }) => {
      const docketNumber = row.original.docketNumber || 'N/A';
      return (
        <div className="min-w-0 w-[70px] sm:w-[90px] md:w-[110px] lg:w-[130px] xl:w-[150px]">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {docketNumber}
          </p>
        </div>
      );
    },
    meta: 'Docket Number',
  },
  {
    id: 'docketType',
    accessorFn: (row) =>
      row.jobItem?.jobItemType === 'COLLECTION' ? 'Collection' : 'Delivery',
    header: () => <div>Type</div>,
    cell: ({ row }) => (
      <div className="py-2">
        {row.original.jobItem?.jobItemType === 'COLLECTION'
          ? 'Collection'
          : 'Delivery'}
      </div>
    ),
    meta: 'Type',
  },
  {
    id: 'product',
    accessorFn: (row) => row.jobItem.product.productName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Product" />;
    },
    cell: ({ row }) => {
      const productName = row.original.jobItem.product.productName;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block w-[30px] sm:w-[40px] md:w-[50px] lg:w-[60px] xl:w-[70px]">
              {productName}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{productName}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Product',
  },
  {
    id: 'deliveryDate',
    accessorFn: (row) => row.deliveryCollectionDate,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Delivery Date" />
      );
    },
    cell: ({ row }) => {
      const deliveryDate =
        row.original.deliveredAt ?? row.original.deliveryCollectionDate;
      return <DateCell dateString={deliveryDate} side="top" />;
    },
    meta: 'Delivery Date',
  },

  {
    id: 'loadSize',
    accessorFn: (row) => row.actualLoadSize,
    header: () => {
      return <div>QTY</div>;
    },
    cell: ({ row }) => {
      const productSellQty = row.original.actualLoadSize;
      const productSellUom = row.original.jobItem.productSellUom;
      const formattedQty = formatNumberThousandSeparator(productSellQty);
      const formattedLoadSize = productSellUom
        ? `${formattedQty} ${formatUomLabel(productSellUom)}`
        : formattedQty || 'N/A';
      const displayText = `${formattedLoadSize}`;
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
    id: 'totalInvoice',
    accessorFn: (row) => row.totalInvoiceAmount,
    header: () => {
      return (
        <div className="flex items-center gap-2">
          Total Invoice Price
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
      const formatted = `${getCurrencySymbol(currencyCode)}${centsToDollars(row.original.totalInvoiceAmount)}`;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="py-2 font-medium w-36 max-w-36 truncate">
              {formatted}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{formatted}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Total Invoice Price',
  },
];
