import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
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
import { useDebounce } from '@/hooks/use-debounce';

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
  className?: string;
  hideSearch?: boolean;
  asyncSearch?: (query: string) => Promise<FacetedOption[]>;
}

const formatLabel = (label: string): string => {
  return label.replace(/_/g, ' ');
};

export function DataTableFacetedFilter({
  title,
  options,
  counts = {},
  filterValues,
  onFilterChange,
  className,
  hideSearch = false,
  asyncSearch,
}: DataTableFacetedFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [asyncOptions, setAsyncOptions] = useState<FacetedOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!asyncSearch || !open) return;

    let cancelled = false;
    setIsLoading(true);
    asyncSearch(debouncedSearch)
      .then((next) => {
        if (!cancelled) setAsyncOptions(next);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [asyncSearch, open, debouncedSearch]);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const resolvedOptions = asyncSearch ? asyncOptions : options;

  const sortedOptions = useMemo(() => {
    const selected = new Map(
      filterValues.map((value) => {
        const match = resolvedOptions.find((option) => option.value === value);
        return [
          value,
          match ?? { value, label: value },
        ] as const;
      }),
    );
    const merged = [
      ...selected.values(),
      ...resolvedOptions.filter((option) => !selected.has(option.value)),
    ];
    return [...merged].sort((a, b) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
    );
  }, [filterValues, resolvedOptions]);

  const handleSelect = (val: string) => {
    const next = filterValues.includes(val)
      ? filterValues.filter((v) => v !== val)
      : [...filterValues, val];
    onFilterChange(next);
  };

  const clearFilters = () => onFilterChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 border-dashed', className)}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>{title}</span>

          {filterValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />

              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {filterValues.length}
              </Badge>

              <div className="hidden lg:flex space-x-1">
                {filterValues.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {filterValues.length} Selected
                  </Badge>
                ) : (
                  filterValues.map((val) => {
                    const opt = sortedOptions.find((o) => o.value === val);
                    const label = opt?.label.includes('_')
                      ? formatLabel(opt.label)
                      : opt?.label ?? val;
                    return (
                      <Badge
                        key={val}
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(val);
                        }}
                      >
                        {label}
                      </Badge>
                    );
                  })
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" side="bottom" className="w-[210px] p-0">
        <Command shouldFilter={!asyncSearch}>
          {!hideSearch && (
            <CommandInput
              placeholder={`Filter ${title}ΓÇª`}
              value={asyncSearch ? search : undefined}
              onValueChange={asyncSearch ? setSearch : undefined}
            />
          )}
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'LoadingΓÇª' : 'No results found.'}
            </CommandEmpty>
            <CommandGroup>
              {sortedOptions.map((opt) => {
                const Icon = opt.icon;
                const checked = filterValues.includes(opt.value);
                const displayLabel = opt.label.includes('_')
                  ? formatLabel(opt.label)
                  : opt.label;

                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => {
                      handleSelect(opt.value);
                      setOpen(true);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center border border-primary',
                        checked
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>

                    {Icon && (
                      <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1">{displayLabel}</span>
                    {counts[opt.value] != null && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
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
                  className="justify-center text-center"
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
