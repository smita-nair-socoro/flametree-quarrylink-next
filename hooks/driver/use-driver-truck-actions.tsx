'use client';
import * as React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { AssignTruckContent } from './assign-truck-content';
import {
  UnassignTruckContent,
  UnassignTruckDescription,
  UnassignTruckBlockedContent,
  UnassignTruckInfo,
} from './unassign-truck-content';
import { DriverDTO } from '@/lib/types/driver';
import { useQuery } from '@tanstack/react-query';
import { HaulierTrucksQueryOptions } from '@/lib/api/haulier';
import { usePatchDriverTrucks } from '@/lib/api/driver';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage, extractErrorData } from '@/lib/utils/error-message-helper';

interface DialogConfig {
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
  confirmText?: string;
  confirmCustomColor?: string;
  confirmIcon?: React.ReactNode;
  confirmVariant?:
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost';
  confirmDisabled?: boolean;
  confirmActionNeeded?: boolean;
  cancelText?: string;
}

export function useDriverTruckActions(driverData?: DriverDTO | null) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [selectedTruck, setSelectedTruck] =
    React.useState<UnassignTruckInfo | null>(null);
  const [selectedTruckIds, setSelectedTruckIds] = React.useState<number[]>([]);
  // Prevents ActionDialog's auto-close from resetting activeDialog when
  // transitioning to a follow-up dialog (e.g. unassign → unassignBlocked).
  // Can be removed once ActionDialog is refactored to not auto-close after confirm.
  const transitioningRef = React.useRef(false);

  const haulierId = driverData?.haulier?.id ?? driverData?.haulierId ?? 0;
  const { data: availableTrucksData } = useQuery(HaulierTrucksQueryOptions(haulierId));
  const availableTrucks = Array.isArray(availableTrucksData) ? availableTrucksData : [];
  const patchDriverTrucks = usePatchDriverTrucks();

  const handleAssignTrucks = async () => {
    if (!driverData?.id) return;
    try {
      const merged = [...new Set([...(driverData.truckIds ?? []), ...selectedTruckIds])];
      await patchDriverTrucks.mutateAsync({
        id: driverData.id,
        data: {
          version: driverData.version ?? 0,
          truckIds: merged,
        },
      });
      notifySuccess('Trucks assigned successfully.');
      setActiveDialog(null);
      setSelectedTruckIds([]);
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to assign trucks.');
    }
  };

  const handleUnassignTruck = async (
    truck: UnassignTruckInfo & { id: number },
  ) => {
    if (!driverData?.id) return;
    try {
      await patchDriverTrucks.mutateAsync({
        id: driverData.id,
        data: {
          version: driverData.version ?? 0,
          truckIds: (driverData.truckIds ?? []).filter((id) => id !== truck.id),
        },
      });
      notifySuccess('Truck unassigned successfully.');
      setActiveDialog(null);
      setSelectedTruck(null);
    } catch (error) {
      const errorData = extractErrorData(error) as Record<string, unknown> | null;
      const hasActiveDeliveries =
        typeof errorData?.activeDeliveryCount === 'number' &&
        errorData.activeDeliveryCount > 0;

      if (hasActiveDeliveries) {
        transitioningRef.current = true;
        setActiveDialog('unassignBlocked');
      } else {
        notifyError(extractErrorMessage(error) || 'Failed to unassign truck.');
      }
    }
  };

  const handleTransferDockets = async () => {
    // TODO: wire up transfer dockets API call / navigation
    console.log('Transfer dockets for truck:', selectedTruck);
    setActiveDialog(null);
    setSelectedTruck(null);
  };

  const dialogConfigs = React.useMemo<Record<string, DialogConfig>>(
    () => ({
      assign: {
        title: 'Assign Truck',
        content: (
          <AssignTruckContent
            trucks={availableTrucks}
            onSelectionChange={setSelectedTruckIds}
          />
        ),
        confirmText: 'Assign',
        confirmCustomColor: '#8E51FF',
        confirmDisabled: selectedTruckIds.length === 0,
        cancelText: 'Cancel',
      },
      unassign: {
        title: 'Unassign Truck from Driver?',
        description: selectedTruck ? (
          <UnassignTruckDescription
            licensePlate={selectedTruck.licensePlate}
            driverName={driverData?.driverName ?? ''}
          />
        ) : undefined,
        content: selectedTruck ? (
          <UnassignTruckContent truck={selectedTruck} />
        ) : null,
        confirmText: 'Unassign Driver',
        confirmCustomColor: '#E7000B',
        cancelText: 'Cancel',
      },
      unassignBlocked: {
        title: 'Unassign Truck from Driver?',
        description: selectedTruck ? (
          <UnassignTruckDescription
            licensePlate={selectedTruck.licensePlate}
            driverName={driverData?.driverName ?? ''}
          />
        ) : undefined,
        content: selectedTruck ? (
          <UnassignTruckBlockedContent
            licensePlate={selectedTruck.licensePlate}
          />
        ) : null,
        confirmText: 'Transfer Dockets',
        confirmCustomColor: '#8E51FF',
        confirmIcon: <ArrowLeftRight className="h-4 w-4" />,
        cancelText: 'Cancel',
      },
    }),
    [driverData, selectedTruck, selectedTruckIds, availableTrucks],
  );

  const actionHandlers: Record<string, () => Promise<void>> = {
    assign: () => handleAssignTrucks(),
    unassign: () => {
      if (selectedTruck && 'id' in selectedTruck) {
        return handleUnassignTruck(
          selectedTruck as UnassignTruckInfo & { id: number },
        );
      }
      return Promise.resolve();
    },
    unassignBlocked: () => handleTransferDockets(),
  };

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
            // TODO: need to change to API response check instead of hardcoding transitioning state
            if (transitioningRef.current) {
              transitioningRef.current = false;
              return;
            }
            setActiveDialog(null);
            setSelectedTruck(null);
          }
        }}
        title={config.title}
        description={config.description}
        content={config.content}
        confirmText={config.confirmText ?? ''}
        confirmCustomColor={config.confirmCustomColor}
        confirmIcon={config.confirmIcon}
        confirmVariant={config.confirmVariant}
        confirmDisabled={config.confirmDisabled}
        confirmActionNeeded={config.confirmActionNeeded}
        cancelText={config.cancelText}
        onConfirmAction={() => actionHandlers[key]?.()}
      />
    );
  });

  return { actions, truckDialogs };
}
