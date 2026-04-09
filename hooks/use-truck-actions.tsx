'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { TruckDTO } from '@/lib/types/truck';
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

interface DialogConfig {
  title: string;
  description?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: string;
  confirmCustomColor?: string;
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
  const [cannotDeactivateCount, setCannotDeactivateCount] = React.useState<
    number | null
  >(null);
  const [cannotDeleteCount, setCannotDeleteCount] = React.useState<
    number | null
  >(null);

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
    }),
    [
      truckData,
      cannotDeactivateCount,
      cannotDeleteCount,
      assignedDrivers,
      completedDocketBreakdown,
    ],
  );

  const actionHandlers: Record<string, () => void> = {
    deactivate: () => void handleDeactivate(),
    reactivate: () => void handleReactivate(),
    delete: () => void handleDelete(),
  };

  const actions = {
    deactivate: () => setActiveDialog('deactivate'),
    reactivate: () => setActiveDialog('reactivate'),
    delete: () => setActiveDialog('delete'),
  };

  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => (
    <ActionDialog
      key={key}
      open={activeDialog === key}
      onOpenChangeAction={(open) => {
        if (!open) setActiveDialog(null);
      }}
      title={config.title}
      description={config.description}
      content={config.content}
      confirmText={config.confirmText ?? ''}
      confirmVariant={config.confirmVariant}
      confirmCustomColor={config.confirmCustomColor}
      confirmActionNeeded={config.confirmActionNeeded}
      confirmDisabled={config.confirmDisabled}
      cancelText={config.cancelText}
      onConfirmAction={() => actionHandlers[key]?.()}
    />
  ));

  return {
    actions,
    confirmDialogs,
  };
}
