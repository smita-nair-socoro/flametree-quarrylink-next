'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { cn } from '@/lib/utils';
import { centsToDollars } from '@/lib/utils/currency';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  getCurrencySymbol,
} from '@/lib/utils/tenant-config-helper';
import { TrendingDown, TrendingUp, Star } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { MobilePricingComparisonCard } from '@/components/mobile/mobile-pricing-comparison-card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PricingType = 'tn' | 'm3' | 'kg' | 'bulka';

export interface PricingMeta {
  lowestCost: number | null;
  bestMargin: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPricingFields(row: QuarriesWithProduct, type: PricingType) {
  switch (type) {
    case 'tn':
      return {
        cost: row.perTnCostPrice,
        sell: row.perTnSellPrice,
        available: row.availableForSaleTn,
        unit: 'per TN',
      };
    case 'm3':
      return {
        cost: row.perM3CostPrice,
        sell: row.perM3SellPrice,
        available: row.availableForSaleM3,
        unit: 'per m³',
      };
    case 'kg':
      return {
        cost: row.per20kgCostPrice,
        sell: row.per20kgSellPrice,
        available: row.availableForSale20kg,
        unit: 'per 20kg',
      };
    case 'bulka':
      return {
        cost: row.perBulkaCostPrice,
        sell: row.perBulkaSellPrice,
        available: row.availableForSaleBulka,
        unit: 'per Bulka',
      };
  }
}

export function computePricingMeta(
  data: QuarriesWithProduct[],
  type: PricingType,
): PricingMeta {
  const costs = data
    .map((r) => getPricingFields(r, type).cost)
    .filter((c) => c > 0);
  const margins = data
    .map((r) => {
      const { cost, sell } = getPricingFields(r, type);
      return sell === 0 ? 0 : (sell - cost) / sell;
    })
    .filter((m) => m > 0);

  return {
    lowestCost: costs.length ? Math.min(...costs) : null,
    bestMargin: margins.length ? Math.max(...margins) : null,
  };
}

// ─── Column factory ───────────────────────────────────────────────────────────

export function createPricingColumns(
  type: PricingType,
  meta: PricingMeta,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxLabel: string = DEFAULT_TAX_LABEL,
): ColumnDef<QuarriesWithProduct>[] {
  const { lowestCost, bestMargin } = meta;

  return [
    {
      id: 'name',
      accessorFn: (row) => row.quarrySupplier?.name,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Supplier" />
      ),
      cell: ({ row }) => {
        const { cost, sell, unit } = getPricingFields(row.original, type);
        const margin = sell === 0 ? 0 : (sell - cost) / sell;
        const isBest =
          bestMargin !== null && margin === bestMargin && margin > 0;
        const name = row.original.quarrySupplier?.name ?? 'Unknown';
        return (
          <div className="flex items-center gap-2">
            {isBest ? (
              <div className="h-7 w-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
            ) : (
              <div className="w-7 shrink-0" />
            )}
            <div className="min-w-0">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <p className="font-medium text-[#101828] truncate block max-w-[160px]">{name}</p>
                </TooltipTrigger>
                <TooltipContent variant="white">
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-muted-foreground">{unit}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'cost_price',
      accessorFn: (row) => getPricingFields(row, type).cost,
      header: ({ column }) => (
        <TableClientSortableHeader
          column={column}
          title={
            <span className="flex items-center gap-1">
              Cost Price
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>Exclude {taxLabel}</TooltipContent>
              </Tooltip>
            </span>
          }
        />
      ),
      cell: ({ row }) => {
        const { cost } = getPricingFields(row.original, type);
        const isLowest = lowestCost !== null && cost === lowestCost && cost > 0;
        return (
          <div>
            <p className="font-medium text-[#101828]">
              {getCurrencySymbol(currencyCode)}
              {cost ? centsToDollars(cost) : '0.00'}
            </p>
            {isLowest && (
              <p className="text-xs text-green-600 font-medium">Lowest</p>
            )}
          </div>
        );
      },
    },
    {
      id: 'sell_price',
      accessorFn: (row) => getPricingFields(row, type).sell,
      header: ({ column }) => (
        <TableClientSortableHeader
          column={column}
          title={
            <span className="flex items-center gap-1">
              Sell Price
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>Exclude {taxLabel}</TooltipContent>
              </Tooltip>
            </span>
          }
        />
      ),
      cell: ({ row }) => {
        const { sell } = getPricingFields(row.original, type);
        return (
          <div>
            {getCurrencySymbol(currencyCode)}
            {sell ? centsToDollars(sell) : '0.00'}
          </div>
        );
      },
    },
    {
      id: 'margin',
      accessorFn: (row) => {
        const { cost, sell } = getPricingFields(row, type);
        return sell === 0 ? 0 : (sell - cost) / sell;
      },
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Profit Margin" />
      ),
      cell: ({ row }) => {
        const { cost, sell } = getPricingFields(row.original, type);
        const margin = sell === 0 ? 0 : (sell - cost) / sell;
        const isBest =
          bestMargin !== null && margin === bestMargin && margin > 0;
        return (
          <div>
            <div
              className={cn(
                'flex items-center gap-1',
                margin < 0
                  ? 'text-red-600'
                  : isBest
                    ? 'text-[#F59E0B]'
                    : margin > 0
                      ? 'text-green-600'
                      : 'text-gray-600',
              )}
            >
              {margin < 0 && <TrendingDown className="h-3.5 w-3.5 shrink-0" />}
              {margin > 0 && <TrendingUp className="h-3.5 w-3.5 shrink-0" />}
              <span className="font-medium">{(margin * 100).toFixed(2)}%</span>
            </div>
            {isBest && (
              <p className="text-xs text-amber-500 font-medium">Best margin</p>
            )}
          </div>
        );
      },
    },
    {
      id: 'availability',
      accessorFn: (row) => getPricingFields(row, type).available,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Availability" />
      ),
      cell: ({ row }) => {
        const { available } = getPricingFields(row.original, type);
        return (
          <div className="text-left w-[120px]">
            <TableBadges names={[available ? 'AVAILABLE' : 'UNAVAILABLE']} />
          </div>
        );
      },
    },
  ];
}

// ─── Mobile list ──────────────────────────────────────────────────────────────

export function MobilePricingList({
  data,
  pricingType,
  lowestCost,
  bestMargin,
  availableOnly = false,
  sortCost = 'asc',
  currencyCode = DEFAULT_CURRENCY_CODE,
}: {
  data: QuarriesWithProduct[];
  pricingType: PricingType;
  lowestCost: number | null;
  bestMargin: number | null;
  availableOnly?: boolean;
  sortCost?: 'asc' | 'desc';
  currencyCode?: string;
}) {
  const getCost = (r: QuarriesWithProduct) =>
    getPricingFields(r, pricingType).cost;
  const getSell = (r: QuarriesWithProduct) =>
    getPricingFields(r, pricingType).sell;
  const getAvailable = (r: QuarriesWithProduct) =>
    getPricingFields(r, pricingType).available;

  const filtered = availableOnly ? data.filter((r) => getAvailable(r)) : data;

  const sorted = [...filtered].sort((a, b) => {
    const aCost = getCost(a) || Infinity;
    const bCost = getCost(b) || Infinity;
    return sortCost === 'desc' ? bCost - aCost : aCost - bCost;
  });

  return (
    <div className="flex flex-col gap-5 mt-4">
      {sorted.map((supplier) => {
        const cost = getCost(supplier);
        const sell = getSell(supplier);
        const margin = sell === 0 ? 0 : (sell - cost) / sell;
        const isLowestCost =
          lowestCost !== null && cost === lowestCost && cost > 0;
        const isBestMargin =
          bestMargin !== null && margin === bestMargin && margin > 0;
        return (
          <MobilePricingComparisonCard
            key={supplier.quarrySupplierId}
            supplier={supplier}
            pricingType={pricingType}
            isLowestCost={isLowestCost}
            isBestMargin={isBestMargin}
            currencyCode={currencyCode}
          />
        );
      })}
    </div>
  );
}
