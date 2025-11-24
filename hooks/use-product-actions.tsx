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
} from 'lucide-react';
import { BADGE_COLORS } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Quotation } from '@/lib/types/quotation';
import { JobDetails } from '@/lib/types/job';

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
  productData?: ProductDetails | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  const productName = productData?.product_name;
  const productCode = productData?.product_code;
  const productStatus = productData?.status;

  const hasActiveQuotes = () => {
    if (!productData?.quotes?.length) return false;
    return productData.quotes.some(
      (q: Quotation) =>
        q.status !== 'ARCHIVED' &&
        q.status !== 'DRAFT' &&
        q.status !== 'CONVERTED_TO_JOB'
    );
  };

  // Comma-separated quote numbers for active quotes
  const quoteName = () => {
    if (hasActiveQuotes()) {
      return productData?.quotes
        .filter(
          (q: Quotation) =>
            q.status !== 'ARCHIVED' &&
            q.status !== 'DRAFT' &&
            q.status !== 'CONVERTED_TO_JOB'
        )
        .map((q: Quotation) => q.quote_number)
        .join(', ');
    }
    return '';
  };

  // Count of active quotes
  const activeQuoteNumber = () => {
    if (hasActiveQuotes()) {
      return productData?.quotes.filter(
        (q: Quotation) =>
          q.status !== 'ARCHIVED' &&
          q.status !== 'DRAFT' &&
          q.status !== 'CONVERTED_TO_JOB'
      ).length;
    }
    return 0;
  };

  const hasActiveJobs = () => {
    if (!productData?.jobs) {
      return false;
    }

    if (productData?.jobs.length === 0) {
      return false;
    }

    if (productData?.jobs.length > 0) {
      return productData.jobs?.some((job: JobDetails) =>
        job.job_items.some((jobItem) => jobItem.remaining_quantity > 0)
      );
    }
  };

  const jobNames = () => {
    if (hasActiveJobs()) {
      return productData?.jobs
        .filter((job) => job.job_items.some((ji) => ji.remaining_quantity > 0))
        .map((job) => job.job_number)
        .join(', ');
    }
    return '';
  };

  const activeJobNumber = () => {
    if (hasActiveJobs()) {
      return productData?.jobs.filter((job) =>
        job.job_items.some((ji) => ji.remaining_quantity > 0)
      ).length;
    }
    return 0;
  };

  const hasActiveDockets = () => {
    if (!productData?.jobs?.length) return false;
    return productData?.jobs.some((job) =>
      job.dockets.some(
        (docket) =>
          docket.docket_status === 'PENDING' ||
          docket.docket_status === 'DELIVERING'
      )
    );
  };

  // Collect all active dockets (pending/delivering)
  const getActiveDockets = () =>
    productData?.jobs?.flatMap((job) =>
      job.dockets.filter(
        (docket) =>
          docket.docket_status === 'PENDING' ||
          docket.docket_status === 'DELIVERING'
      )
    ) ?? [];

  const docketNames = () => {
    if (!hasActiveDockets()) {
      return '';
    }
    return getActiveDockets()
      .map((d) => d.docket_number)
      .join(', ');
  };

  const activeDocketNumber = () => {
    if (!hasActiveDockets()) {
      return 0;
    }
    return getActiveDockets().length;
  };

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
                    This product will be hidden from new quotes and orders, but
                    existing commitments will continue normally.
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
  } else if (selectedAction?.key === 'delete') {
    return {
      delete: {
        title: `Delete`,
        description: (
          <div className="flex justify-start items-center gap-2">
            <div className="flex w-[40px] h-[40px] justify-center bg-[#FFFBEB] rounded-full">
              <span className="flex items-center justify-center">
                <CircleAlert className="h-[20px] w-[20px] text-[#E17100]" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Delete Product with History</span>
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
          <div className="border-1 border-[#FEE685] rounded-md p-[16.625px] bg-[#FFFBEB]">
            <div className="flex items-start gap-2 self-stretch">
              <TriangleAlert className="h-[20px] w-[20px] text-[#E17100] flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-[#973C00] font-medium">
                  Historical Data Preserved
                </span>
                <span className="text-[14px] font-normal text-[#BB4D00]">
                  All past jobs, dockets, quotes and reports will remain
                  accessible.
                </span>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Delete Product',
        confirmVariant: 'destructive',
        confirmCustomColor: '#E7000B',
      },
    };
  } else if (selectedAction?.key === 'cannotDelete') {
    return {
      cannotDelete: {
        title: `Delete`,
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

            <div className="flex flex-col gap-3">
              <span className="font-medium text-[#101828] text-[14px]">
                Active Usage:
              </span>
              <div className="flex flex-col gap-1.5">
                {hasActiveQuotes() && (
                  <>
                    <div className="border-1 border-[#FFD6A7] rounded-md p-3 bg-[#FFF7ED]">
                      <div className="flex flex-row justify-start gap-1">
                        <span className="text-[#364153] text-[14px] font-normal">
                          {activeQuoteNumber()} Active quotes:
                        </span>
                        <span className="text-[#155DFC] font-medium text-[14px] underline">
                          {' '}
                          {quoteName()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {hasActiveJobs() && (
                  <>
                    <div className="border-1 border-[#FFD6A7] rounded-md p-3 bg-[#FFF7ED]">
                      <div className="flex flex-row justify-start gap-1">
                        <span className="text-[#364153] text-[14px] font-normal">
                          {activeJobNumber()} Active jobs:
                        </span>
                        <span className="text-[#155DFC] font-medium text-[14px] underline">
                          {' '}
                          {jobNames()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {hasActiveDockets() && (
                  <>
                    <div className="border-1 border-[#FFD6A7] rounded-md p-3 bg-[#FFF7ED]">
                      <div className="flex flex-row justify-start gap-1">
                        <span className="text-[#364153] text-[14px] font-normal">
                          {activeDocketNumber()} Active dockets:
                        </span>
                        <span className="text-[#155DFC] font-medium text-[14px] underline">
                          {' '}
                          {docketNames()}
                        </span>
                      </div>
                    </div>
                  </>
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
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[#101828] text-[14px]">
                Recommended Action
              </span>
              <span className="text-[#6A7282] text-[14px] font-normal">
                Complete these activities first:
              </span>
              <div className="flex flex-col gap-1.5 mt-2">
                {hasActiveQuotes() && (
                  <div className="border-1 border-[#B9F8CF] p-3 bg-green-50 rounded-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CircleCheckBig className="h-[16px] w-[16px] flex-shrink-0 text-[#00A63E]" />
                        <span className="font-medium text-[14px] text-[#101828]">
                          Complete Active Quotes
                        </span>
                      </div>
                      <span className="font-normal ml-6 text-[12px] text-[#6A7282]">
                        Convert to jobs, archive quotes, or remove this product
                        from active quotes
                      </span>
                    </div>
                  </div>
                )}
                {hasActiveJobs() && (
                  <div className="border-1 border-[#B9F8CF] p-3 bg-green-50 rounded-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CircleCheckBig className="h-[16px] w-[16px] flex-shrink-0 text-[#00A63E]" />
                        <span className="font-medium text-[14px] text-[#101828]">
                          Complete Active Jobs
                        </span>
                      </div>
                      <span className="font-normal ml-6 text-[12px] text-[#6A7282]">
                        Fullfill remaining quantities or complete job deliveries
                        for this product
                      </span>
                    </div>
                  </div>
                )}
                {hasActiveDockets() && (
                  <div className="border-1 border-[#B9F8CF] p-3 bg-green-50 rounded-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Truck className="h-[16px] w-[16px] flex-shrink-0 text-[#00A63E]" />
                        <span className="font-medium text-[14px] text-[#101828]">
                          Fulfill Pending Delivery Dockets
                        </span>
                      </div>
                      <span className="font-normal ml-6 text-[12px] text-[#6A7282]">
                        Complete or cancel delivery dockets containing this
                        product
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
        confirmActionNeeded: false,
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
                  All existing supplier pricing and configurations remain intact
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
  }

  // Return empty object if no action selected
  return {};
};

export function useProductActions(
  productId: number | undefined,
  productData?: ProductDetails | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

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
      // TODO: implement unavailable logic
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
            case 'unavailable':
              console.log('Unavailable product:', productId, productData);
              // TODO: implement unavailable logic
              break;
            case 'available':
              console.log('Available product:', productId, productData);
              // TODO: implement available logic
              break;
            case 'delete':
              console.log('Delete product:', productId, productData);
              // TODO: implement delete logic
              break;
            case 'cannotDelete':
              console.log('Cannot delete product:', productId, productData);
              // This is informational only, no action needed
              break;
            case 'removeSupplier':
              console.log('Remove supplier:', productId, productData);
              // TODO: implement remove supplier logic
              break;
          }
          setActiveDialog(null);
          setSelectedAction(null);
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
      <ProductForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
