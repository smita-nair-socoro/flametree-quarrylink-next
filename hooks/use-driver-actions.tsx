'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { DriverDTO } from '@/lib/types/driver';
import { DRIVER_STATUS } from '@/lib/types/driver-enums';
import DriverForm from '@/app/(protected)/logistics/drivers/(components)/forms/driver-form';
import { useDriverStore } from '@/app/stores/driver-store';
import {
  Ban,
  TriangleAlert,
  CircleCheck,
  CircleX,
  CircleAlert,
} from 'lucide-react';
import {
  DriverByIdQueryOptions,
  useDeleteDriver,
  useDeactivateDriver,
  useReactivateDriver,
} from '@/lib/api/driver';
import { useQuery } from '@tanstack/react-query';
import { DriverActionButtons } from '@/app/(protected)/logistics/drivers/(components)/forms/driver-action-buttons';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage, extractErrorData } from '@/lib/utils/error-message-helper';

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
                        • {truck.truckType ?? 'TRUCK'} - {truck.licensePlate} will remain assigned to this driver.
                      </span>
                    ))}
                    <span>• Driver will be available for docket assignment once the driver is reactivated.</span>
                  </div>
                  <span className="text-xs text-yellow-500 font-normal">
                    Driver will loose access to their Drivers&apos; App until they are
                    activated again.
                  </span>
                </div>
              </div>
            )}

            <div className="border border-[#BAE6FD] rounded-md p-4 bg-[#F0F9FF]">
              <div className="flex flex-col gap-3">
                <span className="text-[16px] text-[#075985] font-medium">
                  Data Preservation
                </span>
                <div className="flex justify-start gap-1 self-stretch text-[#0C4A6E]">
                  <span className="font-medium">15 completed dockets</span>
                  will be preserved
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-start gap-2 self-stretch">
                    <CircleCheck className="text-[#0EA5E9]" />
                    <span className="text-[#0369A1]">10 Delivered Dockets</span>
                  </div>
                  <div className="flex justify-start gap-2 self-stretch">
                    <CircleCheck className="text-[#0EA5E9]" />
                    <span className="text-[#0369A1]">3 Collected</span>
                  </div>
                  <div className="flex justify-start gap-2 self-stretch">
                    <CircleX className="text-[#0EA5E9]" />
                    <span className="text-[#0369A1]">2 Cancelled</span>
                  </div>
                  <div className="flex justify-start gap-2 self-stretch">
                    <CircleCheck className="text-[#0EA5E9]" />
                    <span className="text-[#0369A1]">
                      All maintenance records
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                  <a href={docketLink} className="text-[14px] text-[#155DFC] font-medium underline">
                    {docketCount} active {docketCount === 1 ? 'docket' : 'dockets'}
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
                  <a href={docketLink} className="text-[14px] text-[#155DFC] font-medium underline">
                    {docketCount} active {docketCount === 1 ? 'docket' : 'dockets'}
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
  }
  return {};
};

export function useDriverActions(driverData?: DriverDTO | null) {
  const driverId = driverData?.id;
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const selectedDriver = useDriverStore((state) => state.selectedDriver);

  const { data: fullDriverData } = useQuery({
    ...DriverByIdQueryOptions(driverId ?? 0),
    enabled: !!driverId,
  });

  const deleteDriverMutation = useDeleteDriver();
  const deactivateDriverMutation = useDeactivateDriver();
  const reactivateDriverMutation = useReactivateDriver();

  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [cannotDeactivateDocketIds, setCannotDeactivateDocketIds] = React.useState<number[]>([]);
  const [cannotDeleteDocketIds, setCannotDeleteDocketIds] = React.useState<number[]>([]);

  const activeDocketIds =
    selectedAction?.key === 'cannotDeactivate' ? cannotDeactivateDocketIds
    : selectedAction?.key === 'cannotDelete' ? cannotDeleteDocketIds
    : [];

  const dialogConfigs = React.useMemo(
    () => getDialogConfigs(fullDriverData ?? driverData ?? null, selectedAction || undefined, activeDocketIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [driverData, fullDriverData, selectedAction, cannotDeactivateDocketIds, cannotDeleteDocketIds],
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
          driverStatus: DRIVER_STATUS.INACTIVE,
        });
      }
      setActiveDialog(null);
    } catch (error) {
      const errorData = extractErrorData(error) as Record<string, unknown> | null;
      const docketIds = Array.isArray(errorData?.activeDocketIds)
        ? (errorData.activeDocketIds as number[])
        : [];

      if (docketIds.length > 0) {
        setCannotDeactivateDocketIds(docketIds);
        setSelectedAction({ key: 'cannotDeactivate' });
        setActiveDialog('cannotDeactivate');
      } else {
        notifyError(extractErrorMessage(error));
      }
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
    } catch (error) {
      const errorData = extractErrorData(error) as Record<string, unknown> | null;
      const docketIds = Array.isArray(errorData?.activeDocketIds)
        ? (errorData.activeDocketIds as number[])
        : [];

      if (docketIds.length > 0) {
        setCannotDeleteDocketIds(docketIds);
        setSelectedAction({ key: 'cannotDelete' });
        setActiveDialog('cannotDelete');
      } else {
        notifyError(extractErrorMessage(error));
      }
    }
  };

  const actionHandlers: Record<string, () => Promise<void>> = {
    deactivate: handleDeactivate,
    reactivate: handleReactivate,
    delete: handleDelete,
  };

  const actions = {
    view: (driver?: DriverDTO | null) => {
      const toSelect = driver ?? driverData;
      if (toSelect != null) {
        useDriverStore.getState().setSelectedDriver(toSelect);
      }
      setViewOpen(true);
    },

    deactivate: () => createDialogAction('deactivate')(),
    reactivate: () => createDialogAction('reactivate')(),
    delete: () => createDialogAction('delete')(),
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) {
            setActiveDialog(null);
            setSelectedAction(null);
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
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={selectedDriver?.id}
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
      }}
      hideTrigger
      headerInfo={{
        useSelectedDriver: true,
      }}
      headerButtons={
        <DriverActionButtons driver={driverData ?? selectedDriver} />
      }
    >
      <DriverForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
