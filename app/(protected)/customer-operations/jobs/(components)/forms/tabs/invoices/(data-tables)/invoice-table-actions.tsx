'use client';

import * as React from 'react';
import { Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useInvoiceActions } from '@/hooks/use-invoice-actions';

interface InvoiceTableActionsProps {
  invoiceId: number;
}

export function InvoiceTableActions({ invoiceId }: InvoiceTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions } = useInvoiceActions(invoiceId);

  const handleView = () => {
    actions.viewDetails();
  };

  return (
    <div>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
