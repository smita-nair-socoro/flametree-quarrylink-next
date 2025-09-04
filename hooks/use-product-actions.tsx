'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { ProductDetails } from '@/lib/types/product';
import { ActionDialog } from '@/components/action-dialog';
import ProductForm from '@/app/(protected)/inventory/products/(components)/forms/product-form';
import { ProductActionButtons } from '@/app/(protected)/inventory/products/(components)/forms/product-action-buttons';
import { TriangleAlert, Ban, CircleAlert, CircleCheckBig } from 'lucide-react';
import { BADGE_COLORS } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { QuotationDetails } from '@/lib/types/quotation';

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

  const productQuotesStatus = () => {
    if (!productData?.quotes) {
      return true;
    }

    if (productData.quotes.length === 0) {
      return true;
    }

    if (productData.quotes.length > 0) {
      return !productData.quotes.some(
        (quote: QuotationDetails) =>
          quote.quote_status !== 'ARCHIVED' &&
          quote.quote_status !== 'DRAFT' &&
          quote.quote_status !== 'CONVERTED_TO_JOB'
      );
    }
  };

  const quoteName = () => {
    if (!productQuotesStatus()) {
      console.log(productData?.quotes);
      return productData?.quotes
        .filter(
          (quote: QuotationDetails) =>
            quote.quote_status == 'PENDING' ||
            quote.quote_status == 'DRAFT' ||
            quote.quote_status == 'CONVERTED_TO_JOB'
        )
        .map((quote: QuotationDetails) => quote.quote_number)
        .join(', ');
    }
  };
  console.log(
    productData?.quotes.filter(
      (quote: QuotationDetails) =>
        quote.quote_status == 'PENDING' ||
        quote.quote_status == 'DRAFT' ||
        quote.quote_status == 'CONVERTED_TO_JOB'
    )
  );

  const productJobsStatus = () => {
    if (!productData?.jobs) {
      return true;
    }

    if (productData.jobs.length === 0) {
      return true;
    }

    if (productData.jobs.length > 0) {
      return productData.jobs.some((j) =>
        j.job_items.some((ji) => ji.remaining_quantity == 0)
      );
    }
  };

  const jobNames = () => {
    if (!productJobsStatus()) {
      return productData?.jobs
        .filter((job) => job.job_items.some((ji) => ji.remaining_quantity != 0))
        .map((job) => job.job_number)
        .join(', ');
    }
  };

  const productDocketStatus = () => {
    if (!productData?.jobs || productData.jobs.length === 0) {
      return true;
    }
    // Check if any dockets in jobs have PENDING or DELIVERING status
    return !productData.jobs.some((job) =>
      job.dockets.some(
        (docket) =>
          docket.docket_status === 'PENDING' ||
          docket.docket_status === 'DELIVERING'
      )
    );
  };

  const docketNames = () => {
    if (!productDocketStatus()) {
      return productData?.jobs
        .filter((job) =>
          job.dockets.some(
            (docket) =>
              docket.docket_status === 'PENDING' ||
              docket.docket_status === 'DELIVERING'
          )
        )
        .map((job) => job.dockets.map((docket) => docket.docket_number))
        .join(', ');
    }
  };

  if (selectedAction?.key === 'unavailable') {
    return {
      unavailable: {
        title: `Mark as Unavailable`,
        description: (
          <div className="flex justfiy-start gap-2">
            <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-red-100 rounded-full">
              <span className="flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-600" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Mark as Unavailable</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-gray-500">
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
            <span className="text-sm text-gray-500">
              Are you sure you want to mark this product as unavailable?
            </span>
            <div className="border-1 border-[#FFD6A7] rounded-md p-2 bg-[#FFF7ED]">
              <div className="flex items-start gap-2 self-stretch">
                <TriangleAlert className="h-5 w-6 text-[#F54900]" />
                <div className="flex flex-col">
                  <span className="text-sm text-[#9F2D00] font-medium">
                    Impact on New Business
                  </span>
                  <span className="text-sm text-[#CA3500]">
                    This product will be hidden from new quotes and orders, but
                    existing commitments will continue normally.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">
                What happens when marked as unavailable:
              </span>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-outside pl-5">
                <li> Hidden from new quote creation</li>
                <li> Removed from product selection lists</li>
                <li> Existing quotes and orders continue normally</li>
                <li> All pricing and configurations preserved</li>
                <li>Can be made available again at any time</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">What continues to work:</span>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-outside pl-5">
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
  } else if (selectedAction?.key === 'archive') {
    return {
      archive: {
        title: `Archive`,
        description: (
          <div className="flex justfiy-start gap-2">
            <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-[#DBEAFE] rounded-full">
              <span className="flex items-center justify-center">
                <CircleAlert className="h-5 w-5 text-[#155DFC]" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Archive Produc with History</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-gray-500">
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
          <div className="border-1 border-[#FEE685] rounded-md p-2 bg-[#FFF7ED]">
            <div className="flex items-start gap-2 self-stretch">
              <TriangleAlert className="h-5 w-6 text-[#E17100]" />
              <div className="flex flex-col">
                <span className="text-sm text-[#973C00] font-medium">
                  Historical Data Preserved
                </span>
                <span className="text-sm text-[#BB4D00]">
                  All past jobs, dockets, quotes and reports will remain
                  accessible.
                </span>
              </div>
            </div>
          </div>
        ),
        confirmText: 'Archive Product',
        confirmCustomClass: 'bg-[#475569] hover:bg-[#64748b] text-white',
      },
    };
  } else if (selectedAction?.key === 'cannotArchive') {
    return {
      cannotArchive: {
        title: `Archive`,
        description: (
          <div className="flex justfiy-start gap-2">
            <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-[#FFEDD4] rounded-full">
              <span className="flex items-center justify-center">
                <TriangleAlert className="h-5 w-5 text-[#F54900]" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Cannot Archive Product</span>
              <div className="flex justify-start gap-2">
                <span className="text-sm text-gray-500">
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
            <span className="text-sm text-gray-500 font-semibold">
              This product cannot be archived because it has pending business
              activities:
            </span>

            <div className="flex flex-col gap-4">
              <span className="font-medium">Active Usage:</span>
              <div className="flex flex-col gap-3">
                {!productQuotesStatus() && (
                  <>
                    <div className="border-1 border-[#FFD6A7] rounded-md p-3 bg-[#FFF7ED]">
                      <span className="mx-auto">
                        Active quotes: {quoteName()}
                      </span>
                    </div>
                  </>
                )}
                {!productJobsStatus() && (
                  <>
                    <div className="border-1 border-[#FFD6A7] rounded-md p-3 bg-[#FFF7ED]">
                      <span className="mx-auto">Active jobs: {jobNames()}</span>
                    </div>
                  </>
                )}
                {!productDocketStatus() && (
                  <>
                    <div className="border-1 border-[#FFD6A7] rounded-md p-3 bg-[#FFF7ED]">
                      <span className="mx-auto">
                        Active dockets: {docketNames()}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="border-1 border-[#BEDBFF] bg-[#EFF6FF] rounded-md p-3">
                <div className="flex justify-start gap-2">
                  <CircleAlert className="h-5 w-6 text-[#155DFC]" />
                  <span className="text-sm text-[#193CB8] font-medium">
                    Archiving this product now would disrupt ongoing business
                    operations.
                  </span>
                </div>
              </div>
              <span className="font-medium">Recommended Action</span>
              <span className="text-[#6A7282]">
                Complete these activities first:
              </span>
              {!productQuotesStatus() && (
                <div className="border-1 border-[#B9F8CF] p-3 bg-green-50 rounded-md">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <CircleCheckBig className="h-5 w-5 text-[#00A63E]" />
                      <span className="font-medium">
                        Complete Active Quotes
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">
                      Convert to jobs, archive quotes, or remove this product
                      from active quotes
                    </span>
                  </div>
                </div>
              )}
              {!productJobsStatus() && (
                <div className="border-1 border-[#B9F8CF] p-3 bg-green-50 rounded-md">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <CircleCheckBig className="h-5 w-5 text-[#00A63E]" />
                      <span className="font-medium">Complete Active Jobs</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">
                      Fullfill remaining quantities or complete job deliveries
                      for this product
                    </span>
                  </div>
                </div>
              )}
              {!productDocketStatus() && (
                <div className="border-1 border-[#B9F8CF] p-3 bg-green-50 rounded-md">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <CircleCheckBig className="h-5 w-5 text-[#00A63E]" />
                      <span className="font-medium">
                        Fulfill Pending Delivery Dockets
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">
                      Complete or cancel delivery dockets containing this
                      product
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
        confirmActionNeeded: false,
      },
    };
  } else if (selectedAction?.key === 'unarchive') {
    return {
      unarchive: {
        title: `Unarchive`,
        description: `Unarchive this product`,
        confirmText: 'Unarchive',
        confirmVariant: 'default',
      },
    };
  } else if (selectedAction?.key === 'available') {
    return {
      available: {
        title: `Mark as Available`,
        description: `Mark this product as available`,
        confirmText: 'Mark as Available',
        confirmVariant: 'default',
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

    archive: createDialogAction('archive', () => {
      console.log('Archive product:', productId);
      // TODO: implement archive logic
    }),

    cannotArchive: createDialogAction('cannotArchive', () => {
      console.log('Cannot archive product:', productId);
      // This will show the informational modal about why archiving is not possible
    }),

    unarchive: createDialogAction('unarchive', () => {
      console.log('Unarchive product:', productId);
      // TODO: implement unarchive logic
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
              // TODO: implement archive logic
              break;
            case 'available':
              console.log('Available product:', productId, productData);
              // TODO: implement unarchive logic
              break;
            case 'archive':
              console.log('Archive product:', productId, productData);
              // TODO: implement archive logic
              break;
            case 'cannotArchive':
              console.log('Cannot archive product:', productId, productData);
              // This is informational only, no action needed
              break;
            case 'removeSupplier':
              console.log('Remove supplier:', productId, productData);
              // TODO: implement remove supplier logic
              break;
            case 'unarchive':
              console.log('Unarchive product:', productId, productData);
              // TODO: implement unarchive logic
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
