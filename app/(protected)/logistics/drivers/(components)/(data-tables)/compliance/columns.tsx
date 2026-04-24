'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ComplianceTableActions } from './compliance-table-actions';
import { TableBadges } from '@/components/table-badges';
import { DriverPreStartChecklist } from '@/lib/types/driver-compliance';

export const complianceColumns: ColumnDef<DriverPreStartChecklist>[] = [
  {
    id: 'submissionNumber',
    accessorFn: (row) => row.submissionNumber,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Checklist ID" />
    ),
    cell: ({ row }) => (
      <span className="font-medium py-2 block">{row.original.submissionNumber}</span>
    ),
  },
  {
    id: 'submittedAt',
    accessorFn: (row) => row.submittedAt,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Date" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium py-2 block">
        {new Date(getValue<string>()).toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <TableBadges names={[row.original.status]} visibleCount={1} />,
  },
  {
    id: 'summaryNotes',
    accessorFn: (row) => row.summaryNotes,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground py-2 block">
        {row.original.summaryNotes || '—'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => null,
    cell: ({ row }) => <ComplianceTableActions record={row.original} />,
  },
];
