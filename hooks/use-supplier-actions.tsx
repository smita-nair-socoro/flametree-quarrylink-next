'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { ActionDialog } from '@/components/action-dialog';
import SupplierForm from '@/app/(protected)/inventory/products/(components)/forms/supplier-form';
import { TriangleAlert, CircleCheckBig } from 'lucide-react';
import { useDeleteQuarrySupplierProduct } from '@/lib/api/quarry-supplier-product';

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
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  const quarryName =
    quarryData?.quarry_name ?? quarryData?.supplier_product_name;
  const supplierName = quarryData?.supplier_product_name;
  const supplierProductCode = quarryData?.supplier_product_code;

  if (selectedAction?.key === 'cannotDelete') {
    return {
      delete: {
        title: `Delete Supplier`,
        description: (
          <div className="flex justfiy-start gap-2">
            <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-[#FFEDD4] rounded-full">
              <span className="flex items-center justify-center">
                <TriangleAlert className="h-5 w-5 text-[#F54900]" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Cannot Delete Supplier</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-gray-500">
                  {supplierName} ({supplierProductCode})
                </span>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex flex-col gap-5">
            <span className="text-sm text-gray-500 font-semibold">
              Are you sure you want to delete this supplier from the product?
            </span>
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
  console.log('quarryData', quarryData);
  const dialogConfigs = getDialogConfigs(
    quarryData,
    selectedAction || undefined
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
              if (!quarryId || !quarryData?.product_id) {
                setActiveDialog(null);
                setSelectedAction(null);
                break;
              }
              try {
                console.log('[UI] Attempting delete with ids:', {
                  quarrySupplierId: quarryId,
                  productId: quarryData.product_id,
                });
                const res = await deleteQuarrySupplierProduct({
                  quarrySupplierId: quarryId,
                  productId: quarryData.product_id,
                });
                console.log('[UI] Delete mutation result:', res);
                const blocked = Array.isArray(res?.blockingQuoteDtos)
                  ? res.blockingQuoteDtos
                  : [];
                console.log('[UI] blockingQuoteDtos length:', blocked.length);
                if (blocked.length > 0) {
                  // Open cannotDelete modal to show info
                  setSelectedAction({ key: 'cannotDelete' });
                  setActiveDialog('cannotDelete');
                } else {
                  // Deleted successfully; close dialog
                  setActiveDialog(null);
                  setSelectedAction(null);
                }
              } catch (e: unknown) {
                console.error('Failed to delete supplier:', {
                  error: e,
                });
                setActiveDialog(null);
                setSelectedAction(null);
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
      dialogTitle={`${quarryData?.quarry_supplier?.name} - Detailed Information`}
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
        quarrySupplierId={quarryData?.quarry_supplier?.id}
        productId={quarryData?.product_id}
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
