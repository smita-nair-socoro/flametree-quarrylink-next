'use client';

import * as React from 'react';
import { Check, Plus, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export type QueueDateScope = 'this_day' | 'all_dates';

export type QueueFilterState = {
  dateScope: QueueDateScope;
  customerNames: string[];
};

export const DEFAULT_QUEUE_FILTER: QueueFilterState = {
  dateScope: 'this_day',
  customerNames: [],
};

function scheduleUnlockBodyPointerEvents() {
  window.requestAnimationFrame(() => {
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.pointerEvents = '';
    }
  });
}

export function hasActiveQueueFilters(filter: QueueFilterState): boolean {
  return (
    filter.dateScope !== 'this_day' || filter.customerNames.length > 0
  );
}

export function QueueFiltersDrawer({
  open,
  onOpenChange,
  filter,
  onFilterChange,
  customerOptions,
  boardDate,
  isDateScopeLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: QueueFilterState;
  onFilterChange: (next: QueueFilterState) => void;
  customerOptions: string[];
  boardDate: Date;
  isDateScopeLoading?: boolean;
}) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) scheduleUnlockBodyPointerEvents();
  };

  const toggleCustomerName = (name: string) => {
    onFilterChange({
      ...filter,
      customerNames: filter.customerNames.includes(name)
        ? filter.customerNames.filter((n) => n !== name)
        : [...filter.customerNames, name],
    });
  };

  const clearFilters = () => {
    onFilterChange(DEFAULT_QUEUE_FILTER);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="rounded-t-2xl px-4 pb-6 pt-2">
        <div className="flex flex-col gap-5">
          <DrawerTitle className="text-xl font-bold text-[#0F172A]">Filter queue</DrawerTitle>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Date
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isDateScopeLoading}
                onClick={() =>
                  onFilterChange({ ...filter, dateScope: 'this_day' })
                }
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  filter.dateScope === 'this_day'
                    ? 'border-[#8E51FF] bg-[#F5F3FF] text-[#7C3AED]'
                    : 'border-gray-200 bg-white text-[#64748B]',
                )}
              >
                This day
              </button>
              <button
                type="button"
                disabled={isDateScopeLoading}
                onClick={() =>
                  onFilterChange({ ...filter, dateScope: 'all_dates' })
                }
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  filter.dateScope === 'all_dates'
                    ? 'border-[#8E51FF] bg-[#F5F3FF] text-[#7C3AED]'
                    : 'border-gray-200 bg-white text-[#64748B]',
                )}
              >
                All dates
              </button>
            </div>
            {filter.dateScope === 'all_dates' ? (
              <p className="mt-2 text-xs text-[#64748B]">
                Assigning from all dates still schedules on{' '}
                <span className="font-semibold text-[#0F172A]">
                  {format(boardDate, 'EEEE, d MMMM yyyy')}
                </span>
                .
              </p>
            ) : null}
          </div>

          <div>
            {customerOptions.length > 0 ? (
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Customers
              </p>
            ) : null}
            {customerOptions.length === 0 ? (
              undefined
            ) : (
              <Popover modal>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'mt-2 flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors',
                      filter.customerNames.length > 0
                        ? 'border-[#8E51FF] bg-[#F5F3FF]/60'
                        : 'border-gray-200 bg-white hover:bg-gray-50',
                    )}
                  >
                    <Plus className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="font-semibold text-[#0F172A]">
                      Customer
                    </span>
                    {filter.customerNames.length > 0 ? (
                      <span className="ml-auto max-w-[50%] truncate rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {filter.customerNames.length === 1
                          ? filter.customerNames[0]
                          : `${filter.customerNames.length} selected`}
                      </span>
                    ) : (
                      undefined
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search customers..."
                      className="focus-visible:ring-primary focus-within:ring-primary"
                    />
                    <CommandList className="max-h-[min(300px,50vh)]">
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customerOptions.map((customer) => (
                          <CommandItem
                            key={customer}
                            onSelect={() => toggleCustomerName(customer)}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-primary',
                                filter.customerNames.includes(customer)
                                  ? 'bg-primary text-white'
                                  : 'opacity-50 [&_svg]:invisible',
                              )}
                            >
                              <Check
                                className={cn(
                                  'h-3.5 w-3.5',
                                  filter.customerNames.includes(customer) &&
                                  'text-white',
                                )}
                              />
                            </div>
                            <span>{customer}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {hasActiveQueueFilters(filter) ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-gray-200"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : null}

          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-[#8E51FF] hover:bg-[#7C3AED]"
            onClick={() => handleOpenChange(false)}
          >
            Apply Changes
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function QueueFiltersTriggerButton({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        'h-9 rounded-lg text-sm font-medium',
        active
          ? 'border-[#8E51FF] bg-[#F5F3FF] text-[#7C3AED]'
          : 'border-gray-200',
      )}
      onClick={onClick}
    >
      <SlidersHorizontal className="mr-1.5 h-4 w-4" />
      Filters
      {active ? (
        <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8E51FF] text-[10px] font-bold text-white">
          !
        </span>
      ) : null}
    </Button>
  );
}
