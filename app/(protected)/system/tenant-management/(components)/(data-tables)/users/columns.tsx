'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { getRelativeTime } from '@/lib/utils/date';
import { User } from '@/lib/types/user';
import { UserStatus } from '@/lib/types/user-enums';
import { UserTableActions } from './user-table-actions';
import { FormSelectOption } from '@/components/ui/form-select';

export const createUserColumns = (
  rolesOptions: readonly FormSelectOption[],
  currentUserId?: number | string
): ColumnDef<User>[] => [
  {
    id: 'user_name',
    accessorFn: (row) => row.fullName,
    header: ({ column }) => {
      console.log(column);
      return <TableClientSortableHeader column={column} title="User Name" />;
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'User Name',
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
    accessorFn: (row) => row.groups,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Role" />;
    },
    cell: ({ row }) => {
      const groups = row.original.groups;
      // groups is a string array like ["SUPERADMIN"] or ["USER"]
      const groupsUpper = groups?.join(',').toUpperCase() || '';
      const formattedRole = groupsUpper.includes('SUPERADMIN')
        ? 'Super Admin'
        : groupsUpper.includes('ADMIN')
        ? 'Admin'
        : 'User';
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
    id: 'lastLoginAt',
    accessorFn: (row) => row.lastLoginAt,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Last Login" />;
    },
    cell: ({ row }) => {
      const lastLogin = row.original.lastLoginAt;
      const displayText = lastLogin ? getRelativeTime(lastLogin) : 'Never';
      return <div className="py-2 text-left">{displayText}</div>;
    },
    meta: 'Last Login',
    size: 80,
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <UserTableActions
          user={user}
          roles={rolesOptions}
          currentUserId={currentUserId}
        />
      );
    },
  },
];

// Default export for backwards compatibility
export const userColumns = createUserColumns([], undefined);
