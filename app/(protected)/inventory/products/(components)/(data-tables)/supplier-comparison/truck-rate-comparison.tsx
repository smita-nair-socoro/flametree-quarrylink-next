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
    cell: (info) => <div>{info.getValue() as string}</div>,
    meta: 'Name',
    size: 180,
  },
  {
    id: 'truck_tn_rate',
    accessorFn: (row) => row.tnTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
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
      if (row.original.availableForTruckRateTn === false) {
        return <div>N/A</div>;
      } else {
        const tnRate = row.original.tnTruckRate
          ? centsToDollars(row.original.tnTruckRate)
          : '0';
        return <div>${tnRate}</div>;
      }
    },
    meta: 'truck tn rate',
    size: 130,
  },
  {
    id: 'truck_m3_rate',
    accessorFn: (row) => row.m3TruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
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
      if (row.original.availableForTruckRateM3 === false) {
        return <div>N/A</div>;
      } else {
        const m3Rate = row.original.m3TruckRate
          ? centsToDollars(row.original.m3TruckRate)
          : '0';
        return <div>${m3Rate}</div>;
      }
    },
    meta: 'truck m3 rate',
    size: 130,
  },
  {
    id: 'truck_hourly_rate',
    accessorFn: (row) => row.hourlyTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
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
      if (row.original.availableForTruckRateHour === false) {
        return <div>N/A</div>;
      } else {
        const hourlyRate = row.original.hourlyTruckRate
          ? centsToDollars(row.original.hourlyTruckRate)
          : '0';
        return <div>${hourlyRate}</div>;
      }
    },
    meta: 'truck hourly rate',
    size: 130,
  },
  {
    id: 'truck_load_rate',
    accessorFn: (row) => row.loadTruckRate,
    header: ({}) => {
      return (
        <div className="flex items-center gap-1">
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
      if (row.original.availableForTruckRateLoad === false) {
        return <div className="text-left">N/A</div>;
      } else {
        const loadRate = row.original.loadTruckRate
          ? centsToDollars(row.original.loadTruckRate)
          : '0';
        return <div className="text-left">${loadRate}</div>;
      }
    },
    meta: 'truck load rate',
    size: 100,
  },
];
