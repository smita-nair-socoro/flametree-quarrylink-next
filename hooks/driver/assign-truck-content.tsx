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

export type TruckOption = {
  id: number;
  licensePlate: string;
  haulierName?: string;
};

export function AssignTruckDescription({ driver }: { driver?: DriverDTO | null }) {
  return (
    <div className="flex justify-start items-center gap-2">
      <span className="font-medium">{driver?.driverName}</span>
    </div>
  );
}

export function AssignTruckContent({
  trucks,
  onSelectionChange,
}: {
  trucks: TruckOption[];
  onSelectionChange?: (ids: number[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const groups = React.useMemo(() => {
    const filtered = trucks.filter((t) =>
      t.licensePlate.toLowerCase().includes(search.toLowerCase()),
    );
    const map = new Map<string, TruckOption[]>();
    for (const truck of filtered) {
      const group = truck.haulierName ?? 'Trucks';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(truck);
    }
    return map;
  }, [trucks, search]);

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

  const triggerLabel =
    selectedIds.length === 0
      ? 'Select trucks...'
      : selectedIds.length === 1
        ? (trucks.find((t) => t.id === selectedIds[0])?.licensePlate ?? '1 selected')
        : `${selectedIds.length} trucks selected`;

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

        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)] overflow-hidden"
          align="start"
        >
          <div className="relative border-b">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trucks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-0 rounded-none shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {groups.size === 0 ? (
              <p className="text-sm text-muted-foreground p-4">No trucks found.</p>
            ) : (
              Array.from(groups.entries()).map(([haulierName, groupTrucks]) => (
                <div key={haulierName}>
                  <p className="text-xs text-muted-foreground px-4 pt-3 pb-1 font-medium">
                    {haulierName}
                  </p>
                  {groupTrucks.map((truck) => (
                    <label
                      key={truck.id}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedIds.includes(truck.id)}
                        onCheckedChange={() => toggle(truck.id)}
                      />
                      <span className="text-sm font-medium">{truck.licensePlate}</span>
                    </label>
                  ))}
                </div>
              ))
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

      {/* Selected badges */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const truck = trucks.find((t) => t.id === id);
            return (
              <Button
                key={id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(id)}
                className="h-auto px-2 py-1 text-sm font-normal gap-1"
              >
                {truck?.licensePlate ?? id}
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
