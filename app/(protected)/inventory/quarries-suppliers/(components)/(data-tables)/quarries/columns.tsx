'use client';

import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { Quarry } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';
import { QuarrySupplierTableActions } from './quarry-supplier-table-actions';
import { formatPhoneNumber } from '@/lib/utils/phone-helper';

export const quarriesSuppliersColumns: ColumnDef<Quarry>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: ({ column }) => {
      return (
        <TableClientSortableHeader
          column={column}
          title="Supplier / Quarry Name"
        />
      );
    },
    cell: (info) => <div className="py-2">{info.getValue() as string}</div>,
    meta: 'Supplier / Quarry Name',
  },
  {
    id: 'quarrySupplierType',
    accessorFn: (row) => row.quarrySupplierType,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Type" />;
    },
    cell: ({ row }) => {
      const type = row.original.quarrySupplierType;
      return (
        <div className="py-2">
          <TableBadges names={[type]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Type',
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
    id: 'phone',
    accessorFn: (row) => row.phone,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Phone" />;
    },
    cell: (info) => (
      <div className="py-2">{formatPhoneNumber(info.getValue() as string)}</div>
    ),
    meta: 'Phone',
  },
  {
    id: 'suburb',
    accessorFn: (row) => row.suburb?.toUpperCase() || '',
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Suburbs" />;
    },
    cell: ({ row }) => {
      const suburb = row.original.address.suburb?.toUpperCase() || '';
      return (
        <div className="py-2">
          <TableBadges names={[suburb]} visibleCount={1} variant="suburb" />
        </div>
      );
    },
    meta: 'Suburb',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="py-2">
          <TableBadges names={[status]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Status',
  },
  {
    id: 'actions',
    header: () => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const quarrySupplier = row.original;
      return <QuarrySupplierTableActions quarrySupplier={quarrySupplier} />;
    },
  },
];
