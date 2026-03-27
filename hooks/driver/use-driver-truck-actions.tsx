'use client';
import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import {
  AssignTruckContent,
  AssignTruckDescription,
  TruckOption,
} from './assign-truck-content';
import {
  UnassignTruckContent,
  UnassignTruckDescription,
  UnassignTruckBlockedContent,
  UnassignTruckInfo,
} from './unassign-truck-content';
import { DriverDTO } from '@/lib/types/driver';
import { useAssignTrucks, useUnassignTruck } from '@/lib/api/driver';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

// Dummy available trucks for assignment — replace with real API data
const AVAILABLE_TRUCKS: TruckOption[] = [
  { id: 3, registration: 'INT-XYZ789' },
  { id: 4, registration: 'INT-ABC123' },
  { id: 5, registration: 'EXT-DEF456', groupName: 'External' },
];

interface DialogConfig {
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
  confirmText?: string;
  confirmCustomColor?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  confirmDisabled?: boolean;
  confirmActionNeeded?: boolean;
  cancelText?: string;
}

export function useDriverTruckActions(driverData?: DriverDTO | null) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [selectedTruck, setSelectedTruck] =
    React.useState<UnassignTruckInfo | null>(null);
  const [selectedTruckIds, setSelectedTruckIds] = React.useState<number[]>([]);

  const assignTrucks = useAssignTrucks();
  const unassignTruck = useUnassignTruck();

  const handleAssignTrucks = async () => {
    if (!driverData?.id || selectedTruckIds.length === 0) return;
    try {
      await assignTrucks.mutateAsync({
        driverId: driverData.id,
        truckIds: selectedTruckIds,
      });
      notifySuccess('Trucks assigned successfully.');
      setSelectedTruckIds([]);
    } catch (error) {
      notifyError(
        extractErrorMessage(error) || 'Failed to assign trucks. Please try again.',
      );
    }
  };

  const handleUnassignTruck = async (truck: UnassignTruckInfo & { id: number }) => {
    if (!driverData?.id) return;
    try {
      await unassignTruck.mutateAsync({
        driverId: driverData.id,
        truckId: truck.id,
      });
      notifySuccess('Truck unassigned successfully.');
      setActiveDialog(null);
      setSelectedTruck(null);
    } catch (error) {
      // Backend returns an error when the truck cannot be unassigned due to active deliveries
      setActiveDialog('unassignBlocked');
    }
  };

  const dialogConfigs = React.useMemo<Record<string, DialogConfig>>(
    () => ({
      assign: {
        title: 'Assign Truck',
        description: <AssignTruckDescription driver={driverData} />,
        content: (
          <AssignTruckContent
            trucks={AVAILABLE_TRUCKS}
            onSelectionChange={setSelectedTruckIds}
          />
        ),
        confirmText: 'Assign',
        confirmCustomColor: '#155DFC',
        confirmDisabled: selectedTruckIds.length === 0,
        cancelText: 'Cancel',
      },
      unassign: {
        title: 'Unassign Truck',
        description: selectedTruck ? (
          <UnassignTruckDescription
            truckRegistration={selectedTruck.registration}
            driverName={driverData?.driverName ?? ''}
          />
        ) : undefined,
        content: selectedTruck ? (
          <UnassignTruckContent truck={selectedTruck} />
        ) : null,
        confirmText: 'Unassign',
        confirmCustomColor: '#E7000B',
        cancelText: 'Cancel',
      },
      unassignBlocked: {
        title: 'Cannot Unassign Truck',
        description: selectedTruck ? (
          <UnassignTruckDescription
            truckRegistration={selectedTruck.registration}
            driverName={driverData?.driverName ?? ''}
          />
        ) : undefined,
        content: selectedTruck ? (
          <UnassignTruckBlockedContent
            truckRegistration={selectedTruck.registration}
          />
        ) : null,
        confirmActionNeeded: false,
        cancelText: 'Close',
      },
    }),
    [driverData, selectedTruck, selectedTruckIds],
  );

  const actions = {
    assign: () => {
      setSelectedTruckIds([]);
      setActiveDialog('assign');
    },
    unassign: (truck: UnassignTruckInfo & { id: number }) => {
      setSelectedTruck(truck);
      setActiveDialog('unassign');
    },
  };

  const truckDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) {
            setActiveDialog(null);
            setSelectedTruck(null);
          }
        }}
        title={config.title}
        description={config.description}
        content={config.content}
        confirmText={config.confirmText ?? ''}
        confirmCustomColor={config.confirmCustomColor}
        confirmVariant={config.confirmVariant}
        confirmDisabled={config.confirmDisabled}
        confirmActionNeeded={config.confirmActionNeeded}
        cancelText={config.cancelText}
        onConfirmAction={async () => {
          switch (key) {
            case 'assign':
              await handleAssignTrucks();
              break;
            case 'unassign':
              if (selectedTruck && 'id' in selectedTruck) {
                await handleUnassignTruck(
                  selectedTruck as UnassignTruckInfo & { id: number },
                );
              }
              break;
          }
        }}
      />
    );
  });

  return { actions, truckDialogs };
}
