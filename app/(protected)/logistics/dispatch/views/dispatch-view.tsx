'use client';

import { useState, useEffect, useMemo } from 'react';
import UnassignedDockets from '../cards/unassigned-dockets';
import AssignedDockets from '../cards/assigned-dockets';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import { format, startOfDay, endOfDay, isBefore } from 'date-fns';
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
import { useAssignDocket, useUnassignDocket } from '@/lib/api/docket';
import { notifySuccess } from '@/lib/toast';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import {
  SchedulerTrucksQueryOptions,
  SchedulerDriversQueryOptions,
} from '@/lib/api/scheduler';

import { InvoiceDetailsDialog } from '@/hooks/use-invoice-actions';
import {
  buildDispatchAssignmentWindows,
  DispatchDocket,
  mapSchedulerUnassignedDocketsToBoardRows,
  mapSchedulerAssignedDocketToBoardRow,
  isDispatchTruckResource,
  isDispatchDriverResource,
  truckMatchesFleetFilters,
  driverRowMatchesFilters,
  buildSchedulerFilterHaulierOptions,
  matchesBoardJobFilter,
  formatCargoLineForUnassign,
  assignmentDateDisplayForUnassign,
  resolveUnassignAssignmentLabels,
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

type DispatchDragData = {
  docket: DispatchDocket;
};

function getDocketFromDragActive(
  active: DragStartEvent['active'],
  dockets: DispatchDocket[],
): DispatchDocket | undefined {
  const fromDrag = (active.data.current as DispatchDragData | undefined)
    ?.docket;
  if (fromDrag) return fromDrag;
  return dockets.find((d) => String(d.id) === String(active.id));
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
  const [selectedDocketId, setSelectedDocketId] = useState<string | null>(null);
  const [assignModalData, setAssignModalData] = useState<{
    docketId: string;
    targetId: string;
    time: string;
    docket: DispatchDocket;
  } | null>(null);

  const [activeDragDocket, setActiveDragDocket] =
    useState<DispatchDocket | null>(null);

  const [pendingUnassignDocketId, setPendingUnassignDocketId] = useState<
    string | null
  >(null);

  /** Cached load for truck utilisation — survives assign + API refetch. */
  const [utilisationFocus, setUtilisationFocus] = useState<{
    docketId: string;
    loadSize: number;
  } | null>(null);

  const [boardFilter, setBoardFilter] = useState<DispatchBoardFilterState>(
    DEFAULT_DISPATCH_BOARD_FILTER,
  );

  useEffect(() => {
    setBoardFilter(DEFAULT_DISPATCH_BOARD_FILTER);
  }, [viewType]);

  useEffect(() => {
    setSelectedDocketId(null);
    setUtilisationFocus(null);
  }, [date]);

  useEffect(() => {
    if (viewType !== 'trucks') {
      setUtilisationFocus(null);
    }
  }, [viewType]);

  const start = useMemo(() => formatLocalISO(startOfDay(date)), [date]);
  const end = useMemo(() => formatLocalISO(endOfDay(date)), [date]);
  const isPastDispatchDate = useMemo(
    () => isBefore(startOfDay(date), startOfDay(new Date())),
    [date],
  );
  const isDispatchTodayOrFuture = !isPastDispatchDate;
  const boardInteractionMode = isPastDispatchDate ? 'view-only' : 'full';

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
        (r.dockets || []).map((d) =>
          mapSchedulerAssignedDocketToBoardRow(d, String(r.id)),
        ),
      );
      const assignedIds = new Set(assigned.map((a) => a.id));
      const unassigned = mapSchedulerUnassignedDocketsToBoardRows(
        trucksData.unassignedDockets ?? [],
        assignedIds,
      );
      newDockets = [...assigned, ...unassigned];
    } else if (viewType === 'drivers' && driversData) {
      const assigned = (driversData.resources || []).flatMap((r) =>
        (r.dockets || []).map((d) =>
          mapSchedulerAssignedDocketToBoardRow(d, String(r.id)),
        ),
      );
      const assignedIds = new Set(assigned.map((a) => a.id));
      const unassigned = mapSchedulerUnassignedDocketsToBoardRows(
        driversData.unassignedDockets ?? [],
        assignedIds,
      );
      newDockets = [...assigned, ...unassigned];
    }

    setDockets((prev) => {
      const prevById = new Map(prev.map((d) => [d.id, d]));
      return (newDockets || []).map((d) => {
        const old = prevById.get(d.id);
        if (!old) return d;
        return {
          ...d,
          actualLoadSize: d.actualLoadSize ?? old.actualLoadSize,
          plannedLoadSize: d.plannedLoadSize ?? old.plannedLoadSize,
          productDensity: d.productDensity ?? old.productDensity,
          productSellUom: d.productSellUom || old.productSellUom,
          productName: d.productName || old.productName,
        };
      });
    });
  }, [trucksData, driversData, viewType]);

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

  const filterHaulierOptions = useMemo(
    () => buildSchedulerFilterHaulierOptions(viewType, trucksData, driversData),
    [viewType, trucksData, driversData],
  );

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

  const applyUtilisationForDocket = (
    docketId: string,
    sourceDocket?: DispatchDocket,
  ) => {
    if (viewType !== 'trucks') return;

    const d = sourceDocket ?? dockets.find((x) => String(x.id) === docketId);
    if (!d) return;

    const loadSize = d.actualLoadSize || d.plannedLoadSize || 0;
    if (loadSize > 0) {
      setUtilisationFocus({ docketId, loadSize });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isPastDispatchDate) {
      return;
    }

    const id = event.active.id as string;
    const docket = getDocketFromDragActive(event.active, dockets);

    setActiveDragDocket(docket ?? null);
    setSelectedDocketId(id);

    if (docket?.docketStatus === DOCKET_STATUS.UNASSIGNED) {
      applyUtilisationForDocket(id, docket);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragDocket(null);

    if (isPastDispatchDate || !over) {
      return;
    }

    const docketId = active.id as string;
    const draggedDocket = getDocketFromDragActive(active, dockets);
    const overId = over.id as string;

    if (overId === 'unassigned-queue') {
      if (
        draggedDocket &&
        draggedDocket.docketStatus !== DOCKET_STATUS.ASSIGNED
      ) {
        return;
      }
      setPendingUnassignDocketId(docketId);
      return;
    }

    const match = overId.match(/^truck-(.+)-time-(.+)$/);
    if (match) {
      const [, targetId, time] = match;

      const docket = draggedDocket;
      if (!docket) {
        return;
      }

      if (
        docket.docketStatus !== DOCKET_STATUS.UNASSIGNED &&
        docket.docketStatus !== DOCKET_STATUS.ASSIGNED
      ) {
        return;
      }

      if (
        docket.uiAssignedTruckId === targetId &&
        docket.uiAssignedTime === time
      ) {
        return;
      }

      setSelectedDocketId(docketId);
      applyUtilisationForDocket(docketId, docket);
      setAssignModalData({ docketId, targetId, time, docket });
      return;
    }
  };

  const handleDragCancel = () => {
    setActiveDragDocket(null);
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
    if (isPastDispatchDate) return;

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

    const { startWindow, endWindow } = buildDispatchAssignmentWindows(
      date,
      time,
      newDuration,
    );

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

  const activeDocket = activeDragDocket;

  const handleSelectUnassignedDocket = (id: string) => {
    setSelectedDocketId(id);
    applyUtilisationForDocket(id);
  };

  const handleSelectAssignedDocket = (id: string | null) => {
    setSelectedDocketId(id);
    setUtilisationFocus(null);
  };

  const handleCloseDetailsPanel = () => {
    setSelectedDocketId(null);
    setUtilisationFocus(null);
  };

  const handleUtilisationLoadSizeChange = (loadSize: number) => {
    if (viewType !== 'trucks' || !selectedDocketId || loadSize <= 0) return;

    setUtilisationFocus((prev) => {
      if (prev?.docketId !== selectedDocketId) return prev;
      return { docketId: selectedDocketId, loadSize };
    });

    setDockets((prev) =>
      prev.map((d) => {
        if (String(d.id) !== selectedDocketId) return d;
        return {
          ...d,
          plannedLoadSize: loadSize,
          actualLoadSize: loadSize,
          loadSize,
        };
      }),
    );
  };

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
      destination: [
        pendingUnassignDocket.deliverySuburb,
        pendingUnassignDocket.deliveryState,
      ]
        .filter(Boolean)
        .join(', '),
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
          if (selectedDocketId === id) {
            setSelectedDocketId(null);
            setUtilisationFocus(null);
          }
        },
      },
    );
  };

  const handleAssignResource = (
    selectedId: number,
    adjustedLoadSize?: number,
  ) => {
    if (!assignModalData) return;

    const { docketId, targetId, time, docket: modalDocket } = assignModalData;
    const docket =
      modalDocket ?? dockets.find((d) => String(d.id) === docketId);
    const plannedLoad =
      adjustedLoadSize ?? docket?.plannedLoadSize ?? docket?.loadSize ?? 0;

    // The time variable is like "11:00"
    const { startWindow, endWindow } = buildDispatchAssignmentWindows(
      date,
      time,
      docket?.uiAssignedDuration || 2,
    );

    const truckId = viewType === 'trucks' ? Number(targetId) : selectedId;
    const driverId = viewType === 'trucks' ? selectedId : Number(targetId);

    assignMutation.mutate(
      {
        docketId: Number(docketId),
        driverId,
        truckId,
        deliveryStartWindow: formatLocalISO(startWindow),
        deliveryEndWindow: formatLocalISO(endWindow),
        plannedLoadSize:
          adjustedLoadSize ??
          docket?.actualLoadSize ??
          docket?.plannedLoadSize ??
          0,
      },
      {
        onSuccess: () => {
          setDockets((prev) => {
            const existing = prev.find((d) => String(d.id) === docketId);
            const base = existing ?? modalDocket;
            const updated: DispatchDocket = {
              ...base,
              uiAssignedTruckId: targetId,
              uiAssignedTime: time,
              plannedLoadSize: plannedLoad,
              actualLoadSize: adjustedLoadSize ?? base.actualLoadSize,
              loadSize: plannedLoad,
              deliveryCollectionDate:
                formatLocalISO(startWindow).split('T')[0] + 'T00:00:00.000',
              deliveryCollectionStartTime: formatLocalISO(startWindow),
              deliveryCollectionEndTime: formatLocalISO(endWindow),
              docketStatus: DOCKET_STATUS.ASSIGNED,
              ...(adjustedLoadSize != null
                ? {
                    actualLoadSize: adjustedLoadSize,
                    plannedLoadSize: adjustedLoadSize,
                  }
                : {}),
            };

            if (existing) {
              return prev.map((d) => (String(d.id) === docketId ? updated : d));
            }
            return [...prev, updated];
          });
          setUtilisationFocus((prev) => {
            if (prev?.docketId !== docketId) return prev;
            if (adjustedLoadSize != null) {
              return { docketId, loadSize: adjustedLoadSize };
            }
            return prev;
          });
          setAssignModalData(null);
          notifySuccess('Successfully assigned.');
        },
      },
    );
  };

  const assignModalDocket = assignModalData?.docket ?? null;

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
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
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
          <div className="flex flex-1 min-h-0 overflow-hidden pt-2 pb-4 px-4 gap-4">
            <div className="w-[390px] shrink-0">
              <UnassignedDockets
                date={date}
                dockets={unassignedDocketsForBoard}
                assignedDocketIds={dockets
                  .filter((d) => d.docketStatus !== DOCKET_STATUS.UNASSIGNED)
                  .map((d) => String(d.id))}
                isLoading={isLoading}
                selectedDocketId={selectedDocketId}
                onSelectDocket={handleSelectUnassignedDocket}
                dragEnabled={isDispatchTodayOrFuture}
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
                onSelectDocket={handleSelectAssignedDocket}
                viewType={viewType}
                utilisationFocus={utilisationFocus}
                boardInteractionMode={boardInteractionMode}
              />
            </div>
            {selectedDocketId && (
              <div className="w-[400px] shrink-0 border border-[#E2E8F0] rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
                <DocketDetailsPanel
                  docketId={Number(selectedDocketId)}
                  onClose={handleCloseDetailsPanel}
                  onUnassign={handleUnassign}
                  isDispatchView={true}
                  onUtilisationLoadSizeChange={handleUtilisationLoadSizeChange}
                />
              </div>
            )}
          </div>
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
