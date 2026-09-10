import { describe, expect, test } from 'vitest';
import {
  collectInFlightInvoiceIds,
  collectUnsyncedInvoiceIds,
  inferSharedJobId,
  isInvoiceRetryPending,
  resolveRestoredWatchIds,
  summarizeInvoiceRetryBatch,
} from '@/lib/utils/invoice-retry-progress';

describe('invoice retry progress helpers', () => {
  test('SALES_ORDER_SYNCED stays pending until the invoice is finalized', () => {
    expect(
      isInvoiceRetryPending({
        id: 1,
        status: 'SALES_ORDER_SYNCED',
        accountingSync: 'NOT_SYNCED',
      }),
    ).toBe(true);
  });

  test('summarize waits for every watched invoice, not the first success', () => {
    const progress = summarizeInvoiceRetryBatch(
      [
        { id: 1, status: 'SYNCED', accountingSync: 'SYNCED' },
        { id: 2, status: 'SALES_ORDER_SYNCED', accountingSync: 'NOT_SYNCED' },
        { id: 3, status: 'FAILED', accountingSync: 'FAILED' },
        { id: 4, status: 'PENDING', accountingSync: 'NOT_SYNCED' },
      ],
      [1, 2, 3, 4],
    );

    expect(progress).toEqual({
      successCount: 1,
      failureCount: 1,
      pendingCount: 2,
      totalAttempted: 4,
    });
  });

  test('failed invoices stay pending until the retry HTTP call has settled', () => {
    const progress = summarizeInvoiceRetryBatch(
      [
        { id: 1, status: 'FAILED', accountingSync: 'FAILED' },
        { id: 2, status: 'FAILED', accountingSync: 'FAILED' },
      ],
      [1, 2],
      { treatFailedAsPending: true },
    );
    expect(progress.pendingCount).toBe(2);
    expect(progress.failureCount).toBe(0);
  });

  test('missing watched rows stay pending so the bar cannot close early', () => {
    const progress = summarizeInvoiceRetryBatch(
      [{ id: 1, status: 'SYNCED', accountingSync: 'SYNCED' }],
      [1, 2, 3],
    );

    expect(progress.successCount).toBe(1);
    expect(progress.pendingCount).toBe(2);
    expect(progress.totalAttempted).toBe(3);
  });

  test('collectUnsyncedInvoiceIds excludes fully synced invoices', () => {
    expect(
      collectUnsyncedInvoiceIds([
        { id: 1, status: 'SYNCED', accountingSync: 'SYNCED' },
        { id: 2, status: 'FAILED', accountingSync: 'FAILED' },
        { id: 3, status: 'SALES_ORDER_SYNCED', accountingSync: 'NOT_SYNCED' },
      ]),
    ).toEqual([2, 3]);
  });

  test('collectInFlightInvoiceIds keeps PENDING and SALES_ORDER_SYNCED only', () => {
    expect(
      collectInFlightInvoiceIds([
        { id: 1, status: 'SYNCED', accountingSync: 'SYNCED' },
        { id: 2, status: 'FAILED', accountingSync: 'FAILED' },
        { id: 3, status: 'SALES_ORDER_SYNCED', accountingSync: 'NOT_SYNCED' },
        { id: 4, status: 'PENDING', accountingSync: 'NOT_SYNCED' },
      ]),
    ).toEqual([3, 4]);
  });

  test('resolveRestoredWatchIds uses API in-flight when the snapshot is gone', () => {
    expect(resolveRestoredWatchIds([3, 4], [])).toEqual([3, 4]);
  });

  test('resolveRestoredWatchIds keeps the original batch while any invoice is in flight', () => {
    expect(resolveRestoredWatchIds([3, 4], [1, 2, 3, 4, 5])).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  test('resolveRestoredWatchIds is empty when the backend has settled', () => {
    expect(resolveRestoredWatchIds([], [1, 2, 3])).toEqual([]);
  });

  test('inferSharedJobId returns the job when every watched row shares it', () => {
    expect(
      inferSharedJobId(
        [
          { id: 1, jobId: 10 },
          { id: 2, jobId: 10 },
          { id: 3, jobId: 99 },
        ],
        [1, 2],
      ),
    ).toBe(10);
    expect(
      inferSharedJobId(
        [
          { id: 1, jobId: 10 },
          { id: 2, jobId: 11 },
        ],
        [1, 2],
      ),
    ).toBeUndefined();
  });
});
