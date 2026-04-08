'use client';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { ColumnDef } from '@tanstack/react-table';
import { DriverDTO } from '@/lib/types/driver';
import { DRIVER_TYPE, DRIVER_STATUS } from '@/lib/types/driver-enums';
import { DriverTableActions } from './driver-table-actions';

export const driverColumns: ColumnDef<DriverDTO>[] = [
  {
    id: 'driverName',
    accessorFn: (row) => row.driverName,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Driver Name" />;
    },
    cell: ({ row }) => {
      return <div className="py-2">{row.original.driverName}</div>;
    },
    meta: 'Name',
  },
  {
    id: 'driverType',
    accessorFn: (row) => row.driverType,
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
    id: 'emailAddress',
    accessorFn: (row) => row.emailAddress,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Email" />;
    },
    cell: ({ row }) => {
      return <div className="py-2">{row.original.emailAddress}</div>;
    },
    meta: 'Email',
  },
  {
    id: 'phoneNumber',
    accessorFn: (row) => row.phoneNumber,
    header: ({ column }) => {
      return <TableClientSortableHeader column={column} title="Phone" />;
    },
    cell: ({ row }) => {
      return <div className="py-2">{row.original.phoneNumber}</div>;
    },
    meta: 'Phone',
  },
  {
    id: 'driverStatus',
    accessorFn: (row) => row.driverStatus,
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
