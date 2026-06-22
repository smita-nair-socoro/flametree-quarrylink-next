'use client';
import React from 'react';
import { startOfDay } from 'date-fns';
import { SlidersHorizontal } from 'lucide-react';
import { DeliveriesDateNav } from '@/components/ui/schedular/deliveries-date-nav';
import {
  DeliveriesResourceToggle,
  DeliveriesPeriodToggle,
} from '@/components/ui/schedular/deliveries-toolbar-toggles';
import { ScheduleMonthView } from './views/month-view';
import { ScheduleWeekView } from './views/week-view';
import { ScheduleMobileWeeklyView } from './mobile/weekly/weekly-view';
import { ScheduleMobileMonthlyView } from './mobile/monthly/monthly-view';
import {
  DEFAULT_DISPATCH_BOARD_FILTER,
  DEFAULT_JOB_STATUS_FILTER_OPTIONS,
  SCHEDULE_MONTH_JOB_STATUS_FILTER_OPTIONS,
  type DispatchBoardFilterState,
} from '@/app/(protected)/logistics/dispatch/views/drivers-trucks-filter';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  hasActiveScheduleStatusFilters,
  ScheduleStatusFiltersDrawer,
} from './mobile/schedule-status-filters-drawer';

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
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const isDesktop = !useIsMobile();
  const mobileFiltersActive = hasActiveScheduleStatusFilters(boardFilter);

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

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
          <DeliveriesPeriodToggle value={periodView} onChange={setPeriodView} />
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-10 shrink-0 rounded-xl border-gray-200 bg-white font-semibold text-[#0F172A]',
              mobileFiltersActive &&
                'border-[#C4B5FD] bg-[#FAF5FF] text-[#7C3AED]',
            )}
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <ScheduleStatusFiltersDrawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filter={boardFilter}
          onFilterChange={setBoardFilter}
          statusOptions={
            periodView === 'month'
              ? SCHEDULE_MONTH_JOB_STATUS_FILTER_OPTIONS
              : DEFAULT_JOB_STATUS_FILTER_OPTIONS
          }
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {periodView === 'month' ? (
            <ScheduleMobileMonthlyView
              date={selectedDate}
              onDateChange={setSelectedDate}
              filter={boardFilter}
            />
          ) : (
            <ScheduleMobileWeeklyView
              date={selectedDate}
              onDateChange={setSelectedDate}
              filter={boardFilter}
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
