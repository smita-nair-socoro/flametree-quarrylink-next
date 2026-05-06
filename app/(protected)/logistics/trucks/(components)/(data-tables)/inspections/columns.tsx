'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { InspectionTableActions } from './inspection-table-actions';
import { TableBadges } from '@/components/table-badges';
import { ChecklistItem } from '@/lib/types/checklist';
import { DateCell } from '@/components/date-cell';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

export const inspectionColumns: ColumnDef<ChecklistItem>[] = [
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
    cell: ({ row }) => {
      const value = row.original.summaryNotes || '—';
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground py-2 truncate block w-[160px] lg:w-[220px] xl:w-[280px] cursor-default">
              {value}
            </span>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p className="max-w-[320px] whitespace-normal">{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: 'actions',
    header: () => null,
    cell: ({ row }) => <InspectionTableActions record={row.original} />,
  },
];
