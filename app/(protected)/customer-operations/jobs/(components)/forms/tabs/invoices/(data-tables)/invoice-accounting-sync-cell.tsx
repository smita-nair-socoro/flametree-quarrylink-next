'use client';

import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import { useRetryInvoice } from '@/lib/api/payments';
import type { Invoice } from '@/lib/types/job';
import { toAccountingSyncDisplay } from '@/lib/utils/accounting-sync';

export function InvoiceAccountingSyncCell({ invoice }: { invoice: Invoice }) {
  const retryInvoice = useRetryInvoice();
  const status = invoice.accountingSync ?? invoice.status;
  const isFailed = toAccountingSyncDisplay(status) === 'FAILED';

  return (
    <AccountingSyncBadge
      status={status}
      failureReason={invoice.failureReason}
      onRetry={
        isFailed ? () => retryInvoice.mutate(invoice.id) : undefined
      }
      retrying={retryInvoice.isPending && retryInvoice.variables === invoice.id}
    />
  );
}
