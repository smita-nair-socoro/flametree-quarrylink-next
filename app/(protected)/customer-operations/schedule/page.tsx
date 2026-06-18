'use client';
import React from 'react';
import { startOfDay } from 'date-fns';
import { DeliveriesDateNav } from '@/components/ui/schedular/deliveries-date-nav';
import {
  DeliveriesResourceToggle,
  DeliveriesPeriodToggle,
} from '@/components/ui/schedular/deliveries-toolbar-toggles';
import { ScheduleMonthView } from './views/month-view';
import { ScheduleWeekView } from './views/week-view';
import { ScheduleMobileWeeklyView } from './mobile/weekly/weekly-view';
import {
  DEFAULT_DISPATCH_BOARD_FILTER,
  type DispatchBoardFilterState,
} from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DeliveriesPage() {
  const [selectedDate, setSelectedDate] = React.useState(() =>
    startOfDay(new Date()),
  );
  const [resourceView, setResourceView] = React.useState<'trucks' | 'drivers'>(
    'trucks',
  );
  const [periodView, setPeriodView] = React.useState<'week' | 'month'>('week');
  const [boardFilter, setBoardFilter] =
    React.useState<DispatchBoardFilterState>(DEFAULT_DISPATCH_BOARD_FILTER);

  const isDesktop = !useIsMobile();

  React.useEffect(() => {
    setBoardFilter(DEFAULT_DISPATCH_BOARD_FILTER);
  }, [resourceView, periodView]);

  if (!isDesktop) {
    return (
      <div className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-white">
        <div className="flex h-[70px] shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4">
          <SidebarTrigger className="shrink-0" />
          <DeliveriesDateNav
            date={selectedDate}
            onDateChange={setSelectedDate}
            className="min-w-0 flex-1"
          />
        </div>

        <div className="flex shrink-0 items-center justify-center border-b border-gray-200 bg-white px-4 py-3">
          <DeliveriesPeriodToggle
            value={periodView}
            onChange={setPeriodView}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {periodView === 'month' ? (
            <ScheduleMonthView
              date={selectedDate}
              onDateChange={setSelectedDate}
              filter={boardFilter}
              onFilterChange={setBoardFilter}
            />
          ) : (
            <ScheduleMobileWeeklyView
              date={selectedDate}
              onDateChange={setSelectedDate}
              filter={boardFilter}
              onFilterChange={setBoardFilter}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[#F9FAFB]">
      <div className="flex h-[70px] border-b border-gray-200 bg-white">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 px-4">
          <DeliveriesDateNav
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
          {periodView !== 'month' && (
            <DeliveriesResourceToggle
              value={resourceView}
              onChange={setResourceView}
            />
          )}
          <DeliveriesPeriodToggle value={periodView} onChange={setPeriodView} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <h1 className="sr-only">Deliveries</h1>
          {periodView === 'month' ? (
            <ScheduleMonthView
              date={selectedDate}
              onDateChange={setSelectedDate}
              filter={boardFilter}
              onFilterChange={setBoardFilter}
            />
          ) : (
            <ScheduleWeekView
              date={selectedDate}
              viewType={resourceView}
              filter={boardFilter}
              onFilterChange={setBoardFilter}
            />
          )}
        </main>
      </div>
    </div>
  );
}
