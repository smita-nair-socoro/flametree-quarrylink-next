'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { startOfDay } from 'date-fns';

import { DeliveriesDateNav } from './(components)/deliveries-date-nav';
import {
  DeliveriesOperationsHeader,
  DeliveriesOperationsNav,
} from './(components)/deliveries-operations-sidebar';
import type { DeliveriesOperationsTab } from './(components)/deliveries-operations-sidebar';
import {
  DeliveriesPeriodToggle,
  DeliveriesResourceToggle,
} from './(components)/deliveries-toolbar-toggles';
import DispatchTab from './(components)/tabs/dispatch/dispatch-tab';
import ScheduleTab from './(components)/tabs/schedule/schedule-tab';

function DeliveriesPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] =
    React.useState<DeliveriesOperationsTab>(
      (tabParam as DeliveriesOperationsTab) || 'dispatch'
    );

  React.useEffect(() => {
    if (tabParam === 'schedule' || tabParam === 'dispatch') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(() =>
    startOfDay(new Date()),
  );
  const [resourceView, setResourceView] = React.useState<'trucks' | 'drivers'>(
    'trucks',
  );
  const [periodView, setPeriodView] = React.useState<'week' | 'month'>('week');

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[#F9FAFB]">
      <div className="flex h-[70px] border-b border-gray-200 bg-white">
        <DeliveriesOperationsHeader
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 px-4">
          <DeliveriesDateNav
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
          {!(activeTab === 'schedule' && periodView === 'month') && (
            <DeliveriesResourceToggle
              value={resourceView}
              onChange={setResourceView}
            />
          )}
          {activeTab === 'schedule' && (
            <DeliveriesPeriodToggle
              value={periodView}
              onChange={setPeriodView}
            />
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <DeliveriesOperationsNav
          collapsed={sidebarCollapsed}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <main className="min-w-0 flex-1">
          <h1 className="sr-only">Deliveries</h1>
          {activeTab === 'dispatch' && (
            <DispatchTab
              resourceView={resourceView}
              selectedDate={selectedDate}
            />
          )}
          {activeTab === 'schedule' && (
            <ScheduleTab
              resourceView={resourceView}
              periodView={periodView}
              selectedDate={selectedDate}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function DeliveriesPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DeliveriesPageContent />
    </React.Suspense>
  );
}
