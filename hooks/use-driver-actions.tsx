'use client';
import * as React from 'react';
// import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { DriverDTO } from '@/lib/types/driver';
// import DriverForm from '@/app/(protected)/logistics/drivers/(components)/forms/driver-form';
// import { DriverActionButtons } from '@/app/(protected)/logistics/drivers/(components)/forms/driver-action-buttons';
import {
  Ban,
  TriangleAlert,
  CircleCheck,
  CircleX,
  CircleAlert,
} from 'lucide-react';
import { useDriverStore } from '@/app/stores/driver-store';

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
): Record<string, DialogConfig> => {
  const driverName = driverData?.driverName;

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

            <div className="border border-[#FEF08A] rounded-md p-4 bg-[#FFFBEB]">
              <div className="flex flex-col gap-3">
                <div className="flex justify-start gap-2 self-stretch">
                  <TriangleAlert className="h-[20px] w-[20px] text-[#CA8A04] flex-shrink-0 mt-0.5" />
                  <span className="text-[16px] text-[#854D0E] font-medium">
                    Truck Assignment
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm font-normal text-[#A16207]">
                  <span>
                    • TRUCK -ID Volvo will remain assigned to this driver.
                  </span>
                  <span>
                    • TRUCK -ID Volvo will remain assigned to this driver.
                  </span>
                  <span>
                    • TRUCK -ID Volvo will remain assigned to this driver.
                  </span>
                </div>
                <span className="text-xs text-yellow-500 font-normal">
                  Driver will loose access to their Drivers' App until they are
                  activated again.
                </span>
              </div>
            </div>

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

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                Active Dockets Found:
              </span>
              <div className="bg-orange-50 border border-[#FFD6A7] rounded-md p-3 text-[13.7px] text-[#101828]">
                <span className="text-[14px] text-[#364153] font-normal">
                  2 active dockets:{' '}
                </span>
                <span className="text-[14px] text-[#155DFC] font-medium underline">
                  DO-2342, DO-2343
                </span>
              </div>
            </div>
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

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                Active Dockets Founds:
              </span>
              <div className="bg-orange-50 border border-[#FFD6A7] rounded-md p-3 text-[13.7px] text-[#101828]">
                <span className="text-[14px] text-[#364153] font-normal">
                  2 active dockets:{' '}
                </span>
                <span className="text-[14px] text-[#155DFC] font-medium underline">
                  DO-2342, DO-2343
                </span>
              </div>
            </div>

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
  const selectedDriver = useDriverStore((s) => s.selectedDriver);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const dialogConfigs = React.useMemo(
    () => getDialogConfigs(driverData ?? null, selectedAction || undefined),
    [driverData, selectedAction],
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const handleDeactivate = () => {
    console.log('Deactivate driver:', driverId, driverData);
    // TODO: implement deactivate logic
  };

  const handleCannotDeactivate = () => {
    console.log('Cannot deactivate driver:', driverId, driverData);
    // TODO: implement cannot deactivate logic
  };

  const handleReactivate = () => {
    console.log('Reactivate driver:', driverId, driverData);
    // TODO: implement reactivate logic
  };

  const handleDelete = () => {
    console.log('Delete driver:', driverId, driverData);
    // TODO: implement delete logic
  };

  const actionHandlers: Record<string, () => void> = {
    deactivate: handleDeactivate,
    cannotDeactivate: handleCannotDeactivate,
    reactivate: handleReactivate,
    cannotDelete: handleDelete,
  };

  const actions = {
    /** Pass customer when opening from row click so the store updates before the dialog opens */
    view: (driver?: DriverDTO | null) => {
      const toSelect = driver ?? driverData;
      if (toSelect != null) {
        useDriverStore.getState().setSelectedDriver(toSelect);
      }
      setViewOpen(true);
    },

    deactivate: () => {
      // TODO: check if the driver has any active dockets from API
      createDialogAction('deactivate')();
    },
    reactivate: () => {
      createDialogAction('reactivate')();
    },
    delete: () => {
      // TODO: check if the driver has any active dockets from API
      createDialogAction('delete')();
    },
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;
    console.log('confirmDialogs', key, config);

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
        onConfirmAction={() => {
          const handler = actionHandlers[key];
          if (handler) {
            handler();
          }
        }}
      />
    );
  });

  // const viewDialog = viewOpen ? (
  //   <FormDialog
  //     id={selectedDriver?.id}
  //     dialogTitle="View / Edit Driver"
  //     open={viewOpen}
  //     onOpenChangeAction={(open) => {
  //       setViewOpen(open);
  //     }}
  //     headerButtons={<DriverActionButtons driver={selectedDriver ?? undefined} />}
  //     hideTrigger
  //     headerInfo={{
  //       useSelectedDriver: true,
  //     }}
  //   >
  //     <DriverForm />
  //   </FormDialog>
  // ) : null;

  return {
    actions,
    confirmDialogs,
    // viewDialog,
  };
}
