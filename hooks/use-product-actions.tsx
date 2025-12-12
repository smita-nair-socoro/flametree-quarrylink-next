'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ProductDetails } from '@/lib/types/product';
import { ActionDialog } from '@/components/action-dialog';
import ProductForm from '@/app/(protected)/inventory/products/(components)/forms/product-form';
import { ProductActionButtons } from '@/app/(protected)/inventory/products/(components)/forms/product-action-buttons';
import {
  TriangleAlert,
  Ban,
  CircleAlert,
  CircleCheckBig,
  Truck,
  Info,
} from 'lucide-react';
import { BADGE_COLORS } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useDeleteProduct, useUpdateProduct } from '@/lib/api/product';
import { convertKeysToCamelCase } from '@/lib/utils/case-conversion';
import { notifyError, notifySuccess } from '@/lib/toast';
import { useProductStore } from '@/app/stores/product-store';

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

export function useProductActions(
  productId: number | undefined,
  productData?: ProductDetails | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [blockingItems, setBlockingItems] = React.useState<{
    quotes?: string[];
  } | null>(null);

  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();
  const selectedProduct = useProductStore((s) => s.selectedProduct);
  const setSelectedProduct = useProductStore((s) => s.setSelectedProduct);

  const getDialogConfigs = (
    productData?: ProductDetails | null,
    selectedAction?: SelectedAction
  ): Record<string, DialogConfig> => {
    const productName = productData?.product_name;
    const productCode = productData?.product_code;
    const productStatus = productData?.is_active ? 'Available' : 'Unavailable';

    if (selectedAction?.key === 'unavailable') {
      return {
        unavailable: {
          title: `Mark as Unavailable`,
          description: (
            <div className="flex justify-start items-center gap-2">
              <div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
                <span className="flex items-center justify-center">
                  <Ban className="h-[20px] w-[20px] text-[#E7000B]" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Mark as Unavailable</span>
                <div className="flex justify-start gap-2">
                  <span className="text-sm text-[#6A7282]">
                    {productCode} ({productName})
                  </span>
                  <Badge
                    className={BADGE_COLORS[productStatus ?? '']}
                    variant="outline"
                  >
                    {productStatus}
                  </Badge>
                </div>
              </div>
            </div>
          ),
          content: (
            <div className="flex flex-col gap-5">
              <span className="text-[14px] text-[#364153] font-normal">
                Are you sure you want to mark this product as unavailable?
              </span>
              <div className="border-1 border-[#FFD6A7] rounded-md p-[16.625px] bg-[#FFF7ED]">
                <div className="flex items-start gap-2 self-stretch">
                  <TriangleAlert className="h-[20px] w-[20px] text-[#F54900] flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] text-[#9F2D00] font-medium">
                      Impact on New Business
                    </span>
                    <span className="text-[14px] font-normal text-[#CA3500]">
                      This product will be hidden from new quotes and orders,
                      but existing commitments will continue normally.
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[14px] text-[#101828]">
                  What happens when marked as unavailable:
                </span>
                <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                  <li> Hidden from new quote creation</li>
                  <li> Removed from product selection lists</li>
                  <li> Existing quotes and orders continue normally</li>
                  <li> All pricing and configurations preserved</li>
                  <li>Can be made available again at any time</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[14px] text-[#101828]">
                  What continues to work:
                </span>
                <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                  <li>Action quotes can still be converted to orders</li>
                  <li>Pending orders continue through delivery</li>
                  <li>Historical data remains accessible</li>
                  <li>Product managemnet and editing</li>
                </ul>
              </div>
            </div>
          ),
          confirmText: 'Mark as Unavailable',
          confirmVariant: 'destructive',
          confirmCustomColor: '#E7000B',
        },
      };
    } else if (selectedAction?.key === 'available') {
      return {
        available: {
          title: `Mark as available`,
          description: (
            <div className="flex justify-start items-center gap-2">
              <div className="flex w-[40px] h-[40px] justify-center bg-[#F0FDF4] rounded-full">
                <span className="flex items-center justify-center">
                  <CircleCheckBig className="h-[20px] w-[20px] text-[#008236]" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Mark as Available</span>
                <div className="flex justify-start gap-2">
                  <span className="text-sm text-[#6A7282]">
                    {productCode} ({productName})
                  </span>
                  <Badge
                    className={BADGE_COLORS[productStatus ?? '']}
                    variant="outline"
                  >
                    {productStatus}
                  </Badge>
                </div>
              </div>
            </div>
          ),
          content: (
            <div className="flex flex-col gap-5">
              <span className="text-[14px] text-[#364153] font-normal">
                Are you sure you want to mark this product as unavailable?
              </span>
              <div className="border-1 border-[#B9F8CF] rounded-md p-[16.625px] bg-[#F0FDF4]">
                <div className="flex items-start gap-2 self-stretch">
                  <TriangleAlert className="h-[20px] w-[20px] text-[#008236] flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] text-[#008236] font-medium">
                      Impact on New Business
                    </span>
                    <span className="text-[14px] font-normal text-[#008236] pr-2">
                      This product will be visible in new quotes and orders,
                      expanding your avaialble product catalog for customers.
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[14px] text-[#101828]">
                  What happens when marked as unavailable:
                </span>
                <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                  <li> Visible in new quote creation</li>
                  <li> Added to product selection lists</li>
                  <li> Available for new orders and quotes</li>
                  <li>
                    All existing supplier pricing and configurations remain
                    intact
                  </li>
                  <li> Can be marked unavailable again if needed</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[14px] text-[#101828]">
                  What continues to work:
                </span>
                <ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
                  <li>Existing quotes and orders continue normally</li>
                  <li>Historical sales data remains accessible</li>
                  <li>Product specifications and details preserved</li>
                  <li>Product management and editing capabilities</li>
                </ul>
              </div>
            </div>
          ),
          confirmText: 'Mark as Available',
          confirmVariant: 'default',
          confirmCustomColor: '#008236',
        },
      };
    } else if (selectedAction?.key === 'delete') {
      return {
        delete: {
          title: `Delete Product`,
          description: (
            <div className="flex justify-start items-center gap-2">
              <div className="flex w-[40px] h-[40px] justify-center bg-[#DBEAFE] rounded-full">
                <span className="flex items-center justify-center">
                  <Info className="h-[20px] w-[20px] text-[#155DFC]" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Delete Product with History</span>
                <div className="flex justify-start gap-2">
                  <span className="text-sm text-[#6A7282]">
                    {productName} ({productCode})
                  </span>
                  <Badge
                    className={BADGE_COLORS[productStatus ?? '']}
                    variant="outline"
                  >
                    {productStatus}
                  </Badge>
                </div>
              </div>
            </div>
          ),
          content: (
            <div className="border-1 border-[#FEE685] rounded-md p-[16.625px] bg-[#FFFBEB]">
              <div className="flex items-start gap-2 self-stretch">
                <TriangleAlert className="h-[20px] w-[20px] text-[#E17100] flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] text-[#973C00] font-medium">
                    Historical Data Preserved
                  </span>
                  <span className="text-[14px] font-normal text-[#BB4D00]">
                    All past quotes and reports will remain accessible.
                  </span>
                </div>
              </div>
            </div>
          ),
          confirmText: 'Delete Product',
          confirmVariant: 'destructive',
        },
      };
    } else if (selectedAction?.key === 'cannotDelete') {
      return {
        cannotDelete: {
          title: `Cannot Delete Product`,
          description: (
            <div className="flex justify-start items-center gap-2">
              <div className="flex w-[40px] h-[40px] justify-center bg-[#FFEDD4] rounded-full">
                <span className="flex items-center justify-center h-[40px] w-[40px]">
                  <TriangleAlert className="h-[20px] w-[20px] text-[#F54900]" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Cannot Delete Product</span>
                <div className="flex justify-start gap-2">
                  <span className="text-sm text-[#6A7282]">
                    {productName} ({productCode})
                  </span>
                  <Badge
                    className={BADGE_COLORS[productStatus ?? '']}
                    variant="outline"
                  >
                    {productStatus}
                  </Badge>
                </div>
              </div>
            </div>
          ),
          content: (
            <div className="flex flex-col gap-5">
              <span className="text-[14px] text-[#364153] font-normal">
                This product cannot be deleted because it has pending business
                activities:
              </span>
              {blockingItems && (
                <div className="flex flex-col gap-3">
                  <span className="font-medium text-[#101828] text-[14px]">
                    Active Usage:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {blockingItems.quotes &&
                      blockingItems.quotes.length > 0 && (
                        <div className="border-1 border-[#FFD6A7] rounded-md p-3 bg-[#FFF7ED]">
                          <div className="flex flex-row justify-start gap-1">
                            <span className="text-[#364153] text-[14px] font-normal">
                              {blockingItems.quotes.length} active{' '}
                              {blockingItems.quotes.length === 1
                                ? 'quote'
                                : 'quotes'}
                              :
                            </span>
                            <span className="text-[#155DFC] font-medium text-[14px] underline">
                              {blockingItems.quotes.join(', ')}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="border-1 border-[#BEDBFF] bg-[#EFF6FF] rounded-md p-3 ">
                    <div className="flex justify-start gap-2">
                      <CircleAlert className="h-[16px] w-[16px] flex-shrink-0 text-[#155DFC] mt-1" />
                      <span className="text-[14px] text-[#193CB8] font-normal">
                        Deleting this product now would disrupt ongoing business
                        operations.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ),
          confirmActionNeeded: false,
        },
      };
    }

    // Return empty object if no action selected
    return {};
  };
  const dialogConfigs = getDialogConfigs(
    productData,
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

    unavailable: createDialogAction('unavailable', () => {
      console.log('Unavailable product:', productId);
    }),

    available: createDialogAction('available', () => {
      console.log('Available product:', productId);
      // TODO: implement available logic
    }),

    delete: createDialogAction('delete', () => {
      console.log('Delete product:', productId);
      // TODO: implement delete logic
    }),

    cannotDelete: createDialogAction('cannotDelete', () => {
      console.log('Cannot delete product:', productId);
      // This will show the informational modal about why deleting is not possible
    }),

    removeSupplier: createDialogAction('removeSupplier', () => {
      console.log('Remove supplier:', productId);
      // TODO: implement remove supplier logic
    }),
  };

  // Handle delete API call
  const handleDeleteProduct = async () => {
    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    try {
      const response = await deleteProductMutation.mutateAsync(productId);

      // Check if response contains blocking items
      if (response && response.quotes && response.quotes.length > 0) {
        // Product cannot be deleted, show cannot delete modal
        setBlockingItems(response);
        setActiveDialog('cannotDelete');
        setSelectedAction({ key: 'cannotDelete' });
      } else {
        // Product deleted successfully (empty response)
        setActiveDialog(null);
        setSelectedAction(null);
        // Refresh or redirect as needed
        window.location.reload();
      }
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      setActiveDialog(null);
      setSelectedAction(null);
    }
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
            setBlockingItems(null);
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
        confirmDisabled={
          (key === 'delete' && deleteProductMutation.isPending) ||
          ((key === 'unavailable' || key === 'available') &&
            updateProductMutation.isPending)
        }
        onConfirmAction={() => {
          switch (key) {
            case 'unavailable':
              (async () => {
                try {
                  if (!productId) throw new Error('Product ID is required');
                  if (!productData) throw new Error('Product data is required');

                  // Match ProductForm update payload, but set inactive.
                  const payload = {
                    product_name: productData.product_name,
                    product_code: productData.product_code,
                    material_id: productData.material.id,
                    density_tonnage_per_m3: productData.density_tonnage_per_m3,
                    product_description: productData.product_description,
                    is_active: false,
                    version: productData.version ?? 0,
                  };

                  console.log('productData', productData);
                  console.log('payload', payload);

                  const camelCasePayload = convertKeysToCamelCase(payload);

                  await updateProductMutation.mutateAsync({
                    id: productId,
                    data: { ...camelCasePayload, id: productId },
                  });

                  // Keep the dialog header badges in sync (FormDialog reads from product-store)
                  if (selectedProduct?.id === productId) {
                    setSelectedProduct({
                      ...selectedProduct,
                      is_active: false,
                    });
                  }

                  notifySuccess('Product marked as unavailable.');
                } catch (err: unknown) {
                  notifyError(
                    (err as Error)?.message ?? 'Failed to update product'
                  );
                } finally {
                  setActiveDialog(null);
                  setSelectedAction(null);
                }
              })();
              break;
            case 'available':
              (async () => {
                try {
                  if (!productId) throw new Error('Product ID is required');
                  if (!productData) throw new Error('Product data is required');

                  const payload = {
                    product_name: productData.product_name,
                    product_code: productData.product_code,
                    material_id: productData.material.id,
                    density_tonnage_per_m3: productData.density_tonnage_per_m3,
                    product_description: productData.product_description,
                    is_active: true,
                    version: productData.version ?? 0,
                  };

                  const camelCasePayload = convertKeysToCamelCase(payload);

                  await updateProductMutation.mutateAsync({
                    id: productId,
                    data: { ...camelCasePayload, id: productId },
                  });

                  // Keep the dialog header badges in sync (FormDialog reads from product-store)
                  if (selectedProduct?.id === productId) {
                    setSelectedProduct({ ...selectedProduct, is_active: true });
                  }

                  notifySuccess('Product marked as available.');
                } catch (err: unknown) {
                  notifyError(
                    (err as Error)?.message ?? 'Failed to update product'
                  );
                } finally {
                  setActiveDialog(null);
                  setSelectedAction(null);
                }
              })();
              break;
            case 'delete':
              handleDeleteProduct();
              break;
            case 'cannotDelete':
              // This is informational only, close the dialog
              setActiveDialog(null);
              setSelectedAction(null);
              setBlockingItems(null);
              break;
            case 'removeSupplier':
              console.log('Remove supplier:', productId, productData);
              // TODO: implement remove supplier logic
              setActiveDialog(null);
              setSelectedAction(null);
              break;
          }
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={productId}
      dialogTitle="View / Edit Product"
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
      headerButtons={<ProductActionButtons product={productData} />}
      hideTrigger
      headerInfo={{
        useSelectedProduct: true,
      }}
    >
      <ProductForm id={productId} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
