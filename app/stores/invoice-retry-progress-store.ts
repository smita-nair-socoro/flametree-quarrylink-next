import { create } from 'zustand';
import type { RetrySyncResponse } from '@/lib/types/job';
import type { SyncStatusResponse } from '@/lib/types/sync';

type InvoiceRetryProgressStore = {
  syncStatus: SyncStatusResponse | null;
  wasInProgress: boolean;
  startRetry: () => void;
  completeRetry: (response: RetrySyncResponse) => void;
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

export const useInvoiceRetryProgressStore = create<InvoiceRetryProgressStore>(
  (set) => ({
    syncStatus: null,
    wasInProgress: false,
    startRetry: () =>
      set({
        wasInProgress: true,
        syncStatus: {
          ...idleStatus(),
          state: 'IN_PROGRESS',
        },
      }),
    completeRetry: (response) => {
      const totalAttempted = response?.totalAttempted ?? 0;
      const successCount = response?.successCount ?? 0;
      const failureCount = response?.failureCount ?? 0;
      const firstError = response?.result?.invoices?.find(
        (invoice) => invoice?.errorMessage,
      )?.errorMessage;

      set({
        wasInProgress: true,
        syncStatus: {
          state: failureCount > 0 && successCount === 0 ? 'FAILED' : 'COMPLETED',
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
    failRetry: (errorMessage) =>
      set({
        wasInProgress: true,
        syncStatus: {
          ...idleStatus(),
          state: 'FAILED',
          errorMessage: errorMessage ?? 'Failed to retry invoice sync',
        },
      }),
    clearWasInProgress: () =>
      set({
        wasInProgress: false,
        syncStatus: null,
      }),
  }),
);
