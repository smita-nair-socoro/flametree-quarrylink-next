'use client';

import * as React from 'react';
import {
  Calendar as CalendarLucide,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { addDays, format, isValid, parse, startOfDay } from 'date-fns';

import { Button } from '@/components/ui/button';
import { DeliveriesCalendar } from '@/components/ui/deliveries-calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const DISPLAY_FORMAT = 'EEE d MMM yyyy';

function formatJumpValue(d: Date) {
  return format(d, 'dd/MM/yyyy');
}

type DeliveriesDateNavProps = {
  date: Date;
  onDateChange: (next: Date) => void;
  className?: string;
};

export function DeliveriesDateNav({
  date,
  onDateChange,
  className,
}: DeliveriesDateNavProps) {
  const [open, setOpen] = React.useState(false);
  const [jumpText, setJumpText] = React.useState(() => formatJumpValue(date));

  React.useEffect(() => {
    setJumpText(formatJumpValue(date));
  }, [date]);

  const applyJump = React.useCallback(() => {
    const parsed = parse(jumpText.trim(), 'dd/MM/yyyy', date);
    if (isValid(parsed)) {
      onDateChange(startOfDay(parsed));
      setOpen(false);
    }
  }, [jumpText, date, onDateChange]);

  const goToday = React.useCallback(() => {
    onDateChange(startOfDay(new Date()));
    setOpen(false);
  }, [onDateChange]);

  const bump = React.useCallback(
    (delta: number) => {
      onDateChange(startOfDay(addDays(date, delta)));
    },
    [date, onDateChange],
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in an input, textarea, or contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        bump(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        bump(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bump]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          'flex w-[276px] items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm',
          className,
        )}
      >
        <button
          type="button"
          className="flex shrink-0 items-center justify-center px-2.5 text-[#64748B] transition-colors hover:bg-gray-50"
          aria-label="Previous day"
          onClick={() => bump(-1)}
        >
          <ChevronLeft className="size-4" />
        </button>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-center gap-2 border-x border-gray-200 px-3 py-2 text-center transition-colors hover:bg-gray-50"
          >
            <CalendarLucide
              className="size-4 shrink-0 text-[#8E51FF]"
              strokeWidth={2.25}
            />
            <span className="truncate text-sm font-semibold text-[#0F172A]">
              {format(date, DISPLAY_FORMAT)}
            </span>
            {open ? (
              <ChevronUp className="size-4 shrink-0 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="size-4 shrink-0 text-[#94A3B8]" />
            )}
          </button>
        </PopoverTrigger>
        <button
          type="button"
          className="flex shrink-0 items-center justify-center px-2.5 text-[#64748B] transition-colors hover:bg-gray-50"
          aria-label="Next day"
          onClick={() => bump(1)}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <PopoverContent className="w-auto border-gray-200 p-0 shadow-lg">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <DeliveriesCalendar
            selected={date}
            onSelect={(d: Date | undefined) => {
              if (d) {
                onDateChange(startOfDay(d));
                setOpen(false);
              }
            }}
          />
          <div className="border-t border-gray-200 px-3 pb-3 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              Jump to date
            </p>
            <div className="relative mt-2">
              <Input
                value={jumpText}
                onChange={(e) => setJumpText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyJump();
                }}
                placeholder="dd/mm/yyyy"
                className="h-10 border-gray-200 pr-10 text-sm"
                aria-label="Jump to date"
              />
              <CalendarLucide
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
                strokeWidth={2}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-10 w-full border-gray-200 bg-white font-semibold text-[#0F172A] shadow-none hover:bg-gray-50"
              onClick={goToday}
            >
              Go to today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
