'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DocketTableRow } from '@/lib/types/docket';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TableBadges } from '@/components/table-badges';
import { DateCell } from '@/components/date-cell';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { DocketTableActions } from '@/app/(protected)/customer-operations/dockets/(components)/(data-tables)/docket/docket-table-actions';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { formatUomLabel } from '@/lib/utils/docket-helper';
import { TriangleAlert } from 'lucide-react';

export const docketsColumns: ColumnDef<DocketTableRow>[] = [
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
    accessorFn: (row) => row.deliveryDate,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Delivery Date" />
      );
    },
    cell: ({ row }) => {
      return <DateCell dateString={row.original.deliveryDate} side="top" />;
    },
    meta: 'Delivery Date',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: () => {
      return <div>Status</div>;
    },
    cell: ({ row }) => {
      const docketStatus =
        row.original.status === 'READY_FOR_COLLECTION'
          ? 'READY'
          : row.original.status;
      if (docketStatus === 'INVOICED') {
        if (!row.original.invoiceStatus) {
          return <TableBadges names={[docketStatus]} visibleCount={1} />;
        }
        if (row.original.invoiceStatus === 'FAILED') {
          return (
            <TableBadges
              names={[docketStatus]}
              visibleCount={1}
              icon={<TriangleAlert className="w-4 h-4 mb-0.5 text-red-500" />}
            />
          );
        }
      }
      return <TableBadges names={[docketStatus]} visibleCount={1} />;
    },
    meta: 'Status',
  },
  {
    id: 'product',
    accessorFn: (row) => row.productName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Product" />;
    },
    cell: ({ row }) => {
      const productName = row.original.productName || 'N/A';
      return <div className="py-2">{productName}</div>;
    },
    meta: 'Product',
  },
  {
    id: 'loadSize',
    accessorFn: (row) => row.actualLoadSize ?? row.quantity,
    header: () => {
      return <div>QTY</div>;
    },
    cell: ({ row }) => {
      const loadSize = row.original.actualLoadSize ?? row.original.quantity ?? 0;
      const productSellUom = row.original.quantityUom;
      const formattedQty = formatNumberThousandSeparator(loadSize);
      const formattedLoadSize = productSellUom
        ? `${formattedQty} ${formatUomLabel(productSellUom)}`
        : formattedQty;
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
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const docket = row.original;
      return (
        <DocketTableActions
          docketId={docket.id}
          status={docket.status}
          invoiceStatus={docket.invoiceStatus}
        />
      );
    },
  },
];
