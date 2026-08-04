import * as React from 'react';
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import {
  isEmptySingleSelectValue,
  useAutoSelectSingle,
} from '@/hooks/use-auto-select-single';
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

  /**
   * Whether this option is disabled and cannot be selected.
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional badge displayed next to the option label,
   * e.g. to indicate a status such as "Paused".
   */
  badge?: {
    label: string;
    className?: string;
  };
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

  /**
   * Called when the options list is scrolled near the bottom.
   * Use with paginated/infinite option loading.
   */
  onOptionsListScrollEnd?: () => void;

  /** Whether more options can be loaded via `onOptionsListScrollEnd`. */
  hasMoreOptions?: boolean;

  /** Whether a next page of options is currently loading. */
  isLoadingMoreOptions?: boolean;

  /** Called when the dropdown open state changes. */
  onDropdownOpenChange?: (open: boolean) => void;

  /**
   * Controlled search input value. Pair with `onSearchChange` for server-side search.
   */
  searchValue?: string;

  /** Called when the search input changes. */
  onSearchChange?: (value: string) => void;

  /**
   * When true, disables cmdk client-side filtering so options come from the server.
   * Defaults to true when `onSearchChange` is provided.
   */
  serverSideSearch?: boolean;

  /** Whether options are being loaded for the current search query. */
  isSearchingOptions?: boolean;

  /**
   * Auto-select the only option while the field is empty. Pass gates the
   * component can't know (e.g. `!isEditing`); needs `<Form {...form}>`.
   */
  autoSelectForOnlyOneOption?: boolean;
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
  onOptionsListScrollEnd,
  hasMoreOptions = false,
  isLoadingMoreOptions = false,
  onDropdownOpenChange,
  searchValue,
  onSearchChange,
  serverSideSearch,
  isSearchingOptions = false,
  autoSelectForOnlyOneOption = false,
}: Readonly<FormSelectProps<TFieldValues>>) {
  const [open, setOpen] = React.useState(false);
  const useServerSideSearch = serverSideSearch ?? Boolean(onSearchChange);

  // formContext is null without <Form {...form}>; auto-select no-ops then.
  const formContext = useFormContext<TFieldValues>();
  const watchedValue = useWatch({ control, name });
  const selectableOptions = React.useMemo(
    () => options.filter((opt) => !opt.disabled),
    [options],
  );

  useAutoSelectSingle({
    items: selectableOptions,
    enabled:
      autoSelectForOnlyOneOption &&
      !disabled &&
      formContext != null &&
      !hasMoreOptions &&
      !isLoadingMoreOptions &&
      !isSearchingOptions &&
      !(searchValue ?? '').trim(),
    isEmpty: () => isEmptySingleSelectValue(formContext.getValues(name)),
    onSelect: (opt) =>
      formContext.setValue(
        name,
        opt.value as PathValue<TFieldValues, Path<TFieldValues>>,
        { shouldValidate: true, shouldDirty: false, shouldTouch: false },
      ),
    revalidateKey: watchedValue,
  });

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onDropdownOpenChange?.(nextOpen);
    },
    [onDropdownOpenChange],
  );

  const tryLoadMoreOptions = React.useCallback(() => {
    if (
      !open ||
      !onOptionsListScrollEnd ||
      !hasMoreOptions ||
      isLoadingMoreOptions
    ) {
      return;
    }
    onOptionsListScrollEnd();
  }, [open, hasMoreOptions, isLoadingMoreOptions, onOptionsListScrollEnd]);

  const handleOptionsListScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const isScrollable = target.scrollHeight > target.clientHeight + 1;
      const distanceFromBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      if (isScrollable && distanceFromBottom <= 24) {
        tryLoadMoreOptions();
      }
    },
    [tryLoadMoreOptions],
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedOption = options.find(
          (o) => String(o.value) === String(field.value),
        );
        const hasValidSelection =
          field.value != null &&
          field.value !== '' &&
          field.value !== 0 &&
          selectedOption != null;
        const selectedLabel = selectedOption?.label;

        return (
          <FormItem className={formItemClassName}>
            {label && <FormLabel>{label}</FormLabel>}
            <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'w-full flex items-center justify-between overflow-hidden whitespace-nowrap',
                      !hasValidSelection && 'text-muted-foreground',
                      className
                    )}
                    disabled={disabled}
                  >
                    <span className="flex-1 text-left truncate" title={hasValidSelection ? selectedLabel : placeholder}>
                      {hasValidSelection ? selectedLabel : placeholder}
                    </span>
                    <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              {open && (
                <PopoverContent
                  className={cn(popoverWidthClass, 'p-1 w-auto')}
                  align="start"
                >
                  <Command shouldFilter={!useServerSideSearch}>
                    {showSearch && (
                      <CommandInput
                        placeholder={`Search ${searchLabel ?? 'options'}...`}
                        className="h-9"
                        value={searchValue}
                        onValueChange={onSearchChange}
                      />
                    )}
                    <CommandList
                      onScroll={handleOptionsListScroll}
                      onWheel={(event) => event.stopPropagation()}
                    >
                      <CommandEmpty>
                        {isSearchingOptions
                          ? 'Searching...'
                          : `No ${label ?? 'options'} found.`}
                      </CommandEmpty>
                      <CommandGroup>
                        {options.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            value={`${opt.label} __${String(opt.value)}`}
                            disabled={opt.disabled}
                            onSelect={() => {
                              if (opt.disabled) return;
                              field.onChange(opt.value);
                              onChange?.(String(opt.value));
                              handleOpenChange(false);
                            }}
                            className={cn(
                              'cursor-pointer',
                              opt.disabled && 'cursor-not-allowed text-muted-foreground'
                            )}
                          >
                            <span className="flex-1">{opt.label}</span>
                            {opt.badge && (
                              <span
                                className={cn(
                                  'ml-2 rounded-full border px-2 py-0.5 text-xs font-medium',
                                  opt.badge.className
                                )}
                              >
                                {opt.badge.label}
                              </span>
                            )}
                            <Check
                              className={cn(
                                'ml-auto h-4 w-4',
                                String(field.value) === String(opt.value)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}

                        {hasMoreOptions && (
                          <CommandItem
                            value="__load_more_options__"
                            onSelect={tryLoadMoreOptions}
                            disabled={isLoadingMoreOptions}
                            className="justify-center text-primary cursor-pointer"
                          >
                            {isLoadingMoreOptions ? 'Loading more...' : 'Load more...'}
                          </CommandItem>
                        )}

                        {onAddClick && (
                          <>
                            <CommandSeparator className="mb-1" />
                            <CommandItem
                              onSelect={() => {
                                onAddClick();
                                handleOpenChange(false);
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
              )}
            </Popover>
            {showErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
