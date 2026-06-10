'use client';

import * as React from 'react';
import { format, startOfDay } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Clock,
  Truck,
  User,
  X,
} from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DeliveriesCalendar } from '@/components/ui/deliveries-calendar';
import { TableBadges } from '@/components/table-badges';
import { cn } from '@/lib/utils';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import type {
  DispatchDriverResource,
  DispatchTruckResource,
} from '@/lib/types/docket';
import {
  DispatchDocket,
  formatDispatchProductSellUomLabel,
  formatDispatchTruckFillPct,
  formatTime,
  formatTimeRange,
  isGenericDispatchTruck,
  loadVolumeM3FromProductSellUom,
} from '@/lib/utils/dispatch-helper';

const HOUR_OPTIONS = [
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
] as const;

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function addHoursToTime(time: string, hours: number) {
  const total = timeToMinutes(time) + hours * 60;
  const clamped = Math.min(total, timeToMinutes('23:59'));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function defaultEndTime(start: string, docket?: DispatchDocket) {
  const fromDocket = docket
    ? formatTime(docket.deliveryCollectionEndTime)
    : '';
  if (fromDocket && timeToMinutes(fromDocket) > timeToMinutes(start)) {
    return fromDocket;
  }
  return addHoursToTime(start, 2);
}

function buildTrucksWithStats(
  docket: DispatchDocket,
  trucks: DispatchTruckResource[],
) {
  const docketVol = loadVolumeM3FromProductSellUom(
    docket.actualLoadSize || docket.plannedLoadSize || 0,
    docket.productSellUom || 'TN',
    docket.productDensity || 1,
  );

  return trucks
    .map((t) => {
      const isGeneric = isGenericDispatchTruck(t);
      const truckVol = t.tankVolumeM3 || 0;
      const fillPct = truckVol > 0 ? (docketVol / truckVol) * 100 : 0;
      const isOverVolume =
        !isGeneric && truckVol > 0 && docketVol > truckVol;

      return { ...t, fillPct, isOverVolume, isGeneric, truckVol };
    })
    .sort((a, b) => {
      if (a.isOverVolume && !b.isOverVolume) return 1;
      if (!a.isOverVolume && b.isOverVolume) return -1;
      if (!a.isOverVolume && !b.isOverVolume) return b.fillPct - a.fillPct;
      return a.fillPct - b.fillPct;
    });
}

export type MobileAssignSlot = {
  assignmentDate: Date;
  startTime: string;
  endTime: string;
};

export function MobileAssignPickerDrawer({
  open,
  mode,
  docket,
  boardDate,
  trucks,
  drivers,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  mode: 'truck' | 'driver' | null;
  docket: DispatchDocket | null;
  boardDate: Date;
  trucks: DispatchTruckResource[];
  drivers: DispatchDriverResource[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (resourceId: string, slot: MobileAssignSlot) => void;
}) {
  const [assignmentDate, setAssignmentDate] = React.useState(boardDate);
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('11:00');
  const [dateOpen, setDateOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open || !docket) return;
    setAssignmentDate(boardDate);
    const start =
      formatTime(docket.deliveryCollectionStartTime) || '09:00';
    setStartTime(start);
    setEndTime(defaultEndTime(start, docket));
  }, [open, docket, boardDate]);

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (timeToMinutes(endTime) <= timeToMinutes(value)) {
      const nextEnd = HOUR_OPTIONS.find(
        (t) => timeToMinutes(t) > timeToMinutes(value),
      );
      if (nextEnd) setEndTime(nextEnd);
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    if (timeToMinutes(startTime) >= timeToMinutes(value)) {
      const nextStart = [...HOUR_OPTIONS]
        .reverse()
        .find((t) => timeToMinutes(t) < timeToMinutes(value));
      if (nextStart) setStartTime(nextStart);
    }
  };

  const trucksWithStats = React.useMemo(
    () => (docket ? buildTrucksWithStats(docket, trucks) : []),
    [docket, trucks],
  );

  const loadLabel = docket
    ? `${formatNumberThousandSeparator(
      docket.actualLoadSize || docket.plannedLoadSize || 0,
    )} ${formatDispatchProductSellUomLabel(docket.productSellUom)}`
    : '';

  const windowHint = `Will create window: ${startTime} – ${endTime}`;

  const handleClose = () => onOpenChange(false);

  const confirmSlot: MobileAssignSlot = {
    assignmentDate: startOfDay(assignmentDate),
    startTime,
    endTime,
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="mt-0 flex h-[100dvh] max-h-[100dvh] flex-col gap-0 overflow-hidden p-0"
      >
        <div className="shrink-0 bg-[#8E51FF] px-4 pb-5 pt-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold">
                {mode === 'truck' ? 'Pick a truck' : 'Pick a driver'}
              </h2>
              {docket ? (
                <>
                  <p className="mt-1 text-sm text-white/90">
                    {docket.docketNumber} ·{' '}
                    {docket.customerName || 'Unknown customer'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold">
                      {loadLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimeRange(
                        docket.deliveryCollectionStartTime,
                        docket.deliveryCollectionEndTime,
                      )}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1.5 text-white/90 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Date
              </label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="mt-2 flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-[#0F172A]"
                  >
                    <CalendarIcon className="h-4 w-4 text-[#8E51FF]" />
                    {format(assignmentDate, 'EEE d MMM yyyy')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DeliveriesCalendar
                    selected={assignmentDate}
                    onSelect={(d) => {
                      if (d) {
                        setAssignmentDate(startOfDay(d));
                        setDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Time
              </label>
              <div className="mt-2 flex justify-start gap-5">
                <Select value={startTime} onValueChange={handleStartTimeChange}>
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((t) => (
                      <SelectItem
                        key={`start-${t}`}
                        value={t}
                        disabled={
                          timeToMinutes(t) >= timeToMinutes(endTime)
                        }
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={endTime} onValueChange={handleEndTimeChange}>
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((t) => (
                      <SelectItem
                        key={`end-${t}`}
                        value={t}
                        disabled={
                          timeToMinutes(t) <= timeToMinutes(startTime)
                        }
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-2 text-xs text-[#64748B]">{windowHint}</p>
            </div>

            {mode === 'truck' ? (
              <div className="flex flex-col gap-3">
                {trucksWithStats.map((t, index) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onConfirm(String(t.id), confirmSlot)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-4 text-left transition-colors',
                      t.isOverVolume
                        ? 'border-amber-200 bg-amber-50/60'
                        : index === 0
                          ? 'border-green-400 bg-green-50/50'
                          : 'border-gray-200 bg-white hover:border-[#C4B5FD]',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                          t.isOverVolume
                            ? 'border-amber-200 bg-amber-100'
                            : 'border-gray-100 bg-gray-50',
                        )}
                      >
                        <Truck
                          className={cn(
                            'h-5 w-5',
                            t.isOverVolume
                              ? 'text-amber-700'
                              : 'text-gray-600',
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#0F172A]">
                            {t.licensePlate}
                          </span>
                          <TableBadges
                            names={[t.truckBusinessType || 'INTERNAL']}
                          />
                        </div>
                        <p className="text-sm text-[#64748B]">
                          {t.truckVol} m³
                        </p>
                        {t.isOverVolume ? (
                          <p className="text-xs font-medium text-red-700">
                            Does not fit
                          </p>
                        ) : (
                          <>
                            <p className="text-xs font-medium text-green-700">
                              Load ~{formatDispatchTruckFillPct(t.fillPct)}% of
                              limit
                            </p>
                            {!t.isOverVolume && index === 0 && (
                              <span className="rounded bg-green-600 px-2 py-1 text-[11px] font-bold text-white">
                                BEST FIT
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                  </button>
                ))}
                {trucksWithStats.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No trucks available.
                  </p>
                )}
              </div>
            ) : null}

            {mode === 'driver' ? (
              <div className="flex flex-col gap-3">
                {drivers.map((d) => {
                  const truckLabels =
                    d.trucks?.map((t) => t.licensePlate).filter(Boolean) ?? [];
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onConfirm(String(d.id), confirmSlot)}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-[#C4B5FD]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#0F172A]">
                              {d.driverName}
                            </span>
                            <TableBadges names={[d.driverType || 'INTERNAL']} />
                          </div>
                          <p className="text-sm text-[#64748B] truncate">
                            {truckLabels.length > 0
                              ? truckLabels.join(', ')
                              : 'No trucks linked'}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {d.dockets?.length ?? 0} trips today
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                    </button>
                  );
                })}
                {drivers.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No drivers available.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-gray-200"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
