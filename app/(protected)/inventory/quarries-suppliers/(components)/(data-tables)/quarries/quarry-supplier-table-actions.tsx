'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Archive, ArchiveRestore } from 'lucide-react';
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
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view();
  };

  const handleArchive = () => {
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.archive();
  };

  const handleUnarchive = () => {
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.unarchive();
  };

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
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          {quarrySupplier.status !== 'ARCHIVED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleArchive}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="h-4 w-4 mr-2 text-red-600" />
                Archive
              </DropdownMenuItem>
            </>
          )}

          {quarrySupplier.status === 'ARCHIVED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleUnarchive}
                className="text-blue-600 focus:text-blue-600"
              >
                <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
                Unarchive
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
