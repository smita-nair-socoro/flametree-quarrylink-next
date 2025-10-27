'use client';
import * as React from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { QuotationLineItem } from '@/lib/types/quotation';
import { useQuotationLineItemActions } from '@/hooks/use-quotations-line-item-actions';
import { Delete, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface QuotationLineItemActionButtonsProps {
  quotationLineItem: QuotationLineItem | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function QuotationLineItemActionButtons({
  quotationLineItem,
  layout = 'expanded',
}: QuotationLineItemActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { actions, confirmDialogs, viewDialog } = useQuotationLineItemActions(
    quotationLineItem?.id,
    quotationLineItem
  );

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
        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.duplicate}
            className="rounded-none border-r border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
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
      </div>
    );
  }

  // Desktop expanded version - toggle group layout
  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.duplicate}
          className="rounded-none border-r border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
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
    </div>
  );
}
