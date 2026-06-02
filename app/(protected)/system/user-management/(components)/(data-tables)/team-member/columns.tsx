'use client';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { TeamMemberTableActions } from './team-member-table-actions';
import { User } from '@/lib/types/user';
import { FormSelectOption } from '@/components/ui/form-select';
import { getRoleLabel } from '@/lib/utils/user-helper';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    cell: (info) => {
      const value = info.getValue() as string;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="py-2 truncate block w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px]">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Full Name',
    size: 180,
  },
  {
    id: 'email',
    accessorFn: (row) => row.email,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Email" />;
    },
    cell: (info) => {
      const value = info.getValue() as string;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="py-2 truncate block w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px]">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Email',
    size: 300,
  },
  {
    id: 'role',
    accessorFn: (row) => getRoleLabel(row.groups),
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Role" />;
    },
    cell: ({ row }) => {
      const formattedRole = getRoleLabel(row.original.groups);
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="py-2 text-left truncate block w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px]">
              {formattedRole}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{formattedRole}</p>
          </TooltipContent>
        </Tooltip>
      );
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
    header: () => <div></div>,
    cell: ({ row }) => (
      <TeamMemberTableActions
        teamMember={row.original}
        roles={rolesOptions}
        currentUserId={currentUserId}
      />
    ),
  },
];

// Default export for backwards compatibility
export const teamMemberColumns = createTeamMemberColumns([], undefined);
