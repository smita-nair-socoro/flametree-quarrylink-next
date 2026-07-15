'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AdditionalContactDTO } from '@/lib/types/customer';
import { useAdditionalContactActions } from '@/hooks/use-additional-contact-actions';

interface AdditionalContactTableActionsProps {
  customerId: number;
  additionalContact: AdditionalContactDTO;
}

export function AdditionalContactTableActions({
  customerId,
  additionalContact,
}: AdditionalContactTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useAdditionalContactActions(
    customerId,
    additionalContact,
  );

  const handleView = () => {
    setDropdownOpen(false);
    actions.view();
  };

  const handleDelete = () => {
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

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
