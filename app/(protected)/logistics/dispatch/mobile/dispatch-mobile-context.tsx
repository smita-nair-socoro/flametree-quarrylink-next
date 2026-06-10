'use client';

import * as React from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  DocketsListQueryOptions,
  useAssignDocket,
  useUnassignDocket,
} from '@/lib/api/docket';
import {
  SchedulerDriversQueryOptions,
  SchedulerTrucksQueryOptions,
} from '@/lib/api/scheduler';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { TRUCK_BUSINESS_TYPE, TRUCK_STATUS } from '@/lib/types/truck-enums';
import type {
  DispatchDriverResource,
  DispatchTruckResource,
} from '@/lib/types/docket';
import type { TruckResource } from '@/lib/types/truck';
import { AssignTruckDriverModal } from '@/components/ui/schedular/assign-truck-driver-modal';
import { ConfirmUnassignDialog } from '@/components/ui/schedular/unassign-modal';
import { DocketDetailsPanel } from '@/components/ui/schedular/docket-details-panel';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import {
  DispatchDocket,
  formatCargoLineForUnassign,
  formatLocalISO,
  formatTime,
  formatTimeRange,
  isDispatchDriverResource,
  isDispatchTruckResource,
  isDocketOnSelectedLocalDay,
  mapUnassignedDocketDtoToBoardRow,
  assignmentDateDisplayForUnassign,
  resolveUnassignAssignmentLabels,
} from '@/lib/utils/dispatch-helper';
import {
  MobileAssignPickerDrawer,
  type MobileAssignSlot,
} from './mobile-assign-picker-drawer';

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

type DispatchMobileContextValue = {
  date: Date;
  dockets: DispatchDocket[];
  isLoadingTrucks: boolean;
  isLoadingDrivers: boolean;
  truckResources: TruckResource[];
  driverResources: TruckResource[];
  unassignedForDay: DispatchDocket[];
  unassignedCount: number;
  truckAssignedDockets: DispatchDocket[];
  driverAssignedDockets: DispatchDocket[];
  openAssignTruck: (docketId: string) => void;
  openAssignDriver: (docketId: string) => void;
  openDetails: (docketId: string) => void;
  requestUnassign: (docketId: string) => void;
  openMove: (docketId: string, mode: 'truck' | 'driver') => void;
};

const DispatchMobileContext = React.createContext<
  DispatchMobileContextValue | null
>(null);

export function useDispatchMobile() {
  const ctx = React.useContext(DispatchMobileContext);
  if (!ctx) {
    throw new Error('useDispatchMobile must be used within DispatchMobileProvider');
  }
  return ctx;
}

function mapAssignedDocket(
  d: DispatchDocket,
  resourceId: string,
): DispatchDocket {
  let duration = 2;
  if (d.deliveryCollectionStartTime && d.deliveryCollectionEndTime) {
    const startMs = new Date(
      d.deliveryCollectionStartTime.replace('Z', ''),
    ).getTime();
    const endMs = new Date(
      d.deliveryCollectionEndTime.replace('Z', ''),
    ).getTime();
    duration = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60)));
  }
  return {
    ...d,
    uiAssignedTruckId: resourceId,
    uiAssignedTime: formatTime(d.deliveryCollectionStartTime),
    uiAssignedDuration: duration,
  };
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

  const start = React.useMemo(() => startOfDay(date).toISOString(), [date]);
  const end = React.useMemo(() => endOfDay(date).toISOString(), [date]);

  const { data: trucksData, isLoading: isLoadingTrucks } = useQuery(
    SchedulerTrucksQueryOptions(start, end),
  );
  const { data: driversData, isLoading: isLoadingDrivers } = useQuery(
    SchedulerDriversQueryOptions(start, end),
  );
  const { data: allDocketsData } = useQuery(DocketsListQueryOptions());

  const assignMutation = useAssignDocket();
  const unassignMutation = useUnassignDocket();

  React.useEffect(() => {
    setSelectedDocketId(null);
  }, [date]);

  React.useEffect(() => {
    const allUnassignedList = Array.isArray(allDocketsData)
      ? allDocketsData
      : allDocketsData && 'content' in allDocketsData
        ? allDocketsData.content
        : [];

    const globalUnassigned = allUnassignedList
      .filter((d) => d.docketStatus === DOCKET_STATUS.UNASSIGNED)
      .map(mapUnassignedDocketDtoToBoardRow);

    const truckAssigned = (trucksData?.resources || []).flatMap((r) =>
      (r.dockets || []).map((d) => mapAssignedDocket(d, String(r.id))),
    );
    const driverAssigned = (driversData?.resources || []).flatMap((r) =>
      (r.dockets || []).map((d) => mapAssignedDocket(d, String(r.id))),
    );

    const assignedIds = new Set(
      [...truckAssigned, ...driverAssigned].map((d) => d.id),
    );
    const unassigned = globalUnassigned.filter((u) => !assignedIds.has(u.id));

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
  }, [trucksData, driversData, allDocketsData]);

  const truckResources: TruckResource[] = React.useMemo(() => {
    return (trucksData?.resources || []).map((r) => {
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
  }, [trucksData]);

  const driverResources: TruckResource[] = React.useMemo(() => {
    return (driversData?.resources || []).map((r) => {
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
  }, [driversData]);

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
    const docket = dockets.find((d) => String(d.id) === docketId);
    const plannedLoad =
      adjustedLoadSize ?? docket?.plannedLoadSize ?? docket?.loadSize ?? 0;

    const [hours, minutes] = time.split(':').map(Number);
    const startWindow = new Date(assignmentDate);
    startWindow.setHours(hours, minutes, 0, 0);

    const [endHours, endMinutes] = endTime.split(':').map(Number);
    let endWindow = new Date(assignmentDate);
    endWindow.setHours(endHours, endMinutes, 0, 0);

    if (endWindow <= startWindow) {
      endWindow = new Date(startWindow);
      endWindow.setHours(startWindow.getHours() + 2);
    }

    if (
      endWindow.getDate() !== startWindow.getDate() ||
      endWindow.getMonth() !== startWindow.getMonth() ||
      endWindow.getFullYear() !== startWindow.getFullYear()
    ) {
      endWindow = new Date(startWindow);
      endWindow.setHours(23, 59, 59, 999);
    }

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
                  ...(adjustedLoadSize != null
                    ? {
                      actualLoadSize: adjustedLoadSize,
                      plannedLoadSize: adjustedLoadSize,
                    }
                    : {}),
                }
                : d,
            ),
          );
          setAssignModalData(null);
        },
      },
    );
  };

  const pendingUnassignDocket = pendingUnassignDocketId
    ? dockets.find((d) => String(d.id) === pendingUnassignDocketId)
    : undefined;

  const unassignDialogSnapshot = React.useMemo(() => {
    if (!pendingUnassignDocket) return null;
    const viewType =
      truckResources.some((t) => t.id === pendingUnassignDocket.uiAssignedTruckId)
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
  }, [
    pendingUnassignDocket,
    truckResources,
    trucksData,
    driversData,
    date,
  ]);

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
    const docket = dockets.find(
      (d) => String(d.id) === assignModalData.docketId,
    );
    if (!docket) return null;
    return {
      ...docket,
      uiAssignedDuration: durationHoursFromWindow(
        assignModalData.time,
        assignModalData.endTime,
      ),
    };
  }, [assignModalData, dockets]);

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
    ? dockets.find((d) => String(d.id) === resourcePicker.docketId)
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
    dockets,
    isLoadingTrucks,
    isLoadingDrivers,
    truckResources,
    driverResources,
    unassignedForDay,
    unassignedCount: unassignedForDay.length,
    truckAssignedDockets,
    driverAssignedDockets,
    openAssignTruck: (docketId) => openResourcePicker(docketId, 'truck'),
    openAssignDriver: (docketId) => openResourcePicker(docketId, 'driver'),
    openDetails: (docketId) => setSelectedDocketId(docketId),
    requestUnassign: (docketId) => setPendingUnassignDocketId(docketId),
    openMove: (docketId, mode) => openResourcePicker(docketId, mode),
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
