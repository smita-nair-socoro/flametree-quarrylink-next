import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';

export interface FacetedOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableFacetedFilterProps {
  title: string;
  options: FacetedOption[];
  counts?: Record<string, number>;
  filterValues: string[];
  onFilterChange: (values: string[]) => void;
}

export function DataTableFacetedFilter({
  title,
  options,
  counts = {},
  filterValues,
  onFilterChange,
}: DataTableFacetedFilterProps) {
  const [open, setOpen] = useState(false);

  // toggle a single value in the filterValues array
  const handleSelect = (val: string) => {
    const next = filterValues.includes(val)
      ? filterValues.filter((v) => v !== val)
      : [...filterValues, val];
    onFilterChange(next);
  };

  const clearFilters = () => onFilterChange([]);

  // trigger label: show count or title
  const triggerLabel = useMemo(() => {
    if (!filterValues.length) return title;
    if (filterValues.length === 1) return filterValues[0];
    return `${filterValues.length} selected`;
  }, [filterValues, title]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          {triggerLabel}
          {filterValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {filterValues.length}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" side="bottom" className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Filter ${title}…`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const Icon = opt.icon;
                const checked = filterValues.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => handleSelect(opt.value)}
                    className="flex items-center px-2 py-1"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        checked
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-gray-300 text-transparent',
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    {Icon && (
                      <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1">{opt.label}</span>
                    {counts[opt.value] != null && (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {counts[opt.value]}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {filterValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandItem
                  className="justify-center text-center text-red-600"
                  onSelect={clearFilters}
                >
                  Clear filters
                </CommandItem>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
