'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useSupplierActions } from '@/hooks/use-supplier-actions';
import { QuarrySupplierProduct } from '@/lib/types/quarry';
import { useSupplierStore } from '@/app/stores/supplier-store';

interface SupplierTableActionProps {
  quarry: QuarrySupplierProduct;
}

export function SupplierTableActions({ quarry }: SupplierTableActionProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useSupplierActions(
    quarry.quarry_supplier_id,
    quarry
  );

  const setSelectedSupplier = useSupplierStore(
    (state) => state.setSelectedSupplier
  );

  const handleView = () => {
    setSelectedSupplier(quarry);
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view();
  };

  const handleRemoveSupplier = () => {
    setSelectedSupplier(quarry);
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.remove();
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
          <DropdownMenuItem onClick={handleRemoveSupplier}>
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
