'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { cn } from '@/lib/utils';
import { centsToDollars } from '@/lib/utils/currency';
import {
  DEFAULT_CURRENCY_CODE,
  getCurrencySymbol,
} from '@/lib/utils/tenant-config-helper';
import { Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

export interface MobileTruckRateComparisonCardProps {
  supplier: QuarriesWithProduct;
  isLowestTnRate: boolean;
  currencyCode?: string;
}

export function MobileTruckRateComparisonCard({
  supplier,
  isLowestTnRate,
  currencyCode = DEFAULT_CURRENCY_CODE,
}: MobileTruckRateComparisonCardProps) {
  const name = supplier.quarrySupplier?.name || 'Unknown';
  const currencySymbol = getCurrencySymbol(currencyCode);

  const tnRate = supplier.availableForTruckRateTn
    ? `${currencySymbol}${supplier.tnTruckRate ? centsToDollars(supplier.tnTruckRate) : '0.00'}`
    : 'N/A';
  const m3Rate = supplier.availableForTruckRateM3
    ? `${currencySymbol}${supplier.m3TruckRate ? centsToDollars(supplier.m3TruckRate) : '0.00'}`
    : 'N/A';
  const kgRate = supplier.availableForTruckRate20kg
    ? `${currencySymbol}${supplier.kg20TruckRate ? centsToDollars(supplier.kg20TruckRate) : '0.00'}`
    : 'N/A';
  const bulkaRate = supplier.availableForTruckRateBulka
    ? `${currencySymbol}${supplier.bulkaTruckRate ? centsToDollars(supplier.bulkaTruckRate) : '0.00'}`
    : 'N/A';
  const hourlyRate = supplier.availableForTruckRateHour
    ? `${currencySymbol}${supplier.hourlyTruckRate ? centsToDollars(supplier.hourlyTruckRate) : '0.00'}`
    : 'N/A';
  const loadRate = supplier.availableForTruckRateLoad
    ? `${currencySymbol}${supplier.loadTruckRate ? centsToDollars(supplier.loadTruckRate) : '0.00'}`
    : 'N/A';
  const distanceRate = supplier.availableForTruckRateKm
    ? `${currencySymbol}${supplier.kmTruckRate ? centsToDollars(supplier.kmTruckRate) : '0.00'}`
    : 'N/A';

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden',
        isLowestTnRate
          ? 'border-2 border-green-500 shadow-[0_0_3px_rgba(34,197,94,0.3)]'
          : 'border-gray-200',
      )}
    >
      {/* Header — green bg only when lowest TN rate */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          isLowestTnRate ? 'bg-green-50' : 'bg-[#FAFAFA]',
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isLowestTnRate && (
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-bold text-[#101828] text-base truncate">
                {name}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">{name}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {isLowestTnRate && (
          <span className="text-sm font-medium text-green-600 shrink-0 ml-2">
            Lowest TN rate
          </span>
        )}
      </div>

      <Separator className="bg-gray-200" />

      {/* Rate grid — always white */}
      <div className="divide-y divide-gray-200 bg-white px-4">
        {/* Row 1: TN Rate | m³ Rate */}
        <div className="grid grid-cols-2 divide-x divide-gray-200 py-2.5">
          <div className="flex items-center justify-between pr-4">
            <span className="text-sm text-gray-500">TN Rate</span>
            <span
              className={cn(
                'text-sm',
                tnRate === 'N/A'
                  ? 'text-gray-400'
                  : isLowestTnRate
                    ? 'font-bold text-[#101828]'
                    : 'font-medium text-[#101828]',
              )}
            >
              {tnRate}
            </span>
          </div>
          <div className="flex items-center justify-between pl-4">
            <span className="text-sm text-gray-500">m³ Rate</span>
            <span
              className={cn(
                'text-sm',
                m3Rate === 'N/A'
                  ? 'text-gray-400'
                  : 'font-medium text-[#101828]',
              )}
            >
              {m3Rate}
            </span>
          </div>
        </div>

        {/* Row 2: kg Rate | Bulka Rate */}
        <div className="grid grid-cols-2 divide-x divide-gray-200 py-2.5">
          <div className="flex items-center justify-between pr-4">
            <span className="text-sm text-gray-500">kg Rate</span>
            <span
              className={cn(
                'text-sm',
                kgRate === 'N/A'
                  ? 'text-gray-400'
                  : 'font-medium text-[#101828]',
              )}
            >
              {kgRate}
            </span>
          </div>
          <div className="flex items-center justify-between pl-4">
            <span className="text-sm text-gray-500">Bulka Rate</span>
            <span
              className={cn(
                'text-sm',
                bulkaRate === 'N/A'
                  ? 'text-gray-400'
                  : 'font-medium text-[#101828]',
              )}
            >
              {bulkaRate}
            </span>
          </div>
        </div>

        {/* Row 3: Hourly Rate | Load Rate */}
        <div className="grid grid-cols-2 divide-x divide-gray-200 py-2.5">
          <div className="flex items-center justify-between pr-4">
            <span className="text-sm text-gray-500">Hourly Rate</span>
            <span
              className={cn(
                'text-sm',
                hourlyRate === 'N/A'
                  ? 'text-gray-400'
                  : 'font-medium text-[#101828]',
              )}
            >
              {hourlyRate}
            </span>
          </div>
          <div className="flex items-center justify-between pl-4">
            <span className="text-sm text-gray-500">Load Rate</span>
            <span
              className={cn(
                'text-sm',
                loadRate === 'N/A'
                  ? 'text-gray-400'
                  : 'font-medium text-[#101828]',
              )}
            >
              {loadRate}
            </span>
          </div>
        </div>

        {/* Row 4: Distance Rate | empty */}
        <div className="grid grid-cols-2 divide-x divide-gray-200 py-2.5">
          <div className="flex items-center justify-between pr-4">
            <span className="text-sm text-gray-500">Distance Rate</span>
            <span
              className={cn(
                'text-sm',
                distanceRate === 'N/A'
                  ? 'text-gray-400'
                  : 'font-medium text-[#101828]',
              )}
            >
              {distanceRate}
            </span>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}
