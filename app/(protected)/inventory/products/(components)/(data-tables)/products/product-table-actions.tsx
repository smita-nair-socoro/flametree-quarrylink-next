'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2, Ban, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useProductActions } from '@/hooks/use-product-actions';
import { ProductDetails } from '@/lib/types/product';
import { useProductStore } from '@/app/stores/product-store';
import { useAccountingSoftwareProvider } from '@/lib/utils/tenant-config-helper';

interface ProducTableActionProps {
  product: ProductDetails;
}

export function ProductTableActions({ product }: ProducTableActionProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useProductActions(product);
  const isUnavailable = product.isActive === false;
  const accSoftwareProvider = useAccountingSoftwareProvider();
  const readOnly = accSoftwareProvider === 'MYOB_ACUMATICA';
  const setSelectedProduct = useProductStore(
    (state) => state.setSelectedProduct,
  );

  const handleView = () => {
    setSelectedProduct(product);
    setDropdownOpen(false);
    actions.view();
  };

  const handleUnavailable = () => {
    setSelectedProduct(product);
    setDropdownOpen(false);
    actions.unavailable();
  };

  const handleAvailable = () => {
    setSelectedProduct(product);
    setDropdownOpen(false);
    actions.available();
  };

  const handleDelete = () => {
    setSelectedProduct(product);
    setDropdownOpen(false);
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
          {!readOnly && (
            <>
              <DropdownMenuSeparator />
              {!isUnavailable ? (
                <DropdownMenuItem onClick={handleUnavailable} className="text-destructive focus:text-destructive">
                  <Ban className="h-4 w-4 mr-2 text-red-600" />
                  Mark as Unavailable
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleAvailable} className="text-green-600 focus:text-green-600">
                  <ArchiveRestore className="h-4 w-4 mr-2 text-green-600" />
                  Mark as Available
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
