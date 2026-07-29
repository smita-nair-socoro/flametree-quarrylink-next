'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ActionDialog } from '@/components/action-dialog';
import { CannotDeleteEligibilityCheckContent } from '@/hooks/eligibility-check/cannot-delete-eligibility-check-content';
import { EligibilityBlockingDependencies } from '@/lib/types/eligibility-check';
import { Quarry } from '@/lib/types/quarry';
import QuarrySupplierForm from '@/app/(protected)/inventory/quarries-suppliers/(components)/forms/quarry-supplier-form';
import { QuarrySupplierActionButtons } from '@/app/(protected)/inventory/quarries-suppliers/(components)/forms/quarry-supplier-action-buttons';
import { CircleAlert, CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import {
  LinkedProductsQueryOptions,
  useUnarchiveQuarry,
  useDeleteQuarryAfterEligibilityCheck,
} from '@/lib/api/quarries';
import { useQueryClient } from '@tanstack/react-query';
import {
  extractEligibilityBlockingDependencies,
  extractErrorData,
} from '@/lib/utils/error-message-helper';
import { notifyError, notifySuccess } from '@/lib/toast';
import { useQuarrySupplierStore } from '@/app/stores/quarry-supplier-store';

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

const canDelete = (quarrySupplierData?: Quarry | null): boolean => {
  // Can delete if status is ACTIVE (both QUARRY and SUPPLIER)
  // Backend will check for blocking quotes and return 409 if there are any
  return quarrySupplierData?.status === 'ACTIVE';
};

const canUnarchive = (quarrySupplierData?: Quarry | null): boolean => {
  // Can unarchive if status is ARCHIVED (both QUARRY and SUPPLIER)
  // Backend will check for conflicts and return error if needed
  return quarrySupplierData?.status === 'ARCHIVED';
};

const getDialogConfigs = (
  quarrySupplierData?: Quarry | null,
  selectedAction?: SelectedAction,
  blockingDependencies?: EligibilityBlockingDependencies
): Record<string, DialogConfig> => {
  const name = quarrySupplierData?.name;
  const type = quarrySupplierData?.quarrySupplierType;

  if (selectedAction?.key === 'delete') {
    return {
      delete: {
        title: `Delete ${type === 'QUARRY' ? 'Quarry' : 'Supplier'}`,
        description: (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#FFEDD4] rounded-full">
                <TriangleAlert className="h-5 w-5 text-[#F54900]" />
              </div>
              <span className="font-semibold text-[17.4px]">{name}</span>
            </div>
            <span className="text-md mt-3">
              Are you sure you want to delete this{' '}
              {type === 'SUPPLIER' ? 'Supplier' : 'Quarry'}?
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#000000]">
                Warnings:
              </span>
              <ul className="text-sm text-[#4A5565] space-y-1 list-disc list-outside pl-5">
                <li>Products cannot be used in new quotes</li>
                <li>Pricing configuration will be preserved</li>
                <li>Existing quotes/jobs remain unchanged</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: `Delete ${type === 'SUPPLIER' ? 'Supplier' : 'Quarry'}`,
        confirmVariant: 'destructive',
        confirmCustomColor: '#DC2626',
        confirmCustomClass: 'bg-red-600 hover:bg-red-700 text-white',
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
          'bg-green-600 hover:bg-green-700 text-white font-medium leading-[24px]',
      },
    };
  } else if (selectedAction?.key === 'cannotDelete') {
    return {
      cannotDelete: {
        title: 'Cannot Delete',
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
          <CannotDeleteEligibilityCheckContent
            blockingDependencies={blockingDependencies}
            entityLabel={type === 'QUARRY' ? 'quarry' : 'supplier'}
          />
        ),
        confirmText: 'OK',
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

export function useQuarrySupplierActions(quarrySupplierData?: Quarry | null) {
  const queryClient = useQueryClient();
  const selectedQuarrySupplier = useQuarrySupplierStore(
    (s) => s.selectedQuarrySupplier
  );
  const [viewOpen, setViewOpen] = React.useState(false);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [blockingDependencies, setBlockingDependencies] =
    React.useState<EligibilityBlockingDependencies>({
      blockingQuotations: [],
      blockingJobs: [],
      blockingDockets: [],
      blockingJobItems: [],
      hasBlockingDependencies: false,
    });
  const [editFormType, setEditFormType] = React.useState<string>(
    quarrySupplierData?.quarrySupplierType || 'QUARRY'
  );

  const unarchiveMutation = useUnarchiveQuarry();
  const { mutateAsync: deleteQuarryAfterEligibilityCheck } =
    useDeleteQuarryAfterEligibilityCheck();

  const activeQuarrySupplier = quarrySupplierData ?? selectedQuarrySupplier ?? null;
  const quarrySupplierId = activeQuarrySupplier?.id;
  const dialogConfigs = getDialogConfigs(
    activeQuarrySupplier,
    selectedAction || undefined,
    blockingDependencies
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const actions = {
    /** Pass quarry when opening from row click so the store updates before the dialog opens (avoids stale header). Omit when opening from a row's dropdown; the hook's quarrySupplierData is used. */
    view: (quarry?: Quarry | null) => {
      const toSelect = quarry ?? quarrySupplierData;
      if (toSelect != null) {
        useQuarrySupplierStore.getState().setSelectedQuarrySupplier(toSelect);
        setEditFormType(toSelect.quarrySupplierType || 'QUARRY');
      }
      setViewOpen(true);
    },

    linkedProducts: async () => {
      if (!quarrySupplierId) return;

      try {
        const linked = await queryClient.fetchQuery(
          LinkedProductsQueryOptions(quarrySupplierId)
        );

        const linkedArr = Array.isArray(linked)
          ? linked
          : linked
            ? [linked]
            : [];

        const productIdsSet = new Set<number>();
        for (const lp of linkedArr) {
          const qsp = lp?.quarrySupplierProducts ?? [];
          for (const p of qsp) {
            const id = p?.productId;
            if (typeof id === 'number' && id > 0) productIdsSet.add(id);
          }
        }

        const productIds = Array.from(productIdsSet);

        if (productIds.length === 0) {
          notifyError('No linked products found for this quarry/supplier.');
          return;
        }

        const quarrySupplierName = quarrySupplierData?.name?.trim() ?? selectedQuarrySupplier?.name?.trim();
        const nameParam = quarrySupplierName
          ? `&linkedQuarrySupplierName=${encodeURIComponent(
            quarrySupplierName
          )}`
          : '';

        const linkedProductsUrl = `/inventory/products?linkedProductIds=${encodeURIComponent(
          productIds.join(',')
        )}&linkedQuarrySupplierId=${quarrySupplierId}${nameParam}`;
        window.open(linkedProductsUrl, '_blank', 'noopener,noreferrer');
      } catch (e: unknown) {
        console.error('[useQuarrySupplierActions] linkedProducts failed:', e);
        notifyError('Failed to load linked products.');
      }
    },

    delete: () => {
      if (canDelete(quarrySupplierData ?? selectedQuarrySupplier)) {
        createDialogAction('delete')();
      }
    },

    unarchive: () => {
      if (canUnarchive(quarrySupplierData ?? selectedQuarrySupplier)) {
        createDialogAction('unarchive')();
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
            setBlockingDependencies({
              blockingQuotations: [],
              blockingJobs: [],
              blockingDockets: [],
              blockingJobItems: [],
              hasBlockingDependencies: false,
            });
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
        onConfirmAction={async () => {
          switch (key) {
            case 'delete':
              if (!quarrySupplierId) {
                setActiveDialog(null);
                setSelectedAction(null);
                break;
              }
              try {
                const response = await deleteQuarryAfterEligibilityCheck({
                  id: quarrySupplierId,
                });

                const blocked = extractEligibilityBlockingDependencies(response);
                if (blocked.hasBlockingDependencies) {
                  setBlockingDependencies(blocked);
                  setSelectedAction({ key: 'cannotDelete' });
                  setActiveDialog('cannotDelete');
                  return;
                }

                notifySuccess(
                  `${selectedQuarrySupplier?.name} deleted successfully.`
                );
                setActiveDialog(null);
                setSelectedAction(null);
                setViewOpen(false);
              } catch (e: unknown) {
                console.error('Failed to delete quarry supplier:', {
                  error: e,
                });

                const errorData = extractErrorData(e);
                const blocked =
                  extractEligibilityBlockingDependencies(errorData);

                if (blocked.hasBlockingDependencies) {
                  setBlockingDependencies(blocked);
                  setSelectedAction({ key: 'cannotDelete' });
                  setActiveDialog('cannotDelete');
                } else {
                  // Other error - just close the dialog
                  setActiveDialog(null);
                  setSelectedAction(null);
                }
              }

              return;

            case 'unarchive':
              if (canUnarchive(selectedQuarrySupplier) && quarrySupplierId) {
                unarchiveMutation.mutate(quarrySupplierId, {
                  onSuccess: () => {
                    setActiveDialog(null);
                    setSelectedAction(null);
                    // Also close the view dialog if it's open
                    setViewOpen(false);
                  },
                });
              }
              break;
            case 'cannotDelete':
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
      id={selectedQuarrySupplier?.id}
      dialogTitle={`View / Edit ${editFormType === 'QUARRY' ? 'Quarry' : 'Supplier'
        }`}
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) {
          setTimeout(() => setViewOpen(false), 100);
        }
      }}
      hideTrigger
      headerInfo={{
        useSelectedQuarrySupplier: true,
      }}
      headerButtons={
        <QuarrySupplierActionButtons
          quarrySupplier={selectedQuarrySupplier ?? undefined}
          actionsOverride={actions}
          suppressDialogs
        />
      }
    >
      <QuarrySupplierForm onTypeChange={(type) => setEditFormType(type)} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
