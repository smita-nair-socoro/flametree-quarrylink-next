'use client';

import * as React from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ColorSelectOption {
  /** Primary label shown bold */
  label: string;
  value: string | number;
  /** Secondary text shown after the label */
  sublabel?: React.ReactNode;
  /** Badge text on the right */
  badge?: string;
  /** Tailwind bg class for the option row and trigger when selected */
  bg?: string;
  /** Tailwind border class for the option row and trigger when selected */
  border?: string;
  /** Tailwind bg class for the badge */
  badgeBg?: string;
  /** Tailwind border class for the badge */
  badgeBorder?: string;
  /** Tailwind text class for the badge */
  badgeColor?: string;
  /** Inline style for the option row and trigger — merged with Tailwind classes */
  rowStyle?: React.CSSProperties;
  /** Inline style for the badge — merged with Tailwind classes */
  badgeStyle?: React.CSSProperties;
  /** Disable selecting this option */
  disabled?: boolean;
}

interface ColorSelectProps {
  label?: string;
  searchPlaceholder?: string;
  options: ColorSelectOption[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Extra content rendered below the trigger (e.g. warnings) */
  extra?: React.ReactNode;
}

export function ColorSelect({
  label,
  searchPlaceholder = 'Search...',
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  extra,
}: ColorSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            role="combobox"
            aria-expanded={open}
            style={selected?.rowStyle}
            className={cn(
              'w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              disabled && 'opacity-50 cursor-not-allowed',
              selected ? (selected.bg ?? '') : 'bg-background',
              selected ? (selected.border ?? 'border-input') : 'border-input',
              !selected && 'text-muted-foreground',
            )}
          >
            {selected ? (
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-foreground truncate">
                  {selected.label}
                </span>
                {selected.sublabel && (
                  <span className="text-xs truncate">{selected.sublabel}</span>
                )}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-1 w-[var(--radix-popover-trigger-width)]"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList className="max-h-64">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    disabled={opt.disabled}
                    onSelect={() => {
                      if (!opt.disabled) {
                        onChange(opt.value);
                        setOpen(false);
                      }
                    }}
                    style={opt.rowStyle}
                    className={cn(
                      'flex items-center justify-between rounded-lg border my-1 px-3 py-2.5 cursor-pointer',
                      opt.bg ?? 'bg-background',
                      opt.border ?? 'border-transparent',
                      opt.disabled && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground text-sm truncate">
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className="text-xs truncate">{opt.sublabel}</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {opt.badge && (
                        <span
                          style={opt.badgeStyle}
                          className={cn(
                            'text-xs px-2.5 py-0.5 rounded-full border',
                            opt.badgeBg ?? 'bg-muted',
                            opt.badgeBorder ?? 'border-transparent',
                            opt.badgeColor ?? 'text-foreground',
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <Check
                        className={cn(
                          'h-4 w-4',
                          value === opt.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {extra}
    </div>
  );
}
