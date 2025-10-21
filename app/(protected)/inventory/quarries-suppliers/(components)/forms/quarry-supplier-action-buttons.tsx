'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  ScanBarcode,
} from 'lucide-react';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { Quarry } from '@/lib/types/quarry';

interface QuarrySupplierActionButtonsProps {
  quarrySupplier: Quarry | null | undefined;
}

export function QuarrySupplierActionButtons({
  quarrySupplier,
}: QuarrySupplierActionButtonsProps) {
  const { actions, confirmDialogs } = useQuarrySupplierActions(
    quarrySupplier?.id,
    quarrySupplier
  );

  // Early returns for null quarry/supplier or new quarry/supplier
  if (!quarrySupplier) {
    return null;
  }

  // Don't render anything if id is invalid
  if (!quarrySupplier.id || quarrySupplier.id === 0) {
    return null;
  }

  const isActive = quarrySupplier.status === 'ACTIVE';
  const isArchived = quarrySupplier.status === 'ARCHIVED';

  return (
    <div>
      {confirmDialogs}

      <div className="inline-flex items-center rounded-md overflow-hidden">
        {/* Archive button - only show when ACTIVE */}
        {isActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={actions.archive}
            className="h-9 gap-2 rounded-r-none border-r-0"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        )}

        {/* Unarchive button - only show when ARCHIVED */}
        {isArchived && (
          <Button
            variant="outline"
            size="sm"
            onClick={actions.unarchive}
            className="h-9 gap-2 rounded-r-none border-r-0 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
          >
            <ArchiveRestore className="h-4 w-4" />
            Unarchive
          </Button>
        )}

        {/* More options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-l-none"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={actions.linkedProducts}>
              <ScanBarcode className="h-4 w-4 mr-2" />
              Linked Products
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
