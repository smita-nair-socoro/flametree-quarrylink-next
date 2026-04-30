'use client';

import * as React from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { useSelectedQuotation } from '@/app/stores/quotation-store';
import { useSelectedCustomer } from '@/app/stores/customer-store';
import { useSelectedLineItem } from '@/app/stores/quotation-line-item-store';
import { BADGE_COLORS } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useSelectedProduct } from '@/app/stores/product-store';
import { useSelectedQuarrySupplier } from '@/app/stores/quarry-supplier-store';
import { useSelectedClient } from '@/app/stores/client-store';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';
import { ActionDialog } from './action-dialog';
import { useSelectedJob } from '@/app/stores/job-store';
import { useSelectedJobLineItem } from '@/app/stores/job-line-item-store';
import { useSelectedDocket } from '@/app/stores/docket-store';
import { useSelectedDriver } from '@/app/stores/driver-store';
import { useSelectedTruck } from '@/app/stores/truck-store';
import { normalizeTruckStatus } from '@/lib/types/truck-enums';

interface HeaderInfo {
  /** Custom ID to display as title (replaces dialogTitle when provided) */
  customId?: string;
  /** Array of primary badges to show under the title (e.g., status badges) */
  primaryBadges?: string[];
  /** Array of secondary badges to show next to primary badges (e.g., type, category badges) */
  secondaryBadges?: string[];
  /** Array of third badges to show next to secondary badges (e.g., category badges) */
  thirdBadges?: string[];

  /** Use selected quotation data automatically */
  useSelectedQuotation?: boolean;
  /** Use selected customer data automatically */
  useSelectedCustomer?: boolean;
  /** Use selected product data automatically */
  useSelectedProduct?: boolean;
  /** Use selected supplier data automatically */
  useSelectedSupplier?: boolean;
  /** Use selected quotation line item data automatically */
  useSelectedLineItem?: boolean;
  /** Use selected quarry/supplier data automatically */
  useSelectedQuarrySupplier?: boolean;
  /** Use selected client data automatically */
  useSelectedClient?: boolean;
  /** Use selected job data automatically */
  useSelectedJob?: boolean;
  /** Use selected job line item data automatically */
  useSelectedJobLineItem?: boolean;
  /** Use selected docket data automatically */
  useSelectedDocket?: boolean;
  /** Use selected driver data automatically */
  useSelectedDriver?: boolean;
  /** Use selected truck data automatically */
  useSelectedTruck?: boolean;
}

interface AddProductDrawerDialogProps {
  /** If set, we're editing; otherwise we're creating new */
  id?: number;

  /** Override the header title */
  dialogTitle?: string;

  /** Custom title component (overrides dialogTitle when provided) */
  customTitle?: React.ReactNode;

  /** Override the trigger button text */
  buttonTitle?: string;

  /** Override the dialog description */
  dialogDescription?: string;

  /** Optional subtitle rendered under the title with normal header spacing */
  headerSubtitle?: React.ReactNode;

  /**
   * Optional custom trigger element; must accept an `onClick`.
   * If omitted, we render our default <Plus> button.
   */
  trigger?: React.ReactElement<{ onClick?: () => void }>;

  /** Controlled open state (otherwise it's internal) */
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;

  dialogWidth?: string;

  /** Hides the trigger entirely */
  hideTrigger?: boolean;

  /** Optional notice rendered above the title (e.g. info banner) */
  headerNotice?: React.ReactNode;

  /** Optional header buttons to display inline with the title */
  headerButtons?: React.ReactNode;

  /** Vertical alignment of header buttons relative to content on the left (default: "center") */
  headerButtonsAlign?: 'start' | 'center';

  /** Optional header info for custom ID and badges */
  headerInfo?: HeaderInfo;

  /**
   * When set, used for customer header (title/badges) instead of store's selectedCustomer.
   * Use when the dialog is driven by get-customer-by-id (caller fetches and passes the customer).
   */
  headerCustomer?: {
    businessName?: string;
    contactName?: string;
    customerStatus?: string;
    customerType?: string;
  } | null;

  /** Optional header separator to display between the title and the content  */
  headerSeparator?: boolean;

  /** Optional content class to add to the content */
  contentClass?: string;

  /** Optional custom class for the DialogHeader container (e.g., "px-5 pt-6 pb-2" or "px-5 pt-4 pb-0") */
  headerClassName?: string;

  /** Whether to preserve empty badge space in renderBadges */
  preserveEmptyBadgeSpace?: boolean;

  /** When true, shows a confirm dialog on close if the child form is dirty. Defaults to true. */
  confirmOnCloseIfDirty?: boolean;
  /** Optional customization for the unsaved-changes confirm dialog title */
  unsavedConfirmTitle?: string;
  /** Optional customization for the unsaved-changes confirm dialog description */
  unsavedConfirmDescription?: string;
  /** Optional customization for the unsaved-changes confirm primary button text */
  unsavedConfirmConfirmText?: string;
  /** Optional customization for the unsaved-changes confirm cancel button text */
  unsavedConfirmCancelText?: string;
  /** Optional list of detail bullet points for the unsaved-changes confirm dialog */
  unsavedConfirmDetails?: string[];

  /** When true, prevents auto-focus on any element when the dialog opens */
  preventAutoFocus?: boolean;

  /**
   * **THIS** is our form (or any other content) to render inside
   * the drawer/dialog—e.g. our <ProductForm />.
   *
   * When it's a valid ReactElement, we'll auto‐inject:
   *  • `productId={id}`
   *  • `onCancel={close}`
   *  • `onSuccess={close}`
   *
   * so your form just needs to accept those props.
   */
  children: React.ReactNode;
}

interface ChildFormProps {
  id?: number;
  onCancel: () => void;
  onSuccess: () => void;
  /** Child forms can call this to indicate dirty state changes */
  onDirtyChange?: (isDirty: boolean) => void;
  /** Convenience callback to signal the form has been successfully saved */
  onSaved?: () => void;
}

export function FormDialog({
  id,
  dialogTitle,
  customTitle,
  dialogDescription,
  headerSubtitle,
  buttonTitle,
  trigger,
  open: openProp,
  onOpenChangeAction: onOpenChangeProp,
  dialogWidth,
  hideTrigger,
  headerNotice,
  headerButtons,
  headerButtonsAlign = 'center',
  headerInfo,
  headerCustomer: headerCustomerProp,
  headerSeparator,
  contentClass,
  headerClassName,
  children,
  preserveEmptyBadgeSpace = true,
  confirmOnCloseIfDirty = true,
  unsavedConfirmTitle,
  unsavedConfirmDescription,
  unsavedConfirmConfirmText,
  unsavedConfirmCancelText,
  unsavedConfirmDetails,
  preventAutoFocus,
}: AddProductDrawerDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [effectiveId, setEffectiveId] = React.useState(id);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChangeProp ?? setUncontrolledOpen;

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = React.useState(false);

  /**
   * Radix (Dialog/DropdownMenu) uses a "dismissable layer" stack that can set
   * `document.body.style.pointerEvents = 'none'` while overlays are open.
   * When multiple layers close in the same tick (e.g. Esc closes a dropdown
   * and the dialog), we can occasionally end up with pointer-events left as
   * 'none', making the next screen feel "frozen".
   *
   * This is a defensive cleanup: only touches pointerEvents if it's currently
   * 'none'.
   */
  const unlockBodyPointerEvents = React.useCallback(() => {
    if (typeof document === 'undefined') return;
    if (document.body?.style?.pointerEvents === 'none') {
      document.body.style.pointerEvents = '';
    }
  }, []);

  // Cleanup on close (after Radix unmounts its layers)
  React.useEffect(() => {
    if (open) return;
    const raf = window.requestAnimationFrame(() => {
      unlockBodyPointerEvents();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [open, unlockBodyPointerEvents]);

  // Cleanup on unmount (e.g. route change while closing)
  React.useEffect(() => {
    return () => {
      unlockBodyPointerEvents();
    };
  }, [unlockBodyPointerEvents]);

  const selectedQuotation = useSelectedQuotation();
  const selectedCustomer = useSelectedCustomer();
  const selectedProduct = useSelectedProduct();
  const selectedQuotationLineItem = useSelectedLineItem();
  const selectedQuarrySupplier = useSelectedQuarrySupplier();
  const selectedClient = useSelectedClient();
  const selectedJob = useSelectedJob();
  const selectedJobLineItem = useSelectedJobLineItem();
  const selectedDocket = useSelectedDocket();
  const selectedDriver = useSelectedDriver();
  const selectedTruck = useSelectedTruck();

  let finalCustomId = headerInfo?.customId;
  let finalPrimaryBadges = headerInfo?.primaryBadges;
  let finalSecondaryBadges = headerInfo?.secondaryBadges;
  const finalThirdBadges = headerInfo?.thirdBadges;

  if (headerInfo?.useSelectedQuotation && selectedQuotation) {
    finalCustomId = selectedQuotation.quoteNumber;
    finalPrimaryBadges = [selectedQuotation.quoteStatus];
  }

  const customerForHeader = headerCustomerProp ?? selectedCustomer;
  if (headerInfo?.useSelectedCustomer && customerForHeader) {
    const c = customerForHeader as {
      businessName?: string;
      contactName?: string;
      customerStatus?: string;
      customerType?: string;
    };
    finalCustomId = c.businessName?.trim() || c.contactName || '';
    finalPrimaryBadges = c.customerStatus ? [c.customerStatus] : [];
    finalSecondaryBadges = c.customerType ? [c.customerType] : [];
  }

  if (headerInfo?.useSelectedProduct && selectedProduct) {
    finalCustomId = selectedProduct.productName;
    finalPrimaryBadges = [selectedProduct.material.name.toUpperCase()];
    finalSecondaryBadges = [
      selectedProduct.isActive ? 'AVAILABLE' : 'UNAVAILABLE',
    ];
  }

  if (headerInfo?.useSelectedLineItem && selectedQuotationLineItem) {
    finalCustomId = selectedQuotationLineItem.productName;
    finalPrimaryBadges = [selectedQuotationLineItem.quarryName];
    finalSecondaryBadges = [selectedQuotationLineItem.supplierProductName];
  }

  if (headerInfo?.useSelectedQuarrySupplier && selectedQuarrySupplier) {
    finalCustomId = selectedQuarrySupplier.name;
    finalPrimaryBadges = [selectedQuarrySupplier.status];
    finalSecondaryBadges = [selectedQuarrySupplier.quarrySupplierType];
  }

  if (headerInfo?.useSelectedClient && selectedClient) {
    finalCustomId = selectedClient.name;
    finalPrimaryBadges = [selectedClient.clientStatus];
    finalSecondaryBadges = [selectedClient.subscription];
  }

  if (headerInfo?.useSelectedJob && selectedJob) {
    finalCustomId = selectedJob.jobNumber;
    finalPrimaryBadges = [selectedJob.jobStatus];
  }

  if (headerInfo?.useSelectedJobLineItem && selectedJobLineItem) {
    finalCustomId = selectedJobLineItem.product.productName;
    finalPrimaryBadges = [selectedJobLineItem.jobItemType];
    finalSecondaryBadges = [selectedJobLineItem.product.productName];
  }

  if (headerInfo?.useSelectedDocket && selectedDocket) {
    finalCustomId = selectedDocket.docketNumber;
    finalPrimaryBadges = [selectedDocket.docketStatus];
  }

  if (headerInfo?.useSelectedDriver && selectedDriver) {
    finalCustomId = selectedDriver.driverName;
    finalPrimaryBadges = selectedDriver.driverStatus ? [selectedDriver.driverStatus] : [];
    finalSecondaryBadges = selectedDriver.driverType ? [selectedDriver.driverType] : [];
  }

  if (headerInfo?.useSelectedTruck && selectedTruck) {
    finalCustomId = selectedTruck.licensePlate;
    finalPrimaryBadges = selectedTruck.truckStatus
      ? [normalizeTruckStatus(selectedTruck.truckStatus) ?? selectedTruck.truckStatus]
      : [];
    finalSecondaryBadges = selectedTruck.truckBusinessType ? [selectedTruck.truckBusinessType] : [];
  }

  const defaultTitle = effectiveId ? 'View / Edit' : 'Add New Data';
  const headerTitle =
    customTitle ?? (finalCustomId || dialogTitle) ?? defaultTitle;
  const triggerTitle = buttonTitle ?? defaultTitle;

  // Determine if we're in editing mode - true when we have a valid ID (> 0)
  const isEditing = Boolean(effectiveId && effectiveId > 0);

  const handleOpen = (isDefaultButton: boolean = false) => {
    if (isDefaultButton) {
      setEffectiveId(0);
    } else {
      setEffectiveId(id);
    }
    setOpen(true);
  };

  // Update effectiveId when id prop changes (for controlled usage)
  React.useEffect(() => {
    if (!open) {
      setEffectiveId(id);
    }
  }, [id, open]);

  // Reset dirty state whenever dialog is opened
  React.useEffect(() => {
    if (open) {
      setHasUnsavedChanges(false);
    }
  }, [open]);

  const triggerNode = trigger ? (
    React.isValidElement(trigger) ? (
      React.cloneElement(trigger, { onClick: () => handleOpen(false) })
    ) : (
      <span onClick={() => handleOpen(false)}>{trigger}</span>
    )
  ) : (
    !hideTrigger && (
      <Button onClick={() => handleOpen(true)} variant="default">
        <Plus className="h-4 w-4" /> {triggerTitle}
      </Button>
    )
  );

  const forceClose = React.useCallback(() => {
    setOpen(false);
    setEffectiveId(id);
  }, [setOpen, id]);

  const close = () => {
    if (confirmOnCloseIfDirty && hasUnsavedChanges) {
      setShowUnsavedConfirm(true);
      return;
    }
    forceClose();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setHasUnsavedChanges(false);
      setOpen(true);
      return;
    }
    // Attempt to close
    close();
  };

  const handleChildSuccess = React.useCallback(() => {
    setHasUnsavedChanges(false);
    forceClose();
  }, [forceClose]);

  const handleChildDirtyChange = React.useCallback((dirty: boolean) => {
    setHasUnsavedChanges(dirty);
  }, []);

  const handleChildSaved = React.useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const contentNode = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<ChildFormProps>, {
      id: effectiveId,
      onCancel: close,
      onSuccess: handleChildSuccess,
      onDirtyChange: handleChildDirtyChange,
      onSaved: handleChildSaved,
    })
    : children;

  const formatBadgeText = (text?: string | number | null): string => {
    if (text === undefined || text === null) {
      return '';
    }
    const stringValue = typeof text === 'string' ? text : String(text);
    return stringValue.replace(/_/g, ' ');
  };

  const renderBadges = () => {
    const hasBadges =
      (finalPrimaryBadges && finalPrimaryBadges.length > 0) ||
      (finalSecondaryBadges && finalSecondaryBadges.length > 0) ||
      (finalThirdBadges && finalThirdBadges.length > 0);

    if (!hasBadges) {
      return preserveEmptyBadgeSpace ? '\u00A0' : null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {/* Render primary badges */}
        {finalPrimaryBadges?.map((badge, index) => (
          <Badge
            key={`primary-${index}`}
            variant="outline"
            className={
              BADGE_COLORS[badge] || 'bg-blue-100 text-blue-800 border-blue-300'
            }
          >
            {formatBadgeText(badge)}
          </Badge>
        ))}

        {/* Render secondary badges */}
        {finalSecondaryBadges?.map((badge, index) => (
          <Badge
            key={`secondary-${index}`}
            variant="outline"
            className={
              BADGE_COLORS[badge] || 'bg-gray-100 text-gray-800 border-gray-300'
            }
          >
            {formatBadgeText(badge)}
          </Badge>
        ))}

        {/* Render third badges */}
        {finalThirdBadges?.map((badge, index) => (
          <Badge key={`third-${index}`} variant="outline">
            {formatBadgeText(badge)}
          </Badge>
        ))}
      </div>
    );
  };

  // For ScrollArea, use max-height instead of fixed height
  const getScrollAreaMaxHeight = (): string => {
    // Calculate available space: viewport height minus header space (approx 8rem)
    return 'max-h-[calc(95vh-8rem)]';
  };

  const dialogInner = (
    <>
      <DialogHeader
        className={clsx(
          'flex flex-row justify-between flex-shrink-0 px-5 pt-6',
          headerButtonsAlign === 'start' ? 'items-start' : 'items-center',
          headerClassName || 'pb-2',
        )}
      >
        <div>
          {headerNotice && <div className="mb-3">{headerNotice}</div>}
          <DialogTitle className="text-2xl">{headerTitle}</DialogTitle>
          {headerSubtitle && (
            <div className="mt-2 text-sm text-muted-foreground">
              {headerSubtitle}
            </div>
          )}
          {dialogDescription && (
            <DialogDescription className="mt-2 -mb-5">
              {dialogDescription}
            </DialogDescription>
          )}
          {renderBadges()}
        </div>
        {headerButtons && (
          <div className="flex items-center gap-2 pr-1 text-end">
            {headerButtons}
          </div>
        )}
      </DialogHeader>
      {headerSeparator && <Separator className="-mt-3" />}
      <ScrollArea
        className={clsx(
          getScrollAreaMaxHeight(),
          'rounded-md overflow-auto px-5',
          contentClass,
        )}
      >
        <div>{contentNode}</div>
      </ScrollArea>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        <DialogContent
          className={clsx(
            'flex flex-col p-0 w-full',
            'overflow-hidden rounded-lg',
            'scrollbar-gutter-stable',
          )}
          style={{
            width: '100%',
            maxWidth: dialogWidth
              ? `min(${dialogWidth}, 95vw)`
              : isEditing
                ? 'min(95vw, 1100px)'
                : 'min(90vw, 800px)',
            maxHeight: '95vh',
          }}
          onOpenAutoFocus={
            preventAutoFocus ? (e) => e.preventDefault() : undefined
          }
        >
          {dialogInner}
        </DialogContent>
        <EnhancedConfirmDialog
          open={showUnsavedConfirm}
          onOpenChangeAction={setShowUnsavedConfirm}
          title={unsavedConfirmTitle ?? 'Discard changes?'}
          description={
            unsavedConfirmDescription ??
            'You have unsaved changes. If you close now, your changes will be lost.'
          }
          details={unsavedConfirmDetails}
          cancelText={unsavedConfirmCancelText ?? 'Keep editing'}
          confirmText={unsavedConfirmConfirmText ?? 'Discard'}
          confirmVariant="destructive"
          hideCloseButton
          isDirtyStateWarning
          onConfirmAction={() => {
            setHasUnsavedChanges(false);
            forceClose();
          }}
        />
      </Dialog>
    );
  }

  // For mobile, also apply viewport-based sizing to the drawer
  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{triggerNode}</DrawerTrigger>
      <DrawerContent
        className="flex flex-col max-w-[95vh] h-auto"
        onOpenAutoFocus={
          preventAutoFocus ? (e) => e.preventDefault() : undefined
        }
      >
        <DrawerHeader className="flex flex-row items-center justify-between flex-shrink-0 px-4">
          <div>
            {headerNotice && <div className="mb-3">{headerNotice}</div>}
            <DrawerTitle className="text-start text-2xl">
              {headerTitle}
            </DrawerTitle>
            {headerSubtitle && (
              <div className="mt-2 text-sm text-muted-foreground">
                {headerSubtitle}
              </div>
            )}
            {dialogDescription && (
              <DrawerDescription className="mt-2">
                {dialogDescription}
              </DrawerDescription>
            )}
            {renderBadges()}
          </div>
          {headerButtons && (
            <div className="flex items-center">{headerButtons}</div>
          )}
        </DrawerHeader>
        {headerSeparator && <Separator />}

        <div
          className="flex-1 overflow-y-auto px-4 pt-2"
          style={{ maxHeight: 'calc(95vh - 12rem)' }}
        >
          {contentNode}
        </div>
        <ActionDialog
          open={showUnsavedConfirm}
          onOpenChangeAction={setShowUnsavedConfirm}
          title={unsavedConfirmTitle ?? 'Discard changes?'}
          description={
            unsavedConfirmDescription ??
            'You have unsaved changes. If you close now, your changes will be lost.'
          }
          cancelText={unsavedConfirmCancelText ?? 'Keep editing'}
          confirmText={unsavedConfirmConfirmText ?? 'Discard'}
          confirmVariant="destructive"
          onConfirmAction={() => {
            setHasUnsavedChanges(false);
            forceClose();
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
