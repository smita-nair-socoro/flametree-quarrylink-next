'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { DocketConflictCheckQueryOptions } from '@/lib/api/docket';
import { ConflictingDocket } from '@/lib/types/docket';
import { calculateConvertedQty } from '@/hooks/docket/use-docket-form-state';
import { appendUtcSuffix } from '@/lib/utils/date';
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
import { Spinner } from '@/components/ui/spinner';
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
  onClose?: () => void;
}

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

function ConflictWarning({
  label,
  dockets,
  isLoading,
  onClose,
}: {
  label: string;
  dockets: ConflictingDocket[];
  isLoading?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="small" />
        <span>Checking for conflicts...</span>
      </div>
    );
  }
  if (dockets.length === 0) return null;

  const ids = dockets.map((d) => d.id).join(',');

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
            <span
              className="font-medium underline cursor-pointer text-[#155DFC]"
              onClick={() => {
                onClose?.();
                router.push(`/customer-operations/dockets/?docketId=${ids}`);
              }}
            >
              Conflict Dockets
            </span>
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
  onClose,
}: AssignDocketContentProps) {
  const { data: hauliers = [] } = useQuery(HauliersListQueryOptions());
  const { data: haulierTrucksData } = useQuery(
    HaulierTrucksQueryOptions(haulerSelection ?? 0),
  );
  const { data: haulierDriversData } = useQuery({
    ...HaulierDriversQueryOptions(haulerSelection ?? 0),
    enabled: !!haulerSelection && !!truckSelection,
  });
  const businessName = useClientStore((state) => state.getBusinessName());
  const [haulerOpen, setHaulerOpen] = React.useState(false);

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

  const conflictDates =
    docket?.deliveryCollectionDate &&
    docket.deliveryCollectionStartTime &&
    docket.deliveryCollectionEndTime
      ? {
          deliveryCollectionDate: appendUtcSuffix(
            docket.deliveryCollectionDate,
          ),
          deliveryStartWindow: appendUtcSuffix(
            docket.deliveryCollectionStartTime,
          ),
          deliveryEndWindow: appendUtcSuffix(docket.deliveryCollectionEndTime),
        }
      : null;

  const truckConflictRequest =
    truckSelection && conflictDates
      ? { truckId: truckSelection, ...conflictDates }
      : null;

  const driverConflictRequest =
    driverSelection && conflictDates
      ? { driverId: driverSelection, ...conflictDates }
      : null;

  const { data: truckConflictData, isFetching: isTruckConflictPending } =
    useQuery(DocketConflictCheckQueryOptions(docket?.id, truckConflictRequest));

  const { data: driverConflictData, isFetching: isDriverConflictPending } =
    useQuery(
      DocketConflictCheckQueryOptions(docket?.id, driverConflictRequest),
    );

  const truckConflicts: ConflictingDocket[] = (
    truckConflictData?.hasConflicts
      ? truckConflictData.conflictingDocketIds
      : []
  ).filter((d) => d.docketStatus !== DOCKET_STATUS.DELIVERED);

  const driverConflicts: ConflictingDocket[] = (
    driverConflictData?.hasConflicts
      ? driverConflictData.conflictingDocketIds
      : []
  ).filter((d) => d.docketStatus !== DOCKET_STATUS.DELIVERED);

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

      <ConflictWarning
        label="truck"
        dockets={truckConflicts}
        isLoading={isTruckConflictPending}
        onClose={onClose}
      />

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

      <ConflictWarning
        label="driver"
        dockets={driverConflicts}
        isLoading={isDriverConflictPending}
        onClose={onClose}
      />
    </div>
  );
}
