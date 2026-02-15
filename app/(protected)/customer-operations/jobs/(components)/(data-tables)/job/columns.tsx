'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { Job, JOB_STATUS } from '@/lib/types/job';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { JobTableActions } from './job-table-actions';
import { DateCell } from '@/components/date-cell';

export const jobColumns: ColumnDef<Job>[] = [
  {
    id: 'jobNumber',
    accessorFn: (row) => row.jobNumber,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Job Number" />;
    },
    cell: (info) => {
      const value = (info.getValue() as string) || 'N/A';
      return <div className="py-2">{value}</div>;
    },
    meta: 'Job Number',
  },
  {
    id: 'customerName',
    accessorFn: (row) => row.customerName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Customer" />;
    },
    cell: ({ row }) => {
      const customerName = row.original.customerName;
      return <div className="py-2">{customerName}</div>;
    },
    meta: 'Customer Name',
  },
  {
    id: 'projectName',
    accessorFn: (row) => row.projectName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Project Name" />;
    },
    cell: ({ row }) => {
      const projectName = row.original.projectName;
      return <div className="py-2">{projectName}</div>;
    },
    meta: 'Project Name',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ getValue }) => {
      const names = getValue<string>() as JOB_STATUS;
      return (
        <div className="py-2">
          <TableBadges names={names} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
  },
  {
    id: 'uninvoicedDockets',
    accessorFn: (row) => row.uninvoicedDockets,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader column={column} title="Uninvoiced Dockets" />
      );
    },
    cell: ({ row }) => {
      const cents = parseFloat(row.original.uninvoicedDockets.toString());
      const dollars = cents / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(dollars);
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="py-2 font-medium w-36 max-w-36 truncate">
              {formatted}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{formatted}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Uninvoiced Dockets',
  },
  {
    id: 'accountManagerName',
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
    id: 'createdAt',
    accessorFn: (row) => row.createdAt,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Created At" />;
    },
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
    meta: 'Created At',
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const job = row.original;
      return <JobTableActions job={job} />;
    },
  },
];
