'use client';

import * as React from 'react';
import { MoreHorizontal, Eye, Send, Printer, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from '@/app/(protected)/inventory/products/(components)/forms/product-form';

interface QuotationTableActionsProps {
  id: number;
}

export function QuotationTableActions({ id }: QuotationTableActionsProps) {
  const [open, setOpen] = React.useState(false);

  const viewDetails = () => {
    // Open view/edit dialog
    setOpen(true);
  };

  const sendToCustomer = () => {
    // TODO: implement send to customer logic
    console.log('Send to customer', id);
  };

  const printQuote = () => {
    // TODO: implement print logic
    console.log('Print quote', id);
  };

  const duplicateQuote = () => {
    // TODO: implement duplicate logic
    console.log('Duplicate quote', id);
  };

  const deleteQuote = () => {
    // TODO: implement delete logic
    console.log('Delete quote', id);
  };

  return (
    <div>
      <FormDialog
        id={id}
        dialogTitle="View / Edit product"
        open={open}
        onOpenChangeAction={setOpen}
        hideTrigger
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
          <DropdownMenuItem onClick={viewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={sendToCustomer}>
            <Send className="mr-2 h-4 w-4" />
            Send to Customer
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={printQuote}>
            <Printer className="mr-2 h-4 w-4" />
            Print Quote
          </DropdownMenuItem>
          <DropdownMenuItem onClick={duplicateQuote}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Quote
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={deleteQuote} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
