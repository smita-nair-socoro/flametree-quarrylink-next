'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Archive, ArchiveRestore, Ban } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ProductDetails } from '@/lib/types/product';
import { useProductActions } from '@/hooks/use-product-actions';
import { PRODUCT_STATUS } from '@/lib/types/product-enums';
import { QuotationDetails } from '@/lib/types/quotation';
import { JobDetails } from '@/lib/types/job';

interface ProductActionButtonsProps {
  product: ProductDetails | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function ProductActionButtons({
  product,
  layout = 'expanded',
}: ProductActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isUnavailable =
    product?.status === PRODUCT_STATUS.UNAVAILABLE ? true : false;
  const { actions, confirmDialogs, viewDialog } = useProductActions(
    product?.id,
    product
  );

  // Early returns for null quotation or new quotation
  if (!product) {
    return null;
  }

  // Don't render anything if productId is invalid
  if (!product.id || product.id === 0) {
    return null;
  }

  const canProductBeArchived = () => {
    // Check if there are active quotes that would prevent archiving
    const hasActiveQuotes = product.quotes?.some(
      (quote: QuotationDetails) =>
        quote.quote_status !== 'ARCHIVED' &&
        quote.quote_status !== 'DRAFT' &&
        quote.quote_status !== 'CONVERTED_TO_JOB'
    );

    // Check if there are jobs with remaining quantities
    const hasActiveJobs = product.jobs?.some((job: JobDetails) =>
      job.job_items.some((jobItem) => jobItem.remaining_quantity > 0)
    );

    // Check if there are pending or delivering dockets
    const hasPendingDockets = product.jobs?.some((job: JobDetails) =>
      job.dockets.some(
        (docket) =>
          docket.docket_status == 'PENDING' ||
          docket.docket_status == 'DELIVERING'
      )
    );

    // Product CAN be archived if none of the blocking conditions are true
    return !hasActiveQuotes && !hasActiveJobs && !hasPendingDockets;
  };

  // Mobile or compact version - everything in dropdown
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {viewDialog}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isUnavailable && (
              <>
                <DropdownMenuItem
                  onClick={actions.unavailable}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="h-4 w-4 mr-2 text-red-600" />
                  Mark as Unavailable
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={
                    canProductBeArchived()
                      ? actions.archive
                      : actions.cannotArchive
                  }
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-destructive" />
                  Archive
                </DropdownMenuItem>
              </>
            )}
            {isUnavailable && (
              <DropdownMenuItem
                onClick={actions.available}
                className="text-blue-600 focus:text-blue-600"
              >
                <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
                Mark as Available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  // Desktop expanded version - toggle group layout
  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        {!isUnavailable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.unavailable}
            className="rounded-none border-r bg-red-100 hover:bg-red-50 text-gray-700 hover:text-gray-900 border-gray-200 "
          >
            <Ban className="h-4 w-4 mr-2 text-red-600" />
            <span className="text-red-600">Mark as Unavailable</span>
          </Button>
        )}
        {isUnavailable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.available}
            className="rounded-none border-r bg-blue-100 hover:bg-blue-50 text-gray-700 hover:text-gray-900 border-gray-200 "
          >
            <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-blue-600">Mark as Available</span>
          </Button>
        )}
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
            {product.status !== PRODUCT_STATUS.ARCHIVED && (
              <DropdownMenuItem
                onClick={
                  canProductBeArchived()
                    ? actions.archive
                    : actions.cannotArchive
                }
              >
                <Archive className="h-4 w-4 mr-2 text-destructive" />
                <span className="text-destructive">Archive</span>
              </DropdownMenuItem>
            )}
            {product.status === PRODUCT_STATUS.ARCHIVED && (
              <DropdownMenuItem onClick={actions.unarchive}>
                <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-blue-600">Unarchive</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
