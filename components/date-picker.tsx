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
  /** readonly for input button basically it's disabled if true default to false */
  readOnly?: boolean;
  /** extra styling for the trigger button */
  className?: string;
}

export function DatePicker({
  value,
  onChangeAction,
  disabled,
  placeholder = 'Pick a date',
  required = false,
  readOnly = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onChangeAction(date);
    setOpen(false); // Close the popover after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={readOnly}
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
          onSelect={handleDateSelect}
          disabled={disabled}
          required={required}
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2050, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}
