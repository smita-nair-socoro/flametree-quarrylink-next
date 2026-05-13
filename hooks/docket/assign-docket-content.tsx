'use client';

import * as React from 'react';
import { UserPlus, AlertTriangle, ChevronsUpDown, Check } from 'lucide-react';
import { DocketDTO } from '@/lib/types/docket';
import { SelectOptions } from '@/components/ui/select-options';
import {
  ColorSelect,
  type ColorSelectOption,
} from '@/components/ui/color-select';
import { useQuery } from '@tanstack/react-query';
import {
  HauliersListQueryOptions,
  HaulierTrucksQueryOptions,
  HaulierDriversQueryOptions,
} from '@/lib/api/haulier';
import { useClientStore } from '@/app/stores/client-store';
import { DocketsListQueryOptions } from '@/lib/api/docket';
import { calculateConvertedQty } from '@/hooks/docket/use-docket-form-state';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface AssignDocketFormState {
  haulerSelection: number | undefined;
  truckSelection: number | undefined;
  driverSelection: number | undefined;
}

interface AssignDocketContentProps extends AssignDocketFormState {
  docket?: DocketDTO | null;
  onHaulerChange: (value: number) => void;
  onTruckChange: (value: number) => void;
  onDriverChange: (value: number) => void;
}

type ConflictDocket = { id: number; docketNumber: string };

// Per-truck conflict slots: for each available truck, two pre-assigned dockets are generated
// covering these time windows. Conflicts are visible regardless of which haulier is selected.
const MOCK_CONFLICT_SLOTS = [
  { slotIndex: 0, docketSuffix: 'A', startTime: '00:00', endTime: '23:59' },
  { slotIndex: 1, docketSuffix: 'B', startTime: '00:00', endTime: '23:59' },
];

type TruckStatusConfig = {
  badge: string;
  pctColor: string;
  rowStyle: React.CSSProperties;
  badgeStyle: React.CSSProperties;
};

function getTruckStatusConfig(pct: number): TruckStatusConfig {
  if (pct > 100)
    return {
      badge: 'Exceeds limit',
      pctColor: '#973C00',
      rowStyle: { backgroundColor: '#FEF3F3', borderColor: '#FECACA' },
      badgeStyle: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FECACA',
        color: '#86363B',
      },
    };
  if (pct < 80)
    return {
      badge: 'Under capacity',
      pctColor: '#973C00',
      rowStyle: { backgroundColor: '#FFFBEBE5', borderColor: '#FEF3C6E5' },
      badgeStyle: {
        backgroundColor: '#FEF3C6E5',
        borderColor: '#FEE685CC',
        color: '#7B3306',
      },
    };
  return {
    badge: 'Most efficient fit',
    pctColor: '#007A55',
    rowStyle: { backgroundColor: '#ECFDF5F2', borderColor: '#D0FAE5' },
    badgeStyle: {
      backgroundColor: '#D0FAE5E5',
      borderColor: '#A4F4CFCC',
      color: '#006045',
    },
  };
}

function toMinutes(time: string): number {
  // Handle both "HH:MM" and ISO datetime "YYYY-MM-DDTHH:MM:SS"
  const timePart = time.includes('T') ? time.split('T')[1] : time;
  const [h, m] = timePart.split(':').map(Number);
  return h * 60 + m;
}

function windowsOverlap(
  s1: string,
  e1: string,
  s2: string,
  e2: string,
): boolean {
  return toMinutes(s1) < toMinutes(e2) && toMinutes(s2) < toMinutes(e1);
}

function ConflictWarning({
  label,
  dockets,
}: {
  label: string;
  dockets: ConflictDocket[];
}) {
  if (dockets.length === 0) return null;
  return (
    <div className="rounded-md border border-amber-400 bg-amber-50 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-[#461901]">
            Potential scheduling conflict detected
          </span>
          <span className="text-xs text-[#973C00F2]">
            Another docket is already assigned to this {label} for the same date
            and time. You can still assign this docket.
          </span>
          <div
            className="rounded-md border px-3 py-2 text-xs"
            style={{
              backgroundColor: '#FFF7ED',
              borderColor: '#FFD6A7',
              color: '#364153',
            }}
          >
            <span className="font-medium">Conflicting dockets: </span>
            {dockets.map((cd, i) => (
              <span key={cd.id}>
                <span
                  className="underline cursor-pointer"
                  style={{ color: '#155DFC' }}
                >
                  {cd.docketNumber}
                </span>
                {i < dockets.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssignDocketDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
        <UserPlus className="h-6 w-6 text-[#193CB8]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6A7282]">
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          <span className="font-bold">•</span>
          <span>
            {docket?.actualLoadSize || docket?.plannedLoadSize}
            {docket?.jobItem?.productSellUom}
          </span>
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
  const { data: docketsData } = useQuery(DocketsListQueryOptions());
  const { data: haulierTrucksData } = useQuery(
    HaulierTrucksQueryOptions(haulerSelection ?? 0),
  );
  const { data: haulierDriversData } = useQuery({
    ...HaulierDriversQueryOptions(haulerSelection ?? 0),
    enabled: !!haulerSelection && !!truckSelection,
  });
  const businessName = useClientStore((state) => state.getBusinessName());
  const [haulerOpen, setHaulerOpen] = React.useState(false);

  const allDockets: DocketDTO[] = React.useMemo(() => {
    if (!docketsData) return [];
    if (Array.isArray(docketsData)) return docketsData;
    return (docketsData as { content: DocketDTO[] }).content ?? [];
  }, [docketsData]);

  const availableTrucks = React.useMemo(
    () =>
      (haulierTrucksData?.trucks ?? [])
        .filter((t) => t.id !== undefined)
        .map((t) => ({
          id: t.id as number,
          haulierId: t.haulierId,
          licensePlate: t.licensePlate,
          capacityM3: t.tankVolumeM3 ?? 0,
        })),
    [haulierTrucksData],
  );

  const availableDrivers = React.useMemo(
    () =>
      (haulierDriversData?.drivers ?? [])
        .filter((d) => d.id !== undefined)
        .map((d) => ({
          id: d.id as number,
          driverName: d.driverName,
          truckIds: (d.trucks ?? []).map((t) => t.id),
        })),
    [haulierDriversData],
  );

  // Dummy pre-assigned dockets for delivery window conflict demonstration.
  // One conflict docket is generated per truck (first driver of that truck) so conflicts
  // are visible no matter which haulier the user selects.
  const mockAssignedDockets = React.useMemo(() => {
    if (availableTrucks.length === 0 || availableDrivers.length === 0)
      return [];
    const conflictDate = docket?.deliveryCollectionDate
      ? new Date(docket.deliveryCollectionDate)
      : new Date();
    return availableTrucks.flatMap((truck, ti) => {
      const driver = availableDrivers.find((d) =>
        d.truckIds.includes(truck.id),
      );
      if (!driver) return [];
      return MOCK_CONFLICT_SLOTS.map((slot) => ({
        id: -(ti * 10 + slot.slotIndex + 1),
        docketNumber: `DO-${2340 + ti * 2 + slot.slotIndex}${slot.docketSuffix}`,
        truckId: truck.id,
        driverId: driver.id,
        deliveryCollectionDate: conflictDate,
        deliveryCollectionStartTime: slot.startTime,
        deliveryCollectionEndTime: slot.endTime,
        docketStatus: DOCKET_STATUS.ASSIGNED,
      }));
    });
  }, [availableTrucks, availableDrivers, docket?.deliveryCollectionDate]);

  const internalOptions = React.useMemo(() => {
    const h = hauliers.find((h) => h.haulierName === businessName);
    return h ? [{ label: `${h.haulierName} (Internal)`, value: h.id }] : [];
  }, [hauliers, businessName]);

  const externalOptions = React.useMemo(
    () =>
      hauliers
        .filter((h) => h.haulierName !== businessName)
        .map((h) => ({ label: h.haulierName, value: h.id })),
    [hauliers, businessName],
  );

  const selectedHaulerLabel = [...internalOptions, ...externalOptions].find(
    (o) => o.value === haulerSelection,
  )?.label;

  const loadSize = docket?.plannedLoadSize ?? docket?.loadSize ?? 0;
  const loadSizeM3 = React.useMemo(() => {
    const density = docket?.jobItem?.product?.densityTonnagePerM3 || 1;
    const uom = docket?.jobItem?.productSellUom ?? 'M3';
    return calculateConvertedQty(loadSize, uom, 'M3', density);
  }, [
    loadSize,
    docket?.jobItem?.product?.densityTonnagePerM3,
    docket?.jobItem?.productSellUom,
  ]);

  const truckColorOptions = React.useMemo((): ColorSelectOption[] => {
    if (!haulerSelection) return [];
    const withPct = availableTrucks
      .filter((t) => t.haulierId === haulerSelection)
      .map((t) => {
        const pct =
          t.capacityM3 > 0 ? Math.round((loadSizeM3 / t.capacityM3) * 100) : 0;
        const cfg = getTruckStatusConfig(pct);
        return {
          pct,
          option: {
            label: t.licensePlate,
            value: t.id,
            sublabel: (
              <span>
                · {t.capacityM3}M³{' '}
                <span style={{ color: cfg.pctColor }}>({pct}%)</span>
              </span>
            ),
            badge: cfg.badge,
            rowStyle: cfg.rowStyle,
            badgeStyle: cfg.badgeStyle,
          },
        };
      });
    withPct.sort((a, b) => {
      const aEx = a.pct > 100,
        bEx = b.pct > 100;
      if (aEx && bEx) return a.pct - b.pct;
      if (aEx) return 1;
      if (bEx) return -1;
      return b.pct - a.pct;
    });
    return withPct.map(({ option }) => option);
  }, [availableTrucks, haulerSelection, loadSizeM3]);

  const driverOptions = React.useMemo(
    () =>
      !truckSelection
        ? []
        : availableDrivers
            .filter((d) => d.truckIds.includes(truckSelection))
            .map((d) => ({ label: d.driverName, value: d.id })),
    [availableDrivers, truckSelection],
  );

  // Combine real API dockets and mock assigned dockets for conflict detection
  const candidateDockets = React.useMemo(() => {
    const realFiltered = allDockets.filter(
      (d) =>
        d.id !== docket?.id &&
        d.docketStatus !== DOCKET_STATUS.VOIDED &&
        d.docketStatus !== DOCKET_STATUS.CANCELLED,
    );
    return [...realFiltered, ...mockAssignedDockets] as Array<{
      id: number;
      docketNumber: string;
      truckId: number;
      driverId: number;
      deliveryCollectionDate: Date;
      deliveryCollectionStartTime: string;
      deliveryCollectionEndTime: string;
    }>;
  }, [allDockets, mockAssignedDockets, docket?.id]);

  const { truckConflicts, driverConflicts } = React.useMemo<{
    truckConflicts: ConflictDocket[];
    driverConflicts: ConflictDocket[];
  }>(() => {
    if (!truckSelection && !driverSelection)
      return { truckConflicts: [], driverConflicts: [] };

    const docketDate = docket?.deliveryCollectionDate
      ? new Date(docket.deliveryCollectionDate).toDateString()
      : null;
    const docketStart = docket?.deliveryCollectionStartTime;
    const docketEnd = docket?.deliveryCollectionEndTime;

    const truckConflicts: ConflictDocket[] = [];
    const driverConflicts: ConflictDocket[] = [];

    for (const d of candidateDockets) {
      if (docketDate && d.deliveryCollectionDate) {
        if (new Date(d.deliveryCollectionDate).toDateString() !== docketDate)
          continue;
      }

      const hasTimeOverlap =
        docketStart &&
        docketEnd &&
        d.deliveryCollectionStartTime &&
        d.deliveryCollectionEndTime
          ? windowsOverlap(
              docketStart,
              docketEnd,
              d.deliveryCollectionStartTime,
              d.deliveryCollectionEndTime,
            )
          : true;

      if (!hasTimeOverlap) continue;

      const entry = { id: d.id, docketNumber: d.docketNumber };
      if (truckSelection && d.truckId === truckSelection)
        truckConflicts.push(entry);
      if (driverSelection && d.driverId === driverSelection)
        driverConflicts.push(entry);
    }

    return { truckConflicts, driverConflicts };
  }, [candidateDockets, docket, truckSelection, driverSelection]);

  function selectHauler(value: number) {
    onHaulerChange(value);
    onTruckChange(undefined as unknown as number);
    onDriverChange(undefined as unknown as number);
    setHaulerOpen(false);
  }

  const exceedsLimit =
    truckColorOptions.find((o) => o.value === truckSelection)?.badge ===
    'Exceeds limit';

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>Hauler*</Label>
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
          <PopoverContent
            className="p-1 w-[var(--radix-popover-trigger-width)]"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search hauliers..." className="h-9" />
              <CommandList>
                <CommandEmpty>No hauliers found.</CommandEmpty>
                {[
                  { heading: 'Internal', opts: internalOptions },
                  { heading: 'External', opts: externalOptions },
                ].map(
                  ({ heading, opts }) =>
                    opts.length > 0 && (
                      <CommandGroup key={heading} heading={heading}>
                        {opts.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            onSelect={() => selectHauler(opt.value)}
                            className="cursor-pointer"
                          >
                            <span className="flex-1">{opt.label}</span>
                            <Check
                              className={cn(
                                'ml-auto h-4 w-4',
                                haulerSelection === opt.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ),
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <ColorSelect
        label="Truck*"
        searchPlaceholder="Search trucks..."
        options={truckColorOptions}
        value={truckSelection}
        onChange={(v) => {
          onTruckChange(v as number);
          onDriverChange(undefined as unknown as number);
        }}
        placeholder="Search trucks..."
        disabled={!haulerSelection}
        extra={
          exceedsLimit && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900 text-sm">
                  Load size exceeds truck limit
                </p>
                <p className="text-yellow-800 text-sm mt-0.5">
                  The load size of the docket exceeds the limit of this truck.
                  Please go back to the docket form and update the load size in
                  order to select this truck.
                </p>
              </div>
            </div>
          )
        }
      />

      <ConflictWarning label="truck" dockets={truckConflicts} />

      <SelectOptions
        label="Driver*"
        searchLabel="driver"
        options={driverOptions}
        value={driverSelection}
        onChange={(v) => onDriverChange(v as number)}
        placeholder="Search drivers..."
        popoverWidthClass="w-full"
        disabled={!truckSelection}
      />

      <ConflictWarning label="driver" dockets={driverConflicts} />
    </div>
  );
}
