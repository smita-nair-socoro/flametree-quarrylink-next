'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PaymentsInvoice } from '@/lib/types/payments';
import { TableBadges } from '@/components/table-badges';
import { DateCell } from '@/components/date-cell';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { InvoiceTableActions } from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/invoices/(data-tables)/invoice-table-actions';
import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  formatCurrency,
  getExTaxLabel,
} from '@/lib/utils/tenant-config-helper';
import Link from 'next/link';

export const getPaymentsInvoiceColumns = (
  onRetry: (invoiceId: number) => void,
  retryingId?: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
): ColumnDef<PaymentsInvoice>[] => [
  {
    id: 'invoiceNumber',
    accessorFn: (row) => row.invoiceNumber,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Invoice Number" />
    ),
    cell: ({ row }) => (
      <div className="py-2">{row.original.invoiceNumber || 'N/A'}</div>
    ),
    meta: 'Invoice Number',
  },
  {
    id: 'jobNumber',
    accessorFn: (row) => row.jobNumber,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Job" />
    ),
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
      <div className="flex items-center gap-2">
        <TableClientSortableHeader column={column} title="Amount" />
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{getExTaxLabel(taxLabel)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: ({ row }) => {
      const dollars = Number(row.original.amount) / 100;
      return (
        <div className="py-2 font-medium">
          {formatCurrency(dollars, currencyCode)}
        </div>
      );
    },
    meta: 'Amount',
  },
  {
    id: 'dueDate',
    accessorFn: (row) => row.dueDate,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => <DateCell dateString={row.original.dueDate} side="top" />,
    meta: 'Due Date',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    enableSorting: false,
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <div className="py-2">
        <TableBadges names={[String(row.original.status)]} visibleCount={1} />
      </div>
    ),
    meta: 'Status',
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
        onRetry={() => onRetry(row.original.id)}
        retrying={retryingId === row.original.id}
      />
    ),
    meta: 'Accounting Sync',
  },
  {
    id: 'actions',
    header: () => <div />,
    cell: ({ row }) => <InvoiceTableActions invoiceId={row.original.id} />,
  },
];
