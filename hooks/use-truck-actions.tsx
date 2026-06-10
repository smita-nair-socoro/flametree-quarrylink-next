'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Info } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { FormDialog } from '@/components/form-dialog';
import { TruckDTO } from '@/lib/types/truck';
import { useTruckStore } from '@/app/stores/truck-store';
import TruckForm from '@/app/(protected)/logistics/trucks/(components)/forms/truck-form';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage, extractErrorData } from '@/lib/utils/error-message-helper';
import {
  DeactivateTruckDescription,
  DeactivateTruckContent,
  CannotDeactivateTruckDescription,
  CannotDeactivateTruckContent,
} from '@/hooks/truck/deactivate-truck-content';
import {
  ReactivateTruckDescription,
  ReactivateTruckContent,
} from '@/hooks/truck/reactivate-truck-content';
import {
  DeleteTruckDescription,
  DeleteTruckContent,
  CannotDeleteTruckDescription,
  CannotDeleteTruckContent,
} from '@/hooks/truck/delete-truck-content';
import { AssignDriverContent } from '@/hooks/truck/assign-driver-content';
import {
  UnassignDriverContent,
  UnassignDriverDescription,
  UnassignDriverBlockedContent,
  UnassignDriverInfo,
} from '@/hooks/truck/unassign-driver-content';
import { useQuery } from '@tanstack/react-query';
import { HaulierDriversQueryOptions } from '@/lib/api/haulier';
import {
  useAssignDriversToTruck,
  useUnassignDriverFromTruck,
  useDeactivateTruck,
  useReactivateTruck,
  useDeleteTruck,
} from '@/lib/api/truck';
import { TruckActionButtons } from '@/app/(protected)/logistics/trucks/(components)/forms/truck-action-buttons';
import { Spinner } from '@/components/ui/spinner';

interface DialogConfig {
  title: string;
  description?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: string;
  confirmCustomColor?: string;
  confirmIcon?: React.ReactNode;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  confirmActionNeeded?: boolean;
  confirmDisabled?: boolean;
  cancelText?: string;
}

export function useTruckActions(truckData?: TruckDTO | null) {
  const router = useRouter();
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const setSelectedTruck = useTruckStore((state) => state.setSelectedTruck);
  const selectedTruck = useTruckStore((state) => state.selectedTruck);
  const [cannotDeactivateDocketIds, setCannotDeactivateDocketIds] =
    React.useState<number[]>([]);
  const [cannotDeleteDocketIds, setCannotDeleteDocketIds] = React.useState<
    number[]
  >([]);
  const [selectedDriver, setSelectedDriver] = React.useState<
    (UnassignDriverInfo & { id: number }) | null
  >(null);
  const [blockedDocketIds, setBlockedDocketIds] = React.useState<number[]>([]);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [selectedDriverIds, setSelectedDriverIds] = React.useState<number[]>(
    [],
  );
  const [scrollToSection, setScrollToSection] = React.useState<
    string | undefined
  >();
  // Prevents ActionDialog's auto-close from resetting activeDialog when
  // transitioning to a follow-up dialog (e.g. unassignDriver → unassignDriverBlocked).
  // Can be removed once ActionDialog is refactored to not auto-close after confirm.
  const transitioningRef = React.useRef(false);

  const haulierId = truckData?.haulier?.id ?? truckData?.haulierId ?? 0;
  const { data: availableDriversData } = useQuery({
    ...HaulierDriversQueryOptions(haulierId),
    enabled: !!haulierId && activeDialog === 'assignDriver',
  });
  const assignedDriverIds = (truckData?.drivers ?? []).map((d) => d.id).filter((id): id is number => id != null);
  const allDrivers = availableDriversData?.drivers ?? [];
  const assignDriversToTruck = useAssignDriversToTruck();
  const unassignDriverFromTruck = useUnassignDriverFromTruck();
  const deactivateTruck = useDeactivateTruck();
  const reactivateTruck = useReactivateTruck();
  const deleteTruck = useDeleteTruck();

  const assignedDrivers: string[] = (truckData?.drivers ?? []).map(
    (driver) => driver.driverName,
  );

  const handleDeactivate = async () => {
    if (!truckData?.id) return;
    try {
      await deactivateTruck.mutateAsync(truckData.id);
      notifySuccess('Truck deactivated successfully.');
      setActiveDialog(null);
    } catch (error: unknown) {
      const errorData = extractErrorData(error) as { activeDockets?: Array<{ id: number }> } | null;
      const blocked = errorData?.activeDockets ?? [];
      if (blocked.length > 0) {
        setCannotDeactivateDocketIds(blocked.map((d) => d.id));
        setActiveDialog('cannot_deactivate');
        return;
      }
      notifyError(extractErrorMessage(error) || 'Failed to deactivate truck.');
      setActiveDialog(null);
    }
  };

  const handleReactivate = async () => {
    if (!truckData?.id) return;
    try {
      await reactivateTruck.mutateAsync(truckData.id);
      notifySuccess('Truck reactivated successfully.');
      setActiveDialog(null);
    } catch (error: unknown) {
      notifyError(extractErrorMessage(error) || 'Failed to reactivate truck.');
    }
  };

  const handleDelete = async () => {
    if (!truckData?.id) return;
    try {
      await deleteTruck.mutateAsync(truckData.id);
      notifySuccess('Truck deleted successfully.');
      setActiveDialog(null);
      setViewOpen(false);
    } catch (error: unknown) {
      const errorData = extractErrorData(error) as { activeDockets?: Array<{ id: number }> } | null;
      const blocked = errorData?.activeDockets ?? [];
      if (blocked.length > 0) {
        setCannotDeleteDocketIds(blocked.map((d) => d.id));
        setActiveDialog('cannot_delete');
        return;
      }
      notifyError(extractErrorMessage(error) || 'Failed to delete truck.');
      setActiveDialog(null);
    }
  };

  const handleAssignDrivers = async () => {
    if (!truckData?.id) return;
    try {
      const currentDriverIds = (truckData.drivers ?? []).map((d) => d.id!);
      const merged = [...new Set([...currentDriverIds, ...selectedDriverIds])];
      await assignDriversToTruck.mutateAsync({
        truckId: truckData.id,
        data: { version: truckData.version ?? 0, driverIds: merged },
      });
      notifySuccess('Drivers assigned successfully.');
      setActiveDialog(null);
      setSelectedDriverIds([]);
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to assign drivers.');
    }
  };

  const handleUnassignDriver = async (
    driver: UnassignDriverInfo & { id: number },
  ) => {
    if (!truckData?.id) return;
    transitioningRef.current = true;
    try {
      const response = await unassignDriverFromTruck.mutateAsync({
        truckId: truckData.id,
        data: { version: truckData.version ?? 0, driverId: driver.id },
      });
      const blocked = response?.activeDockets ?? [];
      if (blocked.length > 0) {
        setBlockedDocketIds(blocked.map((d) => d.id));
        setActiveDialog('unassignDriverBlocked');
        return;
      }
      notifySuccess('Driver unassigned successfully.');
      setActiveDialog(null);
      setSelectedDriver(null);
    } catch (error) {
      transitioningRef.current = false;
      setActiveDialog(null);
      notifyError(extractErrorMessage(error) || 'Failed to unassign driver.');
    }
  };

  const handleNavigate = (url: string) => {
    setIsNavigating(true);
    setActiveDialog(null);
    router.push(url);
  };

  const handleTransferDockets = () => {
    const docketLink = `/customer-operations/dockets/?docketId=${blockedDocketIds.join(',')}`;
    setSelectedDriver(null);
    setBlockedDocketIds([]);
    handleNavigate(docketLink);
  };

  const dialogConfigs = React.useMemo(
    (): Record<string, DialogConfig> => ({
      deactivate: {
        title: 'Deactivate Truck',
        description: <DeactivateTruckDescription truck={truckData} />,
        content: <DeactivateTruckContent assignedDrivers={assignedDrivers} />,
        confirmText: 'Deactivate Truck',
        confirmVariant: 'destructive',
        confirmCustomColor: '#DC2626',
        cancelText: 'Cancel',
      },
      cannot_deactivate: {
        title: 'Cannot Deactivate Truck',
        description: <CannotDeactivateTruckDescription truck={truckData} />,
        content: (
          <CannotDeactivateTruckContent
            activeDocketIds={cannotDeactivateDocketIds}
          />
        ),
        confirmActionNeeded: false,
        cancelText: 'Cancel',
      },
      reactivate: {
        title: 'Reactivate TRUCK',
        description: <ReactivateTruckDescription truck={truckData} />,
        content: <ReactivateTruckContent />,
        confirmText: 'Mark as Available',
        confirmCustomColor: '#22C55E',
        cancelText: 'Cancel',
      },
      delete: {
        title: 'Delete Truck',
        description: <DeleteTruckDescription truck={truckData} />,
        content: <DeleteTruckContent />,
        confirmText: 'Delete Truck',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
        cancelText: 'Cancel',
      },
      cannot_delete: {
        title: 'Cannot Delete Truck',
        description: <CannotDeleteTruckDescription truck={truckData} />,
        content: (
          <CannotDeleteTruckContent
            truck={truckData}
            activeDocketIds={cannotDeleteDocketIds}
          />
        ),
        confirmActionNeeded: false,
        cancelText: 'Close',
      },
      assignDriver: {
        title: 'Assign Driver',
        content: (
          <AssignDriverContent
            drivers={allDrivers}
            assignedDriverIds={assignedDriverIds}
            onSelectionChange={setSelectedDriverIds}
          />
        ),
        confirmText: 'Assign',
        confirmCustomColor: '#8E51FF',
        confirmDisabled: selectedDriverIds.length === 0,
        cancelText: 'Cancel',
      },
      unassignDriver: {
        title: 'Unassign Driver from Truck?',
        description: selectedDriver ? (
          <UnassignDriverDescription
            licensePlate={truckData?.licensePlate ?? ''}
            driverName={selectedDriver.driverName}
          />
        ) : undefined,
        content: selectedDriver ? (
          <UnassignDriverContent driver={selectedDriver} />
        ) : null,
        confirmText: 'Unassign Driver',
        confirmCustomColor: '#E7000B',
        cancelText: 'Cancel',
      },
      unassignDriverBlocked: {
        title: 'Unassign Driver from Truck?',
        description: selectedDriver ? (
          <UnassignDriverDescription
            licensePlate={truckData?.licensePlate ?? ''}
            driverName={selectedDriver.driverName}
          />
        ) : undefined,
        content: selectedDriver ? (
          <UnassignDriverBlockedContent
            driverName={selectedDriver.driverName}
            activeDocketIds={blockedDocketIds}
          />
        ) : null,
        confirmText: 'Transfer Dockets',
        confirmCustomColor: '#8E51FF',
        confirmIcon: <ArrowLeftRight className="h-4 w-4" />,
        cancelText: 'Cancel',
      },
    }),
    [
      truckData,
      cannotDeactivateDocketIds,
      cannotDeleteDocketIds,
      assignedDrivers,
      selectedDriver,
      selectedDriverIds,
      allDrivers,
      assignedDriverIds,
      blockedDocketIds,
      handleNavigate,
    ],
  );

  const actionHandlers: Record<string, () => void> = {
    deactivate: () => void handleDeactivate(),
    reactivate: () => void handleReactivate(),
    delete: () => void handleDelete(),
    assignDriver: () => void handleAssignDrivers(),
    unassignDriver: () => {
      if (selectedDriver) void handleUnassignDriver(selectedDriver);
    },
    unassignDriverBlocked: () => handleTransferDockets(),
  };

  const actions = {
    view: (
      truck?: TruckDTO | null,
      options?: { scrollToSection?: string },
    ) => {
      const toSelect = truck ?? truckData;
      if (toSelect != null) setSelectedTruck(toSelect);
      setScrollToSection(options?.scrollToSection);
      setViewOpen(true);
    },
    deactivate: () => setActiveDialog('deactivate'),
    reactivate: () => setActiveDialog('reactivate'),
    delete: () => setActiveDialog('delete'),
    assignDriver: () => {
      setSelectedDriverIds([]);
      setActiveDialog('assignDriver');
    },
    unassignDriver: (driver: UnassignDriverInfo & { id: number }) => {
      setSelectedDriver(driver);
      setActiveDialog('unassignDriver');
    },
  };

  const confirmDialogs = (
    <>
      {isNavigating && (
        <div className="fixed inset-0 bg-white/60 z-50 flex flex-col items-center justify-center gap-4">
          <Spinner size="medium" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      )}
      {Object.entries(dialogConfigs).map(([key, config]) => (
        <ActionDialog
          key={key}
          open={activeDialog === key}
          onOpenChangeAction={(open) => {
            if (!open) {
              // TODO: need to change to API response check instead of hardcoding transitioning state
              if (transitioningRef.current) {
                transitioningRef.current = false;
                return;
              }
              setActiveDialog(null);
              setSelectedDriver(null);
              setBlockedDocketIds([]);
            }
          }}
          title={config.title}
          description={config.description}
          content={config.content}
          confirmText={config.confirmText ?? ''}
          confirmVariant={config.confirmVariant}
          confirmCustomColor={config.confirmCustomColor}
          confirmIcon={config.confirmIcon}
          confirmActionNeeded={config.confirmActionNeeded}
          confirmDisabled={config.confirmDisabled}
          cancelText={config.cancelText}
          onConfirmAction={() => actionHandlers[key]?.()}
        />
      ))}
    </>
  );

  const isGenericTruck = selectedTruck?.model === 'GENERIC';

  const viewDialog = viewOpen ? (
    <FormDialog
      id={selectedTruck?.id}
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) setScrollToSection(undefined);
      }}
      hideTrigger
      dialogTitle="View / Edit Truck"
      headerSubtitle={selectedTruck?.haulier?.haulierName}
      customTitle={isGenericTruck ? 'GENERIC TRUCK' : undefined}
      headerNotice={
        isGenericTruck ? (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-md px-4 py-3 text-sm">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
            <span>
              This is a generic truck automatically generated by the system for
              the hauler.
            </span>
          </div>
        ) : undefined
      }
      headerButtons={<TruckActionButtons truck={truckData ?? selectedTruck} />}
      headerInfo={{ useSelectedTruck: true }}
    >
      <TruckForm id={selectedTruck?.id} scrollToSection={scrollToSection} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
