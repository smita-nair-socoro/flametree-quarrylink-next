'use client';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { TeamMemberTableActions } from './team-member-table-actions';
import { User } from '@/lib/types/user';
import { FormSelectOption } from '@/components/ui/form-select';

export const createTeamMemberColumns = (
  rolesOptions: readonly FormSelectOption[],
  currentUserId?: number | string,
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
    accessorFn: (row) => {
      const groups = row.groups;
      if (!groups || !Array.isArray(groups) || groups.length === 0) return 3;
      const g = groups.join(',').toLowerCase();
      if (g.includes('super_admin') || g.includes('superadmin')) return 2;
      if (g.includes('driver')) return 1;
      if (g.includes('admin')) return 0;
      return 3;
    },
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Role" />;
    },
    cell: ({ row }) => {
      const groups = row.original.groups;
      if (!groups || !Array.isArray(groups) || groups.length === 0) {
        return <div className="py-2">User</div>;
      }
      const g = groups.join(',').toLowerCase();
      const formattedRole =
        g.includes('super_admin') || g.includes('superadmin')
          ? 'Super Admin'
          : g.includes('driver')
          ? 'Driver'
          : g.includes('admin')
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
