import * as React from 'react';
import { CheckIcon, ChevronDown, XIcon, WandSparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  options: MultiSelectOption[];
  onValueChange: (values: string[]) => void;
  /** Controlled selected values (if you want controlled mode) */
  value?: string[];
  /** Uncontrolled default selected values */
  defaultValue?: string[];
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Animation duration in seconds */
  animation?: number;
  /** How many to show before “+N more” */
  maxCount?: number;
  /** If true, popover is modal */
  modalPopover?: boolean;
  /** When true (default), wraps trigger */
  asChild?: boolean;
  onAddClick?: () => void;
  addButtonLabel?: string;
  addButtonClassName?: string;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      value,
      defaultValue = [],
      placeholder = 'Select options',
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = true,
      className,
      onAddClick,
      addButtonLabel = '',
      addButtonClassName,
      ...props
    },
    ref,
  ) => {
    // Uncontrolled internal state
    const [internalValues, setInternalValues] =
      React.useState<string[]>(defaultValue);

    // Controlled vs uncontrolled
    const selectedValues = value ?? internalValues;

    const updateValues = (next: string[]) => {
      onValueChange(next);
      if (value === undefined) {
        setInternalValues(next);
      }
    };

    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === 'Enter') setIsPopoverOpen(true);
      else if (event.key === 'Backspace' && !event.currentTarget.value) {
        updateValues(selectedValues.slice(0, -1));
      }
    };

    const toggleOption = (opt: string) => {
      const next = selectedValues.includes(opt)
        ? selectedValues.filter((v) => v !== opt)
        : [...selectedValues, opt];
      updateValues(next);
    };

    const clearAll = () => updateValues([]);
    const clearExtra = () => updateValues(selectedValues.slice(0, maxCount));
    const toggleAll = () => {
      if (selectedValues.length === options.length) clearAll();
      else updateValues(options.map((o) => o.value));
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild={asChild}>
          <Button
            ref={ref}
            {...props}
            onClick={() => setIsPopoverOpen((o) => !o)}
            className={cn(
              'flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto',
              className,
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedValues.slice(0, maxCount).map((v) => {
                    const opt = options.find((o) => o.value === v);
                    return (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(v);
                        }}
                      >
                        <span className="font-medium">{opt?.label}</span>
                        <XIcon
                          className="h-4 w-4 cursor-pointer text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOption(v);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium cursor-pointer',
                        isAnimating ? 'animate-bounce' : '',
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      +{selectedValues.length - maxCount} more
                      <XIcon
                        className="h-4 w-4 cursor-pointer text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearExtra();
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={() => clearAll()}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search..."
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={toggleAll} className="cursor-pointer">
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selectedValues.length === options.length
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible',
                    )}
                  >
                    <CheckIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  (Select All)
                </CommandItem>
                {options.map((opt) => {
                  const isSel = selectedValues.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => toggleOption(opt.value)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSel
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible',
                        )}
                      >
                        <CheckIcon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      {opt.icon && (
                        <opt.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{opt.label}</span>
                    </CommandItem>
                  );
                })}
                <CommandSeparator className="mb-1" />
                {onAddClick && (
                  <CommandItem
                    onSelect={() => {
                      setIsPopoverOpen(false);
                      onAddClick();
                    }}
                    className={cn(
                      'justify-start text-primary cursor-pointer flex-1',
                      addButtonClassName,
                    )}
                  >
                    {addButtonLabel}
                  </CommandItem>
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => setIsPopoverOpen(false)}
                  className="flex-1 justify-center cursor-pointer max-w-full"
                >
                  Close
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              'cursor-pointer my-2 text-foreground bg-background w-3 h-3',
              isAnimating ? '' : 'text-muted-foreground',
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';
