'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { ActionDialog } from '@/components/action-dialog';
import SupplierForm from '@/app/(protected)/inventory/products/(components)/forms/supplier-form';
import { TriangleAlert, CircleCheckBig, CircleAlert } from 'lucide-react';
import { useDeleteQuarrySupplierProduct } from '@/lib/api/quarry-supplier-product';
import { extractErrorData } from '@/lib/utils/error-message-helper';

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
  blockingQuotes?: unknown[]
): Record<string, DialogConfig> => {
  const quarryName = quarryData?.quarryName ?? quarryData?.supplierProductName;
  const supplierName = quarryData?.supplierProductName;
  const supplierProductCode = quarryData?.supplierProductCode;
  const blockingQuoteLength = blockingQuotes?.length ?? 0;

  const blockingQuoteIds =
    blockingQuotes?.map((quote: any) => quote.quoteNumber) ?? [];

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
          <div className="flex flex-col gap-4">
            <div className="text-[14px] text-[#364153]">
              This supplier cannot be removed because it has pending business
              activities:
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[14px] text-[#101828]">
                Active Usage:
              </span>
              <div className="bg-[#FEF2F2] border border-[#EFC9C9] rounded-md p-3">
                <span className="text-[14px] text-[#364153] font-normal">
                  {blockingQuoteLength} active quotes:{' '}
                </span>
                <span className="text-[14px] text-[#155DFC] font-medium underline">
                  {blockingQuoteIds.join(', ')}
                </span>
              </div>
            </div>
            <div className="bg-[#EFF6FF] border border-[#BEDBFF] rounded-md p-3">
              <div className="flex items-start gap-2 self-stretch">
                <CircleAlert className="h-5 w-5 text-[#193CB8]" />
                <span className="text-[14px] text-[#193CB8] font-normal">
                  Removing this supplier now would disrupt ongoig business
                  operations.
                </span>
              </div>
            </div>
          </div>
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
            <div className="flex flex-col gap-3">
              <span className="font-semibold">Current Status:</span>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justfiy-start gap-2">
                  <CircleCheckBig className="h-5 w-4 text-[#16A34A]" />
                  <span className="text-[#16A34A]">
                    No active quotes using this supplier
                  </span>
                </div>
                <div className="flex justfiy-start gap-2">
                  <CircleCheckBig className="h-5 w-4 text-[#16A34A]" />
                  <span className="text-[#16A34A]">
                    No active jobs using this supplier
                  </span>
                </div>
                <div className="flex justfiy-start gap-2">
                  <CircleCheckBig className="h-5 w-4 text-[#16A34A]" />
                  <span className="text-[#16A34A]">
                    No pending transactions
                  </span>
                </div>
              </div>
            </div>
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
                <li>Historical trasnaction records</li>
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
  quarryId: number | undefined,
  quarryData?: QuarrySupplierProduct | null
) {
  const { mutateAsync: deleteQuarrySupplierProduct } =
    useDeleteQuarrySupplierProduct();
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const [blockingQuotes, setBlockingQuotes] = React.useState<unknown[]>([]);

  const dialogConfigs = getDialogConfigs(
    quarryData,
    selectedAction || undefined,
    blockingQuotes
  );

  const createDialogAction = (actionKey: string, action: () => void) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
  };

  const actions = {
    view: () => {
      setViewOpen(true);
    },

    delete: createDialogAction('delete', () => {
      console.log('Delete supplier:', quarryId);
      // TODO: implement delete logic
    }),

    cannotDelete: createDialogAction('cannotDelete', () => {
      console.log('Cannot delete supplier:', quarryId);
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
              console.log('Delete supplier:', quarryId, quarryData);
              if (!quarryId || !quarryData?.productId) {
                setActiveDialog(null);
                setSelectedAction(null);
                break;
              }
              try {
                await deleteQuarrySupplierProduct({
                  quarrySupplierId: quarryId,
                  productId: quarryData.productId,
                });

                // Deleted successfully; close dialog
                setActiveDialog(null);
                setSelectedAction(null);
              } catch (e: unknown) {
                console.error('Failed to delete supplier:', {
                  error: e,
                });

                // Backend returns 409 with blockingQuoteDtos when deletion is blocked
                const errorData = extractErrorData(e);
                const blocked =
                  errorData &&
                  typeof errorData === 'object' &&
                  'blockingQuoteDtos' in errorData &&
                  Array.isArray(
                    (errorData as { blockingQuoteDtos?: unknown })
                      .blockingQuoteDtos
                  )
                    ? (errorData as { blockingQuoteDtos: unknown[] })
                        .blockingQuoteDtos
                    : [];

                console.log('blocked', blocked);

                if (blocked.length > 0) {
                  // Open cannotDelete modal to show info
                  setBlockingQuotes(blocked);
                  setSelectedAction({ key: 'cannotDelete' });
                  setActiveDialog('cannotDelete');
                } else {
                  setActiveDialog(null);
                  setSelectedAction(null);
                }
              }
              return;
            case 'cannotDelete':
              console.log('Cannot delete supplier:', quarryId, quarryData);
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
      id={quarryId}
      dialogTitle={`${quarryData?.quarrySupplier?.name} - Detailed Information`}
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
        quarrySupplierId={quarryData?.quarrySupplier?.id}
        productId={quarryData?.productId}
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
