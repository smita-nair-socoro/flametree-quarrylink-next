'use client';

import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import { useRetryInvoice } from '@/lib/api/payments';
import type { Invoice } from '@/lib/types/job';

export function InvoiceAccountingSyncCell({ invoice }: { invoice: Invoice }) {
  const retryInvoice = useRetryInvoice();
  return (
    <AccountingSyncBadge
      status={invoice.accountingSync ?? invoice.status}
      failureReason={invoice.failureReason}
      onRetry={() => retryInvoice.mutate(invoice.id)}
      retrying={retryInvoice.isPending && retryInvoice.variables === invoice.id}
    />
  );
}
