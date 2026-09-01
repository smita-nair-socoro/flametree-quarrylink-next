'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PaymentsInternalTransfer } from '@/lib/types/payments';
import { DateCell } from '@/components/date-cell';
import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import {
  DEFAULT_CURRENCY_CODE,
  formatCurrency,
} from '@/lib/utils/tenant-config-helper';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const getPaymentsInternalTransferColumns = (
  onRetry: (journalId: number) => void,
  onViewJournal: (row: PaymentsInternalTransfer) => void,
  retryingId?: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): ColumnDef<PaymentsInternalTransfer>[] => [
  {
    id: 'docketNumber',
    accessorFn: (row) => row.docketNumber,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Docket" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/customer-operations/dockets?ids=${row.original.docketId}`}
        className={cn(
          'py-2 text-primary underline-offset-4 hover:underline',
          row.original.voided && 'text-muted-foreground',
        )}
      >
        {row.original.docketNumber || 'N/A'}
      </Link>
    ),
    meta: 'Docket',
  },
  {
    id: 'jobNumber',
    accessorFn: (row) => row.jobNumber,
    enableSorting: false,
    header: () => <div>Job</div>,
    cell: ({ row }) => {
      const jobId = row.original.jobId;
      const jobNumber = row.original.jobNumber || 'N/A';
      if (!jobId) return <div className="py-2">{jobNumber}</div>;
      return (
        <Link
          href={`/customer-operations/jobs?tab=internal-transfers&ids=${jobId}`}
          className="py-2 text-primary underline-offset-4 hover:underline"
        >
          {jobNumber}
        </Link>
      );
    },
    meta: 'Job',
  },
  {
    id: 'fromSiteName',
    accessorFn: (row) => row.fromSiteName,
    enableSorting: false,
    header: () => <div>From Site</div>,
    cell: ({ row }) => (
      <div className="py-2">{row.original.fromSiteName || 'N/A'}</div>
    ),
    meta: 'From Site',
  },
  {
    id: 'toSiteName',
    accessorFn: (row) => row.toSiteName,
    enableSorting: false,
    header: () => <div>To Site</div>,
    cell: ({ row }) => (
      <div className="py-2">{row.original.toSiteName || 'N/A'}</div>
    ),
    meta: 'To Site',
  },
  {
    id: 'productName',
    accessorFn: (row) => row.productName,
    enableSorting: false,
    header: () => <div>Product</div>,
    cell: ({ row }) => (
      <div className="py-2">{row.original.productName || 'N/A'}</div>
    ),
    meta: 'Product',
  },
  {
    id: 'quantity',
    accessorFn: (row) => row.quantity,
    enableSorting: false,
    header: () => <div>Quantity</div>,
    cell: ({ row }) => <div className="py-2">{row.original.quantity}</div>,
    meta: 'Quantity',
  },
  {
    id: 'costValue',
    accessorFn: (row) => row.costValue,
    header: () => <div>Cost value</div>,
    cell: ({ row }) => (
      <div className="py-2 font-medium">
        {formatCurrency(Number(row.original.costValue) / 100, currencyCode)}
      </div>
    ),
    meta: 'Cost value',
  },
  {
    id: 'transferDate',
    accessorFn: (row) => row.transferDate,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <DateCell dateString={row.original.transferDate} side="top" />
    ),
    meta: 'Date',
  },
  {
    id: 'accountingSync',
    accessorFn: (row) => row.accountingSync,
    enableSorting: false,
    header: () => <div>Accounting Sync</div>,
    cell: ({ row }) => (
      <AccountingSyncBadge
        status={row.original.accountingSync}
        failureReason={row.original.failureReason}
        onRetry={
          row.original.journalId
            ? () => onRetry(row.original.journalId as number)
            : undefined
        }
        retrying={retryingId === row.original.journalId}
      />
    ),
    meta: 'Accounting Sync',
  },
  {
    id: 'actions',
    header: () => <div />,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/customer-operations/dockets?ids=${row.original.docketId}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Docket
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewJournal(row.original)}>
            <FileText className="h-4 w-4 mr-2" />
            View Journal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
