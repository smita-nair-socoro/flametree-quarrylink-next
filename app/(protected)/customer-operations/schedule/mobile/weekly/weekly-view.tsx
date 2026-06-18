'use client';

import * as React from 'react';
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { SchedulerTrucksQueryOptions } from '@/lib/api/scheduler';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { DispatchTruckResource } from '@/lib/types/docket';
import { type DispatchBoardFilterState } from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';
import {
  docketMatchesScheduleJobFilters,
  isDispatchTruckResource,
  parseCollectionStartMs,
} from '@/lib/utils/dispatch-helper';
import {
  docketOnLocalDay,
  ScheduleAgendaDocketCard,
  type ScheduleAgendaDocket,
} from '../schedule-agenda-card';

export function ScheduleMobileWeeklyView({
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

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: trucksData, isLoading } = useQuery(
    SchedulerTrucksQueryOptions(weekStart.toISOString(), weekEnd.toISOString()),
  );

  const allWeekDockets = React.useMemo(() => {
    const rows: ScheduleAgendaDocket[] = [];
    for (const resource of trucksData?.resources || []) {
      if (!isDispatchTruckResource(resource)) continue;
      const truck = resource as DispatchTruckResource;
      for (const docket of truck.dockets || []) {
        rows.push({
          ...docket,
          truckId: String(truck.id),
          truckName: truck.licensePlate,
          driverName: truck.drivers?.[0]?.driverName,
        });
      }
    }
    return rows;
  }, [trucksData]);

  const filteredWeekDockets = React.useMemo(
    () =>
      allWeekDockets.filter((docket) =>
        docketMatchesScheduleJobFilters(docket, filter),
      ),
    [allWeekDockets, filter],
  );

  const docketCountByDay = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of days) {
      counts.set(
        day.toISOString(),
        filteredWeekDockets.filter((d) => docketOnLocalDay(d, day)).length,
      );
    }
    return counts;
  }, [days, filteredWeekDockets]);

  const agendaDockets = React.useMemo(() => {
    return filteredWeekDockets
      .filter((d) => docketOnLocalDay(d, date))
      .sort(
        (a, b) =>
          parseCollectionStartMs(a.deliveryCollectionStartTime) -
          parseCollectionStartMs(b.deliveryCollectionStartTime),
      );
  }, [filteredWeekDockets, date]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const selected = isSameDay(day, date);
            const count = docketCountByDay.get(day.toISOString()) ?? 0;
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onDateChange(day)}
                className={cn(
                  'flex flex-col items-center rounded-xl border px-1 py-2 transition-colors',
                  selected
                    ? 'border-[#8E51FF] bg-[#8E51FF] text-white shadow-sm'
                    : 'border-gray-200 bg-white text-[#64748B] hover:border-[#C4B5FD]',
                )}
              >
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wide',
                    selected ? 'text-white/90' : 'text-[#94A3B8]',
                  )}
                >
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'mt-0.5 text-lg font-bold leading-none',
                    selected ? 'text-white' : 'text-[#0F172A]',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <span
                  className={cn(
                    'mt-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    selected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F1F5F9] text-[#64748B]',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-b border-[#EDE9FE] bg-[#FAF5FF] px-4 py-3">
        <p className="text-base font-semibold text-[#0F172A]">
          {format(date, 'EEEE, d MMMM yyyy')}
        </p>
        <p className="mt-1 text-xs font-medium text-[#7C3AED]">
          View only — open Dispatch to assign or move dockets.
        </p>
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
              <ScheduleAgendaDocketCard
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
