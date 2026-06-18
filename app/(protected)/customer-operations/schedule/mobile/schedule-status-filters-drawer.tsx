'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DEFAULT_JOB_STATUS_FILTER_OPTIONS,
  type DispatchBoardFilterState,
} from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';

function scheduleUnlockBodyPointerEvents() {
  window.requestAnimationFrame(() => {
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.pointerEvents = '';
    }
  });
}

export function hasActiveScheduleStatusFilters(
  filter: DispatchBoardFilterState,
): boolean {
  return filter.jobStatuses.length > 0;
}

export function ScheduleStatusFiltersDrawer({
  open,
  onOpenChange,
  filter,
  onFilterChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: DispatchBoardFilterState;
  onFilterChange: (next: DispatchBoardFilterState) => void;
}) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) scheduleUnlockBodyPointerEvents();
  };

  const toggleStatus = (status: string) => {
    onFilterChange({
      ...filter,
      jobStatuses: filter.jobStatuses.includes(status)
        ? filter.jobStatuses.filter((s) => s !== status)
        : [...filter.jobStatuses, status],
    });
  };

  const clearFilters = () => {
    onFilterChange({ ...filter, jobStatuses: [] });
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="rounded-t-2xl px-4 pb-6 pt-2">
        <div className="flex flex-col gap-5">
          <DrawerTitle className="text-xl font-bold text-[#0F172A]">
            Filters
          </DrawerTitle>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Status
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {DEFAULT_JOB_STATUS_FILTER_OPTIONS.map((option) => {
                const selected = filter.jobStatuses.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleStatus(option.value)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors',
                      selected
                        ? 'border-[#8E51FF] bg-[#F5F3FF] text-[#7C3AED]'
                        : 'border-gray-200 bg-white text-[#0F172A] hover:bg-gray-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                        selected
                          ? 'border-[#8E51FF] bg-[#8E51FF] text-white'
                          : 'border-gray-300 bg-white',
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl border-gray-200"
              onClick={clearFilters}
              disabled={filter.jobStatuses.length === 0}
            >
              Clear
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-xl bg-[#8E51FF] hover:bg-[#7C3AED]"
              onClick={() => handleOpenChange(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
