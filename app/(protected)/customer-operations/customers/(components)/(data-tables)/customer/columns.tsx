'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { CustomerDetails } from '@/lib/types/customer';
import { formatCustomerStatus } from '@/lib/utils/customer-helper';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';

export const customerColumns: ColumnDef<CustomerDetails>[] = [
  {
    id: 'customer_name',
    accessorFn: (row) => row.business_name,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Customer Name" />
      );
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Customer Name',
  },
  {
    id: 'customer_type',
    accessorFn: (row) => row.customer_type,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Customer Type" />
      );
    },
    cell: ({ row }) => {
      const customer_type = row.original.customer_type;
      return (
        <div className="py-2">
          <TableBadges names={[customer_type]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Customer Type',
  },
  {
    id: 'contact_name',
    accessorFn: (row) => row.contact_name,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Contact Name" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Contact Name',
  },
  {
    id: 'email',
    accessorFn: (row) => row.email,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Email" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Email',
  },
  {
    id: 'payment_terms',
    accessorFn: (row) => row.payment_terms,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Payment Terms" />
      );
    },
    cell: ({ row }) => {
      const payment_terms = row.original.payment_terms;
      return (
        <div className="py-2">
          <TableBadges names={payment_terms} visibleCount={1} />
        </div>
      );
    },
    meta: 'Payment Terms',
  },
  {
    id: 'credit_limit',
    accessorFn: (row) => row.credit_limit,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Credit Limit" />;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.original.credit_limit.toString());
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
    meta: 'Credit Limit',
  },
  {
    id: 'remaining_credit',
    accessorFn: (row) => row.remaining_credit,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Remaining Credit" />
      );
    },
    cell: ({ row }) => {
      const cents = parseFloat(
        (row.original.credit_limit - row.original.remaining_credit).toString()
      );
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
    meta: 'Remaining Credit',
  },
  {
    id: 'status',
    accessorFn: (row) => row.customer_status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ getValue }) => {
      const names = formatCustomerStatus(getValue<string>() as CUSTOMER_STATUS);
      return (
        <div className="py-2">
          <TableBadges names={names} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
  },
  {
    id: 'account_manager',
    accessorFn: (row) => row.account_manager,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Account Manager" />
      );
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Account Manager',
  },

  // TODO: QLINK-637 Add actions
  //   {
  //     id: 'actions',
  //     header: () => {
  //       return <div></div>;
  //     },
  //     cell: ({ row }) => {
  //         const customer = row.original;
  //       return <div></div>;
  //     },
  //   },
];
