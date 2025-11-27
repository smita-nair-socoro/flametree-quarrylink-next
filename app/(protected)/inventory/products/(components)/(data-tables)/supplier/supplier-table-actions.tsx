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
import { Separator } from '@/components/ui/separator';

interface SupplierTableActionProps {
  quarry: QuarrySupplierProduct;
  productId?: number;
}

export function SupplierTableActions({
  quarry,
  productId,
}: SupplierTableActionProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Add productId to quarry data for the actions
  const quarryWithProductId = React.useMemo(
    () => ({
      ...quarry,
      product_id: productId || quarry.product_id,
    }),
    [quarry, productId]
  );

  // Support both direct id and nested quarry_supplier.id
  const quarrySupplierId =
    (quarry as any)?.quarry_supplier_id ?? (quarry as any)?.quarry_supplier?.id;

  const { actions, confirmDialogs, viewDialog } = useSupplierActions(
    quarrySupplierId,
    quarryWithProductId
  );

  const setSelectedSupplier = useSupplierStore(
    (state) => state.setSelectedSupplier
  );

  const handleView = () => {
    setSelectedSupplier(quarryWithProductId);
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view();
  };

  const handleDeleteSupplier = () => {
    setSelectedSupplier(quarryWithProductId);
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.delete();
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
          <Separator />
          <DropdownMenuItem onClick={handleDeleteSupplier}>
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            <span className="text-destructive">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
