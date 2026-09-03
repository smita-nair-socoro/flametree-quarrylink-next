'use client';

import * as React from 'react';
import { SyncProgressBar } from '@/components/sync-progress-bar';
import { useInvoiceRetryProgressStore } from '@/app/stores/invoice-retry-progress-store';

const COMPLETION_DISMISS_MS = 10_000;

/**
 * Top-of-page banner for invoice retry, matching Customer/Product SyncProgressBar.
 * Driven by client state because invoice retry is a synchronous aggregate API
 * (HTTP 200 + successCount/failureCount), not an async polled sync job.
 */
export function InvoiceRetryProgressBar() {
  const syncStatus = useInvoiceRetryProgressStore((s) => s.syncStatus);
  const wasInProgress = useInvoiceRetryProgressStore((s) => s.wasInProgress);
  const clearWasInProgress = useInvoiceRetryProgressStore(
    (s) => s.clearWasInProgress,
  );

  React.useEffect(() => {
    if (
      !wasInProgress ||
      (syncStatus?.state !== 'COMPLETED' && syncStatus?.state !== 'FAILED')
    ) {
      return;
    }
    const timer = setTimeout(() => {
      clearWasInProgress();
    }, COMPLETION_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [wasInProgress, syncStatus?.state, clearWasInProgress]);

  return (
    <SyncProgressBar
      syncStatus={syncStatus ?? undefined}
      entityType="Invoice"
      wasInProgress={wasInProgress}
    />
  );
}
