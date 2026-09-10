'use client';

import * as React from 'react';
import { Eye, MoreHorizontal, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useInvoiceActions } from '@/hooks/use-invoice-actions';
import { useRetryInvoice } from '@/lib/api/payments';
import { toAccountingSyncDisplay } from '@/lib/utils/accounting-sync';

interface InvoiceTableActionsProps {
  invoiceId: number;
  jobId?: number;
  accountingSync?: string | null;
}

export function InvoiceTableActions({
  invoiceId,
  jobId,
  accountingSync,
}: InvoiceTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions } = useInvoiceActions(invoiceId);
  const retryInvoice = useRetryInvoice();
  const isFailed = toAccountingSyncDisplay(accountingSync) === 'FAILED';

  const handleView = () => {
    console.log('[InvoiceDetails] View Invoice clicked', { invoiceId });
    setDropdownOpen(false);
    actions.viewDetails();
  };

  const handleRetry = () => {
    setDropdownOpen(false);
    retryInvoice.mutate({ invoiceId, jobId });
  };

  return (
    <div>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Invoice actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Invoice
          </DropdownMenuItem>
          {isFailed ? (
            <DropdownMenuItem
              disabled={retryInvoice.isPending}
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Sync
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
