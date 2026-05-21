'use client';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ChevronsUpDown, Plus } from 'lucide-react';

export interface SelectCreateEditItem {
  id: number | string;
  label: string;
  fields?: Record<string, string>;
}

interface SelectCreateEditProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  entityName: string;
  searchPlaceholder?: string;
  selectPlaceholder?: string;
  items: SelectCreateEditItem[];
  disabled?: boolean;
  renderForm: (
    editingItem: SelectCreateEditItem | null,
    isEditing: boolean,
    onSave: (item: SelectCreateEditItem) => void,
    onCancel: () => void,
  ) => React.ReactNode;
}

export function SelectCreateEdit<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  entityName,
  searchPlaceholder,
  selectPlaceholder,
  items: initialItems,
  disabled = false,
  renderForm,
}: SelectCreateEditProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] =
    React.useState<SelectCreateEditItem[]>(initialItems);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] =
    React.useState<SelectCreateEditItem | null>(null);

  function openAdd() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function openEdit(item: SelectCreateEditItem, e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    setEditingItem(item);
    setDialogOpen(true);
  }

  function handleSave(item: SelectCreateEditItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [...prev, item];
    });
    setDialogOpen(false);
  }

  const isEditing = Boolean(editingItem);

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const selected = items.find((i) => i.id === field.value);

          return (
            <FormItem>
              {label && <FormLabel>{label}</FormLabel>}
              <Popover open={open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    aria-invalid={!!fieldState.error}
                    className={cn(
                      'w-full flex items-center justify-between',
                      !selected && 'text-muted-foreground',
                    )}
                  >
                    <span className="flex-1 text-left truncate">
                      {selected
                        ? selected.label
                        : (selectPlaceholder ??
                          `Search or Select ${entityName}...`)}
                    </span>
                    <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="p-1 w-[var(--radix-popover-trigger-width)]"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder={
                        searchPlaceholder ?? `Search ${entityName}...`
                      }
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>
                        No {entityName.toLowerCase()} found.
                      </CommandEmpty>
                      <CommandGroup>
                        {items.map((item) => {
                          let clickedEdit = false;
                          return (
                            <CommandItem
                              key={item.id}
                              value={item.label}
                              onSelect={() => {
                                if (clickedEdit) return;
                                field.onChange(item.id);
                                setOpen(false);
                              }}
                              className="cursor-pointer flex items-center justify-between"
                            >
                              <span>{item.label}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onMouseDown={() => {
                                  clickedEdit = true;
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(item, e);
                                }}
                                className="cursor-pointer"
                              >
                                Edit
                              </Button>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>

                      <CommandSeparator />

                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setOpen(false);
                            openAdd();
                          }}
                          className="cursor-pointer text-violet-600 gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add new {entityName}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => !v && setDialogOpen(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isEditing ? `Edit ${entityName}` : `Add New ${entityName}`}
            </DialogTitle>
          </DialogHeader>
          {renderForm(editingItem, isEditing, handleSave, () =>
            setDialogOpen(false),
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
