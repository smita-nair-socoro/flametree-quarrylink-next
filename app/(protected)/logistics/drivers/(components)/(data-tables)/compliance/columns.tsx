'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ComplianceTableActions } from './compliance-table-actions';
import { TableBadges } from '@/components/table-badges';
import { DateCell } from '@/components/date-cell';

export type ComplianceRecord = {
  id: number;
  checklistId: string;
  date: string;
  status: string;
  notes?: string;
};

export const complianceColumns: ColumnDef<ComplianceRecord>[] = [
  {
    id: 'checklistId',
    accessorFn: (row) => row.checklistId,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Checklist ID" />
    ),
    cell: ({ row }) => (
      <span className="font-medium py-2 block">{row.original.checklistId}</span>
    ),
  },
  {
    id: 'date',
    accessorFn: (row) => row.date,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Date" />
    ),
    cell: ({ getValue }) => (
      <DateCell dateString={getValue<string>()} side="top" />
    ),
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return <TableBadges names={[status]} visibleCount={1} />;
    },
  },
  {
    id: 'notes',
    accessorFn: (row) => row.notes,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground py-2 block">
        {row.original.notes || '—'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => null,
    cell: ({ row }) => <ComplianceTableActions record={row.original} />,
  },
];
