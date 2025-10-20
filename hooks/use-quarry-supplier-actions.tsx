'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { Quarry } from '@/lib/types/quarry';
import QuarrySupplierForm from '@/app/(protected)/inventory/quarries-suppliers/(components)/forms/quarry-supplier-form';
import { QuarrySupplierActionButtons } from '@/app/(protected)/inventory/quarries-suppliers/(components)/forms/quarry-supplier-action-buttons';
import { CircleAlert, CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';

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
}

interface SelectedAction {
  key: string;
}

const canArchive = (quarrySupplierData?: Quarry | null): boolean => {
  // Can't archive if it's an ACTIVE SUPPLIER
  if (
    quarrySupplierData?.status === 'ACTIVE' &&
    quarrySupplierData?.type === 'SUPPLIER'
  ) {
    return false;
  }
  // Can archive if it's ACTIVE and NOT a SUPPLIER (i.e., QUARRY)
  return quarrySupplierData?.status === 'ACTIVE';
};

const canUnarchive = (quarrySupplierData?: Quarry | null): boolean => {
  // Can't unarchive if it's an ARCHIVED SUPPLIER
  if (
    quarrySupplierData?.status === 'ARCHIVED' &&
    quarrySupplierData?.type === 'SUPPLIER'
  ) {
    return false;
  }
  // Can unarchive if it's ARCHIVED and NOT a SUPPLIER (i.e., QUARRY)
  return quarrySupplierData?.status === 'ARCHIVED';
};

const getDialogConfigs = (
  quarrySupplierData?: Quarry | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  const name = quarrySupplierData?.name;
  const type = quarrySupplierData?.type;

  if (selectedAction?.key === 'archive') {
    return {
      archive: {
        title: `Archive Supplier / Quarry`,
        description: (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#FFEDD4] rounded-full">
                <TriangleAlert className="h-[21px] w-[21px] text-[#F54900]" />
              </div>
              <span className="font-semibold text-[17.4px]">{name}</span>
            </div>
            <span className="text-[14px] text-[#000000] mt-3">
              Are you sure you want to archive this{' '}
              {type === 'SUPPLIER' ? 'Supplier' : 'Quarry'}?
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-[14px] text-[#000000]">
                Current Status:
              </span>
              <div className="flex flex-col gap-2">
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  15 line items - all fully delivered ✓
                </div>
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  0 tonnes remaining to deliver ✓
                </div>
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  All associated dockets completed ✓
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#000000]">
                Warnings:
              </span>
              <ul className="text-[12.1px] text-[#4A5565] space-y-1 list-disc list-outside pl-5">
                <li>Products cannot be used in new quotes</li>
                <li>Pricing configuration will be preserved</li>
                <li>Existing quotes/jobs remain unchanged</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: `Archive ${type === 'SUPPLIER' ? 'Supplier' : 'Quarry'}`,
        confirmVariant: 'default',
        confirmCustomColor: '#4B5563',
        confirmCustomClass: 'bg-gray-600 hover:bg-gray-700 text-white',
      },
    };
  } else if (selectedAction?.key === 'unarchive') {
    return {
      unarchive: {
        title: 'Unarchiving',
        description: (
          <div className="flex justify-start items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#F0FDF4] rounded-full">
                <CircleCheck className="h-[21px] w-[21px] text-[#22C55E]" />
              </div>
              <span className="font-semibold text-[17.4px]">{name}</span>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                Products Reactivation:
              </span>
              <div className="flex flex-col gap-2">
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  12 products will become available for new quotes
                </div>
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  3 product pricing configurations restored
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                System Integration:
              </span>
              <div className="flex flex-col gap-2">
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  Supplier dropdown selections restored
                </div>
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  Historical data remains intact
                </div>
                <div className="bg-[#F0FDF4] rounded-md p-3 text-[14px] text-[#101828] border border-[#C9F9C9]">
                  All audit trails preserved
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <CircleAlert className="h-[16px] w-[16px] text-[#FFFFFF] fill-[#F59E0B]" />
                <span className="font-semibold text-[14px] text-[#101828]">
                  Recommendations:
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-[#FEFCEB] rounded-md p-3 text-[14px] text-[#101828] border border-[#FDE68A]">
                  Review contact information
                </div>
                <div className="bg-[#FEFCEB] rounded-md p-3 text-[14px] text-[#101828] border border-[#FDE68A]">
                  Confirm supplier is still operational
                </div>
              </div>
            </div>
          </div>
        ),
        confirmText: `Unarchive ${type === 'QUARRY' ? 'Quarry' : 'Supplier'}`,
        confirmVariant: 'default',
        confirmCustomColor: '#16a34a',
        confirmCustomClass:
          'bg-green-600 hover:bg-green-700 text-white font-geist font-medium leading-[24px]',
      },
    };
  } else if (selectedAction?.key === 'cannotArchive') {
    return {
      cannotArchive: {
        title: 'Cannot Archive',
        description: (
          <div className="flex justify-start items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#FFEDD4] rounded-full">
                <TriangleAlert className="h-[21px] w-[21px] text-[#F54900]" />
              </div>
              <span className="font-semibold text-[17.4px]">{name}</span>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-4">
            <div className="text-[16px] text-[#364153]">
              <div>Cannot archive while deliveries are pending.</div>
              <div>Complete all deliveries first, then try again.</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                Current Status:
              </span>
              <div className="flex flex-col gap-2">
                <div className="bg-[#FEF2F2] border border-[#EFC9C9] rounded-md p-3 text-[13.7px] text-[#101828]">
                  8 line items with pending deliveries (3475 tonnes remaining)
                </div>
                <div className="bg-[#FEF2F2] border border-[#EFC9C9] rounded-md p-3 text-[13.7px] text-[#101828]">
                  3 active dockets not yet delivered
                </div>
                <div className="bg-[#FEF2F2] border border-[#EFC9C9] rounded-md p-3 text-[13.7px] text-[#101828]">
                  2 quotes with line items
                </div>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Cancel',
        confirmVariant: 'outline',
        confirmCustomClass: 'border-[#E5E5E5]',
        confirmActionNeeded: false,
      },
    };
  } else if (selectedAction?.key === 'cannotUnarchive') {
    return {
      cannotUnarchive: {
        title: `Cannot Unarchive ${name}`,
        titleIcon: (
          <div className="flex w-[42px] h-[42px] justify-center items-center bg-[#FEF2F2] rounded-full">
            <CircleX className="h-[21px] w-[21px] text-[#DC2626]" />
            <Separator />
          </div>
        ),
        description: (
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
            <div className="text-[16px] text-[#364153]">
              <div>Cannot unarchive while conflicts exist.</div>
              <div>Resolve duplicate supplier issue first, then try again.</div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                Blocking Issues:
              </span>
              <div className="bg-[#FEF2F2] border border-[#FFC9C9] rounded-md p-3 text-[13.7px] text-[#101828]">
                Duplicate supplier already active with same name
              </div>
            </div>
          </div>
        ),
        confirmText: 'Cancel',
        confirmVariant: 'outline',
        confirmCustomClass: 'border-[#E5E5E5]',
        confirmActionNeeded: false,
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

    linkedProducts: () => {
      // TODO: Implement linked products functionality
    },

    archive: () => {
      if (canArchive(quarrySupplierData)) {
        createDialogAction('archive')();
      } else {
        createDialogAction('cannotArchive')();
      }
    },

    unarchive: () => {
      if (canUnarchive(quarrySupplierData)) {
        createDialogAction('unarchive')();
      } else {
        createDialogAction('cannotUnarchive')();
      }
    },
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
        onConfirmAction={() => {
          switch (key) {
            case 'archive':
              if (canArchive(quarrySupplierData)) {
                console.log(
                  'Archive quarry/supplier:',
                  quarrySupplierId,
                  quarrySupplierData
                );
                // TODO: implement archive API call
              }
              break;
            case 'unarchive':
              if (canUnarchive(quarrySupplierData)) {
                console.log(
                  'Unarchive quarry/supplier:',
                  quarrySupplierId,
                  quarrySupplierData
                );
                // TODO: implement unarchive API call
              }
              break;
            case 'cannotArchive':
            case 'cannotUnarchive':
              // No action needed, just close the dialog
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
      headerButtons={
        <QuarrySupplierActionButtons quarrySupplier={quarrySupplierData} />
      }
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
