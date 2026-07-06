'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export type GroupedFieldCategory = {
  key: string;
  label: string;
  fields: string[];
};

export interface GroupedFieldSelectorProps {
  categories: readonly GroupedFieldCategory[];
  field: string;
  onChange: (category: string, field: string) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  defaultExpandedKeys?: string[];
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
}

function toFieldKey(category: string, field: string) {
  return `${category}::${field}`;
}

export function GroupedFieldSelector({
  categories,
  field,
  onChange,
  label = 'Field',
  placeholder = 'Select a field',
  searchPlaceholder = 'Search fields...',
  defaultExpandedKeys,
  defaultOpen = false,
  disabled = false,
  className,
}: GroupedFieldSelectorProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [search, setSearch] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    () =>
      new Set(
        defaultExpandedKeys || []
      ),
  );

  React.useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCategories = React.useMemo(() => {
    return categories
      .map((item) => ({
        ...item,
        fields: item.fields.filter((fieldName) => {
          if (!normalizedSearch) return true;
          return (
            fieldName.toLowerCase().includes(normalizedSearch) ||
            item.label.toLowerCase().includes(normalizedSearch) ||
            item.key.toLowerCase().includes(normalizedSearch)
          );
        }),
      }))
      .filter((item) => item.fields.length > 0);
  }, [categories, normalizedSearch]);

  React.useEffect(() => {
    if (!normalizedSearch) return;
    setExpandedCategories(
      new Set(filteredCategories.map((item) => item.key)),
    );
  }, [normalizedSearch, filteredCategories]);

  const selectedLabel = field || placeholder;

  const toggleCategory = (key: string) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? <Label>{label}</Label> : null}
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSearch('');
        }}
        modal
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              !field && 'text-muted-foreground',
            )}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList className="max-h-72">
              {filteredCategories.map((item) => {
                const isExpanded = expandedCategories.has(item.key);

                return (
                  <div
                    key={item.key}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-muted/50"
                      onClick={() => toggleCategory(item.key)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1">{item.key}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.fields.length}
                      </span>
                    </button>

                    {isExpanded &&
                      item.fields.map((fieldName) => (
                        <CommandItem
                          key={toFieldKey(item.label, fieldName)}
                          value={toFieldKey(item.label, fieldName)}
                          className="cursor-pointer pl-9"
                          onSelect={() => {
                            onChange(item.label, fieldName);
                            setOpen(false);
                            setSearch('');
                          }}
                        >
                          {fieldName}
                        </CommandItem>
                      ))}
                  </div>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
