'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { InspectionTableActions } from './inspection-table-actions';
import { TableBadges } from '@/components/table-badges';
import { TruckInspection } from '@/lib/types/truck-inspection';
import { DateCell } from '@/components/date-cell';

export const inspectionColumns: ColumnDef<TruckInspection>[] = [
  {
    id: 'submissionNumber',
    accessorFn: (row) => row.submissionNumber,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Inspection ID" />
    ),
    cell: ({ row }) => (
      <span className="font-medium py-2 block">
        {row.original.submissionNumber}
      </span>
    ),
  },
  {
    id: 'submittedAt',
    accessorFn: (row) => row.submittedAt,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Date" />
    ),
    cell: ({ getValue }) => {
      return <DateCell dateString={getValue<string>()} side="top" />;
    },
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <TableBadges names={[row.original.status]} visibleCount={1} />
    ),
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
    cell: ({ row }) => <InspectionTableActions record={row.original} />,
  },
];
