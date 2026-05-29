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
import { useQuotationStore } from '@/app/stores/quotation-store';
import { QUOTE_STATUS } from '@/lib/types/quotation-enums';

interface QuotationLineItemTableActionsProps {
  quotationLineItem: QuotationLineItem;
}

export function QuotationLineItemTableActions({
  quotationLineItem,
}: QuotationLineItemTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const isDuplicate = useQuotationStore((state) => state.getIsDuplicate());
  const quoteStatus = useQuotationStore((state) => state.selectedQuotation?.quoteStatus);

  const NON_REMOVABLE_STATUSES = new Set([QUOTE_STATUS.PENDING, QUOTE_STATUS.DECLINED, QUOTE_STATUS.ARCHIVED, QUOTE_STATUS.CONVERTED_TO_JOB]);
  const canRemove = !isDuplicate && !NON_REMOVABLE_STATUSES.has(quoteStatus as QUOTE_STATUS);
  const { actions, confirmDialogs, viewDialog } =
    useQuotationLineItemActions(quotationLineItem);

  const createHandler =
    (actionFn: () => void, additionalSetup?: () => void) => () => {
      additionalSetup?.();
      setDropdownOpen(false);
      actionFn();
    };

  const handleView = createHandler(actions.view);

  const handleDelete = createHandler(actions.remove);

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none hover:bg-gray-50 text-gray-800 hover:text-gray-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Products
          </DropdownMenuItem>
          {canRemove && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Delete className="h-4 w-4 mr-2 text-red-600" />
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
