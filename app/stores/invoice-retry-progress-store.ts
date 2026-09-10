import { create } from 'zustand';
import type { RetrySyncResponse } from '@/lib/types/job';
import type { SyncStatusResponse } from '@/lib/types/sync';
import type { InvoiceRetryBatchProgress } from '@/lib/utils/invoice-retry-progress';

type InvoiceRetryProgressStore = {
  syncStatus: SyncStatusResponse | null;
  wasInProgress: boolean;
  watchedInvoiceIds: number[];
  startRetry: (invoiceIds?: number[]) => void;
  applyBatchProgress: (progress: InvoiceRetryBatchProgress) => void;
  completeRetry: (response: RetrySyncResponse) => void;
  completeFromBatch: (progress: InvoiceRetryBatchProgress) => void;
  failRetry: (errorMessage?: string) => void;
  clearWasInProgress: () => void;
};

const idleStatus = (): SyncStatusResponse => ({
  state: 'IDLE',
  entityType: 'INVOICE',
  totalAttempted: 0,
  successCount: 0,
  failureCount: 0,
  errorMessage: null,
});

function completionState(
  successCount: number,
  failureCount: number,
): SyncStatusResponse['state'] {
  return failureCount > 0 && successCount === 0 ? 'FAILED' : 'COMPLETED';
}

export const useInvoiceRetryProgressStore = create<InvoiceRetryProgressStore>(
  (set, get) => ({
    syncStatus: null,
    wasInProgress: false,
    watchedInvoiceIds: [],
    startRetry: (invoiceIds = []) =>
      set({
        wasInProgress: true,
        watchedInvoiceIds: invoiceIds,
        syncStatus: {
          ...idleStatus(),
          state: 'IN_PROGRESS',
          totalAttempted: invoiceIds.length,
        },
      }),
    applyBatchProgress: (progress) => {
      if (progress.pendingCount === 0 && progress.totalAttempted > 0) {
        get().completeFromBatch(progress);
        return;
      }
      set({
        wasInProgress: true,
        syncStatus: {
          state: 'IN_PROGRESS',
          entityType: 'INVOICE',
          totalAttempted: progress.totalAttempted,
          successCount: progress.successCount,
          failureCount: progress.failureCount,
          errorMessage: null,
        },
      });
    },
    completeRetry: (response) => {
      const watchedCount = get().watchedInvoiceIds.length;
      const totalAttempted = response?.totalAttempted ?? 0;
      const successCount = response?.successCount ?? 0;
      const failureCount = response?.failureCount ?? 0;

      // The retry HTTP call can return after the first sales order. Keep the
      // bar open until watch/poll reports every watched invoice has settled.
      if (watchedCount > 0) {
        set({
          wasInProgress: true,
          syncStatus: {
            state: 'IN_PROGRESS',
            entityType: 'INVOICE',
            totalAttempted: Math.max(watchedCount, totalAttempted),
            successCount,
            failureCount,
            errorMessage: null,
          },
        });
        return;
      }

      const firstError = response?.result?.invoices?.find(
        (invoice) => invoice?.errorMessage,
      )?.errorMessage;

      set({
        wasInProgress: true,
        watchedInvoiceIds: [],
        syncStatus: {
          state: completionState(successCount, failureCount),
          entityType: 'INVOICE',
          totalAttempted,
          successCount,
          failureCount,
          errorMessage:
            failureCount > 0 && successCount === 0
              ? firstError ?? 'Invoice sync retry failed'
              : null,
        },
      });
    },
    completeFromBatch: (progress) => {
      const successCount = progress.successCount;
      const failureCount = progress.failureCount;
      set({
        wasInProgress: true,
        watchedInvoiceIds: [],
        syncStatus: {
          state: completionState(successCount, failureCount),
          entityType: 'INVOICE',
          totalAttempted: progress.totalAttempted,
          successCount,
          failureCount,
          errorMessage:
            failureCount > 0 && successCount === 0
              ? 'Invoice sync retry failed'
              : null,
        },
      });
    },
    failRetry: (errorMessage) => {
      if (get().watchedInvoiceIds.length > 0) {
        return;
      }
      set({
        wasInProgress: true,
        watchedInvoiceIds: [],
        syncStatus: {
          ...idleStatus(),
          state: 'FAILED',
          errorMessage: errorMessage ?? 'Failed to retry invoice sync',
        },
      });
    },
    clearWasInProgress: () =>
      set({
        wasInProgress: false,
        watchedInvoiceIds: [],
        syncStatus: null,
      }),
  }),
);
