'use client';

import { useState, useEffect, useMemo } from 'react';
import UnassignedDockets from '../cards/unassigned-dockets';
import AssignedDockets from '../cards/assigned-dockets';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import { format, startOfDay, endOfDay } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { useQuery } from '@tanstack/react-query';
import { DocketCardOverlay } from '../cards/unassigned-dockets';
import { DocketDTO } from '@/lib/types/docket';
import { DispatchDriversTrucksFilter } from './drivers-trucks-filter';
import {
  SchedulerTrucksQueryOptions,
  SchedulerDriversQueryOptions,
} from '@/lib/api/scheduler';

export type DispatchDocket = DocketDTO & {
  uiAssignedTruckId?: string | null;
  uiAssignedTime?: string | null;
  uiAssignedDuration?: number;
  productName?: string;
  customerName?: string;
  productSellUom?: string;
  pickUpAddress?: any; // Can be string or Partial<Address>
  deliveryAddress?: any; // Can be string or Partial<Address>
};

export const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return format(new Date(timeStr), 'HH:mm');
  }
  if (timeStr.includes(':')) {
    return timeStr.split(':').slice(0, 2).join(':');
  }
  return timeStr;
};

export const formatTimeRange = (start?: string, end?: string) => {
  const startTime = formatTime(start);
  const endTime = formatTime(end);
  return startTime && endTime
    ? `${startTime} - ${endTime}`
    : startTime || endTime || 'N/A';
};

export const formatDate = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return format(new Date(timeStr), 'EEE dd MMM');
  }
  return timeStr;
};

export type Truck = {
  id: string;
  name: string;
  capacity: string;
  trips: number;
  drivers: string;
  type?: string;
};

export function DispatchView({
  date,
  viewType,
}: {
  date: Date;
  viewType: 'trucks' | 'drivers';
}) {
  const [dockets, setDockets] = useState<DispatchDocket[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDocketId, setSelectedDocketId] = useState<string | null>(null);

  const start = useMemo(() => startOfDay(date).toISOString(), [date]);
  const end = useMemo(() => endOfDay(date).toISOString(), [date]);

  const { data: trucksData, isLoading: isLoadingTrucks } = useQuery({
    ...SchedulerTrucksQueryOptions(start, end),
    enabled: viewType === 'trucks',
  });

  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    ...SchedulerDriversQueryOptions(start, end),
    enabled: viewType === 'drivers',
  });

  const isLoading = viewType === 'trucks' ? isLoadingTrucks : isLoadingDrivers;

  useEffect(() => {
    let newDockets: DispatchDocket[] = [];

    if (viewType === 'trucks' && trucksData) {
      const assigned = (trucksData.resources || []).flatMap((r) =>
        (r.dockets || []).map((d) => ({
          ...d,
          uiAssignedTruckId: String(r.id),
          uiAssignedTime: formatTime(d.deliveryCollectionStartTime),
        })),
      );
      const unassigned = (trucksData.unassignedDockets || []).map((d) => ({
        ...d,
        uiAssignedTruckId: null,
        uiAssignedTime: null,
      }));
      newDockets = [...assigned, ...unassigned];
    } else if (viewType === 'drivers' && driversData) {
      const assigned = (driversData.resources || []).flatMap((r) =>
        (r.dockets || []).map((d) => ({
          ...d,
          uiAssignedTruckId: String(r.id), // We map driver id to truckId for the UI to reuse the same component
          uiAssignedTime: formatTime(d.deliveryCollectionStartTime),
        })),
      );
      const unassigned = (driversData.unassignedDockets || []).map((d) => ({
        ...d,
        uiAssignedTruckId: null,
        uiAssignedTime: null,
      }));
      newDockets = [...assigned, ...unassigned];
    }

    setDockets(newDockets || []);
  }, [trucksData, driversData, viewType]);

  const mappedResources: Truck[] = useMemo(() => {
    if (viewType === 'trucks' && trucksData) {
      return (trucksData.resources || []).map((r) => ({
        id: String(r.id),
        name: r.licensePlate,
        capacity: 'N/A', // Update if capacity is added to API
        trips: r.dockets?.length || 0,
        drivers: r.drivers?.map((d) => d.driverName).join(', ') || 'Unassigned',
        type: r.drivers?.[0]?.driverType || 'INTERNAL', // Default to INTERNAL if no driver
      }));
    } else if (viewType === 'drivers' && driversData) {
      return (driversData.resources || []).map((r) => ({
        id: String(r.id),
        name: r.trucks?.map((t) => t.licensePlate).join(', ') || 'Unassigned',
        capacity: 'N/A',
        trips: r.dockets?.length || 0,
        drivers: r.driverName,
        type: r.driverType || 'INTERNAL',
      }));
    }
    return [];
  }, [trucksData, driversData, viewType]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const docketId = active.id as string;
    const overId = over.id as string;

    const match = overId.match(/^truck-(.+)-time-(.+)$/);
    if (match) {
      const [, truckId, time] = match;
      setDockets((prev) =>
        prev.map((d) =>
          String(d.id) === docketId
            ? { ...d, uiAssignedTruckId: truckId, uiAssignedTime: time }
            : d,
        ),
      );
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleUpdateDocket = (
    docketId: string,
    updates: Partial<DispatchDocket>,
  ) => {
    setDockets((prev) =>
      prev.map((d) => (String(d.id) === docketId ? { ...d, ...updates } : d)),
    );
  };

  const activeDocket = activeId
    ? dockets.find((d) => String(d.id) === activeId)
    : null;
  const selectedDocket = selectedDocketId
    ? dockets.find((d) => String(d.id) === selectedDocketId)
    : null;

  const handleUnassign = () => {
    if (selectedDocketId) {
      handleUpdateDocket(selectedDocketId, {
        uiAssignedTruckId: null,
        uiAssignedTime: null,
      });
      setSelectedDocketId(null);
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DispatchDriversTrucksFilter viewType={viewType} />
      <div className="border-b pl-6 py-2.5 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-[#64748B]">
            {format(date, 'EEE dd MMM').toUpperCase()}
          </span>
          <div className="border bg-green-50 border-green-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">
              13/17
            </span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Assigned
            </span>
          </div>
          <div className="border bg-blue-50 border-blue-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">2</span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Trucks booked today
            </span>
          </div>
          <div className="border bg-purple-50 border-purple-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">2</span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Drivers on trips
            </span>
          </div>
        </div>
      </div>
      <div className="flex h-[calc(100vh-200px)] overflow-hidden pt-2 pb-4 px-4 gap-4">
        <div className="w-[390px] shrink-0">
          <UnassignedDockets
            date={date}
            dockets={dockets}
            isLoading={isLoading}
            selectedDocketId={selectedDocketId}
            onSelectDocket={setSelectedDocketId}
          />
        </div>
        <div className="flex-1 min-w-0">
          <AssignedDockets
            // date={date}
            trucks={mappedResources}
            dockets={dockets}
            isLoading={isLoading}
            onUpdateDocket={handleUpdateDocket}
            selectedDocketId={selectedDocketId}
            onSelectDocket={setSelectedDocketId}
            // onUnassignDocket={handleUnassign}
            viewType={viewType}
          />
        </div>
        {selectedDocket && (
          <div className="w-[400px] shrink-0 border border-[#E2E8F0] rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
            <DocketDetailsPanel
              docket={selectedDocket}
              onClose={() => setSelectedDocketId(null)}
              onUnassign={handleUnassign}
            />
          </div>
        )}
      </div>
      <DragOverlay zIndex={1000}>
        {activeDocket ? <DocketCardOverlay docket={activeDocket} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
