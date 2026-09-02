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
import { DayPicker } from 'react-day-picker';

export interface DatePickerProps {
  /** currently selected date (or undefined) */
  value?: Date;
  /** called with the new date when the user picks one */
  onChangeAction: (date: Date | undefined) => void;
  /** Greys out the trigger and prevents opening the picker */
  disabled?: boolean;
  /** Disables specific dates inside the calendar */
  disabledDates?: React.ComponentProps<typeof DayPicker>['disabled'];
  /** placeholder text when no date is selected */
  placeholder?: string;
  /** whether selection is required (forces `required: true` on the picker) */
  required?: boolean;
  /** extra styling for the trigger button */
  className?: string;
  /** forwarded from FormControl via Radix Slot */
  'aria-invalid'?: boolean;
}

export function DatePicker({
  value,
  onChangeAction,
  disabled = false,
  disabledDates,
  placeholder = 'Pick a date',
  required = false,
  className,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const isDisabled = disabled;

  const handleDateSelect = (date: Date | undefined) => {
    onChangeAction(date);
    setOpen(false); // Close the popover after selection
  };

  return (
    <Popover
      open={isDisabled ? false : open}
      onOpenChange={isDisabled ? undefined : setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isDisabled}
          aria-invalid={ariaInvalid}
          className={cn(
            'w-full  sm:w-auto pl-3 text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 opacity-50" />
          {value ? (
            <span className="mr-auto">{format(value, 'PPP')}</span>
          ) : (
            <span className="mr-auto">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value}
          defaultMonth={value}
          onSelect={handleDateSelect}
          disabled={disabledDates}
          required={required}
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2050, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}
