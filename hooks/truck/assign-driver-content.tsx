'use client';
import * as React from 'react';
import { Search, ChevronsUpDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { DriverDTO } from '@/lib/types/driver';
import { cn } from '@/lib/utils';
import { useAutoSelectSingle } from '@/hooks/use-auto-select-single';

export function AssignDriverDescription({
  driver,
}: Readonly<{
  driver?: DriverDTO | null;
}>) {
  return (
    <div className="flex justify-start items-center gap-2">
      <span className="font-medium">{driver?.driverName}</span>
    </div>
  );
}

export function AssignDriverContent({
  drivers,
  assignedDriverIds = [],
  haulierName,
  onSelectionChange,
}: Readonly<{
  drivers: DriverDTO[];
  assignedDriverIds?: number[];
  /** Haulier name sourced from the truck's haulier — used as the section header. */
  haulierName?: string;
  onSelectionChange?: (ids: number[]) => void;
}>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const availableDrivers = React.useMemo(
    () => drivers.filter((d) => !assignedDriverIds.includes(d.id ?? 0)),
    [drivers, assignedDriverIds],
  );

  const selectableDrivers = React.useMemo(
    () =>
      availableDrivers.filter(
        (d): d is DriverDTO & { id: number } => d.id != null,
      ),
    [availableDrivers],
  );

  // once: deselecting the only driver must not re-check it.
  useAutoSelectSingle({
    items: selectableDrivers,
    once: true,
    isEmpty: () => selectedIds.length === 0,
    onSelect: (driver) => {
      const ids = [driver.id];
      setSelectedIds(ids);
      onSelectionChange?.(ids);
    },
  });

  const filteredDrivers = React.useMemo(
    () =>
      availableDrivers.filter((d) =>
        d.driverName.toLowerCase().includes(search.toLowerCase()),
      ),
    [availableDrivers, search],
  );

  const toggle = (id: number) => {
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(updated);
    onSelectionChange?.(updated);
  };

  const remove = (id: number) => {
    const updated = selectedIds.filter((x) => x !== id);
    setSelectedIds(updated);
    onSelectionChange?.(updated);
  };

  let triggerLabel: string;
  if (selectedIds.length === 0) {
    triggerLabel = 'Select drivers...';
  } else if (selectedIds.length === 1) {
    triggerLabel = availableDrivers.find((d) => d.id === selectedIds[0])?.driverName ?? '1 selected';
  } else {
    triggerLabel = `${selectedIds.length} drivers selected`;
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'w-full flex items-center justify-between',
              selectedIds.length === 0 && 'text-muted-foreground',
            )}
          >
            <span className="flex-1 text-left truncate">{triggerLabel}</span>
            <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0 h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-72 overflow-hidden" align="start">
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 rounded-none shadow-none focus-visible:ring-0 px-0"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredDrivers.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                No drivers found.
              </p>
            ) : (
              <div>
                {haulierName && (
                  <p className="text-xs text-muted-foreground px-4 pt-3 pb-1 font-medium">
                    {haulierName}
                  </p>
                )}
                {filteredDrivers.map((driver) => (
                  <label
                    key={driver.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedIds.includes(driver.id ?? 0)}
                      onCheckedChange={() => toggle(driver.id ?? 0)}
                    />
                    <span className="text-sm font-medium">
                      {driver.driverName}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <>
              <div className="border-t" />
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedIds([]);
                  onSelectionChange?.([]);
                }}
                className="w-full py-2 text-sm text-center text-muted-foreground hover:bg-muted/50 cursor-pointer rounded-none"
              >
                Clear all
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 overflow-y-auto">
          {selectedIds.map((id) => {
            const driver = availableDrivers.find((d) => d.id === id);
            return (
              <Button
                key={id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(id)}
                className="h-auto px-2 py-1 text-sm font-normal gap-1"
              >
                {driver?.driverName ?? id}
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
