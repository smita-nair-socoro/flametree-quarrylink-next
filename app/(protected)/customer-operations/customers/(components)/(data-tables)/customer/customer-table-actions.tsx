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
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { CustomerDTO } from '@/lib/types/customer';
import { useCustomerStore } from '@/app/stores/customer-store';

interface CustomerTableActionsProps {
  customer: CustomerDTO;
}

export function CustomerTableActions({ customer }: CustomerTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useCustomerActions(
    customer.id,
    customer
  );

  const isArchived = customer.customerStatus === 'ARCHIVED';

  const setSelectedCustomer = useCustomerStore(
    (state) => state.setSelectedCustomer
  );

  const handleView = () => {
    setSelectedCustomer(customer);
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
          <DropdownMenuSeparator />
          {!isArchived ? (
            <DropdownMenuItem
              onClick={handleArchive}
              className="text-destructive focus:text-destructive"
            >
              <Archive className="h-4 w-4 mr-2 text-red-600" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleUnarchive}
              className="text-blue-600 focus:text-blue-600"
            >
              <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
              Unarchive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
