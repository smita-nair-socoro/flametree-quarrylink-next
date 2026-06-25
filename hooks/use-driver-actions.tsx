'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { DriverDTO } from '@/lib/types/driver';
import { DRIVER_STATUS } from '@/lib/types/driver-enums';
import DriverForm from '@/app/(protected)/logistics/drivers/(components)/forms/driver-form';
import { useDriverStore } from '@/app/stores/driver-store';
import { Ban, TriangleAlert, CircleAlert, ArrowLeftRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteDriver,
  useDeactivateDriver,
  useReactivateDriver,
  useUnassignTruckFromDriver,
} from '@/lib/api/driver';
import { useRouter } from 'next/navigation';
import { DriverActionButtons } from '@/app/(protected)/logistics/drivers/(components)/forms/driver-action-buttons';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
  extractErrorMessage,
  extractErrorData,
} from '@/lib/utils/error-message-helper';
import {
  UnassignTruckDescription,
  UnassignTruckBlockedContent,
  UnassignTruckContent,
  UnassignTruckInfo,
} from '@/hooks/driver/unassign-truck-content';
import { Spinner } from '@/components/ui/spinner';
import { DocketsByDriverIdQueryOptions } from '@/lib/api/docket';

interface DialogConfig {
  title?: string;
  titleIcon?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  confirmCustomColor?: string;
  confirmCustomClass?: string;
  confirmIcon?: React.ReactNode;
  confirmActionNeeded?: boolean;
  confirmDisabled?: boolean;
  cancelText?: string;
}

interface SelectedAction {
  key: string;
}

const getDialogConfigs = (
  driverData?: DriverDTO | null,
  selectedAction?: SelectedAction,
  activeDocketIds: number[] = [],
  selectedTruck?: (UnassignTruckInfo & { id: number }) | null,
  blockedTruckDocketIds: number[] = [],
): Record<string, DialogConfig> => {
  const driverName = driverData?.driverName;
  const docketCount = activeDocketIds.length;
  const docketLink = `/customer-operations/dockets/?docketId=${activeDocketIds.join(',')}`;

  if (selectedAction?.key === 'resume') {
    return {
      resume: {
        title: 'Resume Job',
        description: 'Are you sure you want to resume this job?',
        confirmText: 'Resume',
        confirmVariant: 'default',
        confirmActionNeeded: true,
      },
    };
  } else if (selectedAction?.key === 'deactivate') {
    return {
      deactivate: {
        title: 'Deactivate Driver',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
              <span className="flex items-center justify-center">
                <Ban className="h-[20px] w-[20px] text-[#E7000B]" />
              </span>
            </div>
            <span className="font-medium">Driver {driverName}</span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to deactivate this driver?
            </span>

            {(driverData?.trucks ?? []).length > 0 && (
              <div className="border border-[#FEF08A] rounded-md p-4 bg-[#FFFBEB]">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-start gap-2 self-stretch">
                    <TriangleAlert className="h-[20px] w-[20px] text-[#CA8A04] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] text-[#854D0E] font-medium">
                      Truck Assignment
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm font-normal text-[#A16207]">
                    {(driverData?.trucks ?? []).map((truck) => (
                      <span key={truck.id}>
                        • {truck.truckType ?? 'TRUCK'} - {truck.licensePlate}{' '}
                        will remain assigned to this driver.
                      </span>
                    ))}
                    <span>
                      • Driver will be available for docket assignment once the
                      driver is reactivated.
                    </span>
                  </div>
                  <span className="text-xs text-yellow-500 font-normal">
                    Driver will loose access to their Drivers&apos; App until
                    they are activated again.
                  </span>
                </div>
              </div>
            )}

            <div className=" rounded-md p-4 bg-[#F9FAFB]">
              <div className="flex flex-col gap-3">
                <span className="text-[16px] text-[#101828] font-medium">
                  Archive Effects
                </span>
                <div className="flex flex-col gap-1 text-sm font-normal text-[#6A7282]">
                  <span>• Driver will be hidden from active driver lists</span>
                  <span>• Cannot be assigned to delivery dockets</span>
                  <span>• Historical data remains accessible</span>
                  <span>• Can be activated if needed</span>
                </div>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Deactivate Driver',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
      },
    };
  } else if (selectedAction?.key === 'cannotDeactivate') {
    return {
      cannotDeactivate: {
        title: 'Cannot Deactivate Driver',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
              <span className="flex items-center justify-center">
                <Ban className="h-[20px] w-[20px] text-[#E7000B]" />
              </span>
            </div>
            <span className="font-medium">{driverName}</span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to deactivate this driver?
            </span>

            <div className="border border-[#FECACA] rounded-md p-4 bg-[#FEF2F2]">
              <div className="flex justify-start gap-2 self-stretch">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#991B1B] font-medium">
                    Cannot Deactivate Driver
                  </span>
                  <span className="text-[14px] font-normal text-[#991B1B]">
                    Active dockets must be resolved first
                  </span>
                </div>
              </div>
            </div>

            {docketCount > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-[14px] text-[#101828]">
                  Active Dockets Found:
                </span>
                <div className="bg-orange-50 border border-[#FFD6A7] rounded-md p-3">
                  <a
                    href={docketLink}
                    className="text-[14px] text-[#155DFC] font-medium underline"
                  >
                    {docketCount} active{' '}
                    {docketCount === 1 ? 'docket' : 'dockets'}
                  </a>
                </div>
              </div>
            )}
          </div>
        ),
        cancelText: 'Cancel',
        confirmActionNeeded: false,
      },
    };
  } else if (selectedAction?.key === 'reactivate') {
    return {
      reactivate: {
        title: 'Reactivate Driver',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#EFF6FF] rounded-full">
              <span className="flex items-center justify-center">
                <CircleAlert className="h-[20px] w-[20px] text-[#3B82F6]" />
              </span>
            </div>
            <span className="font-medium">Driver {driverName}</span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[15px] text-[#364153] font-normal">
              This will reactivate the driver and restore them to your active
              haulier. Please confirm the action below.
            </span>

            <div className="border border-[#BAE6FD] rounded-md p-4 bg-[#F0F9FF]">
              <div className="flex flex-col gap-3">
                <span className="text-[16px] text-[#075985] font-medium">
                  Driver will be activated to active fleet
                </span>
                <div className="flex flex-col gap-1 text-[15px] font-normal text-[#0369A1]">
                  <span>• Driver will be reactivated to active haulier</span>
                  <span>
                    • Historical data and performance records will be accessible
                  </span>
                  <span>
                    • Compliance verification may be required before assignment
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Reactivate Driver',
        confirmVariant: 'default',
        confirmCustomColor: '#22C55E',
      },
    };
  } else if (selectedAction?.key === 'cannotDelete') {
    return {
      cannotDelete: {
        title: 'Cannot Delete Driver',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
              <span className="flex items-center justify-center">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
              </span>
            </div>
            <span className="font-medium">{driverName}</span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <div className="border border-[#FECACA] rounded-md p-4 bg-[#FEF2F2]">
              <div className="flex justify-start gap-2 self-stretch">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#991B1B] font-medium">
                    Deletion Blocked
                  </span>
                  <span className="text-[14px] font-normal text-[#991B1B]">
                    {driverName} has active deliveries in progress. All
                    deliveries must be completed or reassigned before this
                    driver can be deleted
                  </span>
                </div>
              </div>
            </div>

            {docketCount > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-[14px] text-[#101828]">
                  Active Dockets Found:
                </span>
                <div className="bg-orange-50 border border-[#FFD6A7] rounded-md p-3">
                  <a
                    href={docketLink}
                    className="text-[14px] text-[#155DFC] font-medium underline"
                  >
                    {docketCount} active{' '}
                    {docketCount === 1 ? 'docket' : 'dockets'}
                  </a>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="font-semibold text-[15px] text-[#101828]">
                Required actions:
              </span>
              <span className="text-[14px] text-[#6A7282] font-normal">
                • Wait for active deliveries to be completed
              </span>
              <span className="text-[14px] text-[#6A7282] font-normal">
                • Or reassign dockets to another driver
              </span>
            </div>
          </div>
        ),
        cancelText: 'Cancel',
        confirmActionNeeded: false,
      },
    };
  } else if (selectedAction?.key === 'delete') {
    return {
      delete: {
        title: 'Delete Driver',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
              <span className="flex items-center justify-center">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
              </span>
            </div>
            <span className="font-medium">{driverName}</span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[15px] text-[#364153] font-normal">
              Are you sure you want to delete this driver?
            </span>
            <div className="border border-[#FECACA] rounded-md p-4 bg-[#FEF2F2]">
              <div className="flex justify-start gap-2 self-stretch">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#991B1B] font-medium">
                    This action cannot be undone
                  </span>
                  <span className="text-[15px] font-normal text-[#991B1B]">
                    The driver account will be permanently deleted.
                  </span>
                </div>
              </div>
            </div>

            <div className=" rounded-md p-4 bg-[#F9FAFB]">
              <div className="flex flex-col gap-3">
                <span className="text-[16px] text-[#101828] font-medium">
                  Historical data preserved
                </span>
                <div className="flex flex-col gap-1 text-[15px] font-normal text-[#6A7282]">
                  <span>
                    • Name remains on all past dockets and delivery records
                  </span>
                  <span>
                    • Job history and completed deliveries remain accessible
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        cancelText: 'Cancel',
        confirmText: 'Delete Driver',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
        confirmActionNeeded: true,
      },
    };
  } else if (selectedAction?.key === 'unassignTruck') {
    return {
      unassignTruck: {
        title: 'Unassign Truck from Driver?',
        description: selectedTruck ? (
          <UnassignTruckDescription
            licensePlate={selectedTruck.licensePlate}
            driverName={driverName ?? ''}
          />
        ) : undefined,
        content: selectedTruck ? (
          <UnassignTruckContent truck={selectedTruck} />
        ) : null,
        confirmText: 'Unassign Truck',
        confirmCustomColor: '#E7000B',
        cancelText: 'Cancel',
      },
    };
  } else if (selectedAction?.key === 'unassignTruckBlocked') {
    return {
      unassignTruckBlocked: {
        title: 'Unassign Truck from Driver?',
        description: selectedTruck ? (
          <UnassignTruckDescription
            licensePlate={selectedTruck.licensePlate}
            driverName={driverName ?? ''}
          />
        ) : undefined,
        content: selectedTruck ? (
          <UnassignTruckBlockedContent
            licensePlate={selectedTruck.licensePlate}
            activeDocketIds={blockedTruckDocketIds}
          />
        ) : null,
        confirmText: 'Transfer Dockets',
        confirmCustomColor: '#8E51FF',
        confirmIcon: <ArrowLeftRight className="h-4 w-4" />,
        cancelText: 'Cancel',
      },
    };
  }

  return {};
};

export function useDriverActions(
  driverData?: DriverDTO | null,
  { onDeleteSuccess }: { onDeleteSuccess?: () => void } = {},
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const driverId = driverData?.id;
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const selectedDriver = useDriverStore((state) => state.selectedDriver);

  const deleteDriverMutation = useDeleteDriver();
  const deactivateDriverMutation = useDeactivateDriver();
  const reactivateDriverMutation = useReactivateDriver();
  const unassignTruckMutation = useUnassignTruckFromDriver();

  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [scrollToSection, setScrollToSection] = React.useState<
    string | undefined
  >();
  const [cannotDeactivateDocketIds, setCannotDeactivateDocketIds] =
    React.useState<number[]>([]);
  const [cannotDeleteDocketIds, setCannotDeleteDocketIds] = React.useState<
    number[]
  >([]);
  const [selectedTruck, setSelectedTruck] = React.useState<
    (UnassignTruckInfo & { id: number }) | null
  >(null);
  const [blockedTruckDocketIds, setBlockedTruckDocketIds] = React.useState<
    number[]
  >([]);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const transitioningRef = React.useRef(false);

  const activeDocketIds =
    selectedAction?.key === 'cannotDeactivate'
      ? cannotDeactivateDocketIds
      : selectedAction?.key === 'cannotDelete'
        ? cannotDeleteDocketIds
        : [];

  const handleNavigate = (url: string) => {
    setIsNavigating(true);
    setActiveDialog(null);
    router.push(url);
  };

  const dialogConfigs = React.useMemo(
    () =>
      getDialogConfigs(
        driverData ?? null,
        selectedAction || undefined,
        activeDocketIds,
        selectedTruck,
        blockedTruckDocketIds,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      driverData,
      selectedAction,
      cannotDeactivateDocketIds,
      cannotDeleteDocketIds,
      selectedTruck,
      blockedTruckDocketIds,
    ],
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const handleDeactivate = async () => {
    if (driverId == null) return;
    try {
      await deactivateDriverMutation.mutateAsync(driverId);
      notifySuccess('Driver deactivated successfully.');
      const current = useDriverStore.getState().selectedDriver;
      if (current) {
        useDriverStore.getState().setSelectedDriver({
          ...current,
          driverStatus: DRIVER_STATUS.DEACTIVATED,
        });
      }
      setActiveDialog(null);
    } catch (error) {
      const errorData = extractErrorData(error) as {
        activeDockets?: Array<{ id: number }>;
      } | null;
      const blocked = errorData?.activeDockets ?? [];
      if (blocked.length > 0) {
        setCannotDeactivateDocketIds(blocked.map((d) => d.id));
        setSelectedAction({ key: 'cannotDeactivate' });
        setActiveDialog('cannotDeactivate');
        return;
      }
      notifyError(extractErrorMessage(error));
    }
  };

  const handleReactivate = async () => {
    if (driverId == null) return;
    try {
      await reactivateDriverMutation.mutateAsync(driverId);
      notifySuccess('Driver reactivated successfully.');
      const current = useDriverStore.getState().selectedDriver;
      if (current) {
        useDriverStore.getState().setSelectedDriver({
          ...current,
          driverStatus: DRIVER_STATUS.ACTIVE,
        });
      }
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (driverId == null) return;
    try {
      await deleteDriverMutation.mutateAsync(driverId);
      notifySuccess('Driver deleted successfully.');
      setActiveDialog(null);
      setViewOpen(false);
      onDeleteSuccess?.();
    } catch (error) {
      const errorData = extractErrorData(error) as {
        activeDockets?: Array<{ id: number }>;
      } | null;
      const blocked = errorData?.activeDockets ?? [];
      if (blocked.length > 0) {
        setCannotDeleteDocketIds(blocked.map((d) => d.id));
        setSelectedAction({ key: 'cannotDelete' });
        setActiveDialog('cannotDelete');
        return;
      }
      notifyError(extractErrorMessage(error));
    }
  };

  const handleUnassignTruck = async (
    truck: UnassignTruckInfo & { id: number },
  ) => {
    if (driverId == null) return;
    transitioningRef.current = true;
    try {
      const response = await unassignTruckMutation.mutateAsync({
        driverId,
        data: {
          version: driverData?.version ?? 0,
          truckId: truck.id,
        },
      });
      const blocked = response?.activeDockets ?? [];
      if (blocked.length > 0) {
        setBlockedTruckDocketIds(blocked.map((d) => d.id));
        setSelectedAction({ key: 'unassignTruckBlocked' });
        setActiveDialog('unassignTruckBlocked');
        return;
      }
      notifySuccess('Truck unassigned successfully.');
      setActiveDialog(null);
      setSelectedTruck(null);
    } catch (error) {
      transitioningRef.current = false;
      setActiveDialog(null);
      notifyError(extractErrorMessage(error) || 'Failed to unassign truck.');
    }
  };

  const handleTransferDockets = () => {
    const docketLink = `/customer-operations/dockets/?docketId=${blockedTruckDocketIds.join(',')}`;
    setSelectedTruck(null);
    setBlockedTruckDocketIds([]);
    handleNavigate(docketLink);
  };

  const handleViewDockets = async (targetDriverId?: number) => {
    const driverIdToFetch = targetDriverId ?? driverId ?? selectedDriver?.id;

    if (!driverIdToFetch) {
      notifyError('Unable to load dockets for this driver.');
      return;
    }

    try {
      const dockets = await queryClient.fetchQuery(
        DocketsByDriverIdQueryOptions(driverIdToFetch),
      );
      const docketList = Array.isArray(dockets)
        ? dockets
        : (dockets as unknown as { content?: typeof dockets }).content ?? [];

      if (docketList.length === 0) {
        notifyError('There are no assigned dockets for this driver.');
        return;
      }

      const docketNumbers = docketList.map((docket) => docket.docketNumber);
      console.log('[DriverDockets] assigned docket numbers', {
        driverId: driverIdToFetch,
        docketNumbers,
      });
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to load dockets.');
    }
  };

  const actionHandlers: Record<string, () => Promise<void> | void> = {
    deactivate: handleDeactivate,
    reactivate: handleReactivate,
    delete: handleDelete,
    unassignTruck: () => {
      if (selectedTruck) void handleUnassignTruck(selectedTruck);
    },
    unassignTruckBlocked: () => handleTransferDockets(),
  };

  const actions = {
    view: (
      driver?: DriverDTO | null,
      options?: { scrollToSection?: string },
    ) => {
      const toSelect = driver ?? driverData;
      if (toSelect != null) {
        useDriverStore.getState().setSelectedDriver(toSelect);
      }
      setScrollToSection(options?.scrollToSection);
      setViewOpen(true);
    },

    deactivate: () => createDialogAction('deactivate')(),
    reactivate: () => createDialogAction('reactivate')(),
    delete: () => createDialogAction('delete')(),
    viewDockets: (driverId?: number) => void handleViewDockets(driverId),
    unassignTruck: (truck: UnassignTruckInfo & { id: number }) => {
      setSelectedTruck(truck);
      setSelectedAction({ key: 'unassignTruck' });
      setActiveDialog('unassignTruck');
    },
  };

  // Render active dialog
  const confirmDialogs = (
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
              if (!open) {
                if (transitioningRef.current) {
                  transitioningRef.current = false;
                  return;
                }
                setActiveDialog(null);
                setSelectedAction(null);
                setSelectedTruck(null);
                setBlockedTruckDocketIds([]);
              }
            }}
            title={config.title ?? ''}
            titleIcon={config.titleIcon}
            description={config.description}
            content={config.content}
            confirmText={config.confirmText ?? ''}
            confirmVariant={config.confirmVariant}
            confirmCustomColor={config.confirmCustomColor}
            confirmCustomClass={config.confirmCustomClass}
            confirmIcon={config.confirmIcon}
            confirmActionNeeded={config.confirmActionNeeded}
            confirmDisabled={config.confirmDisabled}
            cancelText={config.cancelText}
            onConfirmAction={async () => {
              const handler = actionHandlers[key];
              if (handler) {
                await handler();
              }
            }}
          />
        );
      })}
    </>
  );

  const viewDialog = viewOpen ? (
    <FormDialog
      id={selectedDriver?.id}
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) setScrollToSection(undefined);
      }}
      hideTrigger
      headerInfo={{
        useSelectedDriver: true,
      }}
      headerButtons={
        <DriverActionButtons
          driver={driverData ?? selectedDriver}
          onDelete={() => setViewOpen(false)}
        />
      }
    >
      <DriverForm scrollToSection={scrollToSection} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
