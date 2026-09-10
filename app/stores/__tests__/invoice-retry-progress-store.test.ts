import { describe, expect, test, beforeEach } from 'vitest';
import {
  INVOICE_RETRY_PROGRESS_STORAGE_KEY,
  useInvoiceRetryProgressStore,
} from '@/app/stores/invoice-retry-progress-store';
import { getSessionStorage, setSessionStorage } from '@/lib/utils';
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

  test('startRetry records the watched batch size', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2, 3, 4, 5], 88);
    const { syncStatus, watchedInvoiceIds, jobId } =
      useInvoiceRetryProgressStore.getState();
    expect(watchedInvoiceIds).toHaveLength(5);
    expect(jobId).toBe(88);
    expect(syncStatus?.totalAttempted).toBe(5);
    expect(syncStatus?.state).toBe('IN_PROGRESS');
  });

  test('startRetry persists the in-flight snapshot for the same tab', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2, 3], 44);
    expect(
      getSessionStorage(INVOICE_RETRY_PROGRESS_STORAGE_KEY, null),
    ).toMatchObject({
      watchedInvoiceIds: [1, 2, 3],
      jobId: 44,
      wasInProgress: true,
    });
  });

  test('hydrateFromSession restores the bar after a refresh', () => {
    useInvoiceRetryProgressStore.getState().clearWasInProgress();
    setSessionStorage(INVOICE_RETRY_PROGRESS_STORAGE_KEY, {
      watchedInvoiceIds: [9, 8, 7],
      jobId: 12,
      wasInProgress: true,
      syncStatus: {
        state: 'IN_PROGRESS',
        entityType: 'INVOICE',
        totalAttempted: 3,
        successCount: 1,
        failureCount: 0,
        errorMessage: null,
      },
    });
    useInvoiceRetryProgressStore.getState().hydrateFromSession();
    const { syncStatus, watchedInvoiceIds, jobId, wasInProgress } =
      useInvoiceRetryProgressStore.getState();
    expect(wasInProgress).toBe(true);
    expect(watchedInvoiceIds).toEqual([9, 8, 7]);
    expect(jobId).toBe(12);
    expect(syncStatus?.state).toBe('IN_PROGRESS');
    expect(syncStatus?.successCount).toBe(1);
    expect(syncStatus?.totalAttempted).toBe(3);
  });

  test('clearWasInProgress drops the persisted snapshot', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1], 1);
    useInvoiceRetryProgressStore.getState().clearWasInProgress();
    expect(window.sessionStorage.getItem(INVOICE_RETRY_PROGRESS_STORAGE_KEY)).toBeNull();
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

  test('completeRetry ignores HTTP completion while a batch is still watched', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    useInvoiceRetryProgressStore.getState().completeRetry({
      totalAttempted: 1,
      successCount: 1,
      failureCount: 0,
    });
    const { syncStatus, watchedInvoiceIds } =
      useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('IN_PROGRESS');
    expect(syncStatus?.totalAttempted).toBe(10);
    expect(syncStatus?.successCount).toBe(1);
    expect(watchedInvoiceIds).toHaveLength(10);
  });

  test('completeRetry also stays IN_PROGRESS when HTTP reports the full batch early', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2]);
    useInvoiceRetryProgressStore.getState().completeRetry({
      totalAttempted: 2,
      successCount: 2,
      failureCount: 0,
    });
    expect(useInvoiceRetryProgressStore.getState().syncStatus?.state).toBe(
      'IN_PROGRESS',
    );
  });

  test('completeFromBatch shows the actual settled counts', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    useInvoiceRetryProgressStore.getState().completeFromBatch({
      successCount: 8,
      failureCount: 2,
      pendingCount: 0,
      totalAttempted: 10,
    });
    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('COMPLETED');
    expect(syncStatus?.successCount).toBe(8);
    expect(syncStatus?.failureCount).toBe(2);
    expect(syncStatus?.totalAttempted).toBe(10);
  });

  test('applyBatchProgress stays IN_PROGRESS while invoices are still pending', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2, 3]);
    useInvoiceRetryProgressStore.getState().applyBatchProgress({
      successCount: 1,
      failureCount: 0,
      pendingCount: 2,
      totalAttempted: 3,
    });
    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('IN_PROGRESS');
    expect(syncStatus?.successCount).toBe(1);
    expect(syncStatus?.totalAttempted).toBe(3);
  });

  test('failRetry does not close the bar while a multi-invoice batch is watched', () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2, 3]);
    useInvoiceRetryProgressStore.getState().failRetry('Gateway timeout');
    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('IN_PROGRESS');
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
