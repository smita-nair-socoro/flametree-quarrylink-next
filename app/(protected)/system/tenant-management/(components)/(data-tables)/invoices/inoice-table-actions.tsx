'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Invoice } from '@/lib/types/user';
import { useInvoiceStore } from '@/app/stores/invoice-store';
import { useInvoiceActions } from '@/hooks/use-invoice-actions';

interface InvoiceTableActionsProps {
  invoice: Invoice;
}

export function InvoiceTableActions({ invoice }: InvoiceTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions } = useInvoiceActions(invoice.id);
  const setSelectedInvoice = useInvoiceStore(
    (state) => state.setSelectedInvoice
  );

  const handleView = () => {
    setSelectedInvoice(invoice);
    actions.view();
  };

  const handleDownload = () => {
    setSelectedInvoice(invoice);
    actions.download();
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
