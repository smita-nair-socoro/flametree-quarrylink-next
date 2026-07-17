'use client';

import * as React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  DocketsInfiniteListQueryOptions,
  getDocketItemsFromListResponse,
  useAssignDocket,
  useUnassignDocket,
} from '@/lib/api/docket';
import type { DocketDTO } from '@/lib/types/docket';
import {
  SchedulerDriversQueryOptions,
  SchedulerTrucksQueryOptions,
} from '@/lib/api/scheduler';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { TRUCK_BUSINESS_TYPE, TRUCK_STATUS } from '@/lib/types/truck-enums';
import type {
  DispatchDriverResource,
  DispatchTruckResource,
  DispatchUnassignedDocket,
} from '@/lib/types/docket';
import type { TruckResource } from '@/lib/types/truck';
import { AssignTruckDriverModal } from '@/components/ui/schedular/assign-truck-driver-modal';
import { ConfirmUnassignDialog } from '@/components/ui/schedular/unassign-modal';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import {
  buildDispatchAssignmentWindows,
  DispatchDocket,
  formatCargoLineForUnassign,
  formatLocalDate,
  formatLocalISO,
  formatTimeRange,
  isDispatchDriverResource,
  isDispatchTruckResource,
  isDocketOnSelectedLocalDay,
  mapSchedulerAssignedDocketToBoardRow,
  mapUnassignedDocketDtoToBoardRow,
  assignmentDateDisplayForUnassign,
  resolveUnassignAssignmentLabels,
  sortDispatchDriverList,
  sortDispatchTruckList,
  getUnassignedQueueApiSortParams,
  isSchedulerQueryLoading,
  mapSchedulerUnassignedDocketsToBoardRows,
} from '@/lib/utils/dispatch-helper';
import {
  MobileAssignPickerDrawer,
  type MobileAssignSlot,
} from './mobile-assign-picker-drawer';
import type { QueueDateScope } from './queue/queue-filters-drawer';
import type { QueueSortKey, QueueSortOrder } from './queue/queue-sort-drawer';
import { notifySuccess } from '@/lib/toast';

type AssignModalData = {
  docketId: string;
  targetId: string;
  time: string;
  endTime: string;
  assignmentDate: Date;
  viewType: 'trucks' | 'drivers';
};

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function durationHoursFromWindow(startTime: string, endTime: string) {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
  return Math.max(1, Math.round(diff / 60));
}

/** Radix + Vaul can leave `body { pointer-events: none }` when overlays close together. */
function unlockBodyPointerEventsIfStuck() {
  if (typeof document === 'undefined') return;
  if (document.body.style.pointerEvents === 'none') {
    document.body.style.pointerEvents = '';
  }
}

function scheduleUnlockBodyPointerEvents() {
  window.requestAnimationFrame(() => {
    unlockBodyPointerEventsIfStuck();
  });
}

type ResourcePickerState = {
  mode: 'truck' | 'driver';
  docketId: string;
};

type MobileDispatchTab = 'queue' | 'trucks' | 'drivers';

type DispatchMobileContextValue = {
  date: Date;
  activeTab: MobileDispatchTab;
  setActiveTab: (tab: MobileDispatchTab) => void;
  dockets: DispatchDocket[];
  isLoadingTrucks: boolean;
  isLoadingDrivers: boolean;
  isLoadingQueue: boolean;
  truckResources: TruckResource[];
  driverResources: TruckResource[];
  unassignedForDay: DispatchDocket[];
  allUnassignedDockets: DispatchDocket[];
  unassignedCount: number;
  truckAssignedDockets: DispatchDocket[];
  driverAssignedDockets: DispatchDocket[];
  openAssignTruck: (docketId: string) => void;
  openAssignDriver: (docketId: string) => void;
  openDetails: (docketId: string) => void;
  requestUnassign: (docketId: string) => void;
  openMove: (docketId: string, mode: 'truck' | 'driver') => void;
  queueDateScope: QueueDateScope;
  setQueueDateScope: (scope: QueueDateScope) => void;
  isLoadingAllUnassignedDockets: boolean;
  hasNextUnassignedPage: boolean;
  isFetchingNextUnassignedPage: boolean;
  fetchNextUnassignedPage: () => void;
  setQueueListSortBy: (sortBy: QueueSortKey) => void;
  setQueueListSortOrder: (sortOrder: QueueSortOrder) => void;
  setQueueListSearch: (search: string | undefined) => void;
};

const DispatchMobileContext =
  React.createContext<DispatchMobileContextValue | null>(null);

export function useDispatchMobile() {
  const ctx = React.useContext(DispatchMobileContext);
  if (!ctx) {
    throw new Error(
      'useDispatchMobile must be used within DispatchMobileProvider',
    );
  }
  return ctx;
}

function resolveDocketById(
  docketId: string,
  dockets: DispatchDocket[],
  allUnassignedFromApi: DispatchDocket[],
): DispatchDocket | undefined {
  return (
    dockets.find((d) => String(d.id) === docketId) ??
    allUnassignedFromApi.find((d) => String(d.id) === docketId)
  );
}

export function DispatchMobileProvider({
  date,
  children,
}: {
  date: Date;
  children: React.ReactNode;
}) {
  const [dockets, setDockets] = React.useState<DispatchDocket[]>([]);
  const [selectedDocketId, setSelectedDocketId] = React.useState<string | null>(
    null,
  );
  const [assignModalData, setAssignModalData] =
    React.useState<AssignModalData | null>(null);
  const [pendingAssignModal, setPendingAssignModal] =
    React.useState<AssignModalData | null>(null);
  const [resourcePicker, setResourcePicker] =
    React.useState<ResourcePickerState | null>(null);
  const [pendingUnassignDocketId, setPendingUnassignDocketId] = React.useState<
    string | null
  >(null);
  const [queueDateScope, setQueueDateScopeState] =
    React.useState<QueueDateScope>('this_day');
  const [queueListSortBy, setQueueListSortBy] =
    React.useState<QueueSortKey>('time');
  const [queueListSortOrder, setQueueListSortOrder] =
    React.useState<QueueSortOrder>('asc');
  const [queueListSearch, setQueueListSearch] = React.useState<
    string | undefined
  >(undefined);
  const [activeTab, setActiveTab] =
    React.useState<MobileDispatchTab>('queue');

  const setQueueDateScope = React.useCallback((scope: QueueDateScope) => {
    setQueueDateScopeState(scope);
  }, []);

  const start = React.useMemo(() => formatLocalDate(date), [date]);
  const end = React.useMemo(() => formatLocalDate(date), [date]);

  const needsTrucksScheduler =
    activeTab === 'trucks' ||
    (activeTab === 'queue' && queueDateScope === 'this_day') ||
    resourcePicker?.mode === 'truck' ||
    assignModalData?.viewType === 'trucks' ||
    pendingAssignModal?.viewType === 'trucks';

  const needsDriversScheduler =
    activeTab === 'drivers' ||
    resourcePicker?.mode === 'driver' ||
    assignModalData?.viewType === 'drivers' ||
    pendingAssignModal?.viewType === 'drivers';

  const {
    data: trucksData,
    isLoading: isLoadingTrucks,
    isFetching: isFetchingTrucks,
    isPending: isPendingTrucks,
    isPlaceholderData: isPlaceholderTrucksData,
  } = useQuery({
    ...SchedulerTrucksQueryOptions(start, end),
    enabled: needsTrucksScheduler,
  });
  const {
    data: driversData,
    isLoading: isLoadingDrivers,
    isFetching: isFetchingDrivers,
    isPending: isPendingDrivers,
    isPlaceholderData: isPlaceholderDriversData,
  } = useQuery({
    ...SchedulerDriversQueryOptions(start, end),
    enabled: needsDriversScheduler,
  });

  const assignedIdsSet = React.useMemo(() => {
    const truckAssigned = (trucksData?.resources || []).flatMap((r) =>
      (r.dockets || []).map((d) => String(d.id)),
    );
    const driverAssigned = (driversData?.resources || []).flatMap((r) =>
      (r.dockets || []).map((d) => String(d.id)),
    );
    return new Set([...truckAssigned, ...driverAssigned]);
  }, [trucksData, driversData]);

  const allDatesQueryParams = React.useMemo(
    () => ({
      pageSize: 10,
      statuses: [DOCKET_STATUS.UNASSIGNED],
      search: queueListSearch,
      ...getUnassignedQueueApiSortParams(queueListSortBy, queueListSortOrder),
    }),
    [queueListSearch, queueListSortBy, queueListSortOrder],
  );

  const {
    data: allDocketsPages,
    isLoading: isLoadingAllUnassignedDockets,
    isFetching: isFetchingAllUnassignedDockets,
    isPending: isPendingAllUnassignedDockets,
    isFetchingNextPage: isFetchingNextUnassignedPage,
    hasNextPage: hasNextUnassignedPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...DocketsInfiniteListQueryOptions(allDatesQueryParams),
    enabled: activeTab === 'queue' && queueDateScope === 'all_dates',
  });

  const allUnassignedFromApi = React.useMemo(() => {
    const pages = allDocketsPages?.pages ?? [];
    const seenIds = new Set<number>();
    const raw: DocketDTO[] = [];

    for (const page of pages) {
      const items = getDocketItemsFromListResponse(page);
      for (const docket of items) {
        if (seenIds.has(docket.id)) continue;
        seenIds.add(docket.id);
        raw.push(docket);
      }
    }

    return raw
      .filter((d) => !assignedIdsSet.has(String(d.id)))
      .map(mapUnassignedDocketDtoToBoardRow);
  }, [allDocketsPages, assignedIdsSet]);

  const isLoadingQueueThisDay =
    activeTab === 'queue' &&
    queueDateScope === 'this_day' &&
    needsTrucksScheduler &&
    isSchedulerQueryLoading({
      isPending: isPendingTrucks,
      isLoading: isLoadingTrucks,
      isFetching: isFetchingTrucks,
      isPlaceholderData: isPlaceholderTrucksData,
      hasData: Boolean(trucksData),
    });

  const isLoadingQueueAllDates =
    activeTab === 'queue' &&
    queueDateScope === 'all_dates' &&
    (isPendingAllUnassignedDockets ||
      isLoadingAllUnassignedDockets ||
      (isFetchingAllUnassignedDockets && !allDocketsPages?.pages.length));

  const isLoadingQueue = isLoadingQueueThisDay || isLoadingQueueAllDates;

  const assignMutation = useAssignDocket();
  const unassignMutation = useUnassignDocket();

  React.useEffect(() => {
    setSelectedDocketId(null);
  }, [date]);

  React.useEffect(() => {
    const truckAssigned = (trucksData?.resources || []).flatMap((r) =>
      (r.dockets || []).map((d) =>
        mapSchedulerAssignedDocketToBoardRow(d, String(r.id)),
      ),
    );
    const driverAssigned = (driversData?.resources || []).flatMap((r) =>
      (r.dockets || []).map((d) =>
        mapSchedulerAssignedDocketToBoardRow(d, String(r.id)),
      ),
    );

    const assignedIds = new Set(
      [...truckAssigned, ...driverAssigned].map((d) => d.id),
    );

    const schedulerUnassignedById = new Map<number, DispatchUnassignedDocket>();
    for (const u of trucksData?.unassignedDockets ?? []) {
      schedulerUnassignedById.set(u.id, u);
    }
    for (const u of driversData?.unassignedDockets ?? []) {
      schedulerUnassignedById.set(u.id, u);
    }

    const unassigned = mapSchedulerUnassignedDocketsToBoardRows(
      Array.from(schedulerUnassignedById.values()),
      assignedIds,
    );

    const merged = [...truckAssigned, ...driverAssigned, ...unassigned];

    setDockets((prev) => {
      const prevById = new Map(prev.map((d) => [d.id, d]));
      return merged.map((d) => {
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
  }, [trucksData, driversData]);

  const truckResources: TruckResource[] = React.useMemo(() => {
    const mapped = (trucksData?.resources || []).map((r) => {
      if (isDispatchTruckResource(r)) {
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
    return sortDispatchTruckList(mapped);
  }, [trucksData]);

  const driverResources: TruckResource[] = React.useMemo(() => {
    const mapped = (driversData?.resources || []).map((r) => {
      if (isDispatchDriverResource(r)) {
        return {
          id: String(r.id),
          name: r.driverName,
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
    return sortDispatchDriverList(mapped);
  }, [driversData]);

  const allUnassignedDockets = allUnassignedFromApi;

  const unassignedForDay = React.useMemo(
    () =>
      dockets.filter(
        (d) =>
          d.docketStatus === DOCKET_STATUS.UNASSIGNED &&
          isDocketOnSelectedLocalDay(d, date),
      ),
    [dockets, date],
  );

  const truckAssignedDockets = React.useMemo(() => {
    const truckIds = new Set(truckResources.map((t) => t.id));
    return dockets.filter(
      (d) =>
        d.docketStatus !== DOCKET_STATUS.UNASSIGNED &&
        d.uiAssignedTruckId &&
        truckIds.has(d.uiAssignedTruckId) &&
        isDocketOnSelectedLocalDay(d, date),
    );
  }, [dockets, truckResources, date]);

  const driverAssignedDockets = React.useMemo(() => {
    const driverIds = new Set(driverResources.map((d) => d.id));
    return dockets.filter(
      (d) =>
        d.docketStatus !== DOCKET_STATUS.UNASSIGNED &&
        d.uiAssignedTruckId &&
        driverIds.has(d.uiAssignedTruckId) &&
        isDocketOnSelectedLocalDay(d, date),
    );
  }, [dockets, driverResources, date]);

  const openResourcePicker = (docketId: string, mode: 'truck' | 'driver') => {
    setPendingAssignModal(null);
    setResourcePicker({ docketId, mode });
  };

  const handleAssignPickerConfirm = (
    resourceId: string,
    slot: MobileAssignSlot,
  ) => {
    if (!resourcePicker) return;

    setPendingAssignModal({
      docketId: resourcePicker.docketId,
      targetId: resourceId,
      time: slot.startTime,
      endTime: slot.endTime,
      assignmentDate: slot.assignmentDate,
      viewType: resourcePicker.mode === 'truck' ? 'trucks' : 'drivers',
    });
    setResourcePicker(null);
  };

  React.useEffect(() => {
    if (!pendingAssignModal) return;

    const timer = window.setTimeout(() => {
      setAssignModalData(pendingAssignModal);
      setPendingAssignModal(null);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [pendingAssignModal]);

  const closeAssignModal = React.useCallback(() => {
    setAssignModalData(null);
    scheduleUnlockBodyPointerEvents();
  }, []);

  const closeResourcePicker = React.useCallback(() => {
    setResourcePicker(null);
    setPendingAssignModal(null);
    scheduleUnlockBodyPointerEvents();
  }, []);

  const handleAssignResource = (
    selectedId: number,
    adjustedLoadSize?: number,
  ) => {
    if (!assignModalData) return;

    const { docketId, targetId, time, endTime, assignmentDate, viewType } =
      assignModalData;
    const docket = resolveDocketById(
      docketId,
      dockets,
      allUnassignedFromApi,
    );
    const plannedLoad =
      adjustedLoadSize ?? docket?.plannedLoadSize ?? docket?.loadSize ?? 0;

    const { startWindow, endWindow } = buildDispatchAssignmentWindows(
      assignmentDate,
      time,
      2,
      endTime,
    );

    let driverId: number | undefined;
    let truckId: number | undefined;

    if (viewType === 'trucks') {
      truckId = Number(targetId);
      driverId = selectedId;
    } else {
      driverId = Number(targetId);
      truckId = selectedId;
    }

    if (!driverId || truckId == null || Number.isNaN(truckId)) return;

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
          setDockets((prev) => {
            const existing = prev.find((d) => String(d.id) === docketId);
            const base =
              existing ??
              docket ??
              resolveDocketById(docketId, prev, allUnassignedFromApi);
            if (!base) return prev;

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
              return prev.map((d) =>
                String(d.id) === docketId ? updated : d,
              );
            }
            return [...prev, updated];
          });
          setAssignModalData(null);
          notifySuccess('Successfully assigned.');
        },
      },
    );
  };

  const pendingUnassignDocket = pendingUnassignDocketId
    ? resolveDocketById(
      pendingUnassignDocketId,
      dockets,
      allUnassignedFromApi,
    )
    : undefined;

  const unassignDialogSnapshot = React.useMemo(() => {
    if (!pendingUnassignDocket) return null;
    const viewType = truckResources.some(
      (t) => t.id === pendingUnassignDocket.uiAssignedTruckId,
    )
      ? 'trucks'
      : 'drivers';
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
  }, [pendingUnassignDocket, truckResources, trucksData, driversData, date]);

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

  const assignModalDocket = React.useMemo(() => {
    if (!assignModalData) return null;
    const docket = resolveDocketById(
      assignModalData.docketId,
      dockets,
      allUnassignedFromApi,
    );
    if (!docket) return null;
    return {
      ...docket,
      uiAssignedDuration: durationHoursFromWindow(
        assignModalData.time,
        assignModalData.endTime,
      ),
    };
  }, [assignModalData, dockets, allUnassignedFromApi]);

  const assignModalTruck: DispatchTruckResource | null =
    assignModalData?.viewType === 'trucks' && trucksData
      ? (trucksData.resources.find(
        (r): r is DispatchTruckResource =>
          isDispatchTruckResource(r) &&
          String(r.id) === assignModalData.targetId,
      ) ?? null)
      : null;

  const assignModalDriver: DispatchDriverResource | null =
    assignModalData?.viewType === 'drivers' && driversData
      ? (driversData.resources.find(
        (r): r is DispatchDriverResource =>
          isDispatchDriverResource(r) &&
          String(r.id) === assignModalData.targetId,
      ) ?? null)
      : null;

  const pickerDocket = resourcePicker
    ? resolveDocketById(
      resourcePicker.docketId,
      dockets,
      allUnassignedFromApi,
    )
    : null;

  const pickerTrucks = React.useMemo(
    () => (trucksData?.resources || []).filter(isDispatchTruckResource),
    [trucksData],
  );

  const pickerDrivers = React.useMemo(
    () => (driversData?.resources || []).filter(isDispatchDriverResource),
    [driversData],
  );

  const value: DispatchMobileContextValue = {
    date,
    activeTab,
    setActiveTab,
    dockets,
    isLoadingTrucks: isSchedulerQueryLoading({
      isPending: isPendingTrucks,
      isLoading: isLoadingTrucks,
      isFetching: isFetchingTrucks,
      isPlaceholderData: isPlaceholderTrucksData,
      hasData: Boolean(trucksData),
    }),
    isLoadingDrivers: isSchedulerQueryLoading({
      isPending: isPendingDrivers,
      isLoading: isLoadingDrivers,
      isFetching: isFetchingDrivers,
      isPlaceholderData: isPlaceholderDriversData,
      hasData: Boolean(driversData),
    }),
    isLoadingQueue,
    truckResources,
    driverResources,
    unassignedForDay,
    allUnassignedDockets,
    unassignedCount: unassignedForDay.length,
    truckAssignedDockets,
    driverAssignedDockets,
    openAssignTruck: (docketId) => openResourcePicker(docketId, 'truck'),
    openAssignDriver: (docketId) => openResourcePicker(docketId, 'driver'),
    openDetails: (docketId) => setSelectedDocketId(docketId),
    requestUnassign: (docketId) => setPendingUnassignDocketId(docketId),
    openMove: (docketId, mode) => openResourcePicker(docketId, mode),
    queueDateScope,
    setQueueDateScope,
    isLoadingAllUnassignedDockets: isLoadingQueueAllDates,
    hasNextUnassignedPage: hasNextUnassignedPage ?? false,
    isFetchingNextUnassignedPage,
    fetchNextUnassignedPage: () => {
      void fetchNextPage();
    },
    setQueueListSortBy,
    setQueueListSortOrder,
    setQueueListSearch,
  };

  return (
    <DispatchMobileContext.Provider value={value}>
      {children}

      {resourcePicker && pickerDocket ? (
        <MobileAssignPickerDrawer
          open
          mode={resourcePicker.mode}
          docket={pickerDocket}
          boardDate={date}
          trucks={pickerTrucks}
          drivers={pickerDrivers}
          onOpenChange={(open) => {
            if (!open) closeResourcePicker();
          }}
          onConfirm={handleAssignPickerConfirm}
        />
      ) : null}

      {assignModalData ? (
        <AssignTruckDriverModal
          open
          onOpenChange={(open) => {
            if (!open) closeAssignModal();
          }}
          viewType={assignModalData.viewType}
          docket={assignModalDocket ?? null}
          truck={assignModalTruck}
          driver={assignModalDriver}
          slotTime={assignModalData.time}
          assignmentDate={assignModalData.assignmentDate}
          onAssign={handleAssignResource}
          onCancel={closeAssignModal}
        />
      ) : null}

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

      <Drawer
        open={!!selectedDocketId}
        onOpenChange={(open) => !open && setSelectedDocketId(null)}
      >
        <DrawerContent className="mt-0 flex h-[92dvh] max-h-[92dvh] flex-col overflow-hidden p-0">
          <DrawerTitle className="sr-only">Docket details</DrawerTitle>
          {selectedDocketId ? (
            <DocketDetailsPanel
              docketId={Number(selectedDocketId)}
              onClose={() => setSelectedDocketId(null)}
              onUnassign={() => {
                if (selectedDocketId) {
                  setPendingUnassignDocketId(selectedDocketId);
                }
              }}
              isDispatchView={true}
            />
          ) : null}
        </DrawerContent>
      </Drawer>
    </DispatchMobileContext.Provider>
  );
}
