'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Invoice } from '@/lib/types/job';
// import { JobLineItemTableActions } from './job-line-items-table-actions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TableBadges } from '@/components/table-badges';
import { DateCell } from '@/components/date-cell';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { INVOICE_STATUS } from '@/lib/types/invoice-enums';

export const invoicesColumns: ColumnDef<Invoice>[] = [
  {
    id: 'invoice',
    accessorFn: (row) => row.invoiceNumber,
    header: () => {
      return <div>Invoice</div>;
    },
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoiceNumber || 'N/A';
      return (
        <div className="py-2">{invoiceNumber}</div>
      );
    },
    meta: 'Invoice Number',
  },
  {
    id: 'dockets',
    accessorFn: (row) => row.docketCount,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Dockets" />
      );
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
      return <div>Amount</div>;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.original.amount.toString());
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
      }).format(dollars);
      return <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="py-2 font-medium w-36 max-w-36 truncate">
            {formatted}
          </div>
        </TooltipTrigger>
        <TooltipContent variant="white">
          <p>{formatted}</p>
        </TooltipContent>
      </Tooltip>;
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
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
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
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      return <div></div>;
    },
  },
];
