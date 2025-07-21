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
import { AddProductDrawerDialog } from '@/app/(protected)/inventory/products/(components)/add-product-dialog';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';

interface TableActionsProps {
  productId: number;
}

export function TableActions({ productId }: TableActionsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <AddProductDrawerDialog
        productId={productId}
        open={open}
        onOpenChangeAction={setOpen}
        hideTrigger={true}
      />

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
