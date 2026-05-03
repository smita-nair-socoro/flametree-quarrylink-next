'use client';
import React from 'react';
import { startOfDay } from 'date-fns';
import { DeliveriesDateNav } from '@/components/ui/schedular/deliveries-date-nav';
import { DeliveriesResourceToggle } from '@/components/ui/schedular/deliveries-toolbar-toggles';
import { DispatchView } from './views/dispatch-view';

export default function DispatchPage() {
  const [selectedDate, setSelectedDate] = React.useState(() =>
    startOfDay(new Date()),
  );
  const [resourceView, setResourceView] = React.useState<'trucks' | 'drivers'>(
    'trucks',
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[#F9FAFB]">
      <div className="flex h-[70px] border-b border-gray-200 bg-white">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 px-4">
          <DeliveriesDateNav
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
          <DeliveriesResourceToggle
            value={resourceView}
            onChange={setResourceView}
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <h1 className="sr-only">Dispatch</h1>
          <DispatchView date={selectedDate} viewType={resourceView} />
        </main>
      </div>
    </div>
  );
}
