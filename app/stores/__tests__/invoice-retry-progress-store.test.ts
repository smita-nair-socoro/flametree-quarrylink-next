import { describe, expect, test, beforeEach } from 'vitest';
import { useInvoiceRetryProgressStore } from '@/app/stores/invoice-retry-progress-store';
import type { RetrySyncResponse } from '@/lib/types/job';

describe('invoice retry progress store', () => {
  beforeEach(() => {
    useInvoiceRetryProgressStore.getState().clearWasInProgress();
  });

  test('startRetry shows IN_PROGRESS', () => {
    useInvoiceRetryProgressStore.getState().startRetry();
    const { syncStatus, wasInProgress } = useInvoiceRetryProgressStore.getState();
    expect(wasInProgress).toBe(true);
    expect(syncStatus?.state).toBe('IN_PROGRESS');
    expect(syncStatus?.entityType).toBe('INVOICE');
  });

  test('completeRetry with mixed results shows COMPLETED counts', () => {
    const response: RetrySyncResponse = {
      totalAttempted: 3,
      successCount: 2,
      failureCount: 1,
      result: { invoices: [] },
    };
    useInvoiceRetryProgressStore.getState().completeRetry(response);
    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('COMPLETED');
    expect(syncStatus?.successCount).toBe(2);
    expect(syncStatus?.failureCount).toBe(1);
    expect(syncStatus?.totalAttempted).toBe(3);
  });

  test('completeRetry with all failures shows FAILED', () => {
    const response: RetrySyncResponse = {
      totalAttempted: 2,
      successCount: 0,
      failureCount: 2,
      result: {
        invoices: [{ errorMessage: 'Acumatica timeout' } as never],
      },
    };
    useInvoiceRetryProgressStore.getState().completeRetry(response);
    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('FAILED');
    expect(syncStatus?.errorMessage).toBe('Acumatica timeout');
  });

  test('completeRetry with nothing to retry stays COMPLETED with zeros', () => {
    useInvoiceRetryProgressStore.getState().completeRetry({
      totalAttempted: 0,
      successCount: 0,
      failureCount: 0,
    });
    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('COMPLETED');
    expect(syncStatus?.totalAttempted).toBe(0);
  });
});
