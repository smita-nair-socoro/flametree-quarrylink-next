'use client';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { DocketTableRow } from '@/lib/types/docket';
import { DateCell } from '@/components/date-cell';
import { TableBadges } from '@/components/table-badges';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DocketTableActions } from './docket-table-actions';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { formatUomLabel } from '@/lib/utils/docket-helper';
import { HelpCircle, TriangleAlert } from 'lucide-react';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  formatCurrency,
  getExTaxLabel,
} from '@/lib/utils/tenant-config-helper';

export const getDocketColumns = (
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
): ColumnDef<DocketTableRow>[] => [
  {
    id: 'docketNumber',
    accessorFn: (row) => row.docketNumber,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Docket #" />;
    },
    cell: (info) => {
      const value = (info.getValue() as string) || 'N/A';
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-30">{value}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Docket Number',
  },
  {
    id: 'docketType',
    accessorFn: (row) => row.type || 'N/A',
    header: () => {
      return <div>Type</div>;
    },
    cell: ({ row }) => {
      return (
        <TableBadges names={[row.original.type]} visibleCount={1} />
      );
    },
    meta: 'Type',
  },
  {
    id: 'jobReference',
    accessorFn: (row) => row.jobReference,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Job Reference" />
      );
    },
    cell: ({ row }) => {
      const jobNumber = row.original.jobReference;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-30">{jobNumber}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{jobNumber}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Job Reference',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: () => {
      return <div>Status</div>;
    },
    cell: ({ row }) => {
      const status =
        row.original.status === 'READY_FOR_COLLECTION'
          ? 'READY'
          : row.original.status;
      if (status === 'INVOICED' && row.original.invoiceStatus === 'FAILED') {
        return (
          <TableBadges
            names={[status]}
            visibleCount={1}
            icon={<TriangleAlert className="w-4 h-4 mb-0.5 text-red-500" />}
          />
        );
      }
      return <TableBadges names={[status]} visibleCount={1} />;
    },
    meta: 'Status',
  },
  {
    id: 'customer',
    accessorFn: (row) => {
      if (!row.customerId) return '';
      return `${row.customerId}|${row.customerName}`;
    },
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Customer" />;
    },
    cell: ({ row }) => {
      const customerName = row.original.customerName || 'N/A';
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-30">{customerName}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{customerName}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Customer',
  },
  {
    id: 'product',
    accessorFn: (row) => {
      if (!row.productId) return '';
      return `${row.productId}|${row.productName}`;
    },
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Product" />;
    },
    cell: ({ row }) => {
      const productName = row.original.productName || 'N/A';
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-30">{productName}</div>
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
    accessorFn: (row) => row.deliveryDate,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Delivery Date" />
      );
    },
    cell: ({ row }) => {
      const deliveryDate = row.original.deliveryDate;
      return <DateCell dateString={deliveryDate?.toString() ?? ''} side="top" />;
    },
    meta: 'Delivery Date',
  },
  {
    id: 'loadSize',
    accessorFn: (row) => row.actualLoadSize ?? row.quantity,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Quantity" />;
    },
    cell: ({ row }) => {
      const loadSize = row.original.actualLoadSize ?? row.original.quantity ?? 0;
      const productUom = row.original.quantityUom;
      const formattedQty = formatNumberThousandSeparator(loadSize);
      const formattedLoadSize = productUom
        ? `${formattedQty} ${formatUomLabel(productUom)}`
        : formattedQty;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block max-w-30">{formattedLoadSize}</div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{formattedLoadSize}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Load Size',
  },
  {
    id: 'totalInvoice',
    accessorFn: (row) => row.totalInvoiceAmount,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader
          column={column}
          title={
            <div className="flex items-center gap-1">
              Total Invoice{' '}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="cursor-help"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getExTaxLabel(taxLabel)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          }
        />
      );
    },
    cell: ({ row }) => {
      const cents = Number.parseFloat(
        row.original.totalInvoiceAmount?.toString() ?? '0',
      );
      const dollars = cents / 100;
      const formatted = formatCurrency(dollars, currencyCode);
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
    meta: 'Total Invoice',
  },

  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      return (
        <DocketTableActions
          docketId={row.original.id}
          status={row.original.status}
          invoiceStatus={row.original.invoiceStatus}
        />
      );
    },
  },
];
