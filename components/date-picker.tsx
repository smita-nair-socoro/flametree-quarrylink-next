'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Matcher } from 'react-day-picker';

export interface DatePickerProps {
  /** currently selected date (or undefined) */
  value?: Date;
  /** called with the new date when the user picks one */
  onChangeAction: (date: Date | undefined) => void;
  /** disable dates exactly the same way <Calendar> does */
  disabled?: Matcher | Matcher[] | undefined;
  /** placeholder text when no date is selected */
  placeholder?: string;
  /** whether selection is required (forces `required: true` on the picker) */
  required?: boolean;
  /** extra styling for the trigger button */
  className?: string;
}

export function DatePicker({
  value,
  onChangeAction,
  disabled,
  placeholder = 'Pick a date',
  required = false,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full sm:w-[240px] pl-3 text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value}
          onSelect={onChangeAction}
          disabled={disabled}
          required={required}
        />
      </PopoverContent>
    </Popover>
  );
}
