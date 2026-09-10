'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SyncProgressBar } from '@/components/sync-progress-bar';
import { useInvoiceRetryProgressStore } from '@/app/stores/invoice-retry-progress-store';
import { restoreInvoiceRetryWatchIfNeeded } from '@/lib/api/invoice-retry-watch';
import { InvoicesKeys, PaymentsKeys } from '@/lib/api/keys';

const COMPLETION_DISMISS_MS = 10_000;

/**
 * Top-of-page banner for invoice retry, matching Customer/Product SyncProgressBar.
 * Client state starts the bar; a poll keeps it open until every invoice in the
 * retry batch has settled. On mount, in-flight backend retries restore the bar
 * after a refresh.
 */
export function InvoiceRetryProgressBar() {
  const queryClient = useQueryClient();
  const syncStatus = useInvoiceRetryProgressStore((s) => s.syncStatus);
  const wasInProgress = useInvoiceRetryProgressStore((s) => s.wasInProgress);
  const clearWasInProgress = useInvoiceRetryProgressStore(
    (s) => s.clearWasInProgress,
  );

  React.useEffect(() => {
    void restoreInvoiceRetryWatchIfNeeded().then((restored) => {
      if (!restored) return;
      void queryClient.invalidateQueries({ queryKey: InvoicesKeys.all });
      void queryClient.invalidateQueries({ queryKey: PaymentsKeys.all });
    });
  }, [queryClient]);

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
