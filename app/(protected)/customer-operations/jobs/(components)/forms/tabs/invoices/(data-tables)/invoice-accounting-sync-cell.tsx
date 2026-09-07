'use client';

import { AccountingSyncBadge } from '@/components/accounting-sync-badge';
import type { Invoice } from '@/lib/types/job';

export function InvoiceAccountingSyncCell({ invoice }: { invoice: Invoice }) {
  const status = invoice.accountingSync ?? invoice.status;

  return (
    <AccountingSyncBadge
      status={status}
      failureReason={invoice.failureReason}
    />
  );
}
