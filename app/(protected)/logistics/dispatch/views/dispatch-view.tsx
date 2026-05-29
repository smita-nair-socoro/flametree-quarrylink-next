'use client';

import { useState, useEffect, useMemo } from 'react';
import UnassignedDockets from '../cards/unassigned-dockets';
import AssignedDockets from '../cards/assigned-dockets';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import { format } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useQuery } from '@tanstack/react-query';
import { DocketCardOverlay } from '../cards/unassigned-dockets';
import { ConfirmUnassignDialog } from '@/components/ui/schedular/unassign-modal';
import { AssignTruckDriverModal } from '@/components/ui/schedular/assign-truck-driver-modal';
import type {
  DispatchDocketDTO,
  DispatchDriverResource,
  DispatchTruckResource,
} from '@/lib/types/docket';
import type { TruckResource } from '@/lib/types/truck';
import { TRUCK_BUSINESS_TYPE, TRUCK_STATUS } from '@/lib/types/truck-enums';
import {
  DispatchDriversTrucksFilter,
  DEFAULT_DISPATCH_BOARD_FILTER,
  type DispatchBoardFilterState,
} from './drivers-trucks-filter';
import {
  useAssignDocket,
  useUnassignDocket,
  DocketsListQueryOptions,
} from '@/lib/api/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import {
  SchedulerTrucksQueryOptions,
  SchedulerDriversQueryOptions,
} from '@/lib/api/scheduler';

import { InvoiceDetailsDialog } from '@/hooks/use-invoice-actions';
import {
  DispatchDocket,
  mapUnassignedDocketDtoToBoardRow,
  isDispatchTruckResource,
  isDispatchDriverResource,
  truckMatchesFleetFilters,
  driverRowMatchesFilters,
  matchesBoardJobFilter,
  formatCargoLineForUnassign,
  assignmentDateDisplayForUnassign,
  resolveUnassignAssignmentLabels,
  formatTime,
  formatTimeRange,
  formatLocalISO,
  isDocketOnSelectedLocalDay,
} from '@/lib/utils/dispatch-helper';

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
            { deliveryCollectionDate: d.deliveryCollectionDate },
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
    targetId: string;
    time: string;
  } | null>(null);

  const [pendingUnassignDocketId, setPendingUnassignDocketId] = useState<
    string | null
  >(null);

  const [boardFilter, setBoardFilter] = useState<DispatchBoardFilterState>(
    DEFAULT_DISPATCH_BOARD_FILTER,
  );

  useEffect(() => {
    setBoardFilter(DEFAULT_DISPATCH_BOARD_FILTER);
  }, [viewType]);

  useEffect(() => {
    setSelectedDocketId(null);
  }, [date]);

  const start = useMemo(() => format(date, "yyyy-MM-dd'T'00:00:00.000'Z'"), [date]);
  const end = useMemo(() => format(date, "yyyy-MM-dd'T'23:59:59.999'Z'"), [date]);

  const { data: trucksData, isLoading: isLoadingTrucks } = useQuery({
    ...SchedulerTrucksQueryOptions(start, end),
    enabled: viewType === 'trucks',
  });

  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    ...SchedulerDriversQueryOptions(start, end),
    enabled: viewType === 'drivers',
  });

  const { data: allDocketsData } = useQuery({
    ...DocketsListQueryOptions(),
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

    const allUnassignedList = Array.isArray(allDocketsData)
      ? allDocketsData
      : allDocketsData && 'content' in allDocketsData
        ? allDocketsData.content
        : [];

    const globalUnassigned = allUnassignedList
      .filter((d) => d.docketStatus === DOCKET_STATUS.UNASSIGNED)
      .map(mapUnassignedDocketDtoToBoardRow);

    if (viewType === 'trucks' && trucksData) {
      const assigned = (trucksData.resources || []).flatMap((r) =>
        (r.dockets || []).map((d) => {
          let duration = 2;
          if (d.deliveryCollectionStartTime && d.deliveryCollectionEndTime) {
            const start = new Date(
              d.deliveryCollectionStartTime.replace('Z', ''),
            ).getTime();
            const end = new Date(
              d.deliveryCollectionEndTime.replace('Z', ''),
            ).getTime();
            duration = Math.max(
              1,
              Math.round((end - start) / (1000 * 60 * 60)),
            );
          }
          return {
            ...d,
            uiAssignedTruckId: String(r.id),
            uiAssignedTime: formatTime(d.deliveryCollectionStartTime),
            uiAssignedDuration: duration,
          };
        }),
      );
      const assignedIds = new Set(assigned.map((a) => a.id));
      const unassigned = globalUnassigned.filter((u) => !assignedIds.has(u.id));
      newDockets = [...assigned, ...unassigned];
    } else if (viewType === 'drivers' && driversData) {
      const assigned = (driversData.resources || []).flatMap((r) =>
        (r.dockets || []).map((d) => {
          let duration = 2;
          if (d.deliveryCollectionStartTime && d.deliveryCollectionEndTime) {
            const start = new Date(
              d.deliveryCollectionStartTime.replace('Z', ''),
            ).getTime();
            const end = new Date(
              d.deliveryCollectionEndTime.replace('Z', ''),
            ).getTime();
            duration = Math.max(
              1,
              Math.round((end - start) / (1000 * 60 * 60)),
            );
          }
          return {
            ...d,
            uiAssignedTruckId: String(r.id), // We map driver id to truckId for the UI to reuse the same component
            uiAssignedTime: formatTime(d.deliveryCollectionStartTime),
            uiAssignedDuration: duration,
          };
        }),
      );
      const assignedIds = new Set(assigned.map((a) => a.id));
      const unassigned = globalUnassigned.filter((u) => !assignedIds.has(u.id));
      newDockets = [...assigned, ...unassigned];
    }

    setDockets(newDockets || []);
  }, [trucksData, driversData, allDocketsData, viewType]);

  const mappedResources: TruckResource[] = useMemo(() => {
    if (viewType === 'trucks' && trucksData) {
      return (trucksData.resources || []).map((r) => {
        if ('licensePlate' in r) {
          return {
            id: String(r.id),
            name: r.licensePlate,
            capacity: r.tankVolumeM3,
            status: r.truckStatus,
            trips: r.dockets?.length || 0,
            businessType: r.truckBusinessType,
            drivers:
              r.drivers?.map((d) => d.driverName).join(', ') || 'Unassigned',
            driversCount: r.drivers?.length || 0,
            haulierName: r.haulier?.haulierName || '',
          };
        }
        return {
          id: String(r.id),
          name: 'Unknown',
          capacity: 0,
          status: TRUCK_STATUS.ACTIVE,
          trips: 0,
          drivers: 'Unassigned',
          driversCount: 0,
          businessType: TRUCK_BUSINESS_TYPE.INTERNAL,
        };
      });
    }
    if (viewType === 'drivers' && driversData) {
      return (driversData.resources || []).map((r) => {
        if ('driverName' in r) {
          return {
            id: String(r.id),
            name:
              r.trucks?.map((t) => t.licensePlate).join(', ') || 'Unassigned',
            capacity: 0,
            status: TRUCK_STATUS.ACTIVE,
            trips: r.dockets?.length || 0,
            drivers: r.driverName,
            businessType:
              (r.driverType as TRUCK_BUSINESS_TYPE) ||
              TRUCK_BUSINESS_TYPE.INTERNAL,
          };
        }
        return {
          id: String(r.id),
          name: 'Unknown',
          capacity: 0,
          status: TRUCK_STATUS.ACTIVE,
          trips: 0,
          drivers: 'Unassigned',
          businessType: TRUCK_BUSINESS_TYPE.INTERNAL,
        };
      });
    }
    return [];
  }, [trucksData, driversData, viewType]);

  const filterDriverOptions = useMemo(() => {
    if (viewType !== 'drivers' || !driversData?.resources) return [];
    return driversData.resources.filter(isDispatchDriverResource).map((r) => ({
      id: String(r.id),
      label: r.driverName,
      secondary:
        r.trucks
          ?.map((t) => t.licensePlate)
          .filter(Boolean)
          .join(', ') || undefined,
    }));
  }, [viewType, driversData]);

  const filterTruckOptions = useMemo(() => {
    if (viewType !== 'trucks' || !trucksData?.resources) return [];
    return trucksData.resources.filter(isDispatchTruckResource).map((r) => ({
      id: String(r.id),
      label: r.licensePlate,
      secondary:
        r.drivers
          ?.map((d) => d.driverName)
          .filter(Boolean)
          .join(', ') || undefined,
    }));
  }, [viewType, trucksData]);

  const filterHaulierOptions = useMemo(() => {
    if (viewType !== 'trucks' || !trucksData?.resources) return [];
    const byId = new Map<number, string>();
    for (const r of trucksData.resources) {
      if (!isDispatchTruckResource(r)) continue;
      for (const d of r.drivers || []) {
        const h = d.haulier;
        if (h?.id != null && h.haulierName) {
          byId.set(h.id, h.haulierName);
        }
      }
    }
    return [...byId.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, label]) => ({ id: String(id), label }));
  }, [viewType, trucksData]);

  const filterCustomerOptions = useMemo(() => {
    const names = new Set<string>();

    if (viewType === 'trucks' && trucksData?.resources) {
      for (const r of trucksData.resources) {
        if (isDispatchTruckResource(r)) {
          for (const d of r.dockets || []) {
            if (d.customerName) names.add(d.customerName);
          }
        }
      }
    } else if (viewType === 'drivers' && driversData?.resources) {
      for (const r of driversData.resources) {
        if (isDispatchDriverResource(r)) {
          for (const d of r.dockets || []) {
            if (d.customerName) names.add(d.customerName);
          }
        }
      }
    }

    const uniqueNames = Array.from(names).sort();
    return uniqueNames;
  }, [viewType, trucksData, driversData]);

  const filteredMappedResources = useMemo(() => {
    let allowedTruckIds = new Set<string>();
    let allowedDriverIds = new Set<string>();

    if (viewType === 'trucks' && trucksData?.resources) {
      allowedTruckIds = new Set(
        trucksData.resources
          .filter(isDispatchTruckResource)
          .filter((r) => truckMatchesFleetFilters(r, boardFilter))
          .map((r) => String(r.id)),
      );
    } else if (viewType === 'drivers' && driversData?.resources) {
      allowedDriverIds = new Set(
        driversData.resources
          .filter(isDispatchDriverResource)
          .filter((r) => driverRowMatchesFilters(r, boardFilter))
          .map((r) => String(r.id)),
      );
    }

    let result = mappedResources.filter((row) => {
      if (viewType === 'trucks') return allowedTruckIds.has(row.id);
      if (viewType === 'drivers') return allowedDriverIds.has(row.id);
      return true;
    });

    // If jobStatus filter is active, hide rows that have NO matching dockets
    if (
      boardFilter.jobStatuses.length > 0 ||
      boardFilter.customerNames.length > 0
    ) {
      const rowsWithDockets = new Set(
        dockets
          .filter((d) => {
            let match = true;
            if (boardFilter.jobStatuses.length > 0) {
              match =
                match && matchesBoardJobFilter(d, boardFilter.jobStatuses);
            }
            if (boardFilter.customerNames.length > 0) {
              match =
                match &&
                !!d.customerName &&
                boardFilter.customerNames.includes(d.customerName);
            }
            return match;
          })
          .map((d) => d.uiAssignedTruckId)
          .filter(Boolean),
      );
      result = result.filter((row) => rowsWithDockets.has(row.id));
    }

    return result;
  }, [
    mappedResources,
    viewType,
    trucksData,
    driversData,
    boardFilter,
    dockets,
  ]);

  const docketsForAssignedBoard = useMemo(() => {
    const visibleIds = new Set(filteredMappedResources.map((r) => r.id));
    return dockets.filter((d) => {
      if (d.docketStatus === DOCKET_STATUS.UNASSIGNED) return false;
      if (!d.uiAssignedTruckId || !visibleIds.has(d.uiAssignedTruckId)) {
        return false;
      }
      let match = matchesBoardJobFilter(d, boardFilter.jobStatuses);
      if (boardFilter.customerNames.length > 0) {
        match =
          match &&
          !!d.customerName &&
          boardFilter.customerNames.includes(d.customerName);
      }
      return match;
    });
  }, [
    dockets,
    filteredMappedResources,
    boardFilter.jobStatuses,
    boardFilter.customerNames,
  ]);

  const docketsForSelectedDay = useMemo(
    () => dockets.filter((d) => isDocketOnSelectedLocalDay(d, date)),
    [dockets, date],
  );

  const headerStats = useMemo(() => {
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
      trucksBooked,
      driversOnTrips: onTripDriverIds.size,
    };
  }, [docketsForSelectedDay, viewType, trucksData, trucksDataForStats, date]);

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
      const docket = dockets.find((d) => String(d.id) === docketId);
      if (docket && docket.docketStatus !== DOCKET_STATUS.ASSIGNED) {
        return;
      }
      setPendingUnassignDocketId(docketId);
      return;
    }

    const match = overId.match(/^truck-(.+)-time-(.+)$/);
    if (match) {
      const [, targetId, time] = match;

      const docket = dockets.find((d) => String(d.id) === docketId);
      if (
        docket &&
        docket.docketStatus !== DOCKET_STATUS.UNASSIGNED &&
        docket.docketStatus !== DOCKET_STATUS.ASSIGNED
      ) {
        return; // Cannot move locked dockets
      }

      if (
        docket &&
        docket.uiAssignedTruckId === targetId &&
        docket.uiAssignedTime === time
      ) {
        // Dropped on the same slot, do nothing
        return;
      }

      setAssignModalData({ docketId, targetId, time });
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

    let endWindow = new Date(startWindow);
    endWindow.setHours(startWindow.getHours() + newDuration);

    if (
      endWindow.getDate() !== startWindow.getDate() ||
      endWindow.getMonth() !== startWindow.getMonth() ||
      endWindow.getFullYear() !== startWindow.getFullYear()
    ) {
      endWindow = new Date(startWindow);
      endWindow.setHours(23, 59, 59, 999);
    }

    assignMutation.mutate(
      {
        docketId: Number(docketId),
        driverId,
        truckId,
        deliveryStartWindow: formatLocalISO(startWindow),
        deliveryEndWindow: formatLocalISO(endWindow),
        plannedLoadSize: docket.actualLoadSize || docket.plannedLoadSize || 0,
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
      },
    );
  };

  const activeDocket = activeId
    ? dockets.find((d) => String(d.id) === activeId)
    : null;

  const focusDocket =
    activeDocket ||
    (selectedDocketId
      ? dockets.find((d) => String(d.id) === selectedDocketId)
      : null);

  const handleUnassign = () => {
    if (selectedDocketId) {
      setPendingUnassignDocketId(selectedDocketId);
    }
  };

  const pendingUnassignDocket = useMemo(
    () =>
      pendingUnassignDocketId
        ? dockets.find((d) => String(d.id) === pendingUnassignDocketId)
        : undefined,
    [dockets, pendingUnassignDocketId],
  );

  const unassignDialogSnapshot = useMemo(() => {
    if (!pendingUnassignDocket) return null;
    const { truck, driver } = resolveUnassignAssignmentLabels(
      pendingUnassignDocket,
      viewType,
      trucksData,
      driversData,
    );
    return {
      docketNumber: pendingUnassignDocket.docketNumber,
      cargoSummary: formatCargoLineForUnassign(pendingUnassignDocket),
      destination:
        pendingUnassignDocket.deliverySuburb +
        ', ' +
        pendingUnassignDocket.deliveryState || '',
      customerName: pendingUnassignDocket.customerName || '',
      truckLabel: truck,
      driverLabel: driver,
      assignmentDateLabel: assignmentDateDisplayForUnassign(
        pendingUnassignDocket,
        date,
      ),
      timeWindowLabel: formatTimeRange(
        pendingUnassignDocket.deliveryCollectionStartTime,
        pendingUnassignDocket.deliveryCollectionEndTime,
      ),
    };
  }, [pendingUnassignDocket, viewType, trucksData, driversData, date]);

  const confirmPendingUnassign = () => {
    if (!pendingUnassignDocketId) return;
    const id = pendingUnassignDocketId;
    unassignMutation.mutate(
      { docketId: Number(id) },
      {
        onSuccess: () => {
          setDockets((prev) =>
            prev.map((d) =>
              String(d.id) === id
                ? {
                  ...d,
                  uiAssignedTruckId: null,
                  uiAssignedTime: null,
                  docketStatus: DOCKET_STATUS.UNASSIGNED,
                }
                : d,
            ),
          );
          setPendingUnassignDocketId(null);
          if (selectedDocketId === id) setSelectedDocketId(null);
        },
      },
    );
  };

  const handleAssignResource = (
    selectedId: number,
    adjustedLoadSize?: number,
  ) => {
    if (!assignModalData) return;

    const { docketId, targetId, time } = assignModalData;
    const docket = dockets.find((d) => String(d.id) === docketId);
    const plannedLoad =
      adjustedLoadSize ?? docket?.plannedLoadSize ?? docket?.loadSize ?? 0;

    // Parse time to ISO strings for start and end windows
    // The time variable is like "11:00"
    const [hours, minutes] = time.split(':').map(Number);
    const startWindow = new Date(date);
    startWindow.setHours(hours, minutes, 0, 0);

    // Assuming 2 hours duration for now, or use docket.uiAssignedDuration
    const duration = docket?.uiAssignedDuration || 2;
    let endWindow = new Date(startWindow);
    endWindow.setHours(startWindow.getHours() + duration);

    if (
      endWindow.getDate() !== startWindow.getDate() ||
      endWindow.getMonth() !== startWindow.getMonth() ||
      endWindow.getFullYear() !== startWindow.getFullYear()
    ) {
      endWindow = new Date(startWindow);
      endWindow.setHours(23, 59, 59, 999);
    }

    const truckId = viewType === 'trucks' ? Number(targetId) : selectedId;
    const driverId = viewType === 'trucks' ? selectedId : Number(targetId);

    assignMutation.mutate(
      {
        docketId: Number(docketId),
        driverId,
        truckId,
        deliveryStartWindow: formatLocalISO(startWindow),
        deliveryEndWindow: formatLocalISO(endWindow),
        plannedLoadSize: plannedLoad,
      },
      {
        onSuccess: () => {
          setDockets((prev) =>
            prev.map((d) =>
              String(d.id) === docketId
                ? {
                  ...d,
                  uiAssignedTruckId: targetId,
                  uiAssignedTime: time,
                  plannedLoadSize: plannedLoad,
                  actualLoadSize: adjustedLoadSize ?? d.actualLoadSize,
                  loadSize: plannedLoad,
                  deliveryCollectionDate:
                    formatLocalISO(startWindow).split('T')[0] +
                    'T00:00:00.000',
                  deliveryCollectionStartTime: formatLocalISO(startWindow),
                  deliveryCollectionEndTime: formatLocalISO(endWindow),
                  docketStatus: DOCKET_STATUS.ASSIGNED,
                }
                : d,
            ),
          );
          setAssignModalData(null);
        },
      },
    );
  };

  const assignModalDocket = assignModalData
    ? dockets.find((d) => String(d.id) === assignModalData.docketId)
    : null;

  const assignModalTruck: DispatchTruckResource | null =
    assignModalData && viewType === 'trucks' && trucksData
      ? (trucksData.resources.find(
        (r): r is DispatchTruckResource =>
          isDispatchTruckResource(r) &&
          String(r.id) === assignModalData.targetId,
      ) ?? null)
      : null;

  const assignModalDriver: DispatchDriverResource | null =
    assignModalData && viewType === 'drivers' && driversData
      ? (driversData.resources.find(
        (r): r is DispatchDriverResource =>
          isDispatchDriverResource(r) &&
          String(r.id) === assignModalData.targetId,
      ) ?? null)
      : null;

  const unassignedDocketsForBoard = useMemo(() => {
    return dockets.filter((d) => d.docketStatus === DOCKET_STATUS.UNASSIGNED);
  }, [dockets]);

  return (
    <>
      <InvoiceDetailsDialog />
      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <DispatchDriversTrucksFilter
          viewType={viewType}
          driverOptions={filterDriverOptions}
          truckOptions={filterTruckOptions}
          haulierOptions={filterHaulierOptions}
          customerOptions={filterCustomerOptions}
          isLoadingResources={isLoading}
          filter={boardFilter}
          onFilterChange={setBoardFilter}
        />
        <div className="border-b pl-6 py-2.5 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-[#64748B]">
              {format(date, 'EEE dd MMM').toUpperCase()}
            </span>

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
              dockets={unassignedDocketsForBoard}
              isLoading={isLoading}
              selectedDocketId={selectedDocketId}
              onSelectDocket={setSelectedDocketId}
            />
          </div>
          <div className="flex-1 min-w-0">
            <AssignedDockets
              trucks={filteredMappedResources}
              dockets={docketsForAssignedBoard}
              isLoading={isLoading}
              onUpdateDocket={handleUpdateDocket}
              onResizeDocket={handleResizeDocket}
              selectedDocketId={selectedDocketId}
              onSelectDocket={setSelectedDocketId}
              viewType={viewType}
              focusDocket={focusDocket}
            />
          </div>
          {selectedDocketId && (
            <div className="w-[400px] shrink-0 border border-[#E2E8F0] rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
              <DocketDetailsPanel
                docketId={Number(selectedDocketId)}
                onClose={() => setSelectedDocketId(null)}
                onUnassign={handleUnassign}
                isDispatchView={true}
              />
            </div>
          )}
        </div>
        <DragOverlay zIndex={1000} modifiers={[snapCenterToCursor]}>
          {activeDocket ? <DocketCardOverlay docket={activeDocket} /> : null}
        </DragOverlay>

        <AssignTruckDriverModal
          open={!!assignModalData}
          onOpenChange={(open) => !open && setAssignModalData(null)}
          viewType={viewType}
          docket={assignModalDocket as DispatchDocket | null}
          truck={assignModalTruck}
          driver={assignModalDriver}
          slotTime={assignModalData?.time ?? ''}
          assignmentDate={date}
          onAssign={handleAssignResource}
          onCancel={() => setAssignModalData(null)}
        />

        {unassignDialogSnapshot && (
          <ConfirmUnassignDialog
            open={!!pendingUnassignDocketId}
            onOpenChange={(open) => {
              if (!open) setPendingUnassignDocketId(null);
            }}
            docketNumber={unassignDialogSnapshot.docketNumber}
            cargoSummary={unassignDialogSnapshot.cargoSummary}
            destination={unassignDialogSnapshot.destination}
            customerName={unassignDialogSnapshot.customerName}
            truckLabel={unassignDialogSnapshot.truckLabel}
            driverLabel={unassignDialogSnapshot.driverLabel}
            assignmentDateLabel={unassignDialogSnapshot.assignmentDateLabel}
            timeWindowLabel={unassignDialogSnapshot.timeWindowLabel}
            onConfirm={confirmPendingUnassign}
            isConfirming={unassignMutation.isPending}
          />
        )}
      </DndContext>
    </>
  );
}
