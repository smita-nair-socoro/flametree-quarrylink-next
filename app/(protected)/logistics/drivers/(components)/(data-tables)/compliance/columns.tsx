'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BADGE_COLORS } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';

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
    header: ({ column }) => <TableClientSortableHeader column={column} title="Checklist ID" />,
    cell: ({ row }) => (
      <span className="font-medium py-2 block">{row.original.checklistId}</span>
    ),
  },
  {
    id: 'date',
    accessorFn: (row) => row.date,
    header: ({ column }) => <TableClientSortableHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground py-2 block">{row.original.date}</span>
    ),
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => <TableClientSortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant="outline" className={BADGE_COLORS[status]}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'notes',
    accessorFn: (row) => row.notes,
    header: ({ column }) => <TableClientSortableHeader column={column} title="Notes" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground py-2 block">{row.original.notes || '—'}</span>
    ),
  },
  {
    id: 'actions',
    header: () => null,
    cell: () => (
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
];
