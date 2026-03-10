import * as React from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronsUpDown, X, Check } from 'lucide-react';
import { FormSelectOption } from '@/components/ui/form-select';

interface FormMultiSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  options: readonly FormSelectOption[];
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
          className="p-1 w-[var(--radix-popover-trigger-width)]"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = selected.includes(String(opt.value));
                  return (
                    <CommandItem
                      key={opt.value}
                      value={`${opt.label} __${String(opt.value)}`}
                      onSelect={() => toggle(String(opt.value))}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'h-4 w-4 rounded flex items-center justify-center border flex-shrink-0',
                          isSelected
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-input bg-background',
                        )}
                      >
                        {isSelected && (
                          <Check
                            className="h-3 w-3 text-white"
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <span>{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
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
            className=" h-auto px-2 py-1 border rounded-md text-sm font-normal"
          >
            Clear all
          </Button>
        </div>
      )}

      {error && <FormMessage />}
    </FormItem>
  );
}
