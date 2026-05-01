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
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useQuery } from '@tanstack/react-query';
import { DocketCardOverlay } from '../cards/unassigned-dockets';
import type {
  DispatchBoardDocketRow,
  DispatchDocketDTO,
  DispatchDriverResource,
  DispatchTruckResource,
  DocketDTO,
} from '@/lib/types/docket';
import type { TruckResource } from '@/lib/types/truck';

function isDispatchTruckResource(
  r: DispatchTruckResource | DispatchDriverResource,
): r is DispatchTruckResource {
  return 'licensePlate' in r;
}

import { DispatchDriversTrucksFilter } from './drivers-trucks-filter';
import {
  SchedulerTrucksQueryOptions,
  SchedulerDriversQueryOptions,
} from '@/lib/api/scheduler';
import { useAssignDocket, useUnassignDocket } from '@/lib/api/docket';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

type DispatchDocketUiFields = {
  uiAssignedTruckId?: string | null;
  uiAssignedTime?: string | null;
  uiAssignedDuration?: number;
};

/** Board row from `DispatchDocketDTO` plus UI state; optional nested fields after assign/detail merge. */
export type DispatchDocket = DispatchBoardDocketRow &
  DispatchDocketUiFields &
  Partial<Omit<DocketDTO, 'pickUpAddress' | 'deliveryAddress'>>;

export const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return timeStr.split('T')[1].substring(0, 5);
  }
  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1].substring(0, 5);
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
    // Remove Z to force parsing as local time and avoid timezone shifts
    const localTimeStr = timeStr.replace('Z', '');
    return format(new Date(localTimeStr), 'EEE dd MMM');
  }
  return timeStr;
};

/** Local wall-clock ISO string without `Z` — matches assign payload and avoids UTC day drift from `toISOString()`. */
export const formatLocalISO = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/** Same local-day rule as the unassigned “This day” tab — `deliveryCollectionStartTime` vs `date`. */
export function isDocketOnSelectedLocalDay(
  d: Pick<DispatchDocket, 'deliveryCollectionStartTime'>,
  day: Date,
): boolean {
  const iso = d.deliveryCollectionStartTime;
  if (!iso) return false;
  const docketDate = new Date(iso.includes('T') ? iso.replace('Z', '') : iso);
  return (
    docketDate.getFullYear() === day.getFullYear() &&
    docketDate.getMonth() === day.getMonth() &&
    docketDate.getDate() === day.getDate()
  );
}

function countTrucksWithAssignedBookingsOnSelectedDay(
  data: DispatchDocketDTO | undefined,
  day: Date,
): number {
  if (!data?.resources?.length) return 0;
  return data.resources.filter(
    (r) =>
      isDispatchTruckResource(r) &&
      (r.dockets || []).some(
        (d) =>
          d.docketStatus === DOCKET_STATUS.ASSIGNED &&
          isDocketOnSelectedLocalDay(
            { deliveryCollectionStartTime: d.deliveryCollectionStartTime },
            day,
          ),
      ),
  ).length;
}

/** Driver id for IN_TRANSIT / ARRIVED stats: full docket, or truck row in trucks view, or driver row id in drivers view. */
function resolveDriverIdForTripStats(
  d: DispatchDocket,
  viewType: 'trucks' | 'drivers',
  trucksData: DispatchDocketDTO | undefined,
): number | undefined {
  if (d.driver?.id != null) return d.driver.id;
  if (viewType === 'drivers') {
    const n = Number(d.uiAssignedTruckId);
    return Number.isFinite(n) ? n : undefined;
  }
  if (!d.uiAssignedTruckId || !trucksData?.resources) return undefined;
  const truck = trucksData.resources.find(
    (r): r is DispatchTruckResource =>
      isDispatchTruckResource(r) && String(r.id) === d.uiAssignedTruckId,
  );
  return truck?.drivers?.[0]?.id;
}

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
  const [assignModalData, setAssignModalData] = useState<{
    docketId: string;
    truckId: string;
    time: string;
  } | null>(null);

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

  /** Trucks endpoint used for “Trucks booked” when the board is in drivers view. */
  const { data: trucksDataForStats } = useQuery({
    ...SchedulerTrucksQueryOptions(start, end),
    enabled: viewType === 'drivers',
  });

  const isLoading = viewType === 'trucks' ? isLoadingTrucks : isLoadingDrivers;

  const assignMutation = useAssignDocket();
  const unassignMutation = useUnassignDocket();

  useEffect(() => {
    let newDockets: DispatchDocket[] = [];

    if (viewType === 'trucks' && trucksData) {
      const assigned = (trucksData.resources || []).flatMap((r) =>
        (r.dockets || []).map((d) => {
          let duration = 2;
          if (d.deliveryCollectionStartTime && d.deliveryCollectionEndTime) {
            const start = new Date(d.deliveryCollectionStartTime.replace('Z', '')).getTime();
            const end = new Date(d.deliveryCollectionEndTime.replace('Z', '')).getTime();
            duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
          }
          return {
            ...d,
            uiAssignedTruckId: String(r.id),
            uiAssignedTime: formatTime(d.deliveryCollectionStartTime),
            uiAssignedDuration: duration,
          };
        }),
      );
      const unassigned = (trucksData.unassignedDockets || []).map((d) => ({
        ...d,
        uiAssignedTruckId: null,
        uiAssignedTime: null,
      }));
      newDockets = [...assigned, ...unassigned];
    } else if (viewType === 'drivers' && driversData) {
      const assigned = (driversData.resources || []).flatMap((r) =>
        (r.dockets || []).map((d) => {
          let duration = 2;
          if (d.deliveryCollectionStartTime && d.deliveryCollectionEndTime) {
            const start = new Date(d.deliveryCollectionStartTime.replace('Z', '')).getTime();
            const end = new Date(d.deliveryCollectionEndTime.replace('Z', '')).getTime();
            duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
          }
          return {
            ...d,
            uiAssignedTruckId: String(r.id), // We map driver id to truckId for the UI to reuse the same component
            uiAssignedTime: formatTime(d.deliveryCollectionStartTime),
            uiAssignedDuration: duration,
          };
        }),
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

  const mappedResources: TruckResource[] = useMemo(() => {
    if (viewType === 'trucks' && trucksData) {
      return (trucksData.resources || []).map((r) =>
        'licensePlate' in r
          ? {
            id: String(r.id),
            name: r.licensePlate,
            capacity: 'N/A',
            trips: r.dockets?.length || 0,
            drivers:
              r.drivers?.map((d) => d.driverName).join(', ') || 'Unassigned',
            type: r.drivers?.[0]?.driverType || 'INTERNAL',
          }
          : {
            id: String(r.id),
            name: 'Unknown',
            capacity: 'N/A',
            trips: 0,
            drivers: 'Unassigned',
            type: 'INTERNAL',
          },
      );
    }
    if (viewType === 'drivers' && driversData) {
      return (driversData.resources || []).map((r) =>
        'driverName' in r
          ? {
            id: String(r.id),
            name:
              r.trucks?.map((t) => t.licensePlate).join(', ') || 'Unassigned',
            capacity: 'N/A',
            trips: r.dockets?.length || 0,
            drivers: r.driverName,
            type: r.driverType || 'INTERNAL',
          }
          : {
            id: String(r.id),
            name: 'Unknown',
            capacity: 'N/A',
            trips: 0,
            drivers: 'Unassigned',
            type: 'INTERNAL',
          },
      );
    }
    return [];
  }, [trucksData, driversData, viewType]);

  const docketsForSelectedDay = useMemo(
    () => dockets.filter((d) => isDocketOnSelectedLocalDay(d, date)),
    [dockets, date],
  );

  const headerStats = useMemo(() => {
    const total = docketsForSelectedDay.length;
    const assignedCount = docketsForSelectedDay.filter(
      (d) => d.docketStatus === DOCKET_STATUS.ASSIGNED,
    ).length;

    const assignedOnSelectedDay = docketsForSelectedDay.filter(
      (d) => d.docketStatus === DOCKET_STATUS.ASSIGNED,
    );
    const trucksBooked =
      viewType === 'trucks'
        ? new Set(
          assignedOnSelectedDay
            .map((d) => d.uiAssignedTruckId)
            .filter((id): id is string => Boolean(id)),
        ).size
        : countTrucksWithAssignedBookingsOnSelectedDay(
          trucksDataForStats,
          date,
        );

    const trucksForDriverResolve =
      viewType === 'trucks' ? trucksData : trucksDataForStats;

    const onTripDriverIds = new Set<number>();
    for (const d of docketsForSelectedDay) {
      if (
        d.docketStatus !== DOCKET_STATUS.IN_TRANSIT &&
        d.docketStatus !== DOCKET_STATUS.ARRIVED
      ) {
        continue;
      }
      const driverId = resolveDriverIdForTripStats(
        d,
        viewType,
        trucksForDriverResolve,
      );
      if (driverId != null) onTripDriverIds.add(driverId);
    }

    return {
      assignedCount,
      total,
      trucksBooked,
      driversOnTrips: onTripDriverIds.size,
    };
  }, [
    docketsForSelectedDay,
    viewType,
    trucksData,
    trucksDataForStats,
    date,
  ]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const docketId = active.id as string;
    const overId = over.id as string;

    if (overId === 'unassigned-queue') {
      const docket = dockets.find(d => String(d.id) === docketId);
      if (docket && docket.docketStatus !== DOCKET_STATUS.ASSIGNED) {
        return; // Only ASSIGNED dockets can be unassigned
      }

      // Unassign the docket
      unassignMutation.mutate({ docketId: Number(docketId) });
      setDockets((prev) =>
        prev.map((d) =>
          String(d.id) === docketId
            ? {
              ...d,
              uiAssignedTruckId: null,
              uiAssignedTime: null,
              docketStatus: DOCKET_STATUS.UNASSIGNED,
            }
            : d,
        ),
      );
      return;
    }

    const match = overId.match(/^truck-(.+)-time-(.+)$/);
    if (match) {
      const [, truckId, time] = match;

      const docket = dockets.find(d => String(d.id) === docketId);
      if (docket && docket.docketStatus !== DOCKET_STATUS.UNASSIGNED && docket.docketStatus !== DOCKET_STATUS.ASSIGNED) {
        return; // Cannot move locked dockets
      }

      if (docket && docket.uiAssignedTruckId === truckId && docket.uiAssignedTime === time) {
        // Dropped on the same slot, do nothing
        return;
      }

      if (viewType === 'trucks') {
        setAssignModalData({ docketId, truckId, time });
      } else {
        // If in drivers view, we might not need the modal or it might be different.
        // The user said "do only from the trucks view", so we'll just update local state for now in drivers view.
        setDockets((prev) =>
          prev.map((d) =>
            String(d.id) === docketId
              ? { ...d, uiAssignedTruckId: truckId, uiAssignedTime: time }
              : d,
          ),
        );
      }
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

  const handleResizeDocket = (docketId: string, newDuration: number) => {
    const docket = dockets.find((d) => String(d.id) === docketId);
    if (!docket || !docket.uiAssignedTruckId) return;

    let driverId = docket.driver?.id;
    let truckId: number | undefined;

    if (viewType === 'trucks' && trucksData) {
      truckId = Number(docket.uiAssignedTruckId);
      if (!driverId) {
        const truck = trucksData.resources.find(
          (r): r is DispatchTruckResource =>
            isDispatchTruckResource(r) &&
            String(r.id) === docket.uiAssignedTruckId,
        );
        if (truck && 'drivers' in truck && truck.drivers?.length) {
          driverId = truck.drivers[0].id;
        }
      }
    } else if (viewType === 'drivers' && driversData) {
      driverId = Number(docket.uiAssignedTruckId);
      const row = driversData.resources.find(
        (r): r is DispatchDriverResource =>
          !isDispatchTruckResource(r) &&
          String(r.id) === docket.uiAssignedTruckId,
      );
      truckId = row?.trucks?.[0]?.id;
    }

    if (!driverId || truckId == null || Number.isNaN(truckId)) {
      console.error('No driver/truck found for docket, cannot resize');
      return;
    }

    const time = docket.uiAssignedTime;
    if (!time) return;

    const [hours, minutes] = time.split(':').map(Number);
    const startWindow = new Date(date);
    startWindow.setHours(hours, minutes, 0, 0);

    const endWindow = new Date(startWindow);
    endWindow.setHours(startWindow.getHours() + newDuration);

    assignMutation.mutate(
      {
        docketId: Number(docketId),
        driverId,
        truckId,
        deliveryStartWindow: formatLocalISO(startWindow),
        deliveryEndWindow: formatLocalISO(endWindow),
        plannedLoadSize: docket.loadSize || 0,
      },
      {
        onSuccess: () => {
          setDockets((prev) =>
            prev.map((d) =>
              String(d.id) === docketId
                ? {
                  ...d,
                  uiAssignedDuration: newDuration,
                  deliveryCollectionEndTime: formatLocalISO(endWindow),
                }
                : d,
            ),
          );
        },
      }
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
      unassignMutation.mutate({ docketId: Number(selectedDocketId) });
      handleUpdateDocket(selectedDocketId, {
        uiAssignedTruckId: null,
        uiAssignedTime: null,
        docketStatus: DOCKET_STATUS.UNASSIGNED,
      });
      setSelectedDocketId(null);
    }
  };

  const handleAssignDriver = (driverId: number) => {
    if (!assignModalData) return;

    const { docketId, truckId, time } = assignModalData;
    const docket = dockets.find((d) => String(d.id) === docketId);

    // Parse time to ISO strings for start and end windows
    // The time variable is like "11:00"
    const [hours, minutes] = time.split(':').map(Number);
    const startWindow = new Date(date);
    startWindow.setHours(hours, minutes, 0, 0);

    // Assuming 2 hours duration for now, or use docket.uiAssignedDuration
    const duration = docket?.uiAssignedDuration || 2;
    const endWindow = new Date(startWindow);
    endWindow.setHours(startWindow.getHours() + duration);

    assignMutation.mutate(
      {
        docketId: Number(docketId),
        driverId,
        truckId: Number(truckId),
        deliveryStartWindow: formatLocalISO(startWindow),
        deliveryEndWindow: formatLocalISO(endWindow),
        plannedLoadSize: docket?.loadSize || 0,
      },
      {
        onSuccess: () => {
          setDockets((prev) =>
            prev.map((d) =>
              String(d.id) === docketId
                ? {
                  ...d,
                  uiAssignedTruckId: truckId,
                  uiAssignedTime: time,
                  deliveryCollectionDate: startOfDay(startWindow),
                  deliveryCollectionStartTime: formatLocalISO(startWindow),
                  deliveryCollectionEndTime: formatLocalISO(endWindow),
                  docketStatus: DOCKET_STATUS.ASSIGNED,
                }
                : d,
            ),
          );
          setAssignModalData(null);
        },
      }
    );
  };

  const assignModalDocket = assignModalData
    ? dockets.find((d) => String(d.id) === assignModalData.docketId)
    : null;
  const assignModalTruck: DispatchTruckResource | null =
    assignModalData && trucksData
      ? trucksData.resources.find(
        (r): r is DispatchTruckResource =>
          isDispatchTruckResource(r) &&
          String(r.id) === assignModalData.truckId,
      ) ?? null
      : null;

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
              {headerStats.assignedCount}/{headerStats.total}
            </span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Assigned
            </span>
          </div>
          <div className="border bg-blue-50 border-blue-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">
              {headerStats.trucksBooked}
            </span>{' '}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">
              Trucks booked today
            </span>
          </div>
          <div className="border bg-purple-50 border-purple-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">
              {headerStats.driversOnTrips}
            </span>{' '}
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
            onResizeDocket={handleResizeDocket}
            selectedDocketId={selectedDocketId}
            onSelectDocket={setSelectedDocketId}
            // onUnassignDocket={handleUnassign}
            viewType={viewType}
          />
        </div>
        {selectedDocket && (
          <div className="w-[400px] shrink-0 border border-[#E2E8F0] rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
            <DocketDetailsPanel
              docket={selectedDocket as DocketDTO}
              onClose={() => setSelectedDocketId(null)}
              onUnassign={handleUnassign}
            />
          </div>
        )}
      </div>
      <DragOverlay zIndex={1000} modifiers={[snapCenterToCursor]}>
        {activeDocket ? <DocketCardOverlay docket={activeDocket} /> : null}
      </DragOverlay>

      <Dialog
        open={!!assignModalData}
        onOpenChange={(open) => !open && setAssignModalData(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Select Driver
            </DialogTitle>
            {assignModalDocket && assignModalTruck && (
              <p className="text-gray-500 text-sm mt-1">
                {assignModalDocket.docketNumber} &rarr;{' '}
                {assignModalTruck.licensePlate}
              </p>
            )}
          </DialogHeader>

          {assignModalDocket && assignModalTruck && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Load</span>
                  <span className="font-bold text-gray-900">
                    {assignModalDocket.loadSize}{' '}
                    {assignModalDocket.productSellUom === 'M3'
                      ? 'm³'
                      : assignModalDocket.productSellUom === 'KG_20'
                        ? 'x 20kg'
                        : assignModalDocket.productSellUom || 'TN'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Truck limits</span>
                  <span className="font-bold text-gray-900">
                    22 m³ / 30 TN
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Trip fill</span>
                  <span className="font-bold text-gray-900">50%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {assignModalTruck.drivers?.map((driver) => (
                  <div
                    key={driver.id ?? driver.driverName}
                    onClick={() => {
                      if (driver.id != null) handleAssignDriver(driver.id);
                    }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">
                      {driver.driverName}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                      AVAILABLE
                    </span>
                  </div>
                ))}
                {(!assignModalTruck.drivers || assignModalTruck.drivers.length === 0) && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No drivers found for this truck.
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  variant="outline"
                  onClick={() => setAssignModalData(null)}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
