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
import AddNewProductForm from './add-new-product-form';

export function AddNewProductDrawerDialog() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const btnTitle = 'Add New Product';
  const dlgDescription =
    "Create or make changes to your product here. Click save when you're done.";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-1 h-4 w-4" /> {btnTitle}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{btnTitle}</DialogTitle>
            <DialogDescription>{dlgDescription}</DialogDescription>
          </DialogHeader>
          <AddNewProductForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-1 h-4 w-4" /> {btnTitle}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{btnTitle}</DrawerTitle>
          <DrawerDescription>{dlgDescription}</DrawerDescription>
        </DrawerHeader>

        <AddNewProductForm className="px-4" />

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
