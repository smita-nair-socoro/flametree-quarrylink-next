import * as React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
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
  CommandSeparator,
} from '@/components/ui/command';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { ChevronsUpDown, Check } from 'lucide-react';

export interface FormSelectOption {
  /**
   * Form Select Label.
   * This will be displayed above the select control
   */
  label: string;

  /**
   * The unique value associated with the option.
   * This is the value that will be written to the form state.
   */
  value: string | number;
}

/**
 * A reusable select field built on shadcn popover+command + React Hook Form.
 *
 * @template TFieldValues - The shape of your form's values.
 */
export interface FormSelectProps<TFieldValues extends FieldValues> {
  /**
   * The RHF control object returned from `useForm`.
   * Used internally to register the field and manage form state.
   */
  control: Control<TFieldValues>;

  /**
   * The name of the field within your form values.
   * Must match one of the keys on your `TFieldValues` type.
   */
  name: Path<TFieldValues>;

  /**
   * The text label shown above the select control.
   */
  label?: string;

  /**
   * The text label shown above the search input field.
   */
  searchLabel?: string;

  /**
   * An array of options that the user can select from.
   * This array is treated as read-only and never mutated by the component.
   */
  options: readonly FormSelectOption[];

  /**
   * Placeholder text displayed on the button when no option is selected.
   * @default "Select..."
   */
  placeholder?: string;

  /**
   * A Tailwind width utility class to control the popover content width.
   * @default "w-[200px]"
   */
  popoverWidthClass?: string;

  /**
   * Any additional Tailwind class names to apply to the trigger button.
   */
  className?: string;

  /**
   * Any additional Tailwind class names to apply to the form item.
   */
  formItemClassName?: string;

  /**
   * Optional callback to render a bottom-row button.
   * If provided, a "add" item will appear which calls this on select.
   */
  onAddClick?: () => void;
  /**
   * Text to display for the add-button row.
   * @default "+ New Item"
   */
  addButtonLabel?: string;
  /**
   * Additional classes to apply to the add-button row.
   */
  addButtonClassName?: string;

  /**
   * Whether to show the search input field in the dropdown.
   * @default true
   */
  showSearch?: boolean;

  /**
   * Whether to show the error message below the select control.
   * @default true
   */
  showErrorMessage?: boolean;

  /**
   * Optional callback called when the value changes.
   * Receives the new value as a parameter.
   */
  onChange?: (value: string) => void;

  /**
   * Whether to disable the select control.
   * @default false
   */
  disabled?: boolean;
}

/**
 * A single-select dropdown component integrated with React Hook Form,
 * built with shadcn-ui Popover + Command for search/filter UX.
 * Supports an optional bottom-row "add" button via props.
 *
 * @template TFieldValues - The shape of your form's data.
 */
export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  searchLabel,
  options,
  placeholder = 'Select...',
  popoverWidthClass = 'w-[200px]',
  className,
  formItemClassName,
  onAddClick,
  addButtonLabel = '+ New Item',
  addButtonClassName,
  showSearch = true,
  onChange,
  disabled = false,
  showErrorMessage = true,
}: FormSelectProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={formItemClassName}>
          {label && <FormLabel>{label}</FormLabel>}
          <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full flex items-center justify-between overflow-hidden whitespace-nowrap',
                    !field.value && 'text-muted-foreground',
                    className
                  )}
                  disabled={disabled}
                >
                  <span className="flex-1 text-left truncate">
                    {field.value
                      ? options.find((o) => o.value === field.value)?.label
                      : placeholder}
                  </span>
                  <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className={cn(popoverWidthClass, 'p-1 w-auto')}
              align="start"
            >
              <Command>
                {showSearch && (
                  <CommandInput
                    placeholder={`Search ${searchLabel}...`}
                    className="h-9"
                  />
                )}
                <CommandList>
                  <CommandEmpty>No {label} found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        onSelect={() => {
                          field.onChange(opt.value);
                          onChange?.(String(opt.value));
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <span className="flex-1">{opt.label}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            field.value === opt.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}

                    {onAddClick && (
                      <>
                        <CommandSeparator className="mb-1" />
                        <CommandItem
                          onSelect={() => {
                            onAddClick();
                            setOpen(false);
                          }}
                          className={cn(
                            'text-primary cursor-pointer',
                            addButtonClassName
                          )}
                        >
                          {addButtonLabel}
                        </CommandItem>
                      </>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {showErrorMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
