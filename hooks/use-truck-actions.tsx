'use client';

import * as React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { FormDialog } from '@/components/form-dialog';
import { TruckDTO } from '@/lib/types/truck';
import TruckForm from '@/app/(protected)/logistics/trucks/(components)/forms/truck-form';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
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
import {
  AssignDriverContent,
  DriverOption,
} from '@/hooks/truck/assign-driver-content';
import {
  UnassignDriverContent,
  UnassignDriverDescription,
  UnassignDriverBlockedContent,
  UnassignDriverInfo,
} from '@/hooks/truck/unassign-driver-content';

// TODO: replace with real driver list from API (filtered by haulier)
const AVAILABLE_DRIVERS: DriverOption[] = [
  { id: 1, driverName: 'John Smith', haulierName: 'Acme Hauliers' },
  { id: 2, driverName: 'Armin Menhaji', haulierName: 'Acme Hauliers' },
  { id: 3, driverName: 'Jayden Olivo', haulierName: 'Acme Hauliers' },
];

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
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [cannotDeactivateCount, setCannotDeactivateCount] = React.useState<
    number | null
  >(null);
  const [cannotDeleteCount, setCannotDeleteCount] = React.useState<
    number | null
  >(null);
  const [selectedDriver, setSelectedDriver] = React.useState<
    (UnassignDriverInfo & { id: number }) | null
  >(null);
  const [selectedDriverIds, setSelectedDriverIds] = React.useState<number[]>(
    [],
  );
  // Prevents ActionDialog's auto-close from resetting activeDialog when
  // transitioning to a follow-up dialog (e.g. unassignDriver → unassignDriverBlocked).
  // Can be removed once ActionDialog is refactored to not auto-close after confirm.
  const transitioningRef = React.useRef(false);

  // TODO: replace with real assigned drivers from API
  const assignedDrivers: string[] = [
    'John Smith',
    'Armin Menhaji',
    'Jayden Olivo',
  ];

  // TODO: replace with real completed docket breakdown from API
  const completedDocketBreakdown = {
    delivered: 10,
    collected: 3,
    cancelled: 2,
  };

  const handleDeactivate = async () => {
    if (!truckData?.id) return;
    try {
      // TODO: wire up deactivate truck API call
      console.log('Deactivate truck:', truckData.id);
      notifySuccess('Truck deactivated successfully.');
      setActiveDialog(null);
    } catch (error: unknown) {
      // TODO: parse activeDocketCount from error response when API is ready
      const activeDocketCount = 2; // placeholder — replace with parsed error data

      if (activeDocketCount > 0) {
        setCannotDeactivateCount(activeDocketCount);
        setActiveDialog('cannot_deactivate');
      } else {
        notifyError(
          extractErrorMessage(error) || 'Failed to deactivate truck.',
        );
        setActiveDialog(null);
      }
    }
  };

  const handleReactivate = async () => {
    if (!truckData?.id) return;
    try {
      // TODO: wire up reactivate truck API call
      console.log('Reactivate truck:', truckData.id);
      notifySuccess('Truck reactivated successfully.');
      setActiveDialog(null);
    } catch (error: unknown) {
      notifyError(extractErrorMessage(error) || 'Failed to reactivate truck.');
    }
  };

  const handleDelete = async () => {
    if (!truckData?.id) return;
    try {
      // TODO: wire up delete truck API call
      console.log('Delete truck:', truckData.id);
      notifySuccess('Truck deleted successfully.');
      setActiveDialog(null);
    } catch (error: unknown) {
      // TODO: parse activeDocketCount from error response when API is ready
      const activeDocketCount = 2; // placeholder — replace with parsed error data

      if (activeDocketCount > 0) {
        setCannotDeleteCount(activeDocketCount);
        setActiveDialog('cannot_delete');
      } else {
        notifyError(extractErrorMessage(error) || 'Failed to delete truck.');
        setActiveDialog(null);
      }
    }
  };

  const handleAssignDrivers = async () => {
    // TODO: wire up assign drivers API call
    console.log('Assign drivers:', truckData?.id, selectedDriverIds);
    setSelectedDriverIds([]);
  };

  const handleUnassignDriver = async (
    driver: UnassignDriverInfo & { id: number },
  ) => {
    // TODO: wire up unassign driver API call
    // If API returns active deliveries error, call setActiveDialog('unassignDriverBlocked')
    console.log('Unassign driver:', truckData?.id, driver.id);

    // MOCK: simulate backend blocking all drivers due to active deliveries
    // TODO: replace with real API error parsing — only block when response indicates active deliveries
    transitioningRef.current = true;
    setActiveDialog('unassignDriverBlocked');
  };

  const handleTransferDockets = async () => {
    // TODO: wire up transfer dockets API call / navigation
    console.log('Transfer dockets for driver:', selectedDriver);
    setActiveDialog(null);
    setSelectedDriver(null);
  };

  const dialogConfigs = React.useMemo(
    (): Record<string, DialogConfig> => ({
      deactivate: {
        title: 'Deactivate Truck',
        description: <DeactivateTruckDescription truck={truckData} />,
        content: (
          <DeactivateTruckContent
            assignedDrivers={assignedDrivers}
            completedDocketBreakdown={completedDocketBreakdown}
          />
        ),
        confirmText: 'Mark as Unavailable',
        confirmVariant: 'destructive',
        confirmCustomColor: '#DC2626',
        cancelText: 'Cancel',
      },
      cannot_deactivate: {
        title: 'Cannot Deactivate Truck',
        description: <CannotDeactivateTruckDescription truck={truckData} />,
        content: (
          <CannotDeactivateTruckContent
            activeDocketCount={cannotDeactivateCount ?? 0}
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
            activeDocketCount={cannotDeleteCount ?? 0}
          />
        ),
        confirmActionNeeded: false,
        cancelText: 'Close',
      },
      assignDriver: {
        title: 'Assign Driver',
        content: (
          <AssignDriverContent
            drivers={AVAILABLE_DRIVERS}
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
          <UnassignDriverBlockedContent driverName={selectedDriver.driverName} />
        ) : null,
        confirmText: 'Transfer Dockets',
        confirmCustomColor: '#8E51FF',
        confirmIcon: <ArrowLeftRight className="h-4 w-4" />,
        cancelText: 'Cancel',
      },
    }),
    [
      truckData,
      cannotDeactivateCount,
      cannotDeleteCount,
      assignedDrivers,
      completedDocketBreakdown,
      selectedDriver,
      selectedDriverIds,
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
    unassignDriverBlocked: () => void handleTransferDockets(),
  };

  const actions = {
    view: () => setViewOpen(true),
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

  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => (
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
  ));

  const viewDialog = viewOpen ? (
    <FormDialog
      id={truckData?.id}
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
      }}
      hideTrigger
      dialogTitle="View / Edit Truck"
      headerInfo={{
        customId: truckData?.licensePlate,
        primaryBadges: truckData?.truckStatus ? [truckData.truckStatus] : [],
        secondaryBadges: truckData?.haulierName ? [truckData.haulierName] : [],
      }}
    >
      <TruckForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
