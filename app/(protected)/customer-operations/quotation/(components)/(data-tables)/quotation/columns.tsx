'use client';

import { DateCell } from '@/components/date-cell';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { dateSortingFn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { TableActions } from '@/components/table-actions';
import { QuotationDetails } from '@/lib/types/quotation';

export const quotationColumns: ColumnDef<QuotationDetails>[] = [
  {
    id: 'quote_number',
    accessorFn: (row) => row.quote_number,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Quotation Number" />
      );
    },
    cell: (info) => info.getValue(),
    meta: 'Quotation Number',
  },

  {
    id: 'customer_name',
    accessorFn: (row) => row.customer.name,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Customer Name" />
      );
    },
    cell: (info) => info.getValue(),
    meta: 'Customer Name',
  },

  {
    id: 'quote_type',
    accessorFn: (row) => row.quote_type,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Quote Type" />;
    },
    cell: ({ row }) => {
      const quote_type = row.original.quote_type;
      return <TableBadges names={quote_type} visibleCount={1} />;
    },
    meta: 'Quote Type',
  },

  {
    id: 'products',
    accessorFn: (row) => row.quarryProducts.map((qp) => qp.quarry.name),
    header: 'Products',
    cell: ({ getValue }) => {
      const names = getValue<string[]>();
      return <TableBadges names={names} visibleCount={1} />;
    },
    meta: 'Products',
  },

  {
    id: 'created_at',
    accessorFn: (row) => row.created_at,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Date Issued" />;
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    sortingFn: dateSortingFn,

    meta: 'Created Date',
  },

  {
    id: 'expiry_date',
    accessorFn: (row) => row.expiry_date,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Expiry Date" />;
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    sortingFn: dateSortingFn,

    meta: 'Expiry Date',
  },

  {
    id: 'total_cost_price',
    accessorFn: (row) => row.total_cost_price,
    header: ({}) => {
      return <div>Total Price (Ex-GST)</div>;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.original.total_cost_price.toString());
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);

      return <div className="text-center font-medium">{formatted}</div>;
    },
    meta: 'Total Price',
  },

  {
    id: 'account_manager',
    accessorFn: (row) => row.account_manager,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Account Manager" />
      );
    },
    cell: (info) => info.getValue(),
    meta: 'Account Manager',
  },

  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ getValue }) => {
      const names = getValue<string>();
      return <TableBadges names={names} visibleCount={1} />;
    },
    meta: 'STATUS',
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const id = row.original.id;

      return <TableActions productId={id} />;
    },
  },
];
