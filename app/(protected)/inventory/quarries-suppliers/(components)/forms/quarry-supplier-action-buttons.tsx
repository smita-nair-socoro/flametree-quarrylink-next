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
  MoreHorizontal,
  ScanBarcode,
} from 'lucide-react';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { Quarry } from '@/lib/types/quarry';

interface QuarrySupplierActionButtonsProps {
  quarrySupplier: Quarry | null | undefined;
  /**
   * When provided, these actions will be used instead of creating a new
   * `useQuarrySupplierActions` instance. This lets the header buttons operate on
   * the same dialog state as the parent (so closing actions affect the same dialog).
   */
  actionsOverride?: {
    view: () => void;
    linkedProducts: () => void;
    delete: () => void;
    unarchive: () => void;
  };
  /**
   * When true, this component will not render its own confirm dialogs.
   * Useful when the parent already renders them to avoid duplication.
   */
  suppressDialogs?: boolean;
}

export function QuarrySupplierActionButtons({
  quarrySupplier,
  actionsOverride,
  suppressDialogs = false,
}: QuarrySupplierActionButtonsProps) {
  const internal = useQuarrySupplierActions(quarrySupplier);
  const actions = actionsOverride ?? internal.actions;
  const confirmDialogs = suppressDialogs ? null : internal.confirmDialogs;

  // Early returns for null quarry/supplier or new quarry/supplier
  if (!quarrySupplier) {
    return null;
  }

  // Don't render anything if id is invalid
  if (!quarrySupplier.id || quarrySupplier.id === 0) {
    return null;
  }

  return (
    <div>
      {confirmDialogs}

      <div className="inline-flex items-center rounded-md overflow-hidden">
        {/* Linked Products - standalone button, always visible */}
        <Button
          variant="outline"
          size="sm"
          onClick={actions.linkedProducts}
          className="h-9 gap-2 rounded-r-none border-r-0"
        >
          <ScanBarcode className="h-4 w-4" />
          Linked Products
        </Button>

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
            <DropdownMenuItem
              onClick={actions.delete}
              className="text-destructive focus:text-destructive"
            >
              <Archive className="h-4 w-4 mr-2 text-destructive" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
