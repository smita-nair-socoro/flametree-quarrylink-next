'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { CustomerDTO } from '@/lib/types/customer';
import { formatCustomerStatus } from '@/lib/utils/customer-helper';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';
import { CustomerTableActions } from './customer-table-actions';

export const customerColumns: ColumnDef<CustomerDTO>[] = [
  {
    id: 'customer_name',
    accessorFn: (row) => row.businessName || row.contactName,
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
    accessorFn: (row) => row.customerType,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Customer Type" />
      );
    },
    cell: ({ row }) => {
      const customer_type = row.original.customerType;
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
    accessorFn: (row) => row.contactName,
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
    id: 'credit_limit',
    accessorFn: (row) => row.creditLimit,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Credit Limit" />;
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.original.creditLimit.toString());
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);
      return row.original.paymentType === 'CREDIT' ? (
        <div className="py-2 font-medium w-36 max-w-36 truncate" title={formatted}>
          {formatted}
        </div>
      ) : (
        <div className="py-2 font-medium w-36 max-w-36 truncate" title="N/A">N/A</div>
      );
    },
    meta: 'Credit Limit',
  },
  // {
  //   id: 'remaining_credit',
  //   accessorFn: (row) => row.remainingCredit,
  //   header: ({ column }) => {
  //     return (
  //       <TableClientSortableHeader column={column} title="Remaining Credit" />
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const cents = parseFloat(
  //       (row.original.creditLimit - (row.original.remainingCredit ?? 0)).toString()
  //     );
  //     const dollars = cents / 100;
  //     const formatted = new Intl.NumberFormat('en-US', {
  //       style: 'currency',
  //       currency: 'USD',
  //     }).format(dollars);
  //     return (
  //       <div className="py-2 font-medium w-36 max-w-36 truncate">
  //         {formatted}
  //       </div>
  //     );
  //   },
  //   meta: 'Remaining Credit',
  // },
  {
    id: 'status',
    accessorFn: (row) => row.customerStatus,
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
    accessorFn: (row) => row.accountManagerName,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Account Manager" />
      );
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Account Manager',
  },

  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const customer = row.original;
      return <CustomerTableActions customer={customer} />;
    },
  },
];
