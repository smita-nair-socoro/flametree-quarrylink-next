'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { InspectionTableActions } from './inspection-table-actions';
import { TableBadges } from '@/components/table-badges';
import { InspectionRecord } from '@/lib/types/truck-inspection';

export const inspectionColumns: ColumnDef<InspectionRecord>[] = [
  {
    id: 'checklistId',
    accessorFn: (row) => row.checklistId,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Inspection ID" />
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
      <span className="font-medium py-2 block">{getValue<string>()}</span>
    ),
  },
  {
    id: 'driver',
    accessorFn: (row) => row.driver,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Driver" />
    ),
    cell: ({ row }) => (
      <span className="font-medium py-2 block">
        {row.original.driver?.driverName}
      </span>
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
    cell: ({ row }) => <InspectionTableActions record={row.original} />,
  },
];
