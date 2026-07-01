'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { parseDeliveryTimeWindowValue } from '@/lib/utils/time';

function ScrollColumn({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div ref={ref} style={{ overflowY: 'auto', height: 300 }}>
      {children}
    </div>
  );
}

// Valid delivery window: 04:00–23:00
// AM shows 4–11 only (12 AM / 1–3 AM are outside the window)
// PM shows 12, 1–11 (maps to 12:00–23:00, all in window)
const AM_HOURS = [4, 5, 6, 7, 8, 9, 10, 11];
const PM_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function parseValue(
  value?: string | null,
): { hour: number; minute: number; ampm: 'AM' | 'PM' } | null {
  if (!value) return null;
  const normalized = parseDeliveryTimeWindowValue(value);
  if (!normalized) return null;
  const parts = normalized.split(':');
  const h = Number.parseInt(parts[0], 10);
  const m = Number.parseInt(parts[1] ?? '0', 10);
  if (Number.isNaN(h)) return null;
  return {
    hour: h % 12 || 12,
    minute: Number.isNaN(m) ? 0 : m,
    ampm: h >= 12 ? 'PM' : 'AM',
  };
}

function buildTimeString(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h = hour12 % 12;
  if (ampm === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

interface TimeWindowPickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  isOptionDisabled?: (time: string) => boolean;
  placeholder?: string;
  'aria-invalid'?: boolean;
}

export function TimeWindowPicker({
  value,
  onChange,
  disabled,
  readOnly,
  isOptionDisabled,
  placeholder = 'Select time',
  'aria-invalid': ariaInvalid,
}: Readonly<TimeWindowPickerProps>) {
  const parsed = parseValue(value);

  const displayValue = parsed
    ? `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')} ${parsed.ampm}`
    : null;

  const currentAmpm = parsed?.ampm ?? 'AM';
  const hourList = currentAmpm === 'AM' ? AM_HOURS : PM_HOURS;

  function handleChange(type: 'hour' | 'minute' | 'ampm', val: string) {
    const current = parsed ?? { hour: 4, minute: 0, ampm: 'AM' as const };
    let nextHour = type === 'hour' ? Number(val) : current.hour;
    const nextMinute = type === 'minute' ? Number(val) : current.minute;
    const nextAmpm = (type === 'ampm' ? val : current.ampm) as 'AM' | 'PM';

    // When switching to AM, snap invalid AM hours (12, 1, 2, 3) to 4
    if (type === 'ampm' && nextAmpm === 'AM' && !AM_HOURS.includes(nextHour)) {
      nextHour = 4;
    }

    onChange(buildTimeString(nextHour, nextMinute, nextAmpm));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid}
          disabled={disabled || readOnly}
          className={cn(
            'w-full pl-3 text-left font-normal',
            !displayValue && 'text-muted-foreground',
            ariaInvalid && 'border-destructive',
          )}
        >
          {displayValue ?? <span>{placeholder}</span>}
          <Clock className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex divide-x" style={{ height: 300 }}>
          <ScrollColumn>
            <div className="flex flex-col p-2">
              {hourList.map((hour) => {
                const timeStr = buildTimeString(hour, parsed?.minute ?? 0, currentAmpm);
                const optionDisabled = isOptionDisabled?.(timeStr) ?? false;
                return (
                  <Button
                    key={hour}
                    type="button"
                    size="icon"
                    variant={parsed?.hour === hour ? 'default' : 'ghost'}
                    className="w-full shrink-0 aspect-square"
                    disabled={optionDisabled}
                    onClick={() => handleChange('hour', hour.toString())}
                  >
                    {hour}
                  </Button>
                );
              })}
            </div>
          </ScrollColumn>
          <ScrollColumn>
            <div className="flex flex-col p-2">
              {MINUTES.map((minute) => {
                const timeStr = buildTimeString(parsed?.hour ?? 4, minute, currentAmpm);
                const optionDisabled = isOptionDisabled?.(timeStr) ?? false;
                return (
                  <Button
                    key={minute}
                    type="button"
                    size="icon"
                    variant={parsed?.minute === minute ? 'default' : 'ghost'}
                    className="w-full shrink-0 aspect-square"
                    disabled={optionDisabled}
                    onClick={() => handleChange('minute', minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                );
              })}
            </div>
          </ScrollColumn>
          <div className="flex flex-col p-2">
            {(['AM', 'PM'] as const).map((ampm) => {
              const timeStr = buildTimeString(parsed?.hour ?? 4, parsed?.minute ?? 0, ampm);
              const optionDisabled = isOptionDisabled?.(timeStr) ?? false;
              return (
                <Button
                  key={ampm}
                  type="button"
                  size="icon"
                  variant={parsed?.ampm === ampm ? 'default' : 'ghost'}
                  className="w-full shrink-0 aspect-square"
                  disabled={optionDisabled}
                  onClick={() => handleChange('ampm', ampm)}
                >
                  {ampm}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
