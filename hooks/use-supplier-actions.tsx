'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { EligibilityBlockingDependencies } from '@/lib/types/eligibility-check';
import { ActionDialog } from '@/components/action-dialog';
import { CannotDeleteEligibilityCheckContent } from '@/hooks/eligibility-check/cannot-delete-eligibility-check-content';
import SupplierForm from '@/app/(protected)/inventory/products/(components)/forms/supplier-form';
import { TriangleAlert } from 'lucide-react';
import { useDeleteQuarrySupplierProduct } from '@/lib/api/quarry-supplier-product';
import {
  extractEligibilityBlockingDependencies,
  extractErrorData,
} from '@/lib/utils/error-message-helper';
import { useSupplierStore } from '@/app/stores/supplier-store';

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

const getDialogConfigs = (
  quarryData?: QuarrySupplierProduct | null,
  selectedAction?: SelectedAction,
  blockingDependencies?: EligibilityBlockingDependencies,
): Record<string, DialogConfig> => {
  const quarryName = quarryData?.quarryName ?? quarryData?.supplierProductName;
  const supplierProductCode = quarryData?.supplierProductCode;

  if (selectedAction?.key === 'cannotDelete') {
    return {
      cannotDelete: {
        title: 'Cannot Delete',
        description: (
          <div className="flex justify-start items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="flex w-[48px] h-[48px] justify-center items-center bg-[#FFEDD4] rounded-full">
                <TriangleAlert className="h-[21px] w-[21px] text-[#F54900]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Cannot Delete Supplier</span>
                <div className="flex justify-start gap-2">
                  <span className="text-sm text-[#6A7282]">
                    {quarryName} ({supplierProductCode})
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        content: (
          <CannotDeleteEligibilityCheckContent
            blockingDependencies={blockingDependencies}
            entityLabel="supplier"
          />
        ),
        confirmActionNeeded: false,
      },
    };
  } else if (selectedAction?.key === 'delete') {
    return {
      delete: {
        title: `Delete Supplier`,
        titleIcon: <TriangleAlert className="h-5 w-5 text-[#F59E0B]" />,
        description: (
          <div className="flex flex-col gap-4">
            <span className="font-medium">
              {quarryName} ({supplierProductCode})
            </span>
            <span>
              Are you sure you want to delete this supplier from the product?
            </span>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <div className="border-1 border-[#FED7AA] rounded-md p-3 bg-[#FFF7ED]">
              <div className="flex items-start gap-2 self-stretch">
                <TriangleAlert className="h-5 w-5 text-[#F59E0B]" />
                <span className="text-sm text-[#92400E]">
                  This action cannot be undone. The supplier will be permanently
                  removed from this product.
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">What will be deleted:</span>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-outside pl-5">
                <li> Supplier pricing configuration</li>
                <li> Truck rates for this supplier</li>
                <li> Supplier product name and code</li>
                <li> All supplier-specific settings</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">What will be preserved:</span>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-outside pl-5">
                <li>Historical transaction records</li>
                <li>Audit logs</li>
                <li>Other suppliers for this product</li>
              </ul>
            </div>
          </div>
        ),
        confirmText: 'Delete Supplier',
        confirmVariant: 'destructive',
      },
    };
  }

  // Return empty object if no action selected
  return {};
};

export function useSupplierActions(
  supplierData?: QuarrySupplierProduct | null,
) {
  const { mutateAsync: deleteQuarrySupplierProduct } =
    useDeleteQuarrySupplierProduct();
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
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

  const selectedSupplier = useSupplierStore((s) => s.selectedSupplier);
  const setSelectedSupplier = useSupplierStore((s) => s.setSelectedSupplier);

  const activeQuarrySupplierId =
    selectedSupplier?.quarrySupplierId ?? selectedSupplier?.quarrySupplier?.id;

  const dialogConfigs = getDialogConfigs(
    selectedSupplier,
    selectedAction || undefined,
    blockingDependencies,
  );

  const createDialogAction = (actionKey: string, action: () => void) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const actions = {
    view: (supplier?: QuarrySupplierProduct | null) => {
      const toSelect = supplier ?? supplierData;
      if (toSelect) {
        setSelectedSupplier(toSelect);
      }
      setViewOpen(true);
    },

    delete: createDialogAction('delete', () => {
      console.log('Delete supplier:', activeQuarrySupplierId);
      // TODO: implement delete logic
    }),

    cannotDelete: createDialogAction('cannotDelete', () => {
      console.log('Cannot delete supplier:', activeQuarrySupplierId);
      // This will show the informational modal about why deleting is not possible
    }),
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
              if (!activeQuarrySupplierId || !selectedSupplier?.productId) {
                setActiveDialog(null);
                setSelectedAction(null);
                break;
              }
              try {
                const response = await deleteQuarrySupplierProduct({
                  quarrySupplierId: activeQuarrySupplierId,
                  productId: selectedSupplier.productId,
                });

                const blocked = extractEligibilityBlockingDependencies(response);
                if (blocked.hasBlockingDependencies) {
                  setBlockingDependencies(blocked);
                  setSelectedAction({ key: 'cannotDelete' });
                  setActiveDialog('cannotDelete');
                  return;
                }

                setActiveDialog(null);
                setSelectedAction(null);
              } catch (e: unknown) {
                console.error('Failed to delete supplier:', {
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
                  setActiveDialog(null);
                  setSelectedAction(null);
                }
              }
              return;
            case 'cannotDelete':
              // TODO: implement cannot delete logic
              break;
          }
          // default close
          setActiveDialog(null);
          setSelectedAction(null);
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={activeQuarrySupplierId}
      dialogTitle={`${
        selectedSupplier?.quarrySupplier?.name
      } - Detailed Information`}
      dialogWidth="700px"
      contentClass="-mt-5"
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
        useSelectedSupplier: true,
      }}
    >
      <SupplierForm
        quarrySupplierId={
          selectedSupplier?.quarrySupplierId ??
          selectedSupplier?.quarrySupplier?.id
        }
        productId={selectedSupplier?.productId}
        onCancel={() => setViewOpen(false)}
      />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
