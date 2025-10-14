'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuotationLineItemActions } from '@/hooks/use-quotations-line-item-actions';
import { QuotationLineItem } from '@/lib/types/quotation';
import { useQuotationLineItemStore } from '@/app/stores/line-item-quotation';

interface QutationLineItemTableActionsProps {
  quotationLineItem: QuotationLineItem;
}

export function QuotationLineItemTableActions({
  quotationLineItem,
}: QutationLineItemTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useQuotationLineItemActions(
    quotationLineItem.id,
    quotationLineItem
  );
  const setSelectedQuotationLineItem = useQuotationLineItemStore(
    (state) => state.setSelectedLineItem
  );

  const createHandler =
    (actionFn: () => void, additionalSetup?: () => void) => () => {
      additionalSetup?.();
      setDropdownOpen(false);
      actionFn();
    };

  const handleView = createHandler(actions.view, () =>
    setSelectedQuotationLineItem(quotationLineItem)
  );

  const handleDelete = createHandler(actions.remove, () =>
    setSelectedQuotationLineItem(quotationLineItem)
  );

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none bg-gray-50 hover:bg-gray-100 text-gray-800 hover:text-gray-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Products
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Delete className="h-4 w-4 mr-2 text-red-600" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
