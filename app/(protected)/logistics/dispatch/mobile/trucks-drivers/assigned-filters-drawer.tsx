'use client';

import * as React from 'react';
import { Check, Plus, SlidersHorizontal } from 'lucide-react';
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

export type AssignedFilterState = {
  customerNames: string[];
};

export const DEFAULT_ASSIGNED_FILTER: AssignedFilterState = {
  customerNames: [],
};

function scheduleUnlockBodyPointerEvents() {
  window.requestAnimationFrame(() => {
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.pointerEvents = '';
    }
  });
}

export function hasActiveAssignedFilters(filter: AssignedFilterState): boolean {
  return filter.customerNames.length > 0;
}

export function AssignedFiltersDrawer({
  open,
  onOpenChange,
  filter,
  onFilterChange,
  customerOptions,
  viewType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: AssignedFilterState;
  onFilterChange: (next: AssignedFilterState) => void;
  customerOptions: string[];
  viewType: 'trucks' | 'drivers';
}) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) scheduleUnlockBodyPointerEvents();
  };

  const toggleCustomerName = (name: string) => {
    onFilterChange({
      customerNames: filter.customerNames.includes(name)
        ? filter.customerNames.filter((n) => n !== name)
        : [...filter.customerNames, name],
    });
  };

  const clearFilters = () => {
    onFilterChange(DEFAULT_ASSIGNED_FILTER);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="rounded-t-2xl px-4 pb-6 pt-2">
        <div className="flex flex-col gap-5">
          <DrawerTitle className="text-xl font-bold text-[#0F172A]">Filter {viewType === 'trucks' ? 'trucks' : 'drivers'}</DrawerTitle>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Customers
            </p>
            {customerOptions.length === 0 ? (
              <p className="mt-2 text-sm text-[#64748B]">
                No customers in assigned trips for this day.
              </p>
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
                    ) : null}
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

          {hasActiveAssignedFilters(filter) ? (
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

export function AssignedFiltersTriggerButton({
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
