'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { getRelativeTime } from '@/lib/utils/date';
import { TeamMemberTableActions } from './team-member-table-actions';
import { User } from '@/lib/types/user';
import { Role, UserStatus } from '@/lib/types/user-enums';

export const teamMemberColumns: ColumnDef<User>[] = [
  {
    id: 'full_name',
    accessorFn: (row) => row.full_name,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Full Name" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Full Name',
    size: 180,
  },
  {
    id: 'email',
    accessorFn: (row) => row.email,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Email" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Email',
    size: 240,
  },
  {
    id: 'role',
    accessorFn: (row) => row.role,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Role" />;
    },
    cell: ({ row }) => {
      const role = row.original.role;
      const formattedRole =
        role === Role.ADMIN
          ? 'Admin'
          : role === Role.SUPERADMIN
          ? 'Super Admin'
          : 'User'; // TODO: Add other roles here
      return <div className="py-2">{formattedRole}</div>;
    },
    meta: 'Role',
    size: 120,
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ getValue }) => {
      const status = getValue<string>() as UserStatus;
      const formattedStatus =
        status === UserStatus.ACTIVE
          ? 'ACTIVE'
          : status === UserStatus.PENDING
          ? 'PENDING'
          : status === UserStatus.INACTIVE
          ? 'INACTIVE'
          : status;
      return (
        <div className="py-2">
          <TableBadges names={[formattedStatus]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
    size: 180,
  },
  {
    id: 'last_login_at',
    accessorFn: (row) => row.last_login_at,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Last Login" />;
    },
    cell: ({ row }) => {
      const lastLogin = row.original.last_login_at;
      const displayText = lastLogin ? getRelativeTime(lastLogin) : 'Never';
      return <div className="py-2 text-left">{displayText}</div>;
    },
    meta: 'Last Login',
    size: 80,
  },
];
