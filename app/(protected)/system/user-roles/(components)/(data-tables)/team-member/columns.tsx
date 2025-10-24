'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { TeamMember } from '@/lib/types/team-member';
import { TEAM_MEMBER_STATUS, TEAM_MEMBER_ROLE } from '@/lib/types/team-member-enums';
import { getRelativeTime } from '@/lib/utils/date';

export const teamMemberColumns: ColumnDef<TeamMember>[] = [
  {
    id: 'user_name',
    accessorFn: (row) => row.user_name,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="User Name" />
      );
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'User Name',
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
    id: 'role',
    accessorFn: (row) => row.role,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Role" />;
    },
    cell: ({ row }) => {
      const role = row.original.role;
      const formattedRole =
        role === TEAM_MEMBER_ROLE.ADMIN ? 'Admin' :
        role === TEAM_MEMBER_ROLE.USER ? 'User' :
        role === TEAM_MEMBER_ROLE.MANAGER ? 'Manager' :
        role;
      return <div className="py-2">{formattedRole}</div>;
    },
    meta: 'Role',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ getValue }) => {
      const status = getValue<string>() as TEAM_MEMBER_STATUS;
      const formattedStatus =
        status === TEAM_MEMBER_STATUS.ACTIVE ? 'ACTIVE' :
        status === TEAM_MEMBER_STATUS.PENDING ? 'PENDING' :
        status === TEAM_MEMBER_STATUS.INACTIVE ? 'INACTIVE' :
        status;
      return (
        <div className="py-2">
          <TableBadges names={[formattedStatus]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
  },
  {
    id: 'last_login',
    accessorFn: (row) => row.last_login,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Last Login" />;
    },
    cell: ({ row }) => {
      const lastLogin = row.original.last_login;
      const displayText = lastLogin ? getRelativeTime(lastLogin) : 'Never';
      return <div className="py-2 text-left">{displayText}</div>;
    },
    meta: 'Last Login',
    size: 150,
  },
];
