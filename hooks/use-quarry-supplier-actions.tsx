'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { Quarry } from '@/lib/types/quarry';
import QuarrySupplierForm from '@/app/(protected)/inventory/quarries-suppliers/(components)/forms/quarry-supplier-form';
import { Archive, ArchiveRestore } from 'lucide-react';

interface DialogConfig {
  title?: string;
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
}

interface SelectedAction {
  key: string;
}

const getDialogConfigs = (
  quarrySupplierData?: Quarry | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  const name = quarrySupplierData?.name;
  const type = quarrySupplierData?.type;
  const status = quarrySupplierData?.status;

  if (selectedAction?.key === 'archive') {
    return {
      archive: {
        title: 'Archive Quarry / Supplier',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
              <span className="flex items-center justify-center">
                <Archive className="h-[20px] w-[20px] text-[#E7000B]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{name}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">{type}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to archive this {type?.toLowerCase()}?
            </span>
            <div className="border-1 border-[#FFB3B3] rounded-md p-[16.625px] bg-[#FFE2E2]">
              <div className="flex justify-start gap-2 self-stretch">
                <Archive className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#E7000B] font-medium">
                    Archive {type}
                  </span>
                  <span className="text-[14px] font-normal text-[#E7000B]">
                    This {type?.toLowerCase()} will be archived and will no
                    longer appear in active listings.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when archived:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> {type} status changes to Archived</li>
                <li> {type} will not appear in active listings</li>
                <li> Historical data is preserved</li>
                <li> {type} can be restored later if needed</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What continues to work:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> {type} remains accessible for reference</li>
                <li> All historical records are maintained</li>
                <li> {type} can be unarchived at any time</li>
                <li> Associated products and pricing are preserved</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Archive',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
      },
    };
  } else if (selectedAction?.key === 'unarchive') {
    return {
      unarchive: {
        title: 'Unarchive Quarry / Supplier',
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#F0FDF4] rounded-full">
              <span className="flex items-center justify-center">
                <ArchiveRestore className="h-[20px] w-[20px] text-[#008236]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{name}</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-[#6A7282]">{type}</span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-[14px] text-[#364153] font-normal">
              Are you sure you want to unarchive this {type?.toLowerCase()}?
            </span>
            <div className="border-1 border-[#B9F8CF] rounded-md p-[16.625px] bg-[#F0FDF4]">
              <div className="flex justify-start gap-2 self-stretch">
                <ArchiveRestore className="h-[20px] w-[20px] text-[#008236] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#008236] font-medium">
                    Restore {type}
                  </span>
                  <span className="text-[14px] font-normal text-[#008236]">
                    This {type?.toLowerCase()} will be restored to active status
                    and will appear in listings again.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[14px] text-[#101828]">
                What happens when unarchived:
              </span>
              <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                <li> {type} status changes to Active</li>
                <li> {type} will appear in active listings</li>
                <li> All historical data is restored</li>
                <li> {type} can be used for new orders</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Unarchive',
        confirmVariant: 'default',
        confirmCustomColor: '#008236',
      },
    };
  }
  return {};
};

export function useQuarrySupplierActions(
  quarrySupplierId: number | undefined,
  quarrySupplierData?: Quarry | null
) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const dialogConfigs = getDialogConfigs(
    quarrySupplierData,
    selectedAction || undefined
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const actions = {
    view: () => {
      setViewOpen(true);
    },

    archive: createDialogAction('archive'),

    unarchive: createDialogAction('unarchive'),
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
        description={config.description}
        content={config.content}
        confirmText={config.confirmText ?? ''}
        confirmVariant={config.confirmVariant}
        confirmCustomColor={config.confirmCustomColor}
        confirmCustomClass={config.confirmCustomClass}
        confirmIcon={config.confirmIcon}
        confirmActionNeeded={config.confirmActionNeeded}
        onConfirmAction={() => {
          switch (key) {
            case 'archive':
              console.log(
                'Archive quarry/supplier:',
                quarrySupplierId,
                quarrySupplierData
              );
              // TODO: implement archive logic
              break;
            case 'unarchive':
              console.log(
                'Unarchive quarry/supplier:',
                quarrySupplierId,
                quarrySupplierData
              );
              // TODO: implement unarchive logic
              break;
          }
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={quarrySupplierId}
      dialogTitle="View / Edit Quarry / Supplier"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        // Ensure dropdown menu state is reset when dialog closes
        if (!open) {
          // Small delay to ensure proper cleanup
          setTimeout(() => {
            setViewOpen(false);
          }, 100);
        }
      }}
      hideTrigger
      headerInfo={{
        useSelectedQuarrySupplier: true,
      }}
    >
      <QuarrySupplierForm id={quarrySupplierId} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
