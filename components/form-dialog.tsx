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
import { QUOTE_TYPE_COLORS, STATUS_COLORS } from '@/lib/utils';

interface HeaderInfo {
  /** Custom ID to display as title (replaces dialogTitle when provided) */
  customId?: string;
  /** Array of primary badges to show under the title (e.g., status badges) */
  primaryBadges?: string[];
  /** Array of secondary badges to show next to primary badges (e.g., type, category badges) */
  secondaryBadges?: string[];
  /** Use selected quotation data automatically */
  useSelectedQuotation?: boolean;
}

interface AddProductDrawerDialogProps {
  /** If set, we're editing; otherwise we're creating new */
  id?: number;

  /** Override the header title */
  dialogTitle?: string;

  /** Override the trigger button text */
  buttonTitle?: string;

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
  buttonTitle,
  trigger,
  open: openProp,
  onOpenChangeAction: onOpenChangeProp,
  hideTrigger,
  headerButtons,
  headerInfo,
  children,
}: AddProductDrawerDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [effectiveId, setEffectiveId] = React.useState(id);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChangeProp ?? setUncontrolledOpen;

  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Always call the hook, but only use the result when needed
  const selectedQuotation = useSelectedQuotation();

  let finalCustomId = headerInfo?.customId;
  let finalPrimaryBadges = headerInfo?.primaryBadges;
  let finalSecondaryBadges = headerInfo?.secondaryBadges;

  if (headerInfo?.useSelectedQuotation && selectedQuotation) {
    finalCustomId = selectedQuotation.quote_number;
    finalPrimaryBadges = [selectedQuotation.quote_status];
    finalSecondaryBadges = [selectedQuotation.quote_type];
  }

  const defaultTitle = effectiveId ? 'View / Edit' : 'Add New Data';
  const headerTitle = (finalCustomId || dialogTitle) ?? defaultTitle;
  const triggerTitle = buttonTitle ?? defaultTitle;

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

  const renderBadges = () => {
    const hasBadges =
      (finalPrimaryBadges && finalPrimaryBadges.length > 0) ||
      (finalSecondaryBadges && finalSecondaryBadges.length > 0);

    if (!hasBadges) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {/* Render status badges */}
        {finalPrimaryBadges?.map((status, index) => (
          <Badge
            key={`status-${index}`}
            variant="outline"
            className={STATUS_COLORS[status] || STATUS_COLORS.DRAFT}
          >
            {status}
          </Badge>
        ))}

        {/* Render quote type badges */}
        {finalSecondaryBadges?.map((quoteType, index) => (
          <Badge
            key={`quote-type-${index}`}
            variant="outline"
            className={
              QUOTE_TYPE_COLORS[quoteType as keyof typeof QUOTE_TYPE_COLORS] ||
              'bg-gray-100 text-gray-800 border-gray-300'
            }
          >
            {quoteType}
          </Badge>
        ))}
      </div>
    );
  };

  const dialogInner = (
    <>
      <DialogHeader className="flex flex-row items-center justify-between pr-5">
        <div>
          <DialogTitle>{headerTitle}</DialogTitle>
          <DialogDescription />
          {renderBadges()}
        </div>
        {headerButtons && (
          <div className="flex items-center gap-2">{headerButtons}</div>
        )}
      </DialogHeader>
      <ScrollArea
        className={clsx(effectiveId ? 'h-[calc(65vh-5rem)]' : 'h-auto')}
      >
        <div className="pr-4">{contentNode}</div>
      </ScrollArea>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        <DialogContent className="min-w-[850px]">{dialogInner}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerNode}</DrawerTrigger>
      <DrawerContent className="flex flex-col max-h-[90vh]">
        <DrawerHeader className="flex flex-row items-center justify-between flex-shrink-0 px-4">
          <div>
            <DrawerTitle>{headerTitle}</DrawerTitle>
            <DrawerDescription />
            {renderBadges()}
          </div>
          {headerButtons && (
            <div className="flex items-center">{headerButtons}</div>
          )}
        </DrawerHeader>

        {/* Mobile content with native overflow scrolling */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">{contentNode}</div>

        <DrawerFooter className="flex-shrink-0 pt-4">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
