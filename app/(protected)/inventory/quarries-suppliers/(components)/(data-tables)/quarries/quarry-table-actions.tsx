'use client';
import * as React from 'react';
import { MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
// import { useProductActions } from '@/hooks/use-product-actions';
import { Quarry } from '@/lib/types/quarry';
// import { useProductStore } from '@/app/stores/product-store';

interface QuarryTableActionProps {
  quarry: Quarry;
}

export function QuarryTableActions({ quarry }: QuarryTableActionProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  // const { actions, confirmDialogs, viewDialog } = useProductActions(
  //   quarry.id,
  //   product
  // );

  // const setSelectedQuarry = useQuarryStore(
  //   (state) => state.setSelectedQuarry
  // );

  const handleView = () => {
    // setSelectedQuarry(quarry);
    setDropdownOpen(false); // Close dropdown before opening modal
    // actions.view();
  };

  return (
    <div>
      {/* {confirmDialogs}
      {viewDialog} */}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
