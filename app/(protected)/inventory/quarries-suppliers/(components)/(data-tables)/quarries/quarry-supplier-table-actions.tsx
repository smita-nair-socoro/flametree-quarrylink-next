'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  Archive,
  ArchiveRestore,
  ScanBarcode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuarrySupplierActions } from '@/hooks/use-quarry-supplier-actions';
import { Quarry } from '@/lib/types/quarry';
import { useQuarrySupplierStore } from '@/app/stores/quarry-supplier-store';

interface QuarrySupplierTableActionsProps {
  quarrySupplier: Quarry;
}

export function QuarrySupplierTableActions({
  quarrySupplier,
}: QuarrySupplierTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useQuarrySupplierActions(
    quarrySupplier.id,
    quarrySupplier
  );
  const setSelectedQuarrySupplier = useQuarrySupplierStore(
    (state) => state.setSelectedQuarrySupplier
  );

  const handleView = () => {
    setSelectedQuarrySupplier(quarrySupplier);
    setDropdownOpen(false);
    actions.view();
  };

  const handleLinkedProducts = () => {
    setDropdownOpen(false);
    actions.linkedProducts();
  };

  const handleArchive = () => {
    setDropdownOpen(false);
    actions.archive();
  };

  const handleUnarchive = () => {
    setDropdownOpen(false);
    actions.unarchive();
  };

  const isArchived = quarrySupplier.status === 'ARCHIVED';

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Always available: View Details */}
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          {/* Linked Products */}
          <DropdownMenuItem onClick={handleLinkedProducts}>
            <ScanBarcode className="h-4 w-4 mr-2" />
            Linked Products
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Conditional: Archive or Unarchive based on status */}
          {isArchived ? (
            <DropdownMenuItem
              onClick={handleUnarchive}
              className="text-green-500 focus:text-green-500"
            >
              <ArchiveRestore className="h-4 w-4 mr-2 text-green-500" />
              Unarchive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleArchive}
              className="text-destructive focus:text-destructive"
            >
              <Archive className="h-4 w-4 mr-2 text-destructive" />
              Archive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
