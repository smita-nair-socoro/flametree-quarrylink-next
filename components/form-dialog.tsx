'use client';

import * as React from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { useSelectedQuotation } from '@/app/stores/quotation-store';
import { useSelectedCustomer } from '@/app/stores/customer-store';
import { useQuotationLineItemStore } from '@/app/stores/quotation-line-item-store';
import { BADGE_COLORS } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useSelectedProduct } from '@/app/stores/product-store';
import { useSelectedQuarrySupplier } from '@/app/stores/quarry-supplier-store';
import { useSelectedClient } from '@/app/stores/tenant-store';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';
import { isAnyDropdownOpen } from '@/components/ui/dropdown-menu';
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

  /** Optional header separator to display between the title and the content  */
  headerSeparator?: boolean;

  /** Optional content class to add to the content */
  contentClass?: string;

  /** Optional custom class for the DialogHeader container (e.g., "px-5 pt-6 pb-2" or "px-5 pt-4 pb-0") */
  headerClassName?: string;

  /** Optional footer content rendered as a sticky bar at the bottom (e.g. Save/Cancel buttons) */
  footer?: React.ReactNode;

  /** Optional class applied to the footer container */
  footerClassName?: string;

  /** Whether to preserve empty badge space in renderBadges */
  preserveEmptyBadgeSpace?: boolean;

  /** When true, shows a confirm dialog on close if the child form is dirty. Defaults to true. */
  confirmOnCloseIfDirty?: boolean;
  /** Called whenever the child form's dirty state changes */
  onUnsavedChangesChange?: (isDirty: boolean) => void;
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

export const FormDialogFooterContext = React.createContext<React.Dispatch<
  React.SetStateAction<React.ReactNode>
> | null>(null);

/**
 * Call inside any form rendered as a FormDialog child to slot content
 * into the dialog's sticky footer (replaces inline Cancel/Save buttons).
 * Runs after every render so the content always reflects current state.
 */
export function useFormDialogFooter(content: React.ReactNode) {
  const setFooter = React.useContext(FormDialogFooterContext);
  React.useLayoutEffect(() => {
    setFooter?.(content);
    return () => setFooter?.(null);
  });
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
  headerSeparator,
  contentClass,
  headerClassName,
  children,
  preserveEmptyBadgeSpace = true,
  confirmOnCloseIfDirty = true,
  onUnsavedChangesChange,
  unsavedConfirmTitle,
  unsavedConfirmDescription,
  unsavedConfirmConfirmText,
  unsavedConfirmCancelText,
  unsavedConfirmDetails,
  preventAutoFocus,
  footer,
  footerClassName,
}: Readonly<AddProductDrawerDialogProps>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [effectiveId, setEffectiveId] = React.useState(id);
  const [slottedFooter, setSlottedFooter] =
    React.useState<React.ReactNode>(null);

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
    const raf = globalThis.requestAnimationFrame(() => {
      unlockBodyPointerEvents();
    });
    return () => globalThis.cancelAnimationFrame(raf);
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
  const selectedQuotationLineItem = useQuotationLineItemStore((state) =>
    headerInfo?.useSelectedLineItem ? state.selectedLineItem : null,
  );
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

  if (headerInfo?.useSelectedCustomer && selectedCustomer) {
    finalCustomId =
      selectedCustomer.businessName?.trim() ||
      selectedCustomer.individualContactName ||
      '';
    finalPrimaryBadges = selectedCustomer.customerStatus
      ? [selectedCustomer.customerStatus]
      : [];
    finalSecondaryBadges = selectedCustomer.customerType
      ? [selectedCustomer.customerType]
      : [];
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
    finalPrimaryBadges = selectedDriver.driverStatus
      ? [selectedDriver.driverStatus]
      : [];
    finalSecondaryBadges = selectedDriver.driverType
      ? [selectedDriver.driverType]
      : [];
  }

  if (headerInfo?.useSelectedTruck && selectedTruck) {
    finalCustomId = selectedTruck.licensePlate;
    finalPrimaryBadges = selectedTruck.truckStatus
      ? [
        normalizeTruckStatus(selectedTruck.truckStatus) ??
        selectedTruck.truckStatus,
      ]
      : [];
    finalSecondaryBadges = selectedTruck.truckBusinessType
      ? [selectedTruck.truckBusinessType]
      : [];
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

  let triggerNode: React.ReactNode;
  if (trigger) {
    if (React.isValidElement(trigger)) {
      triggerNode = React.cloneElement(trigger, {
        onClick: () => handleOpen(false),
      });
    } else {
      triggerNode = (
        <button
          type="button"
          className="contents"
          onClick={() => handleOpen(false)}
        >
          {trigger}
        </button>
      );
    }
  } else {
    triggerNode = !hideTrigger && (
      <Button onClick={() => handleOpen(true)} variant="default">
        <Plus className="h-4 w-4" /> {triggerTitle}
      </Button>
    );
  }

  const forceClose = React.useCallback(() => {
    setOpen(false);
    setEffectiveId(id);
  }, [setOpen, id]);

  const close = React.useCallback(() => {
    if (confirmOnCloseIfDirty && hasUnsavedChanges) {
      setShowUnsavedConfirm(true);
      return;
    }
    forceClose();
  }, [confirmOnCloseIfDirty, hasUnsavedChanges, forceClose]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);
      setOpen(true);
      return;
    }
    // Attempt to close
    close();
  };

  const handleChildSuccess = React.useCallback(() => {
    setHasUnsavedChanges(false);
    onUnsavedChangesChange?.(false);
    forceClose();
  }, [forceClose, onUnsavedChangesChange]);

  const handleChildDirtyChange = React.useCallback(
    (dirty: boolean) => {
      setHasUnsavedChanges(dirty);
      onUnsavedChangesChange?.(dirty);
    },
    [onUnsavedChangesChange],
  );

  const handleChildSaved = React.useCallback(() => {
    setHasUnsavedChanges(false);
    onUnsavedChangesChange?.(false);
  }, [onUnsavedChangesChange]);

  const clonedChild = React.useMemo(
    () =>
      React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<ChildFormProps>, {
          id: effectiveId,
          onCancel: close,
          onSuccess: handleChildSuccess,
          onDirtyChange: handleChildDirtyChange,
          onSaved: handleChildSaved,
        })
        : children,
    [
      children,
      effectiveId,
      close,
      handleChildSuccess,
      handleChildDirtyChange,
      handleChildSaved,
    ],
  );

  const contentNode = (
    <FormDialogFooterContext.Provider value={setSlottedFooter}>
      {clonedChild}
    </FormDialogFooterContext.Provider>
  );

  const activeFooter = footer ?? slottedFooter;

  const formatBadgeText = (text?: string | number | null): string => {
    if (text === undefined || text === null) {
      return '';
    }
    const stringValue = typeof text === 'string' ? text : String(text);
    return stringValue.replaceAll('_', ' ');
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
        {finalPrimaryBadges?.map((badge) => {
          const isFailedInvoice =
            headerInfo?.useSelectedDocket &&
            badge === 'INVOICED' &&
            selectedDocket?.invoiceStatus === 'FAILED';
          return (
            <Badge
              key={`primary-${badge}`}
              variant="outline"
              className={
                BADGE_COLORS[badge] ||
                'bg-blue-100 text-blue-800 border-blue-300'
              }
            >
              {formatBadgeText(badge)}
              {isFailedInvoice && (
                <TriangleAlert className="mb-0.5 text-red-500" />
              )}
            </Badge>
          );
        })}

        {/* Render secondary badges */}
        {finalSecondaryBadges?.map((badge) => (
          <Badge
            key={`secondary-${badge}`}
            variant="outline"
            className={
              BADGE_COLORS[badge] || 'bg-gray-100 text-gray-800 border-gray-300'
            }
          >
            {formatBadgeText(badge)}
          </Badge>
        ))}

        {/* Render third badges */}
        {finalThirdBadges?.map((badge) => (
          <Badge key={`third-${badge}`} variant="outline">
            {formatBadgeText(badge)}
          </Badge>
        ))}
      </div>
    );
  };

  const renderConnectedEntities = () => {
    const links: { label: string; href: string }[] = [];

    // Only show when the quote has actually been converted and we have a jobNumber to display
    if (
      headerInfo?.useSelectedQuotation &&
      selectedQuotation?.quoteStatus === 'CONVERTED_TO_JOB' &&
      selectedQuotation.jobId > 0 &&
      selectedQuotation.jobNumber
    ) {
      links.push({
        label: selectedQuotation.jobNumber,
        href: `/customer-operations/jobs?openJobId=${selectedQuotation.jobId}`,
      });
    }

    // Only show when the job originated from a quote and we have a quoteNumber to display
    if (
      headerInfo?.useSelectedJob &&
      selectedJob?.quoteId &&
      selectedJob.quoteId > 0 &&
      selectedJob.quoteNumber
    ) {
      links.push({
        label: selectedJob.quoteNumber,
        href: `/customer-operations/quotation?openQuoteId=${selectedJob.quoteId}`,
      });
    }

    // Every docket belongs to a job — always show
    if (
      headerInfo?.useSelectedDocket &&
      selectedDocket?.jobId &&
      selectedDocket.jobId > 0
    ) {
      links.push({
        label: selectedDocket.job?.jobNumber ?? `#${selectedDocket.jobId}`,
        href: `/customer-operations/jobs?openJobId=${selectedDocket.jobId}`,
      });
    }

    if (links.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline text-[#8E51FF]"
            onClick={(e) => e.stopPropagation()}
          >
            {link.label}
          </a>
        ))}
      </div>
    );
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
          {renderConnectedEntities()}
          {renderBadges()}
        </div>
        {headerButtons && (
          <div className="flex items-center gap-2 pr-1 text-end">
            {headerButtons}
          </div>
        )}
      </DialogHeader>
      {headerSeparator && <Separator className="-mt-3" />}
      <div
        className={clsx(
          'flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5',
          contentClass,
        )}
      >
        {contentNode}
      </div>
      {activeFooter && (
        <DialogFooter className={clsx('px-5 py-4', footerClassName)}>
          {activeFooter}
        </DialogFooter>
      )}
    </>
  );

  let dialogMaxWidth: string;
  if (dialogWidth) {
    dialogMaxWidth = `min(${dialogWidth}, 95vw)`;
  } else if (isEditing) {
    dialogMaxWidth = 'min(95vw, 1100px)';
  } else {
    dialogMaxWidth = 'min(90vw, 800px)';
  }

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
            maxWidth: dialogMaxWidth,
            maxHeight: '95vh',
          }}
          onOpenAutoFocus={
            preventAutoFocus ? (e) => e.preventDefault() : undefined
          }
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (isAnyDropdownOpen()) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isAnyDropdownOpen()) e.preventDefault();
          }}
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
            {renderConnectedEntities()}
            {renderBadges()}
          </div>
          {headerButtons && (
            <div className="flex items-center">{headerButtons}</div>
          )}
        </DrawerHeader>
        {headerSeparator && <Separator />}

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-2">
          {contentNode}
        </div>
        {activeFooter && (
          <div className={clsx('flex-shrink-0 px-4 py-4', footerClassName)}>
            {activeFooter}
          </div>
        )}
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
