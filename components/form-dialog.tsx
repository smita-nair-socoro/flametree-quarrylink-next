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
import clsx from 'clsx';

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
  children,
}: AddProductDrawerDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [effectiveId, setEffectiveId] = React.useState(id);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChangeProp ?? setUncontrolledOpen;

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const defaultTitle = effectiveId ? 'View / Edit' : 'Add New Data';
  const headerTitle = dialogTitle ?? defaultTitle;
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

  // Build the trigger node
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

  const dialogInner = (
    <>
      <DialogHeader className="flex flex-row items-center justify-between pr-5">
        <div>
          <DialogTitle>{headerTitle}</DialogTitle>
          <DialogDescription />
        </div>
        {headerButtons && (
          <div className="flex items-center gap-2">{headerButtons}</div>
        )}
      </DialogHeader>
      <ScrollArea className={clsx(effectiveId ? 'h-calc(75-5rem)]' : 'h-auto')}>
        {contentNode}
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
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <div>
            <DrawerTitle>{headerTitle}</DrawerTitle>
            <DrawerDescription />
          </div>
          {headerButtons && (
            <div className="flex items-center">{headerButtons}</div>
          )}
        </DrawerHeader>
        <ScrollArea className="h-auto">{contentNode}</ScrollArea>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
