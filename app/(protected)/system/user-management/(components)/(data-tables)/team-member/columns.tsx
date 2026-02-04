'use client';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { TeamMemberTableActions } from './team-member-table-actions';
import { User } from '@/lib/types/user';
import { FormSelectOption } from '@/components/ui/form-select';

export const createTeamMemberColumns = (
  rolesOptions: readonly FormSelectOption[],
  currentUserId?: number | string
): ColumnDef<User>[] => [
  {
    id: 'name',
    accessorFn: (row) => row.name,
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
    size: 300,
  },
  {
    id: 'role',
    accessorFn: (row) => row.groups,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Role" />;
    },
    cell: ({ row }) => {
      const groups = row.original.groups;
      // Handle cases where groups might be null, undefined, or not an array
      if (!groups || !Array.isArray(groups) || groups.length === 0) {
        return <div className="py-2">User</div>;
      }

      // Join groups and check for role types
      const groupsStr = groups.join(',').toUpperCase();
      const formattedRole =
        groupsStr.includes('SUPER_ADMIN') || groupsStr.includes('SUPERADMIN')
          ? 'Super Admin'
          : groupsStr.includes('ADMIN')
          ? 'Admin'
          : 'User';
      return <div className="py-2">{formattedRole}</div>;
    },
    meta: 'Role',
    size: 120,
  },
  // {
  //   id: 'lastLoginAt',
  //   accessorFn: (row) => row.lastLoginAt,
  //   header: ({ column }) => {
  //     return <TableClientSortableHeader column={column} title="Last Login" />;
  //   },
  //   cell: ({ row }) => {
  //     const lastLogin = row.original.lastLoginAt;
  //     const displayText = lastLogin ? getRelativeTime(lastLogin) : 'Never';
  //     return <div className="py-2 text-left">{displayText}</div>;
  //   },
  //   meta: 'Last Login',
  //   size: 80,
  // },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const teamMember = row.original;
      return (
        <TeamMemberTableActions
          teamMember={teamMember}
          roles={rolesOptions}
          currentUserId={currentUserId}
        />
      );
    },
  },
];

// Default export for backwards compatibility
export const teamMemberColumns = createTeamMemberColumns([], undefined);
