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
import { TableBadges } from '@/components/table-badges';
import { CashSaleReceiptActions } from '@/components/cash-sale-receipt-actions';
import { useRetryCashSale } from '@/lib/api/payments';

function CashSaleSyncCell({ receipt }: { receipt: PaymentsCashSale }) {
  const retry = useRetryCashSale();
  return (
    <AccountingSyncBadge
      status={receipt.accountingSync}
      failureReason={receipt.failureReason}
      onRetry={
        receipt.accountingSync === 'FAILED' && !receipt.voided
          ? () => retry.mutate(receipt.id)
          : undefined
      }
      retrying={retry.isPending}
    />
  );
}

export const getPaymentsCashSaleColumns = (
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  options?: {
    includeJob?: boolean;
    includeCustomer?: boolean;
    referenceTitle?: string;
    dateTitle?: string;
    receivedByTitle?: string;
  },
): ColumnDef<PaymentsCashSale>[] => {
  const includeJob = options?.includeJob !== false;
  const includeCustomer = options?.includeCustomer !== false;
  const referenceTitle = options?.referenceTitle ?? 'Reference';
  const dateTitle = options?.dateTitle ?? 'Date';
  const receivedByTitle = options?.receivedByTitle ?? 'Payment Received By';
  const columns: ColumnDef<PaymentsCashSale>[] = [
    {
      id: 'reference',
      accessorFn: (row) => row.reference,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title={referenceTitle} />
      ),
      cell: ({ row }) => (
        <div
          className={cn(
            'py-2 flex items-center gap-2',
            row.original.voided && 'text-muted-foreground',
          )}
        >
          {row.original.voided ? (
            <TableBadges names={['VOID']} visibleCount={1} />
          ) : null}
          {row.original.reference || 'N/A'}
        </div>
      ),
      meta: referenceTitle,
    },
  ];

  if (includeJob) {
    columns.push({
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
    });
  }

  if (includeCustomer) {
    columns.push({
      id: 'customerName',
      accessorFn: (row) => row.customerName,
      enableSorting: false,
      header: () => <div>Customer</div>,
      cell: ({ row }) => (
        <div className="py-2">{row.original.customerName || 'N/A'}</div>
      ),
      meta: 'Customer',
    });
  }

  columns.push(
    {
      id: 'docketCount',
      accessorFn: (row) => row.docketCount,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Dockets" />
      ),
      cell: ({ row }) => (
        <div className="py-2">
          <TableBadges
            names={[
              `${row.original.docketCount} docket${row.original.docketCount === 1 ? '' : 's'}`,
            ]}
            visibleCount={1}
          />
        </div>
      ),
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
        <TableClientSortableHeader column={column} title={dateTitle} />
      ),
      cell: ({ row }) => (
        <DateCell dateString={row.original.recordedAt} side="top" />
      ),
      meta: dateTitle,
    },
    {
      id: 'paymentType',
      accessorFn: (row) => row.paymentType,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Payment Type" />
      ),
      cell: ({ row }) => (
        <div className="py-2">
          <TableBadges
            names={[row.original.paymentType || 'N/A']}
            visibleCount={1}
          />
        </div>
      ),
      meta: 'Payment type',
    },
    {
      id: 'paymentReceivedBy',
      accessorFn: (row) => row.paymentReceivedBy,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title={receivedByTitle} />
      ),
      cell: ({ row }) => (
        <div className="py-2">{row.original.paymentReceivedBy || 'N/A'}</div>
      ),
      meta: receivedByTitle,
    },
    {
      id: 'accountingSync',
      accessorFn: (row) => row.accountingSync,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Accounting Sync" />
      ),
      cell: ({ row }) => <CashSaleSyncCell receipt={row.original} />,
      meta: 'Accounting Sync',
    },
    {
      id: 'actions',
      header: () => <div />,
      cell: ({ row }) => <CashSaleReceiptActions receipt={row.original} />,
    },
  );

  return columns;
};
