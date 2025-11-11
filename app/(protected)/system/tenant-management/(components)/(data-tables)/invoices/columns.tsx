'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { Invoice } from '@/lib/types/user';

export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    id: 'invoice_number',
    accessorFn: (row) => row.invoice_number,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Invoice Number" />
      );
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Invoice Number',
  },

  {
    id: 'invoice_date',
    accessorFn: (row) => row.invoice_date,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Invoice Date" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Invoice Date',
  },

  {
    id: 'invoice_amount',
    accessorFn: (row) => row.invoice_amount,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Invoice Amount" />
      );
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.original.invoice_amount.toString());
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);
      return (
        <div className="py-2 font-medium w-36 max-w-36 truncate">
          {formatted}
        </div>
      );
    },
    meta: 'Invoice Amount',
  },

  {
    id: 'invoice_status',
    accessorFn: (row) => row.invoice_status,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Invoice Status" />
      );
    },
    cell: ({ row }) => {
      const invoice_status = row.original.invoice_status;
      return (
        <div className="py-2">
          <TableBadges names={[invoice_status]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Invoice Status',
  },
  //   {
  //     id: 'actions',
  //     header: () => {
  //       return <div></div>;
  //     },
  //     cell: ({ row }) => {
  //       const customer = row.original;
  //       return <CustomerTableActions customer={customer} />;
  //     },
  //   },
];
