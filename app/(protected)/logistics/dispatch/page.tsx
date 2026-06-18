'use client';
import React from 'react';
import { startOfDay } from 'date-fns';
import { ClipboardList, Truck, User } from 'lucide-react';
import { DeliveriesDateNav } from '@/components/ui/schedular/deliveries-date-nav';
import { DeliveriesResourceToggle } from '@/components/ui/schedular/deliveries-toolbar-toggles';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { DispatchView } from './views/dispatch-view';
import { DispatchMobileProvider, useDispatchMobile } from './mobile/dispatch-mobile-context';
import { UnassignedDockets } from './mobile/queue/unassigned-dockets';
import { AssignedDockets } from './mobile/trucks-drivers/assigned-dockets';

function MobileDispatchTabs() {
  const { unassignedCount } = useDispatchMobile();

  const mobileNavItems = [
    { value: 'queue', label: 'Queue', icon: ClipboardList, badge: unassignedCount },
    { value: 'trucks', label: 'Trucks', icon: Truck },
    { value: 'drivers', label: 'Drivers', icon: User },
  ] as const;

  return (
    <Tabs
      defaultValue="queue"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-hidden bg-[#F8FAFC]">
        <TabsContent value="queue" className="mt-0 h-full overflow-y-auto">
          <UnassignedDockets />
        </TabsContent>
        <TabsContent value="trucks" className="mt-0 h-full overflow-y-auto">
          <AssignedDockets viewType="trucks" />
        </TabsContent>
        <TabsContent value="drivers" className="mt-0 h-full overflow-y-auto">
          <AssignedDockets viewType="drivers" />
        </TabsContent>
      </div>

      <div className="flex h-20 shrink-0 border-t border-gray-200 bg-white">
        <TabsList className="grid h-full w-full grid-cols-3 rounded-none bg-white p-0">
          {mobileNavItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="group relative flex h-full flex-col items-center justify-center gap-1 rounded-none px-0 py-0 text-gray-400 shadow-none ring-offset-0 hover:text-gray-600 focus-visible:ring-0 data-[state=active]:bg-transparent data-[state=active]:text-[#8E51FF] data-[state=active]:shadow-none"
            >
              <div className="relative rounded-md p-2 transition-colors group-data-[state=active]:bg-[#F3E8FF]">
                <item.icon
                  className="h-5 w-5 text-gray-400 group-data-[state=active]:text-[#8E51FF]"
                  strokeWidth={2.5}
                />
                {'badge' in item && item.badge > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8E51FF] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[13px] font-semibold tracking-wide text-gray-400 group-data-[state=active]:border-b-2 group-data-[state=active]:border-[#8E51FF] group-data-[state=active]:text-[#8E51FF]">
                {item.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}

export default function DispatchPage() {
  const [selectedDate, setSelectedDate] = React.useState(() =>
    startOfDay(new Date()),
  );
  const [resourceView, setResourceView] = React.useState<'trucks' | 'drivers'>(
    'trucks',
  );

  const isDesktop = !useIsMobile();

  if (!isDesktop) {
    return (
      <DispatchMobileProvider date={selectedDate}>
        <div className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-white">
          <div className="flex h-[70px] shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4">
            <SidebarTrigger className="shrink-0" />
            <DeliveriesDateNav
              date={selectedDate}
              onDateChange={setSelectedDate}
              className="min-w-0 flex-1"
            />
          </div>
          <MobileDispatchTabs />
        </div>
      </DispatchMobileProvider>
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
