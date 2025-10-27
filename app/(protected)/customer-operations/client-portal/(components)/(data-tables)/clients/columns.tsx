'use client';

import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { Client } from '@/lib/types/client';
import { ColumnDef } from '@tanstack/react-table';

export const clientColumns: ColumnDef<Client>[] = [
  {
    id: 'client',
    accessorFn: (row) => row.client,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Client" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Client',
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
    accessorFn: (row) => `${row.users} / ${row.max_users}`,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Users" />;
    },
    cell: ({ row }) => {
      const users = row.original.users;
      const maxUsers = row.original.max_users;
      const percentage = (users / maxUsers) * 100;
      return (
        <div className="py-2 flex items-center gap-2">
          <span className="min-w-[50px]">
            {users} / {maxUsers}
          </span>
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
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="py-2">
          <TableBadges names={[status]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
  },
];
