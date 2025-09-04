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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
import { QUOTE_TYPE_COLORS, BADGE_COLORS } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface HeaderInfo {
  /** Custom ID to display as title (replaces dialogTitle when provided) */
  customId?: string;
  /** Array of primary badges to show under the title (e.g., status badges) */
  primaryBadges?: string[];
  /** Array of secondary badges to show next to primary badges (e.g., type, category badges) */
  secondaryBadges?: string[];
  /** Use selected quotation data automatically */
  useSelectedQuotation?: boolean;
  /** Use selected customer data automatically */
  useSelectedCustomer?: boolean;
}

interface AddProductDrawerDialogProps {
  /** If set, we're editing; otherwise we're creating new */
  id?: number;

  /** Override the header title */
  dialogTitle?: string;

  /** Override the trigger button text */
  buttonTitle?: string;

  /** Override the dialog description */
  dialogDescription?: string;

  /**
   * Optional custom trigger element; must accept an `onClick`.
   * If omitted, we render our default <Plus> button.
   */
  trigger?: React.ReactElement<{ onClick?: () => void }>;

  /** Controlled open state (otherwise it's internal) */
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;

  /** Hides the trigger entirely */
  hideTrigger?: boolean;

  /** Optional header buttons to display inline with the title */
  headerButtons?: React.ReactNode;

  /** Optional header info for custom ID and badges */
  headerInfo?: HeaderInfo;

  /** Optional header separator to display between the title and the content  */
  headerSeparator?: boolean;

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
}

export function FormDialog({
  id,
  dialogTitle,
  dialogDescription,
  buttonTitle,
  trigger,
  open: openProp,
  onOpenChangeAction: onOpenChangeProp,
  hideTrigger,
  headerButtons,
  headerInfo,
  headerSeparator,
  children,
}: AddProductDrawerDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [effectiveId, setEffectiveId] = React.useState(id);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChangeProp ?? setUncontrolledOpen;

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const selectedQuotation = useSelectedQuotation();
  const selectedCustomer = useSelectedCustomer();

  let finalCustomId = headerInfo?.customId;
  let finalPrimaryBadges = headerInfo?.primaryBadges;
  let finalSecondaryBadges = headerInfo?.secondaryBadges;

  if (headerInfo?.useSelectedQuotation && selectedQuotation) {
    finalCustomId = selectedQuotation.quote_number;
    finalPrimaryBadges = [selectedQuotation.quote_status];
    finalSecondaryBadges = [selectedQuotation.quote_type];
  }

  if (headerInfo?.useSelectedCustomer && selectedCustomer) {
    finalCustomId = selectedCustomer.business_name;
    finalPrimaryBadges = [selectedCustomer.customer_status];
    finalSecondaryBadges = [selectedCustomer.customer_type];
  }

  const defaultTitle = effectiveId ? 'View / Edit' : 'Add New Data';
  const headerTitle = (finalCustomId || dialogTitle) ?? defaultTitle;
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

  const close = () => {
    setOpen(false);
    // Reset effectiveId when closing
    setEffectiveId(id);
  };

  // If children is a single ReactElement, auto-inject id/onCancel/onSuccess
  const contentNode = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<ChildFormProps>, {
        id: effectiveId,
        onCancel: close,
        onSuccess: close,
      })
    : children;

  const formatBadgeText = (text: string): string => {
    return text.replace(/_/g, ' ');
  };

  const renderBadges = () => {
    const hasBadges =
      (finalPrimaryBadges && finalPrimaryBadges.length > 0) ||
      (finalSecondaryBadges && finalSecondaryBadges.length > 0);

    if (!hasBadges) return null;

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
              QUOTE_TYPE_COLORS[badge as keyof typeof QUOTE_TYPE_COLORS] ||
              'bg-gray-100 text-gray-800 border-gray-300'
            }
          >
            {formatBadgeText(badge)}
          </Badge>
        ))}
      </div>
    );
  };

  // Calculate dialog dimensions based on editing state
  const getDialogDimensions = () => {
    if (isEditing) {
      // Editing mode: 95% width with max height constraint
      return {
        width: '95vw',
        maxWidth: '95vw',
        maxHeight: '95vh',
        height: 'auto',
      };
    }
    // Adding mode: 50% width with max height constraint
    return {
      width: '50vw',
      maxWidth: '50vw',
      maxHeight: '95vh',
      height: 'auto',
    };
  };

  const dimensions = getDialogDimensions();

  // For ScrollArea, use max-height instead of fixed height
  const getScrollAreaMaxHeight = (): string => {
    // Calculate available space: viewport height minus header space (approx 8rem)
    return 'max-h-[calc(95vh-8rem)]';
  };

  const dialogInner = (
    <>
      <DialogHeader className="flex flex-row items-center justify-between px-5 pt-6 pb-2 flex-shrink-0">
        <div>
          <DialogTitle className="text-2xl">{headerTitle}</DialogTitle>
          <DialogDescription className="my-2">
            {dialogDescription}
          </DialogDescription>
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
          'rounded-md overflow-auto px-5 pt-4'
        )}
      >
        <div>{contentNode}</div>
      </ScrollArea>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        <DialogContent
          className="flex flex-col p-0"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: dimensions.maxWidth,
            maxHeight: dimensions.maxHeight,
          }}
        >
          {dialogInner}
        </DialogContent>
      </Dialog>
    );
  }

  // For mobile, also apply viewport-based sizing to the drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerNode}</DrawerTrigger>
      <DrawerContent className="flex flex-col max-w-[95vh] h-auto">
        <DrawerHeader className="flex flex-row items-center justify-between flex-shrink-0 px-4">
          <div>
            <DrawerTitle className="text-start text-2xl">
              {headerTitle}
            </DrawerTitle>
            <DrawerDescription className="mt-2">
              {dialogDescription}
            </DrawerDescription>
            {renderBadges()}
          </div>
          {headerButtons && (
            <div className="flex items-center">{headerButtons}</div>
          )}
        </DrawerHeader>
        {headerSeparator && <Separator className="" />}

        <div
          className="flex-1 overflow-y-auto px-4 pt-5"
          style={{ maxHeight: 'calc(95vh - 12rem)' }}
        >
          {contentNode}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
