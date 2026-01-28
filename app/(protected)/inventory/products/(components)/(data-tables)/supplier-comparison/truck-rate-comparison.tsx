'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { centsToDollars } from '@/lib/utils/currency';
import { ColumnDef } from '@tanstack/react-table';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const truckRateComparisonColumn: ColumnDef<QuarriesWithProduct>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.quarrySupplier?.name,
    header: ({}) => {
      return <div>Supplier</div>;
    },
    cell: (info) => {
      const value = info.getValue() as string;
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="truncate block w-[60px] sm:w-[80px] md:w-[90px] lg:w-[100px] xl:w-[120px]">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent variant="white">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: 'Name',
  },
  {
    id: 'truck_tn_rate',
    accessorFn: (row) => row.tnTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1 w-[80px]">
          TN Rate
          <Tooltip>
            {' '}
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const tnRate = row.original.tnTruckRate
        ? centsToDollars(row.original.tnTruckRate)
        : '0.00';
      return <div>${tnRate}</div>;
    },
    meta: 'truck tn rate',
  },
  {
    id: 'truck_m3_rate',
    accessorFn: (row) => row.m3TruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1 w-[80px]">
          m³ Rate{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const m3Rate = row.original.m3TruckRate
        ? centsToDollars(row.original.m3TruckRate)
        : '0.00';
      return <div>${m3Rate}</div>;
    },
    meta: 'truck m3 rate',
  },

  {
    id: 'truck_kg_rate',
    accessorFn: (row) => row.kg20TruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1 w-[75px]">
          kg Rate{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const kgRate = row.original.kg20TruckRate
        ? centsToDollars(row.original.kg20TruckRate)
        : '0.00';
      return <div>${kgRate}</div>;
    },
    meta: 'truck kg rate',
  },
  {
    id: 'truck_bulka_rate',
    accessorFn: (row) => row.bulkaTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1 w-[90px]">
          Bulka Rate{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const bulkaRate = row.original.bulkaTruckRate
        ? centsToDollars(row.original.bulkaTruckRate)
        : '0.00';
      return <div>${bulkaRate}</div>;
    },
    meta: 'truck bulka rate',
  },
  {
    id: 'truck_hourly_rate',
    accessorFn: (row) => row.hourlyTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1 w-[98px]">
          Hourly Rate{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const hourlyRate = row.original.hourlyTruckRate
        ? centsToDollars(row.original.hourlyTruckRate)
        : '0.00';
      return <div>${hourlyRate}</div>;
    },
    meta: 'truck hourly rate',
  },
  {
    id: 'truck_load_rate',
    accessorFn: (row) => row.loadTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1 w-[120px]">
          Load Rate{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const loadRate = row.original.loadTruckRate
        ? centsToDollars(row.original.loadTruckRate)
        : '0.00';
      return <div className="">${loadRate}</div>;
    },
    meta: 'truck load rate',
  },
  {
    id: 'truck_distance_rate',
    accessorFn: (row) => row.kmTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1 -ml-10 w-[110px]">
          Distance Rate{' '}
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>(ex-GST)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => {
      const distanceRate = row.original.kmTruckRate
        ? centsToDollars(row.original.kmTruckRate)
        : '0.00';
      return <div className="-ml-10">${distanceRate}</div>;
    },
    meta: 'truck distance rate',
  },
];
