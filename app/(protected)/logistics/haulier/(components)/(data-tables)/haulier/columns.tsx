'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { HaulierDTO } from '@/lib/types/haulier';
import { HaulierTableActions } from './haulier-table-actions';
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { isInternalHaulier } from '@/lib/utils/haulier-helper';

export const haulierColumns = (tenantEmail: string | null | undefined): ColumnDef<HaulierDTO>[] => [
  {
    id: 'haulierName',
    accessorFn: (row) => row.haulierName,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Haulier Name" />
    ),
    cell: ({ row }) => (
      <div className="py-2 font-medium">{row.original.haulierName}</div>
    ),
    meta: 'Name',
  },
  {
    id: 'emailAddress',
    accessorFn: (row) => row.emailAddress,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Email Address" />
    ),
    cell: ({ row }) => (
      <div className="py-2">{row.original.emailAddress}</div>
    ),
    meta: 'Email',
  },
  {
    id: 'phoneNumber',
    accessorFn: (row) => row.phoneNumber,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => (
      <div className="py-2">
        {formatPhoneNumber(normalizePhoneNumber(row.original.phoneNumber))}
      </div>
    ),
    meta: 'Phone',
  },
  {
    id: 'haulierType',
    accessorFn: (row) =>
      isInternalHaulier(row.emailAddress, tenantEmail) ? 'INTERNAL' : 'SUBCONTRACTOR',
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Type" />
    ),
    cell: ({ getValue }) => {
      const type = getValue<string>();
      return (
        <div className="py-2">
          <TableBadges names={[type]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Type',
  },
  {
    id: 'actions',
    header: () => <div />,
    cell: ({ row }) => <HaulierTableActions haulier={row.original} />,
  },
];
