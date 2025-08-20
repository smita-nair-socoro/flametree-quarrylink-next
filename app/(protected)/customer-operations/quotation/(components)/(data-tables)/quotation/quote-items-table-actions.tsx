'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuoteItemActions } from '@/hooks/use-quote-item-actions';
import { QuoteItem } from '@/lib/types/quotation';

interface QuotationItemsTableActionsProps {
  quoteItem: QuoteItem;
}

export function QuotationItemsTableActions({
  quoteItem,
}: QuotationItemsTableActionsProps) {
  const { actions, confirmDialogs, viewDialog } =
    useQuoteItemActions(quoteItem);

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={actions.viewProduct}>
            <Eye className="mr-2 h-4 w-4" />
            View Product
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={actions.remove}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
