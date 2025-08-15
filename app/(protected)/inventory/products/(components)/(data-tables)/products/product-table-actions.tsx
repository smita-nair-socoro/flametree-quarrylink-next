'use client';

import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import ProductForm from '@/app/(protected)/inventory/products/(components)/forms/product-form';
import { FormDialog } from '@/components/form-dialog';

interface ProductTableActionsProps {
  productId: number;
}

export function ProductTableActions({ productId }: ProductTableActionsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <FormDialog
        id={productId}
        dialogTitle="View / Edit product"
        open={open}
        onOpenChangeAction={setOpen}
        hideTrigger={true}
      >
        <ProductForm />
      </FormDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpen(true)}>
            View product
          </DropdownMenuItem>

          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
