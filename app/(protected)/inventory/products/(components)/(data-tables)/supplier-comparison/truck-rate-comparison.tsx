'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { ColumnDef } from '@tanstack/react-table';

export const truckRateComparisonColumn: ColumnDef<QuarriesWithProduct>[] = [
  {
    id: 'quarry_name',
    accessorFn: (row) => row.quarry_name,
    header: ({}) => {
      return <div>Supplier</div>;
    },
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Quarry Name',
    size: 180,
  },
  {
    id: 'truck_tn_rate',
    accessorFn: (row) => row.price.truck_tn_rate,
    header: ({}) => {
      return <div>TN Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.price.available_truck_tn_rate === false) {
        return <div>N/A</div>;
      } else {
        const tnRate =
          (row.original.price.truck_tn_rate / 100)
            ?.toFixed(2)
            .toLocaleString() || '0';
        return <div>${tnRate}</div>;
      }
    },
    meta: 'truck tn rate',
    size: 120,
  },
  {
    id: 'truck_m3_rate',
    accessorFn: (row) => row.price.truck_m3_rate,
    header: ({}) => {
      return <div>m³ Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.price.available_truck_m3_rate === false) {
        return <div>N/A</div>;
      } else {
        const m3Rate =
          (row.original.price.truck_m3_rate / 100)
            ?.toFixed(2)
            .toLocaleString() || '0';
        return <div>${m3Rate}</div>;
      }
    },
    meta: 'truck m3 rate',
    size: 120,
  },
  {
    id: 'truck_hourly_rate',
    accessorFn: (row) => row.price.truck_hourly_rate,
    header: ({}) => {
      return <div>Hourly Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.price.available_truck_hourly_rate === false) {
        return <div>N/A</div>;
      } else {
        const hourlyRate =
          (row.original.price.truck_hourly_rate / 100)
            ?.toFixed(2)
            .toLocaleString() || '0';
        return <div>${hourlyRate}</div>;
      }
    },
    meta: 'truck hourly rate',
    size: 120,
  },
  {
    id: 'truck_load_rate',
    accessorFn: (row) => row.price.truck_load_rate,
    header: ({}) => {
      return <div className="text-left">Load Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.price.available_truck_load_rate === false) {
        return <div className="text-left">N/A</div>;
      } else {
        const loadRate =
          (row.original.price.truck_load_rate / 100)
            ?.toFixed(2)
            .toLocaleString() || '0';
        return <div className="text-left">${loadRate}</div>;
      }
    },
    meta: 'truck load rate',
    size: 100,
  },
];
