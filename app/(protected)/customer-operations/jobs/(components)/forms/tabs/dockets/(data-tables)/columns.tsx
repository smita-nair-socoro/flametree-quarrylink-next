'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DocketDTO } from '@/lib/types/docket';
// import { JobLineItemTableActions } from './job-line-items-table-actions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TableBadges } from '@/components/table-badges';
import { DateCell } from '@/components/date-cell';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { DocketTableActions } from '@/app/(protected)/customer-operations/dockets/(components)/(data-tables)/docket/docket-table-actions';

export const docketsColumns: ColumnDef<DocketDTO>[] = [
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
    id: 'deliveryDate',
    accessorFn: (row) => row.deliveryCollectionDate,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Delivery Date" />
      );
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    meta: 'Delivery Date',
  },
  {
    id: 'status',
    accessorFn: (row) => row.docketStatus,
    header: () => {
      return <div>Status</div>;
    },
    cell: ({ row }) => {
      return <TableBadges names={[row.original.docketStatus]} visibleCount={1} />;
    },
    meta: 'Status',
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
    id: 'loadSize',
    accessorFn: (row) => row.loadSize,
    header: () => {
      return <div>QTY</div>;
    },
    cell: ({ row }) => {
      const productSellQty = row.original.loadSize;
      const productSellUom = row.original.jobItem.productSellUom;
      const displayText = `${productSellQty} ${productSellUom}`;
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
  // {
  //   id: 'actions',
  //   header: () => {
  //     return <div></div>;
  //   },
  //   cell: ({ row }) => {
  //     const docket = row.original;
  //     return <DocketTableActions docket={docket} />;
  //   },
  // },
];
