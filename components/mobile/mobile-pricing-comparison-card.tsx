'use client';

import { QuarriesWithProduct } from '@/lib/types/quarry';
import { cn } from '@/lib/utils';
import { centsToDollars } from '@/lib/utils/currency';
import {
  DEFAULT_CURRENCY_CODE,
  getCurrencySymbol,
} from '@/lib/utils/currency-tax-helper';
import { TrendingDown, TrendingUp, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TableBadges } from '@/components/table-badges';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

export type PricingComparisonType = 'tn' | 'm3' | 'kg' | 'bulka';

export interface MobilePricingComparisonCardProps {
  supplier: QuarriesWithProduct;
  pricingType: PricingComparisonType;
  isLowestCost: boolean;
  isBestMargin: boolean;
  currencyCode?: string;
}

function getPricingValues(
  supplier: QuarriesWithProduct,
  type: PricingComparisonType,
) {
  switch (type) {
    case 'tn':
      return {
        costPrice: supplier.perTnCostPrice,
        sellPrice: supplier.perTnSellPrice,
        available: supplier.availableForSaleTn,
      };
    case 'm3':
      return {
        costPrice: supplier.perM3CostPrice,
        sellPrice: supplier.perM3SellPrice,
        available: supplier.availableForSaleM3,
      };
    case 'kg':
      return {
        costPrice: supplier.per20kgCostPrice,
        sellPrice: supplier.per20kgSellPrice,
        available: supplier.availableForSale20kg,
      };
    case 'bulka':
      return {
        costPrice: supplier.perBulkaCostPrice,
        sellPrice: supplier.perBulkaSellPrice,
        available: supplier.availableForSaleBulka,
      };
  }
}

export function MobilePricingComparisonCard({
  supplier,
  pricingType,
  isLowestCost,
  isBestMargin,
  currencyCode = DEFAULT_CURRENCY_CODE,
}: MobilePricingComparisonCardProps) {
  const { costPrice, sellPrice, available } = getPricingValues(
    supplier,
    pricingType,
  );

  const currencySymbol = getCurrencySymbol(currencyCode);
  const costDisplay = costPrice ? centsToDollars(costPrice) : '0.00';
  const sellDisplay = sellPrice ? centsToDollars(sellPrice) : '0.00';
  const margin = sellPrice === 0 ? 0 : (sellPrice - costPrice) / sellPrice || 0;
  const name = supplier.quarrySupplier?.name || 'Unknown';

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden',
        isLowestCost
          ? 'border-2 border-green-500 shadow-[0_0_3px_rgba(34,197,94,0.3)]'
          : 'border-gray-200',
      )}
    >
      {/* Header — green bg only when lowest cost */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          isLowestCost ? 'bg-green-50' : 'bg-[#FAFAFA]',
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isLowestCost && (
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
        <div className="shrink-0 ml-2">
          <TableBadges names={[available ? 'AVAILABLE' : 'UNAVAILABLE']} />
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* 3-column pricing grid — always white */}
      <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white px-4 py-3">
        {/* Cost Price */}
        <div className="pr-3">
          <p className="text-[10px] text-gray-500 ">Cost Price</p>
          <p
            className={cn(
              'text-[16px] font-semibold',
              isLowestCost ? 'text-green-600' : 'text-[#101828]',
            )}
          >
            {currencySymbol}{costDisplay}
          </p>
          {isLowestCost && (
            <p className="text-[10px] text-green-600 font-medium mt-0.5">
              Lowest
            </p>
          )}
        </div>

        {/* Sell Price */}
        <div className="px-3">
          <p className="text-[10px] text-gray-500 ">Sell Price</p>
          <p className="text-[16px] font-semibold text-[#101828]">
            {currencySymbol}{sellDisplay}
          </p>
        </div>

        {/* Margin */}
        <div className="pl-3">
          <p className="text-[10px] text-gray-500 ">Margin</p>
          <div
            className={cn(
              'flex items-center gap-0.5 text-[16px] font-semibold',
              margin < 0
                ? 'text-red-600'
                : isBestMargin
                  ? 'text-[#F59E0B]'
                  : margin > 0
                    ? 'text-green-600'
                    : 'text-gray-600',
            )}
          >
            {margin < 0 && <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
            {margin > 0 && <TrendingUp className="w-3.5 h-3.5 shrink-0" />}
            <span>{(margin * 100).toFixed(2)}%</span>
          </div>
          {isBestMargin && (
            <p className="text-xs text-amber-500 font-medium mt-0.5">
              Best margin
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
