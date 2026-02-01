import * as React from 'react';
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
import { ChevronsUpDown, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface SelectOption {
  /**
   * The display label for the option.
   */
  label: string;

  /**
   * The unique value associated with the option.
   */
  value: string | number;
}

export interface SelectOptionsProps {
  /**
   * The text label shown above the select control.
   */
  label?: string;

  /**
   * The text label shown in the search input placeholder.
   */
  searchLabel?: string;

  /**
   * An array of options that the user can select from.
   */
  options: readonly SelectOption[];

  /**
   * The currently selected value.
   */
  value: string | number | undefined;

  /**
   * Callback when the selection changes.
   */
  onChange: (value: string | number) => void;

  /**
   * Placeholder text displayed when no option is selected.
   * @default "Select..."
   */
  placeholder?: string;

  /**
   * A Tailwind width utility class to control the popover content width.
   * @default "w-[300px]"
   */
  popoverWidthClass?: string;

  /**
   * Any additional Tailwind class names to apply to the trigger button.
   */
  className?: string;

  /**
   * Whether to show the search input field in the dropdown.
   * @default true
   */
  showSearch?: boolean;

  /**
   * Whether to disable the select control.
   * @default false
   */
  disabled?: boolean;

  /**
   * Error message to display below the select.
   */
  error?: string;
}

/**
 * A standalone select dropdown component built with shadcn-ui Popover + Command.
 * Similar to FormSelect but without React Hook Form integration.
 * Perfect for use in dialogs and other non-form contexts.
 */
export function SelectOptions({
  label,
  searchLabel,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  popoverWidthClass = 'w-[300px]',
  className,
  showSearch = true,
  disabled = false,
  error,
}: SelectOptionsProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'w-full flex items-center justify-between overflow-hidden whitespace-nowrap',
              !value && 'text-muted-foreground',
              error && 'border-red-500',
              className
            )}
            disabled={disabled}
          >
            <span className="flex-1 text-left truncate" title={selectedOption ? selectedOption.label : placeholder}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(popoverWidthClass, 'p-1 w-auto')}
          align="start"
        >
          <Command>
            {showSearch && (
              <CommandInput
                placeholder={`Search ${searchLabel || 'options'}...`}
                className="h-9"
              />
            )}
            <CommandList>
              <CommandEmpty>No {searchLabel || 'options'} found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <span className="flex-1">{opt.label}</span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === opt.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
