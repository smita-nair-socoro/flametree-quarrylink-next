'use client';

import * as React from 'react';
import { CalendarDays, LayoutGrid, Truck, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ResourceView = 'trucks' | 'drivers';
type PeriodView = 'week' | 'month';

type ResourceToggleProps = {
  value: ResourceView;
  onChange: (v: ResourceView) => void;
};

export function DeliveriesResourceToggle({
  value,
  onChange,
}: ResourceToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-gray-200 bg-[#F1F5F9]"
      role="group"
      aria-label="Resource view"
    >
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onChange('trucks')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors cursor-pointer',
              value === 'trucks'
                ? 'border border-gray-200 bg-white text-[#0F172A] shadow-sm'
                : 'border border-transparent text-[#64748B] hover:text-[#0F172A]',
            )}
            aria-pressed={value === 'trucks'}
          >
            <Truck className="size-4 shrink-0" strokeWidth={2.25} />
            Trucks
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          backgroundClassName="bg-[#A855F7] text-white font-medium border-none shadow-md"
          arrowClassName="bg-[#A855F7] fill-[#A855F7]"
        >
          Focus on fleet utilization.
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onChange('drivers')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors cursor-pointer',
              value === 'drivers'
                ? 'border border-gray-200 bg-white text-[#0F172A] shadow-sm'
                : 'border border-transparent text-[#64748B] hover:text-[#0F172A]',
            )}
            aria-pressed={value === 'drivers'}
          >
            <Users className="size-4 shrink-0" strokeWidth={2.25} />
            Drivers
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          backgroundClassName="bg-[#A855F7] text-white font-medium border-none shadow-md"
          arrowClassName="bg-[#A855F7] fill-[#A855F7]"
        >
          Plan by driver availability.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

type PeriodToggleProps = {
  value: PeriodView;
  onChange: (v: PeriodView) => void;
};

export function DeliveriesPeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-gray-200 bg-[#F1F5F9] p-0.5"
      role="group"
      aria-label="Schedule period"
    >
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onChange('week')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors cursor-pointer',
              value === 'week'
                ? 'border border-gray-200 bg-white text-[#0F172A] shadow-sm'
                : 'border border-transparent text-[#64748B] hover:text-[#0F172A]',
            )}
            aria-pressed={value === 'week'}
          >
            <LayoutGrid className="size-4 shrink-0" strokeWidth={2.25} />
            Week
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          backgroundClassName="bg-[#A855F7] text-white font-medium border-none shadow-md"
          arrowClassName="bg-[#A855F7] fill-[#A855F7]"
        >
          Weekly grid (read-only)
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onChange('month')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors cursor-pointer',
              value === 'month'
                ? 'border border-gray-200 bg-white text-[#0F172A] shadow-sm'
                : 'border border-transparent text-[#64748B] hover:text-[#0F172A]',
            )}
            aria-pressed={value === 'month'}
          >
            <CalendarDays className="size-4 shrink-0" strokeWidth={2.25} />
            Month
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          backgroundClassName="bg-[#A855F7] text-white font-medium border-none shadow-md"
          arrowClassName="bg-[#A855F7] fill-[#A855F7]"
        >
          Monthly overview (read-only)
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
