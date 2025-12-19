'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { State } from 'country-state-city';
import { Input } from '@/components/ui/input';

interface StateSelectProps {
  value: string; // State name
  onChange: (stateName: string) => void;
  countryCode: string; // ISO country code (e.g., 'AU', 'US')
  disabled?: boolean;
  placeholder?: string;
}

export function StateSelect({
  value,
  onChange,
  countryCode,
  disabled = false,
  placeholder = 'Select state/region',
}: StateSelectProps) {
  const [open, setOpen] = React.useState(false);
  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];

  // If country has no predefined states, allow free text input
  if (states.length === 0) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // If no country selected, show disabled input
  if (!countryCode) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between"
        disabled={true}
      >
        {placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search state/region..." />
          <CommandList>
            <CommandEmpty>No state/region found.</CommandEmpty>
            <CommandGroup>
              {states.map((state) => (
                <CommandItem
                  key={state.isoCode}
                  value={state.name}
                  onSelect={() => {
                    onChange(state.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === state.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {state.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
