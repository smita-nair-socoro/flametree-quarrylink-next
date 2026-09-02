'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatCalendarDate } from '@/lib/utils/date';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DateRangeValue = {
  from?: Date;
  to?: Date;
  preset?: DateRangePreset;
};

export type DateRangePreset =
  | 'today'
  | 'last7'
  | 'thisMonth'
  | 'last90'
  | 'custom'
  | 'clear';

const PRESETS: { id: Exclude<DateRangePreset, 'custom' | 'clear'>; label: string }[] =
  [
    { id: 'today', label: 'Today' },
    { id: 'last7', label: 'Last 7 days' },
    { id: 'thisMonth', label: 'This month' },
    { id: 'last90', label: 'Last 90 days' },
  ];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function applyDateRangePreset(preset: DateRangePreset): DateRangeValue {
  const today = startOfDay(new Date());
  if (preset === 'clear') {
    return { preset: 'clear' };
  }
  if (preset === 'today') {
    return { from: today, to: today, preset };
  }
  if (preset === 'last7') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from, to: today, preset };
  }
  if (preset === 'thisMonth') {
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today,
      preset,
    };
  }
  if (preset === 'last90') {
    const from = new Date(today);
    from.setDate(from.getDate() - 89);
    return { from, to: today, preset };
  }
  return { preset: 'custom' };
}

export function DateRangePresets({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}) {
  const rangeLabel =
    value.from && value.to
      ? `${formatCalendarDate(value.from)} – ${formatCalendarDate(value.to)}`
      : 'All dates';

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
      <span className="text-sm text-muted-foreground min-w-[12rem]">
        {rangeLabel}
      </span>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            size="sm"
            variant={value.preset === preset.id ? 'default' : 'outline'}
            onClick={() => onChange(applyDateRangePreset(preset.id))}
          >
            {preset.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant={value.preset === 'clear' || !value.from ? 'default' : 'outline'}
          onClick={() => onChange(applyDateRangePreset('clear'))}
        >
          Clear dates
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={value.preset === 'custom' ? 'default' : 'outline'}
              className={cn('gap-1')}
            >
              <CalendarIcon className="h-4 w-4" />
              Custom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Calendar
                mode="single"
                selected={value.from}
                onSelect={(from: Date | undefined) =>
                  onChange({ ...value, from, preset: 'custom' })
                }
              />
              <Calendar
                mode="single"
                selected={value.to}
                onSelect={(to: Date | undefined) => onChange({ ...value, to, preset: 'custom' })}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function toIsoDate(date?: Date): string | undefined {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
