'use client';

import * as React from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { CustomerAttachmentDTO } from '@/lib/types/customer';
import { useCustomerAttachmentActions } from '@/hooks/use-customer-attachment-actions';

interface CustomerAttachmentTableActionsProps {
  attachment: CustomerAttachmentDTO;
}

export function CustomerAttachmentTableActions({
  attachment,
}: CustomerAttachmentTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs } = useCustomerAttachmentActions(attachment);

  const handleRemove = () => {
    setDropdownOpen(false);
    actions.remove();
  };

  return (
    <div>
      {confirmDialogs}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleRemove}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
