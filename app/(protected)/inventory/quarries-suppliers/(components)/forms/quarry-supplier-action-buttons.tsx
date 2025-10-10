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
import { MoreHorizontal, Archive, ArchiveRestore, Edit } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { Quarry } from '@/lib/types/quarry';

interface QuarrySupplierActionButtonsProps {
  quarrySupplier: Quarry | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function QuarrySupplierActionButtons({
  quarrySupplier,
  layout = 'expanded',
}: QuarrySupplierActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isArchived = quarrySupplier?.status === 'ARCHIVED' ? true : false;

  const { actions, confirmDialogs, viewDialog } = useQuarrySupplierActions(
    quarrySupplier?.id,
    quarrySupplier
  );

  // Early returns for null quarrySupplier or new quarrySupplier
  if (!quarrySupplier) {
    return null;
  }

  // Don't render anything if quarrySupplierId is invalid
  if (!quarrySupplier.id || quarrySupplier.id === 0) {
    return null;
  }

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
            {!isArchived && (
              <>
                <DropdownMenuItem onClick={actions.viewProducts}>
                  <Edit className="h-4 w-4 mr-2" />
                  View Products
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-red-600" />
                  Archive
                </DropdownMenuItem>
              </>
            )}
            {isArchived && (
              <DropdownMenuItem
                onClick={actions.unarchive}
                className="text-blue-600 focus:text-blue-600"
              >
                <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
                Unarchive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Desktop expanded version - button layout
  return (
    <div>
      {confirmDialogs}
      {viewDialog}

      <div className="inline-flex items-center gap-2">
        {/* Edit button - always visible */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Focus on first input field or enable edit mode
            console.log('Edit clicked');
          }}
          className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>

        {/* Archive/Unarchive button */}
        {!isArchived ? (
          <Button
            variant="outline"
            size="sm"
            onClick={actions.archive}
            className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={actions.unarchive}
            className="bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700"
          >
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Unarchive
          </Button>
        )}

        {/* More options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isArchived && (
              <DropdownMenuItem onClick={actions.viewProducts}>
                <Edit className="h-4 w-4 mr-2" />
                View Products
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
