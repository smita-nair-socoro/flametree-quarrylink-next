'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
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

interface QuarrySupplierTableActionsProps {
  quarrySupplier: Quarry;
}

export function QuarrySupplierTableActions({
  quarrySupplier,
}: QuarrySupplierTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useQuarrySupplierActions(
    quarrySupplier
  );

  const handleView = () => {
    actions.view(quarrySupplier);
    setDropdownOpen(false);
  };

  const handleLinkedProducts = () => {
    setDropdownOpen(false);
    actions.linkedProducts();
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
          {/* Always available: View Details */}
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Linked Products */}
          <DropdownMenuItem onClick={handleLinkedProducts}>
            <ScanBarcode className="h-4 w-4 mr-2" />
            Linked Products
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
