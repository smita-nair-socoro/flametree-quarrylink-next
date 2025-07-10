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
import ProductForm from './product-form';

interface AddProductDrawerDialogProps {
  /** If set, we’re editing that product; otherwise we’re creating a new one */
  productId?: number;

  /**
   * We expect a single React element here that at least
   * accepts an `onClick` prop.
   */
  trigger?: React.ReactElement<{ onClick?: () => void }>;

  /** control externally (menu) or let it be uncontrolled */
  open: boolean;

  onOpenChangeAction: (open: boolean) => void;

  /** when true, do NOT render any trigger button */
  hideTrigger?: boolean;
}

export function AddProductDrawerDialog({
  productId,
  trigger,
  open: openProp,
  onOpenChangeAction: onOpenChangeProp,
  hideTrigger,
}: AddProductDrawerDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChangeProp ?? setUncontrolledOpen;

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const title = productId ? 'View / Edit Product' : 'Add New Product';

  const triggerNode = trigger ? (
    React.isValidElement(trigger) ? (
      React.cloneElement(trigger, { onClick: () => setOpen(true) })
    ) : (
      <span onClick={() => setOpen(true)}>{trigger}</span>
    )
  ) : (
    !hideTrigger && (
      <Button onClick={() => setOpen(true)} variant="default">
        <Plus className="mr-1 h-4 w-4" /> {title}
      </Button>
    )
  );

  const closeDialog = () => {
    setOpen(false);
  };

  const content = (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <ProductForm
        productId={productId}
        onCancel={() => closeDialog()}
        onSuccess={() => closeDialog()}
      />
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        <DialogContent className="min-w-[650px]">{content}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerNode}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <ProductForm
          productId={productId}
          onSuccess={() => setOpen(false)}
          className="px-4"
        />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
