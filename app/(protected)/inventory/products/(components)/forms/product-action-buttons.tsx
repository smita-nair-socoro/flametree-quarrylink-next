'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArchiveRestore, Ban, Trash2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ProductDetails } from '@/lib/types/product';
import { useProductActions } from '@/hooks/use-product-actions';
import { useAccountingSoftwareProvider } from '@/lib/utils/tenant-config-helper';

interface ProductActionButtonsProps {
  product: ProductDetails | null | undefined;
  layout?: 'compact' | 'expanded';
  /**
   * When provided, these actions will be used instead of creating a new
   * `useProductActions` instance. This lets the header buttons operate on the
   * same dialog state as the parent (so closing actions affect the same dialog).
   */
  actionsOverride?: {
    view: () => void;
    unavailable: () => void;
    available: () => void;
    delete: () => void;
    cannotDelete: () => void;
    removeSupplier: () => void;
  };
  /**
   * When true, this component will not render its own confirm/view dialogs.
   * Useful when the parent already renders them to avoid duplication.
   */
  suppressDialogs?: boolean;
}

export function ProductActionButtons({
  product,
  layout = 'expanded',
  actionsOverride,
  suppressDialogs = false,
}: ProductActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isUnavailable = product?.isActive === false;
  const internal = useProductActions(product);
  const actions = actionsOverride ?? internal.actions;
  const confirmDialogs = suppressDialogs ? null : internal.confirmDialogs;
  const viewDialog = suppressDialogs ? null : internal.viewDialog;
  const accSoftwareProvider = useAccountingSoftwareProvider();
  const readOnly = accSoftwareProvider === 'MYOB';
  // Early returns for null quotation or new quotation
  if (!product) {
    return null;
  }

  // Don't render anything if productId is invalid
  if (!product.id || product.id === 0) {
    return null;
  }

  // Mobile or compact version - everything in dropdown
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {viewDialog}
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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
                  <DropdownMenuSeparator />
                </>
              )}
              {isUnavailable && (
                <>
                  <DropdownMenuItem
                    onClick={actions.available}
                    className="text-green-600 focus:text-green-600"
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2 text-green-600" />
                    Mark as Available
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={actions.delete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }
  // Desktop expanded version - toggle group layout
  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      {!readOnly && (
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
              {!isUnavailable ? (
                <DropdownMenuItem
                  onClick={actions.unavailable}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="h-4 w-4 mr-2 text-red-600" />
                  Mark as Unavailable
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={actions.available}
                  className="text-green-600 focus:text-green-600"
                >
                  <ArchiveRestore className="h-4 w-4 mr-2 text-green-600" />
                  Mark as Available
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={actions.delete}>
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                <span className="text-destructive">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
