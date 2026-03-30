'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { Driver } from '@/lib/types/driver';
import { DRIVER_TYPE, DRIVER_STATUS } from '@/lib/types/driver-enums';
import { DriverTableActions } from './driver-table-actions';

export const driverColumns: ColumnDef<Driver>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Driver Name" />;
    },
    cell: ({ row }) => {
      const name = row.original.name;
      return <div className="py-2">{name}</div>;
    },
    meta: 'Name',
  },
  {
    id: 'type',
    accessorFn: (row) => row.type,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Type" />;
    },
    cell: ({ getValue }) => {
      const type = getValue<string>() as DRIVER_TYPE;
      return (
        <div className="py-2">
          <TableBadges names={[type]} visibleCount={1} />
        </div>
      );
    },
    meta: 'Type',
  },

  {
    id: 'haulier',
    accessorFn: (row) => row.haulierName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Haulier" />;
    },
    cell: ({ getValue }) => {
      const haulier = getValue<string>() as string;
      return (
        <div className="py-2">
          <TableBadges names={[haulier]} visibleCount={1} variant="haulier" />
        </div>
      );
    },
    meta: 'Haulier',
  },
  {
    id: 'email',
    accessorFn: (row) => row.email,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Email" />;
    },
    cell: ({ row }) => {
      const email = row.original.email;
      return <div className="py-2">{email}</div>;
    },
    meta: 'Email',
  },
  {
    id: 'phone',
    accessorFn: (row) => row.phone,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Phone" />;
    },
    cell: ({ row }) => {
      const phone = row.original.phone;
      return <div className="py-2">{phone}</div>;
    },
    meta: 'Phone',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Status" />;
    },
    cell: ({ getValue }) => {
      const status = getValue<string>() as DRIVER_STATUS;
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
      const driver = row.original;
      return <DriverTableActions driver={driver} />;
    },
  },
];
