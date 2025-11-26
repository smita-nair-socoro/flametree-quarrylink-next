'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { centsToDollars } from '@/lib/utils/currency';
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
    accessorFn: (row) => row.tn_truck_rate,
    header: ({}) => {
      return <div>TN Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.available_for_truck_rate_tn === false) {
        return <div>N/A</div>;
      } else {
        const tnRate = row.original.tn_truck_rate
          ? centsToDollars(row.original.tn_truck_rate)
          : '0';
        return <div>${tnRate}</div>;
      }
    },
    meta: 'truck tn rate',
    size: 120,
  },
  {
    id: 'truck_m3_rate',
    accessorFn: (row) => row.m3_truck_rate,
    header: ({}) => {
      return <div>m³ Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.available_for_truck_rate_m3 === false) {
        return <div>N/A</div>;
      } else {
        const m3Rate = row.original.m3_truck_rate
          ? centsToDollars(row.original.m3_truck_rate)
          : '0';
        return <div>${m3Rate}</div>;
      }
    },
    meta: 'truck m3 rate',
    size: 120,
  },
  {
    id: 'truck_hourly_rate',
    accessorFn: (row) => row.hourly_truck_rate,
    header: ({}) => {
      return <div>Hourly Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.available_for_truck_rate_hour === false) {
        return <div>N/A</div>;
      } else {
        const hourlyRate = row.original.hourly_truck_rate
          ? centsToDollars(row.original.hourly_truck_rate)
          : '0';
        return <div>${hourlyRate}</div>;
      }
    },
    meta: 'truck hourly rate',
    size: 160,
  },
  {
    id: 'truck_load_rate',
    accessorFn: (row) => row.load_truck_rate,
    header: ({}) => {
      return <div className="text-left">Load Rate</div>;
    },
    cell: ({ row }) => {
      if (row.original.available_for_truck_rate_load === false) {
        return <div className="text-left">N/A</div>;
      } else {
        const loadRate = row.original.load_truck_rate
          ? centsToDollars(row.original.load_truck_rate)
          : '0';
        return <div className="text-left">${loadRate}</div>;
      }
    },
    meta: 'truck load rate',
    size: 100,
  },
];
