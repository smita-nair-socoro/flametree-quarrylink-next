'use client';

import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { Client } from '@/lib/types/client';
import { ColumnDef } from '@tanstack/react-table';
import { ClientTableActions } from './client-table-actions';

export const clientColumns: ColumnDef<Client>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Client" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Name',
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
    id: 'phone',
    accessorFn: (row) => row.phone,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Phone" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Phone',
  },
  {
    id: 'subscription',
    accessorFn: (row) => row.subscription,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Subscription" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Subscription',
  },
  {
    id: 'users',
    accessorFn: (row) => `${row.total_users} / ${row.total_users}`,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Users" />;
    },
    cell: ({ row }) => {
      const users = row.original.total_users;
      const percentage = (users / 30) * 100;
      return (
        <div className="py-2 flex items-center gap-2">
          <span className="min-w-[50px]">{users} / 30</span>
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    },
    meta: 'Users',
  },
  {
    id: 'client_status',
    accessorFn: (row) => row.client_status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ row }) => {
      const status = row.original.client_status;
      return (
        <div className="py-2">
          <TableBadges names={[status]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Client Status',
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const client = row.original;
      return <ClientTableActions client={client} />;
    },
  },
];
