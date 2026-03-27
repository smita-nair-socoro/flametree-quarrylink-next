'use client';

import { cn } from '@/lib/utils';
import { centsToDollars } from '@/lib/utils/currency';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MobileLineItemProps {
  title: string;
  subtitle: string;
  costPrice: number;
  sellPrice: number;
  costLabel?: string;
  sellLabel?: string;
  profitLabel: string;
  profitValue: number;
  actions: React.ReactNode;
}

export function MobileLineItem({
  title,
  subtitle,
  costPrice,
  sellPrice,
  costLabel = 'Cost',
  sellLabel = 'Sell',
  profitLabel,
  profitValue,
  actions,
}: MobileLineItemProps) {
  const profitColor =
    profitValue < 0
      ? 'text-red-600'
      : profitValue > 0
        ? 'text-green-600'
        : 'text-gray-600';

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA]">
        <div className="min-w-0">
          <p className="font-bold text-[#101828] text-base truncate">{title}</p>
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        </div>
        {actions}
      </div>

      <Separator className="bg-gray-200" />

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white">
        <div className="flex flex-col items-center py-3 gap-0.5">
          <span className="text-xs text-gray-500">{costLabel}</span>
          <span className="text-sm font-semibold text-[#101828]">
            ${centsToDollars(costPrice)}
          </span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <span className="text-xs text-gray-500">{sellLabel}</span>
          <span className="text-sm font-semibold text-[#101828]">
            ${centsToDollars(sellPrice)}
          </span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <span className="text-xs text-gray-500">{profitLabel}</span>
          <span className={cn('text-sm font-semibold flex items-center gap-0.5', profitColor)}>
            {profitValue < 0 && <TrendingDown className="w-3.5 h-3.5" />}
            {profitValue > 0 && <TrendingUp className="w-3.5 h-3.5" />}
            {profitValue.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
