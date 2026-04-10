'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface YearPickerProps {
  value?: Date;
  onChangeAction: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function YearPicker({
  value,
  onChangeAction,
  className,
  placeholder = 'Pick a year',
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false);

  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const endYear = currentYear;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? value.getFullYear() : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="start">
        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {years.map((year) => (
            <Button
              key={year}
              variant={value?.getFullYear() === year ? 'default' : 'ghost'}
              className="text-sm h-9 cursor-pointer"
              onClick={() => {
                onChangeAction(new Date(year, 0, 1));
                setOpen(false);
              }}
            >
              {year}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
