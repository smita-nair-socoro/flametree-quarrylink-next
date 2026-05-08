'use client';
import * as React from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { QuotationLineItem } from '@/lib/types/quotation';
import { useQuotationLineItemActions } from '@/hooks/use-quotations-line-item-actions';
import { Delete } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useQuotationStore } from '@/app/stores/quotation-store';
import { QUOTE_STATUS } from '@/lib/types/quotation-enums';

interface QuotationLineItemActionButtonsProps {
  quotationLineItem: QuotationLineItem | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function QuotationLineItemActionButtons({
  quotationLineItem,
  layout = 'expanded',
}: QuotationLineItemActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isDuplicate = useQuotationStore((state) => state.getIsDuplicate());
  const quoteStatus = useQuotationStore((state) => state.selectedQuotation?.quoteStatus);

  const NON_REMOVABLE_STATUSES = new Set([QUOTE_STATUS.PENDING, QUOTE_STATUS.DECLINED, QUOTE_STATUS.ARCHIVED, QUOTE_STATUS.CONVERTED_TO_JOB]);
  const canRemove = !isDuplicate && !NON_REMOVABLE_STATUSES.has(quoteStatus as QUOTE_STATUS);
  const { actions, confirmDialogs, viewDialog } =
    useQuotationLineItemActions(quotationLineItem);

  // Early returns for null quotation or new quotation
  if (!quotationLineItem) {
    return null;
  }

  // Don't render anything if quotationId is invalid
  if (!quotationLineItem.id || quotationLineItem.id === 0) {
    return null;
  }

  // Mobile or compact version - everything in dropdown
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {viewDialog}
        {canRemove && (
          <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={actions.remove}
                  className="text-destructive focus:text-destructive"
                >
                  <Delete className="h-4 w-4 mr-2 text-red-600" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    );
  }

  // Desktop expanded version - toggle group layout
  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      {canRemove && (
        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={actions.remove}
                className="text-destructive focus:text-destructive"
              >
                <Delete className="h-4 w-4 mr-2 text-red-600" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
