'use client';
import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DriverDTO } from '@/lib/types/driver';

export type TruckOption = {
  id: number;
  registration: string;
  groupName?: string;
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
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const groups = React.useMemo(() => {
    const filtered = trucks.filter((t) =>
      t.registration.toLowerCase().includes(search.toLowerCase()),
    );
    const map = new Map<string, TruckOption[]>();
    for (const truck of filtered) {
      const group = truck.groupName ?? 'Trucks';
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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trucks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-md overflow-hidden">
        {groups.size === 0 ? (
          <p className="text-sm text-muted-foreground p-4">No trucks found.</p>
        ) : (
          Array.from(groups.entries()).map(([groupName, groupTrucks]) => (
            <div key={groupName}>
              <p className="text-xs text-muted-foreground px-4 pt-3 pb-1 font-medium">
                {groupName}
              </p>
              {groupTrucks.map((truck) => (
                <label
                  key={truck.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedIds.includes(truck.id)}
                    onCheckedChange={() => toggle(truck.id)}
                  />
                  <span className="text-sm font-medium">{truck.registration}</span>
                </label>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
