'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Invoice } from '@/lib/types/job';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TableBadges } from '@/components/table-badges';
import { DateCell } from '@/components/date-cell';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { INVOICE_STATUS } from '@/lib/types/invoice-enums';
import { InvoiceTableActions } from './invoice-table-actions';
import { InvoiceAccountingSyncCell } from './invoice-accounting-sync-cell';
import { HelpCircle } from 'lucide-react';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  formatCurrency,
  getExTaxLabel,
} from '@/lib/utils/tenant-config-helper';

export const getInvoicesColumns = (
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
): ColumnDef<Invoice>[] => [
  {
    id: 'invoice',
    accessorFn: (row) => row.invoiceNumber,
    header: () => {
      return <div>Invoice</div>;
    },
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoiceNumber || 'N/A';
      return <div className="py-2">{invoiceNumber}</div>;
    },
    meta: 'Invoice Number',
  },
  {
    id: 'dockets',
    accessorFn: (row) => row.docketCount,
    enableSorting: false,
    header: () => {
      return <div>Dockets</div>;
    },
    cell: ({ row }) => {
      const docketCount = row.original.docketCount;
      return <div className="py-2">{docketCount}</div>;
    },
    meta: 'Dockets',
  },
  {
    id: 'amount',
    accessorFn: (row) => row.amount,
    header: () => {
      return <div className="flex items-center gap-2">
        Amount
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{getExTaxLabel(taxLabel)}</p>
          </TooltipContent>
        </Tooltip>
      </div>;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.original.amount.toString());
      const dollars = cents / 100;
      const formatted = formatCurrency(dollars, currencyCode);
      return (
        <div className="flex items-center gap-1">
          <span className="py-2 font-medium w-[100px] truncate">
            {formatted}
          </span>
        </div >
      );
    },
    meta: 'Amount',
  },
  {
    id: 'Due Date',
    accessorFn: (row) => row.dueDate,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Due Date" />;
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      return <DateCell dateString={dueDate} side="top" />;
    },
    meta: 'Due Date',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    enableSorting: false,
    header: () => {
      return <div>Status</div>;
    },
    cell: ({ getValue }) => {
      const status = getValue<string>() as INVOICE_STATUS;
      return (
        <div className="py-2">
          <TableBadges names={[status]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
  },
  {
    id: 'accountingSync',
    accessorFn: (row) => row.accountingSync ?? row.status,
    enableSorting: false,
    header: () => {
      return <div>Accounting Sync</div>;
    },
    cell: ({ row }) => {
      return <InvoiceAccountingSyncCell invoice={row.original} />;
    },
    meta: 'Accounting Sync',
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const invoice = row.original;
      return <InvoiceTableActions invoiceId={invoice.id} />;
    },
  },
];
