'use client';

import * as React from 'react';
import { ListFilter } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type QueueSortKey = 'time' | 'size' | 'customer';
export type QueueSortOrder = 'asc' | 'desc';

const SORT_OPTIONS: { value: QueueSortKey; label: string }[] = [
  { value: 'time', label: 'Time' },
  { value: 'size', label: 'Size' },
  { value: 'customer', label: 'Customer' },
];

function scheduleUnlockBodyPointerEvents() {
  window.requestAnimationFrame(() => {
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.pointerEvents = '';
    }
  });
}

export function QueueSortDrawer({
  open,
  onOpenChange,
  sortBy,
  onSortByChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sortBy: QueueSortKey;
  onSortByChange: (value: QueueSortKey) => void;
}) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) scheduleUnlockBodyPointerEvents();
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="rounded-t-2xl px-4 pb-6 pt-2">
        <div className="flex flex-col gap-5">
          <div>
            <DrawerTitle className="text-xl font-bold text-[#0F172A]">Sort queue</DrawerTitle>
            <p className="mt-1 text-sm text-[#64748B]">
              Choose how unassigned dockets are ordered.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map((option) => {
              const selected = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortByChange(option.value)}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors',
                    selected
                      ? 'border-[#8E51FF] bg-[#F5F3FF]/60'
                      : 'border-gray-200 bg-white',
                  )}
                >
                  <span className="text-base font-semibold text-[#0F172A]">
                    {option.label}
                  </span>
                  {selected ? (
                    <span className="rounded-md bg-[#8E51FF] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      Selected
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

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

export function QueueSortTriggerButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 rounded-lg border-gray-200 text-sm font-medium"
      onClick={onClick}
    >
      <ListFilter className="mr-1.5 h-4 w-4" />
      Sort
    </Button>
  );
}
