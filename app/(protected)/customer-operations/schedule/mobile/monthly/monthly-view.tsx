'use client';

import * as React from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SchedulerTrucksQueryOptions } from '@/lib/api/scheduler';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import { TableBadges } from '@/components/table-badges';
import { cn } from '@/lib/utils';
import type {
  DispatchBoardDocketRow,
  DispatchTruckResource,
} from '@/lib/types/docket';
import { type DispatchBoardFilterState } from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';
import {
  docketMatchesScheduleJobFilters,
  docketPassesScheduleFleetFilters,
  formatTime,
  formatTimeRange,
  getDispatchStatusStripeClass,
  isDispatchTruckResource,
  parseCollectionStartMs,
} from '@/lib/utils/dispatch-helper';

type AgendaDocket = DispatchBoardDocketRow & {
  driverName?: string;
  truckName?: string;
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

function docketOnLocalDay(docket: AgendaDocket, day: Date): boolean {
  if (!docket.deliveryCollectionDate) return false;
  const localTimeStr = docket.deliveryCollectionDate.includes('T')
    ? docket.deliveryCollectionDate.replace('Z', '')
    : docket.deliveryCollectionDate;
  return isSameDay(new Date(localTimeStr), day);
}

function formatDayCount(count: number): string {
  if (count > 9) return '9+';
  return String(count);
}

function AgendaDocketCard({
  docket,
  onClick,
}: {
  docket: AgendaDocket;
  onClick: () => void;
}) {
  const location = [docket.deliverySuburb, docket.deliveryState]
    .filter(Boolean)
    .join(', ');
  const personnel = [docket.truckName, docket.driverName]
    .filter(Boolean)
    .join(' · ');
  const startTime = formatTime(docket.deliveryCollectionStartTime) || '—';
  const timeRange = formatTimeRange(
    docket.deliveryCollectionStartTime,
    docket.deliveryCollectionEndTime,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-colors hover:bg-gray-50/80"
    >
      <div className="flex w-[72px] shrink-0 items-center justify-center border-r border-gray-100 bg-[#F8FAFC] px-2 py-4">
        <span className="text-lg font-bold tabular-nums text-[#0F172A]">
          {startTime}
        </span>
      </div>
      <div
        className={cn(
          'w-1 shrink-0',
          getDispatchStatusStripeClass(docket.docketStatus),
        )}
      />
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-[#0F172A]">
            {docket.customerName || 'Unknown customer'}
          </h3>
          <TableBadges names={[docket.docketStatus]} visibleCount={1} />
        </div>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-[#8E51FF]">
            {docket.docketNumber}
          </span>
          {timeRange ? (
            <span className="ml-2 font-medium text-[#8E51FF]">{timeRange}</span>
          ) : null}
        </p>
        {personnel ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#64748B]">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{personnel}</span>
          </p>
        ) : null}
        {location ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#64748B]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function ScheduleMobileMonthlyView({
  date,
  onDateChange,
  filter,
}: {
  date: Date;
  onDateChange: (next: Date) => void;
  filter: DispatchBoardFilterState;
}) {
  const [selectedDocketId, setSelectedDocketId] = React.useState<
    number | undefined
  >(undefined);

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const { data: trucksData, isLoading } = useQuery(
    SchedulerTrucksQueryOptions(
      calendarStart.toISOString(),
      calendarEnd.toISOString(),
    ),
  );

  const allMonthDockets = React.useMemo(() => {
    if (!trucksData) return [];

    const assigned: AgendaDocket[] = (trucksData.resources || []).flatMap(
      (r) => {
        if (!isDispatchTruckResource(r)) return [];
        const truck = r as DispatchTruckResource;
        return (truck.dockets || []).map((docket) => ({
          ...docket,
          truckName: truck.licensePlate,
          driverName: truck.drivers?.[0]?.driverName,
        }));
      },
    );

    const unassigned: AgendaDocket[] = (trucksData.unassignedDockets || []).map(
      (docket) => ({ ...docket }),
    );

    return [...assigned, ...unassigned];
  }, [trucksData]);

  const filteredMonthDockets = React.useMemo(
    () =>
      allMonthDockets.filter(
        (docket) =>
          docketMatchesScheduleJobFilters(docket, filter) &&
          docketPassesScheduleFleetFilters(docket.id, trucksData, filter),
      ),
    [allMonthDockets, filter, trucksData],
  );

  const docketCountByDay = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of calendarDays) {
      counts.set(
        day.toISOString(),
        filteredMonthDockets.filter((d) => docketOnLocalDay(d, day)).length,
      );
    }
    return counts;
  }, [calendarDays, filteredMonthDockets]);

  const agendaDockets = React.useMemo(
    () =>
      filteredMonthDockets
        .filter((d) => docketOnLocalDay(d, date))
        .sort(
          (a, b) =>
            parseCollectionStartMs(a.deliveryCollectionStartTime) -
            parseCollectionStartMs(b.deliveryCollectionStartTime),
        ),
    [filteredMonthDockets, date],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => onDateChange(subMonths(date, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#64748B] hover:bg-gray-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-base font-bold text-[#0F172A]">
            {format(monthStart, 'MMMM yyyy')}
          </h2>
          <button
            type="button"
            onClick={() => onDateChange(addMonths(date, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#64748B] hover:bg-gray-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="border-t border-gray-100 px-4 pb-3 pt-2">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="text-center text-[11px] font-semibold text-[#94A3B8]"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const selected = isSameDay(day, date);
              const inMonth = isSameMonth(day, monthStart);
              const count = docketCountByDay.get(day.toISOString()) ?? 0;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => onDateChange(day)}
                  className={cn(
                    'flex min-h-[52px] flex-col items-center rounded-lg border px-0.5 py-1.5 transition-colors',
                    selected
                      ? 'border-[#8E51FF] bg-[#8E51FF] text-white shadow-sm'
                      : inMonth
                        ? 'border-gray-200 bg-white text-[#0F172A] hover:border-[#C4B5FD]'
                        : 'border-transparent bg-transparent text-[#CBD5E1] hover:bg-gray-50',
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-bold leading-none',
                      selected
                        ? 'text-white'
                        : inMonth
                          ? 'text-[#0F172A]'
                          : 'text-[#CBD5E1]',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {count > 0 ? (
                    <span
                      className={cn(
                        'mt-1 text-[10px] font-bold',
                        selected ? 'text-white/90' : 'text-[#8E51FF]',
                      )}
                    >
                      {formatDayCount(count)}
                    </span>
                  ) : (
                    <span className="mt-1 h-[14px]" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#EDE9FE] bg-[#FAF5FF] px-4 py-3">
          <p className="text-base font-semibold text-[#0F172A]">
            {format(date, 'EEEE, d MMMM yyyy')}
          </p>
          <p className="mt-1 text-xs font-medium text-[#7C3AED]">
            View only — open Dispatch to assign or move dockets.
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Agenda
          </span>
          <span className="text-sm font-semibold text-[#64748B]">
            {agendaDockets.length}{' '}
            {agendaDockets.length === 1 ? 'docket' : 'dockets'}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="medium" />
          </div>
        ) : agendaDockets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-muted-foreground">
            No dockets for this day.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {agendaDockets.map((docket) => (
              <AgendaDocketCard
                key={docket.id}
                docket={docket}
                onClick={() => setSelectedDocketId(docket.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Drawer
        open={selectedDocketId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedDocketId(undefined);
        }}
      >
        <DrawerContent className="mt-0 flex h-[92dvh] max-h-[92dvh] flex-col overflow-hidden p-0">
          <DrawerTitle className="sr-only">Docket details</DrawerTitle>
          {selectedDocketId != null ? (
            <DocketDetailsPanel
              docketId={selectedDocketId}
              onClose={() => setSelectedDocketId(undefined)}
              onUnassign={() => setSelectedDocketId(undefined)}
            />
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
