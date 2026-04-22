'use client';

import * as React from 'react';
import { Truck, AlertTriangle, ChevronsUpDown, Check } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';
import { SelectOptions } from '@/components/ui/select-options';
import { useQuery } from '@tanstack/react-query';
import { HauliersListQueryOptions } from '@/lib/api/haulier';
import { TrucksListQueryOptions } from '@/lib/api/truck';
import { DriversListQueryOptions } from '@/lib/api/driver';
import { useClientStore } from '@/app/stores/client-store';
import { DocketsListQueryOptions } from '@/lib/api/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface AssignDocketFormState {
  haulerSelection: number | undefined;
  truckSelection: number | undefined;
  driverSelection: number | undefined;
}

interface ConflictingDocket {
  id: number;
  docketNumber: string;
}

interface AssignDocketContentProps extends AssignDocketFormState {
  docket?: DocketDTO | null;
  onHaulerChange: (value: number) => void;
  onTruckChange: (value: number) => void;
  onDriverChange: (value: number) => void;
}

export function AssignDocketDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
        <Truck className="h-6 w-6 text-[#3B82F6]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6A7282]">
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          {docket?.loadSize != null && (
            <>
              <span className="font-bold">•</span>
              <span>
                {docket.loadSize} {docket.jobItem?.productSellUom}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AssignDocketContent({
  docket,
  haulerSelection,
  truckSelection,
  driverSelection,
  onHaulerChange,
  onTruckChange,
  onDriverChange,
}: AssignDocketContentProps) {
  const { data: hauliers = [] } = useQuery(HauliersListQueryOptions());
  const { data: allTrucks = [] } = useQuery(TrucksListQueryOptions());
  const { data: allDrivers = [] } = useQuery(DriversListQueryOptions());
  const { data: docketsData } = useQuery(DocketsListQueryOptions());
  const allDockets: DocketDTO[] = React.useMemo(() => {
    if (!docketsData) return [];
    if (Array.isArray(docketsData)) return docketsData;
    return (docketsData as { content: DocketDTO[] }).content ?? [];
  }, [docketsData]);
  const tenantName = useClientStore((state) => state.getTenantName());

  const [haulerOpen, setHaulerOpen] = React.useState(false);

  const internalHaulier = hauliers.find((h) => h.haulierName === tenantName);

  const internalOptions = React.useMemo(
    () =>
      internalHaulier
        ? [{ label: `${internalHaulier.haulierName} (Internal)`, value: internalHaulier.id }]
        : [],
    [internalHaulier],
  );

  const externalOptions = React.useMemo(
    () =>
      hauliers
        .filter((h) => h.haulierName !== tenantName)
        .map((h) => ({ label: h.haulierName, value: h.id })),
    [hauliers, tenantName],
  );

  const allHaulerOptions = React.useMemo(
    () => [...internalOptions, ...externalOptions],
    [internalOptions, externalOptions],
  );

  const selectedHaulerLabel = allHaulerOptions.find((o) => o.value === haulerSelection)?.label;

  const truckOptions = React.useMemo(() => {
    if (!haulerSelection) return [];
    return allTrucks
      .filter((t) => t.haulierId === haulerSelection && t.id != null)
      .map((t) => ({
        label: `${t.licensePlate}${t.model ? ` / ${t.model}` : ''}`,
        value: t.id as number,
      }));
  }, [allTrucks, haulerSelection]);

  const driverOptions = React.useMemo(() => {
    if (!truckSelection) return [];
    return allDrivers
      .filter(
        (d) =>
          d.id != null &&
          (d.truckIds?.includes(truckSelection) ||
            d.trucks?.some((t) => t.id === truckSelection)),
      )
      .map((d) => ({
        label: d.driverName,
        value: d.id as number,
      }));
  }, [allDrivers, truckSelection]);

  const conflictingDockets = React.useMemo<ConflictingDocket[]>(() => {
    if (!docket) return [];
    const docketDate = docket.deliveryCollectionDate
      ? new Date(docket.deliveryCollectionDate).toDateString()
      : null;
    if (!docketDate) return [];

    return allDockets.filter((d) => {
      if (d.id === docket.id) return false;
      if (
        d.docketStatus === DOCKET_STATUS.VOIDED ||
        d.docketStatus === DOCKET_STATUS.CANCELLED
      )
        return false;

      const sameDate =
        d.deliveryCollectionDate &&
        new Date(d.deliveryCollectionDate).toDateString() === docketDate;

      const truckMatch = truckSelection && d.truckId === truckSelection;
      const driverMatch = driverSelection && d.driverId === driverSelection;

      return sameDate && (truckMatch || driverMatch);
    }) as ConflictingDocket[];
  }, [allDockets, docket, truckSelection, driverSelection]);

  const hasConflict = conflictingDockets.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>Hauler</Label>
        <Popover open={haulerOpen} onOpenChange={setHaulerOpen} modal>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                'w-full flex items-center justify-between overflow-hidden whitespace-nowrap',
                !haulerSelection && 'text-muted-foreground',
              )}
            >
              <span className="flex-1 text-left truncate">
                {selectedHaulerLabel ?? 'Select hauler...'}
              </span>
              <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-1 w-[var(--radix-popover-trigger-width)]" align="start">
            <Command>
              <CommandInput placeholder="Search hauliers..." className="h-9" />
              <CommandList>
                <CommandEmpty>No hauliers found.</CommandEmpty>
                {internalOptions.length > 0 && (
                  <CommandGroup heading="Internal">
                    {internalOptions.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        onSelect={() => {
                          onHaulerChange(opt.value);
                          onTruckChange(undefined as unknown as number);
                          onDriverChange(undefined as unknown as number);
                          setHaulerOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <span className="flex-1">{opt.label}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            haulerSelection === opt.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {externalOptions.length > 0 && (
                  <CommandGroup heading="External">
                    {externalOptions.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        onSelect={() => {
                          onHaulerChange(opt.value);
                          onTruckChange(undefined as unknown as number);
                          onDriverChange(undefined as unknown as number);
                          setHaulerOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <span className="flex-1">{opt.label}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            haulerSelection === opt.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <SelectOptions
        label="Truck"
        searchLabel="truck"
        options={truckOptions}
        value={truckSelection}
        onChange={(v) => {
          onTruckChange(v as number);
          onDriverChange(undefined as unknown as number);
        }}
        placeholder="Search trucks..."
        popoverWidthClass="w-full"
        disabled={!haulerSelection}
      />

      <SelectOptions
        label="Driver"
        searchLabel="driver"
        options={driverOptions}
        value={driverSelection}
        onChange={(v) => onDriverChange(v as number)}
        placeholder="Search drivers..."
        popoverWidthClass="w-full"
        disabled={!truckSelection}
      />

      {hasConflict && (
        <div className="rounded-md border border-amber-400 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-amber-800">
                Potential scheduling conflict detected
              </span>
              <span className="text-xs text-amber-700">
                The selected truck or driver is already assigned to another
                docket for the same date. You may still assign this docket.
              </span>
              <div className="mt-1 flex flex-wrap gap-1 text-xs">
                <span className="text-amber-700">Conflicting dockets:</span>
                {conflictingDockets.map((cd, i) => (
                  <span key={cd.id} className="text-blue-600 underline cursor-pointer">
                    {cd.docketNumber}
                    {i < conflictingDockets.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
