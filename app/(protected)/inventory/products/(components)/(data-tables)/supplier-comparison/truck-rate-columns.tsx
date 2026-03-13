'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { centsToDollars } from '@/lib/utils/currency';
import { Star } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { MobileTruckRateComparisonCard } from '@/components/mobile/mobile-truck-rate-comparison-card';

// ─── Column factory ───────────────────────────────────────────────────────────

function rateCell(val: number, available: boolean) {
  if (!available) return <span className="text-gray-400">N/A</span>;
  return <span>${val ? centsToDollars(val) : '0.00'}</span>;
}

export function createTruckRateColumns(
  lowestTn: number | null,
): ColumnDef<QuarriesWithProduct>[] {
  return [
    {
      id: 'name',
      accessorFn: (row) => row.quarrySupplier?.name,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Supplier" />
      ),
      cell: ({ row }) => {
        const tn = row.original.tnTruckRate;
        const isLowest = lowestTn !== null && tn === lowestTn && tn > 0;
        const name = row.original.quarrySupplier?.name ?? 'Unknown';
        return (
          <div className="flex items-center gap-2">
            {isLowest ? (
              <div className="h-7 w-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
            ) : (
              <div className="w-7 shrink-0" />
            )}
            <p className="font-medium text-[#101828]">{name}</p>
          </div>
        );
      },
    },
    {
      id: 'truck_tn_rate',
      accessorFn: (row) => row.tnTruckRate,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="TN Rate" />
      ),
      cell: ({ row }) => {
        const tn = row.original.tnTruckRate;
        const isLowest = lowestTn !== null && tn === lowestTn && tn > 0;
        if (!row.original.availableForTruckRateTn)
          return <span className="text-gray-400">N/A</span>;
        return (
          <div>
            <p className="font-medium text-[#101828]">
              ${tn ? centsToDollars(tn) : '0.00'}
            </p>
            {isLowest && (
              <p className="text-xs text-green-600 font-medium">Lowest</p>
            )}
          </div>
        );
      },
    },
    {
      id: 'truck_m3_rate',
      accessorFn: (row) => row.m3TruckRate,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="m³ Rate" />
      ),
      cell: ({ row }) =>
        rateCell(row.original.m3TruckRate, row.original.availableForTruckRateM3),
    },
    {
      id: 'truck_kg_rate',
      accessorFn: (row) => row.kg20TruckRate,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="kg Rate (ex-GST)" />
      ),
      cell: ({ row }) =>
        rateCell(row.original.kg20TruckRate, row.original.availableForTruckRate20kg),
    },
    {
      id: 'truck_bulka_rate',
      accessorFn: (row) => row.bulkaTruckRate,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Bulka Rate" />
      ),
      cell: ({ row }) =>
        rateCell(row.original.bulkaTruckRate, row.original.availableForTruckRateBulka),
    },
    {
      id: 'truck_hourly_rate',
      accessorFn: (row) => row.hourlyTruckRate,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Hourly Rate" />
      ),
      cell: ({ row }) =>
        rateCell(row.original.hourlyTruckRate, row.original.availableForTruckRateHour),
    },
    {
      id: 'truck_load_rate',
      accessorFn: (row) => row.loadTruckRate,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Load Rate" />
      ),
      cell: ({ row }) =>
        rateCell(row.original.loadTruckRate, row.original.availableForTruckRateLoad),
    },
    {
      id: 'truck_distance_rate',
      accessorFn: (row) => row.kmTruckRate,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Dist. Rate" />
      ),
      cell: ({ row }) =>
        rateCell(row.original.kmTruckRate, row.original.availableForTruckRateKm),
    },
  ];
}

// ─── Mobile list ──────────────────────────────────────────────────────────────

export function MobileTruckRateList({
  data,
  lowestTn,
}: {
  data: QuarriesWithProduct[];
  lowestTn: number | null;
}) {
  const sorted = [...data].sort((a, b) => {
    const aRate = a.tnTruckRate || Infinity;
    const bRate = b.tnTruckRate || Infinity;
    return aRate - bRate;
  });

  return (
    <div className="flex flex-col gap-3 mt-4">
      {sorted.map((supplier) => (
        <MobileTruckRateComparisonCard
          key={supplier.quarrySupplierId}
          supplier={supplier}
          isLowestTnRate={
            lowestTn !== null &&
            supplier.tnTruckRate === lowestTn &&
            supplier.tnTruckRate > 0
          }
        />
      ))}
    </div>
  );
}
