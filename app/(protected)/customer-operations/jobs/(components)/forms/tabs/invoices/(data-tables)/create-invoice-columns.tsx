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
// import { DocketTableActions } from '@/app/(protected)/customer-operations/dockets/(components)/(data-tables)/docket/docket-table-actions';

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';

export const createInvoiceColumns: ColumnDef<DocketDTO>[] = [
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
    id: 'product',
    accessorFn: (row) => row.jobItem.product.productName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Product" />;
    },
    cell: ({ row }) => {
      const productName = row.original.jobItem.product.productName;
      return <div className="py-2">{productName}</div>;
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
      const formattedLoadSize =
        productSellUom === 'TN'
          ? `${productSellQty} TN`
          : productSellUom === 'M3'
            ? `${productSellQty} m³`
            : productSellUom === 'KG_20'
              ? `${productSellQty} x 20kg`
              : productSellUom === 'BULKA'
                ? `${productSellQty} Bulka`
                : productSellQty || 'N/A';
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
    accessorFn: (row) => row.totalInvoice,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Total Invoice Price" />
      );
    },
    cell: () => {
      // Hardcoded $1000 for now as requested
      const formatted = '$1,000.00';
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
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: () => {
      return <div></div>;
    },
  },
];
