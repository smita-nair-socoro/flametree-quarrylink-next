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
import { Country } from 'country-state-city';

interface CountrySelectProps {
  value: string; // Country name
  onChange: (countryName: string, countryCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function CountrySelect({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select country',
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const countries = Country.getAllCountries();

  // Find selected country for display with flag
  const selectedCountry = countries.find((c) => c.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            {selectedCountry ? (
              <>
                <span className="text-lg leading-none">
                  {getFlagEmoji(selectedCountry.isoCode)}
                </span>
                <span>{selectedCountry.name}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.isoCode}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.name, country.isoCode);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="mr-2 text-lg leading-none">
                    {getFlagEmoji(country.isoCode)}
                  </span>
                  <span>{country.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
