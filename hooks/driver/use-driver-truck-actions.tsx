'use client';
import * as React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { AssignTruckContent, TruckOption } from './assign-truck-content';
import {
  UnassignTruckContent,
  UnassignTruckDescription,
  UnassignTruckBlockedContent,
  UnassignTruckInfo,
} from './unassign-truck-content';
import { DriverDTO } from '@/lib/types/driver';

// TODO: replace with real truck list from API (filtered by haulier)
const AVAILABLE_TRUCKS: TruckOption[] = [
  { id: 3, licensePlate: 'ABC-123', haulierName: 'Acme Hauliers' },
  { id: 4, licensePlate: 'DEF-456', haulierName: 'Acme Hauliers' },
  { id: 5, licensePlate: 'GHI-789', haulierName: 'Acme Hauliers' },
  { id: 6, licensePlate: 'ABC-124', haulierName: 'Acme Hauliers' },
  { id: 7, licensePlate: 'DEF-22456', haulierName: 'Acme Hauliers' },
  { id: 8, licensePlate: 'GHI-11789', haulierName: 'Acme Hauliers' },
  { id: 9, licensePlate: 'ABC-125', haulierName: 'Acme Hauliers' },
  { id: 10, licensePlate: 'DEF-2456', haulierName: 'Acme Hauliers' },
  { id: 11, licensePlate: 'GHI-1789', haulierName: 'Acme Hauliers' },
  { id: 12, licensePlate: 'ABC-1233', haulierName: 'Acme Hauliers' },
  { id: 13, licensePlate: 'DEF-4526', haulierName: 'Acme Hauliers' },
  { id: 14, licensePlate: 'GHI-7819', haulierName: 'Acme Hauliers' },
];

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

  const handleAssignTrucks = async () => {
    // TODO: wire up assign trucks API call
    console.log('Assign trucks:', driverData?.id, selectedTruckIds);
    setSelectedTruckIds([]);
  };

  const handleUnassignTruck = async (
    truck: UnassignTruckInfo & { id: number },
  ) => {
    // TODO: wire up unassign truck API call
    // If API returns active deliveries error, call setActiveDialog('unassignBlocked')
    console.log('Unassign truck:', driverData?.id, truck.id);

    // MOCK: simulate backend blocking all trucks due to active deliveries
    // TODO: replace with real API error parsing — only block when response indicates active deliveries
    transitioningRef.current = true;
    setActiveDialog('unassignBlocked');
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
            trucks={AVAILABLE_TRUCKS}
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
    [driverData, selectedTruck, selectedTruckIds],
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
