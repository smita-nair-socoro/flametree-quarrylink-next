'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { TruckDTO } from '@/lib/types/truck';
import { TRUCK_TYPE, normalizeTruckStatus } from '@/lib/types/truck-enums';
import { TruckTableActions } from './truck-table-actions';

export const truckColumns: ColumnDef<TruckDTO>[] = [
  {
    id: 'licensePlate',
    accessorFn: (row) => row.licensePlate,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Registration" />;
    },
    cell: ({ row }) => {
      if (row.original.model === 'GENERIC')
        return <div className="py-2">--</div>;
      const value = row.original.licensePlate;
      return <div className="py-2 font-medium">{value || '-'}</div>;
    },
    meta: 'Registration',
  },
  {
    id: 'model',
    accessorFn: (row) => row.model,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Make & Model" />;
    },
    cell: ({ row }) => {
      if (row.original.model === 'GENERIC')
        return <div className="py-2">--</div>;
      const value = row.original.model;
      return <div className="py-2">{value || '-'}</div>;
    },
    meta: 'Make & Model',
  },
  {
    id: 'truckType',
    accessorFn: (row) => row.truckType,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Type" />;
    },
    cell: ({ row }) => {
      const isGeneric = row.original.model === 'GENERIC';
      const type = isGeneric
        ? 'GENERIC'
        : (row.original.truckType as TRUCK_TYPE);
      return (
        <div className="py-2">
          <TableBadges names={[type]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Type',
  },
  {
    id: 'haulierName',
    accessorFn: (row) => row.haulier?.haulierName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Haulier" />;
    },
    cell: ({ getValue }) => {
      const name = getValue<string | undefined>();
      if (!name) return <div className="py-2">-</div>;
      return (
        <div className="py-2">
          <TableBadges names={[name]} visibleCount={1} variant="haulier" />
        </div>
      );
    },
    meta: 'Haulier',
  },
  {
    id: 'tankVolumeM3',
    accessorFn: (row) => row.tankVolumeM3,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Volume" />;
    },
    cell: ({ row }) => {
      if (row.original.model === 'GENERIC')
        return <div className="py-2">--</div>;
      const value = row.original.tankVolumeM3;
      if (value == null) return <div className="py-2">-</div>;
      return (
        <div className="py-2">
          {value} m<sup>3</sup>
        </div>
      );
    },
    meta: 'Volume',
  },
  {
    id: 'combinationGvm',
    accessorFn: (row) => row.combinationGvm,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="GVM" />;
    },
    cell: ({ row }) => {
      if (row.original.model === 'GENERIC')
        return <div className="py-2">--</div>;
      const value = row.original.combinationGvm;
      if (value == null) return <div className="py-2">-</div>;
      return <div className="py-2">{value} TN</div>;
    },
    meta: 'GVM',
  },
  {
    id: 'truckStatus',
    accessorFn: (row) => row.truckStatus,
    header: () => {
      return <div>Status</div>;
    },
    cell: ({ getValue }) => {
      const raw = getValue<string>();
      const status = normalizeTruckStatus(raw);
      return (
        <div className="py-2">
          <TableBadges names={status ? [status] : [raw]} visibleCount={1} />
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
      const truck = row.original;
      return <TruckTableActions truck={truck} />;
    },
  },
];
