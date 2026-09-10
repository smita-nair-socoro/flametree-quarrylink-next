import { describe, expect, test } from 'vitest';
import {
  collectUnsyncedInvoiceIds,
  isInvoiceRetryPending,
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
});
