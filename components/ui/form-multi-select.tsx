import * as React from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronsUpDown, X, Search } from 'lucide-react';
import { FormSelectOption } from '@/components/ui/form-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export interface FormMultiSelectOption extends FormSelectOption {
  group?: string;
}

interface FormMultiSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  options: readonly FormMultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formItemClassName?: string;
  searchPlaceholder?: string;
}

export function FormMultiSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = 'Select...',
  disabled = false,
  className,
  formItemClassName,
  searchPlaceholder = 'Search...',
}: FormMultiSelectProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  const selected: string[] = Array.isArray(field.value) ? field.value : [];

  function toggle(value: string) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    field.onChange(next);
  }

  function remove(value: string) {
    field.onChange(selected.filter((v) => v !== value));
  }

  const filtered = React.useMemo(
    () =>
      options.filter((o) =>
        String(o.label).toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );

  const groups = React.useMemo(() => {
    const map = new Map<string, FormMultiSelectOption[]>();
    for (const opt of filtered) {
      const group = opt.group ?? '';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(opt);
    }
    return map;
  }, [filtered]);

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => String(o.value) === selected[0])?.label ??
          '1 selected')
        : `${selected.length} trucks selected`;

  return (
    <FormItem className={formItemClassName}>
      {label && <FormLabel>{label}</FormLabel>}

      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              'w-full flex items-center justify-between overflow-hidden whitespace-nowrap',
              selected.length === 0 && 'text-muted-foreground',
              className,
            )}
          >
            <span className="flex-1 text-left truncate">{triggerLabel}</span>
            <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0 h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)] overflow-hidden"
          align="start"
        >
          {/* Search */}
          <div className="relative border-b">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-0 rounded-none shadow-none focus-visible:ring-0"
            />
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {groups.size === 0 ? (
              <p className="text-sm text-muted-foreground p-4">No options found.</p>
            ) : (
              Array.from(groups.entries()).map(([groupName, groupOpts]) => (
                <div key={groupName}>
                  {groupName && (
                    <p className="text-xs text-muted-foreground px-4 pt-3 pb-1 font-medium">
                      {groupName}
                    </p>
                  )}
                  {groupOpts.map((opt) => {
                    const isSelected = selected.includes(String(opt.value));
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggle(String(opt.value))}
                        />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((val) => {
            const optLabel =
              options.find((o) => String(o.value) === val)?.label ?? val;
            return (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(val)}
                className="h-auto px-2 py-1 text-sm font-normal gap-1"
              >
                {optLabel}
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            );
          })}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => field.onChange([])}
            className="h-auto px-2 py-1 border rounded-md text-sm font-normal"
          >
            Clear all
          </Button>
        </div>
      )}

      {error && <FormMessage />}
    </FormItem>
  );
}
