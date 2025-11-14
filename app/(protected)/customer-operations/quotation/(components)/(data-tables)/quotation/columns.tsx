'use client';
import { DateCell } from '@/components/date-cell';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { dateSortingFn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Quotation } from '@/lib/types/quotation';
import { QuotationTableActions } from './quotation-table-actions';
import { centsToDollars } from '@/lib/utils/currency';

export const quotationColumns: ColumnDef<Quotation>[] = [
  {
    id: 'quote_number',
    accessorFn: (row) => row.quote_number,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Quotation" />;
    },
    cell: (info) => info.getValue(),
    meta: 'Quotation Number',
  },
  {
    id: 'customer_name',
    accessorFn: (row) => row.customer_name,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Customer" />;
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
      if (!quote_type) return <span className="text-muted-foreground">-</span>;
      return <TableBadges names={[quote_type]} visibleCount={1} />;
    },
    meta: 'Quote Type',
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
    meta: 'Date Issued',
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
    id: 'total_sell_price',
    accessorFn: (row) => row.total_sell_price,
    header: ({}) => {
      return <div>Total Sell Price (Ex-GST)</div>;
    },
    cell: ({ row }) => {
      const total_sell_price = row.original.total_sell_price
        ? centsToDollars(row.original.total_sell_price)
        : '0';
      return <div>${total_sell_price}</div>;
    },
    meta: 'Total Price',
  },
  {
    id: 'account_manager',
    accessorFn: (row) => row.account_manager_name,
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
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return <span className="text-muted-foreground">-</span>;
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
      const quotation = row.original;
      return (
        <div>
          <QuotationTableActions quotation={quotation} />
        </div>
      );
    },
  },
];
