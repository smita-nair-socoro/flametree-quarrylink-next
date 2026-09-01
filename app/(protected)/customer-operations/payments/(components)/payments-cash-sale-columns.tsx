'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PaymentsCashSale } from '@/lib/types/payments';
import { DateCell } from '@/components/date-cell';
import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import {
  DEFAULT_CURRENCY_CODE,
  formatCurrency,
} from '@/lib/utils/tenant-config-helper';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const getPaymentsCashSaleColumns = (
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): ColumnDef<PaymentsCashSale>[] => [
  {
    id: 'reference',
    accessorFn: (row) => row.reference,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Reference" />
    ),
    cell: ({ row }) => (
      <div className={cn('py-2', row.original.voided && 'text-muted-foreground')}>
        {row.original.reference || 'N/A'}
      </div>
    ),
    meta: 'Reference',
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
          href={`/customer-operations/jobs?ids=${jobId}`}
          className="py-2 text-primary underline-offset-4 hover:underline"
        >
          {jobNumber}
        </Link>
      );
    },
    meta: 'Job',
  },
  {
    id: 'customerName',
    accessorFn: (row) => row.customerName,
    enableSorting: false,
    header: () => <div>Customer</div>,
    cell: ({ row }) => (
      <div className="py-2">{row.original.customerName || 'N/A'}</div>
    ),
    meta: 'Customer',
  },
  {
    id: 'docketCount',
    accessorFn: (row) => row.docketCount,
    enableSorting: false,
    header: () => <div>Dockets</div>,
    cell: ({ row }) => <div className="py-2">{row.original.docketCount}</div>,
    meta: 'Dockets',
  },
  {
    id: 'amount',
    accessorFn: (row) => row.amount,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <div className="py-2 font-medium">
        {formatCurrency(Number(row.original.amount) / 100, currencyCode)}
      </div>
    ),
    meta: 'Amount',
  },
  {
    id: 'recordedAt',
    accessorFn: (row) => row.recordedAt,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <DateCell dateString={row.original.recordedAt} side="top" />
    ),
    meta: 'Date',
  },
  {
    id: 'paymentType',
    accessorFn: (row) => row.paymentType,
    enableSorting: false,
    header: () => <div>Payment type</div>,
    cell: ({ row }) => (
      <div className="py-2">{row.original.paymentType || 'N/A'}</div>
    ),
    meta: 'Payment type',
  },
  {
    id: 'paymentReceivedBy',
    accessorFn: (row) => row.paymentReceivedBy,
    enableSorting: false,
    header: () => <div>Received by</div>,
    cell: ({ row }) => (
      <div className="py-2">{row.original.paymentReceivedBy || 'N/A'}</div>
    ),
    meta: 'Received by',
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
      />
    ),
    meta: 'Accounting Sync',
  },
];
