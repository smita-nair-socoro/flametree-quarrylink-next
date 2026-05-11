'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';
import { Spinner } from '@/components/ui/spinner';
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
import {
  usePatchDriverTrucks,
  useUnassignTruckFromDriver,
} from '@/lib/api/driver';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

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
  const router = useRouter();
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [selectedTruck, setSelectedTruck] =
    React.useState<UnassignTruckInfo | null>(null);
  const [selectedTruckIds, setSelectedTruckIds] = React.useState<number[]>([]);
  const [blockedDocketIds, setBlockedDocketIds] = React.useState<number[]>([]);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const haulierId = driverData?.haulier?.id ?? driverData?.haulierId ?? 0;
  const { data: availableTrucksData } = useQuery(
    HaulierTrucksQueryOptions(haulierId),
  );
  const availableTrucks = availableTrucksData?.trucks ?? [];
  const patchDriverTrucks = usePatchDriverTrucks();
  const unassignTruckFromDriver = useUnassignTruckFromDriver();

  const handleAssignTrucks = async () => {
    if (!driverData?.id) return;
    try {
      const merged = [
        ...new Set([...(driverData.truckIds ?? []), ...selectedTruckIds]),
      ];
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
      const response = await unassignTruckFromDriver.mutateAsync({
        driverId: driverData.id,
        data: {
          version: driverData.version ?? 0,
          truckId: truck.id,
        },
      });
      const blocked = response?.activeDockets ?? [];
      if (blocked.length > 0) {
        setBlockedDocketIds(blocked.map((d) => d.id));
        setActiveDialog('unassignBlocked');
        return;
      }
      notifySuccess('Truck unassigned successfully.');
      setActiveDialog(null);
      setSelectedTruck(null);
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to unassign truck.');
    }
  };

  const handleNavigate = (url: string) => {
    setIsNavigating(true);
    setActiveDialog(null);
    router.push(url);
  };

  const handleTransferDockets = () => {
    const docketLink = `/customer-operations/dockets/?docketId=${blockedDocketIds.join(',')}`;
    setSelectedTruck(null);
    setBlockedDocketIds([]);
    handleNavigate(docketLink);
  };

  const dialogConfigs = React.useMemo<Record<string, DialogConfig>>(
    () => ({
      assign: {
        title: 'Assign Truck',
        content: (
          <AssignTruckContent
            trucks={availableTrucks}
            assignedTruckIds={(driverData?.trucks ?? []).map((t) => t.id)}
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
        confirmText: 'Unassign Truck',
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
            activeDocketIds={blockedDocketIds}
            onNavigate={() => handleNavigate(`/customer-operations/dockets/?docketId=${blockedDocketIds.join(',')}`)}
          />
        ) : null,
        confirmText: 'Transfer Dockets',
        confirmCustomColor: '#8E51FF',
        confirmIcon: <ArrowLeftRight className="h-4 w-4" />,
        cancelText: 'Cancel',
      },
    }),
    [
      driverData,
      selectedTruck,
      selectedTruckIds,
      availableTrucks,
      blockedDocketIds,
      isNavigating,
      handleNavigate,
    ],
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
    unassignBlocked: () => {
      handleTransferDockets();
      return Promise.resolve();
    },
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

  const truckDialogs = (
    <>
      {isNavigating && (
        <div className="fixed inset-0 bg-white/60 z-50 flex flex-col items-center justify-center gap-4">
          <Spinner size="medium" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      )}
      {Object.entries(dialogConfigs).map(([key, config]) => {
        if (activeDialog !== key) return null;

        return (
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
            confirmCustomColor={config.confirmCustomColor}
            confirmIcon={config.confirmIcon}
            confirmVariant={config.confirmVariant}
            confirmDisabled={config.confirmDisabled}
            confirmActionNeeded={config.confirmActionNeeded}
            cancelText={config.cancelText}
            onConfirmAction={() => actionHandlers[key]?.()}
          />
        );
      })}
    </>
  );

  return { actions, truckDialogs };
}
