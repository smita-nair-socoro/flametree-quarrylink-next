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
import { Separator } from '@/components/ui/separator';
import { useProductActions } from '@/hooks/use-product-actions';
import { ProductDetails } from '@/lib/types/product';
import { useProductStore } from '@/app/stores/product-store';

interface ProducTableActionProps {
  product: ProductDetails;
}

export function ProductTableActions({ product }: ProducTableActionProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useProductActions(product);

  const setSelectedProduct = useProductStore(
    (state) => state.setSelectedProduct,
  );

  const handleView = () => {
    setSelectedProduct(product);
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view();
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
          <Separator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
