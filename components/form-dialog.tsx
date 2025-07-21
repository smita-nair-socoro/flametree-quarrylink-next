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
  /** If set, we’re editing; otherwise we’re creating new */
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

  /** Controlled open state (otherwise it’s internal) */
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;

  /** Hides the trigger entirely */
  hideTrigger?: boolean;

  /**
   * **THIS** is our form (or any other content) to render inside
   * the drawer/dialog—e.g. our <ProductForm />.
   *
   * When it’s a valid ReactElement, we’ll auto‐inject:
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
  children,
}: AddProductDrawerDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChangeProp ?? setUncontrolledOpen;

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const defaultTitle = id ? 'View / Edit' : 'Add New Data';
  const headerTitle = dialogTitle ?? defaultTitle;
  const triggerTitle = buttonTitle ?? defaultTitle;

  // Build the trigger node
  const triggerNode = trigger ? (
    React.isValidElement(trigger) ? (
      React.cloneElement(trigger, { onClick: () => setOpen(true) })
    ) : (
      <span onClick={() => setOpen(true)}>{trigger}</span>
    )
  ) : (
    !hideTrigger && (
      <Button onClick={() => setOpen(true)} variant="default">
        <Plus className="h-4 w-4" /> {triggerTitle}
      </Button>
    )
  );

  const close = () => setOpen(false);

  // If children is a single ReactElement, auto-inject id/onCancel/onSuccess
  const contentNode = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<ChildFormProps>, {
        id: id,
        onCancel: close,
        onSuccess: close,
      })
    : children;

  const inner = (
    <>
      <DialogHeader>
        <DialogTitle>{headerTitle}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <ScrollArea className={clsx(id ? 'h-[calc(70vh-5rem)]' : 'h-auto')}>
        {contentNode}
      </ScrollArea>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        <DialogContent className="min-w-[700px]">{inner}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerNode}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{headerTitle}</DrawerTitle>
          <DrawerDescription />
        </DrawerHeader>
        <ScrollArea className="h-[calc(80vh-5rem)]">{contentNode}</ScrollArea>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
