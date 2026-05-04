'use client';

import type { ComponentProps } from 'react';
import { format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type CalendarProps = ComponentProps<typeof Calendar>;

const defaultClassNames = {
  nav: 'hidden',
  month_caption: 'flex h-12 w-full items-start justify-center px-1 pt-2',
  dropdowns:
    'w-full flex items-start text-sm font-medium justify-center h-full gap-6',
  dropdown_root: 'relative rounded-md border-0 shadow-none bg-transparent',
  caption_label:
    'flex flex-col items-center justify-center gap-0.5 text-base h-auto font-medium text-[#0F172A] [&>svg]:text-[#0F172A] [&>svg]:size-3',
  weekdays: 'flex px-1 mt-2',
  weekday: 'flex-1 text-center text-[13px] font-medium text-[#64748B]',
} as const;

const defaultFormatters = {
  formatWeekdayName: (day: Date) => format(day, 'EEE').slice(0, 2),
};

export type DeliveriesCalendarProps = {
  selected: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: CalendarProps['disabled'];
  defaultMonth?: CalendarProps['defaultMonth'];
  className?: string;
  classNames?: CalendarProps['classNames'];
  formatters?: CalendarProps['formatters'];
  showOutsideDays?: boolean;
  startMonth?: Date;
  endMonth?: Date;
  weekStartsOn?: CalendarProps['weekStartsOn'];
  modifiers?: CalendarProps['modifiers'];
  modifiersClassNames?: CalendarProps['modifiersClassNames'];
  components?: CalendarProps['components'];
};

/**
 * Single-date calendar with month/year dropdowns, two-letter weekday headers,
 * and deliveries styling. Built on {@link Calendar}.
 */
export function DeliveriesCalendar({
  selected,
  onSelect,
  disabled,
  defaultMonth,
  className,
  classNames,
  formatters,
  showOutsideDays = true,
  startMonth = new Date(2025, 0),
  endMonth = new Date(new Date().getFullYear(), 11),
  weekStartsOn,
  modifiers,
  modifiersClassNames,
  components,
}: DeliveriesCalendarProps) {
  return (
    <Calendar
      mode="single"
      required
      captionLayout="dropdown"
      selected={selected}
      onSelect={onSelect as never}
      disabled={disabled}
      defaultMonth={defaultMonth}
      showOutsideDays={showOutsideDays}
      startMonth={startMonth}
      endMonth={endMonth}
      weekStartsOn={weekStartsOn}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      components={components}
      className={cn(
        'rounded-none border-0 shadow-none [--cell-size:2.25rem]',
        className,
      )}
      classNames={{
        ...defaultClassNames,
        ...classNames,
      }}
      formatters={{
        ...defaultFormatters,
        ...formatters,
      }}
    />
  );
}
