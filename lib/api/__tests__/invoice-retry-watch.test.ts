import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { InvoiceRetryWatchRow } from '@/lib/utils/invoice-retry-progress';

const listPayments = vi.fn();
const getAll = vi.fn();

vi.mock('@/lib/api/APIClient', () => ({
  APIClient: {
    invoices: {
      listPayments: (...args: unknown[]) => listPayments(...args),
      getAll: (...args: unknown[]) => getAll(...args),
    },
  },
}));

vi.mock('@/lib/utils/time', () => ({
  delay: () => Promise.resolve(),
}));

import { useInvoiceRetryProgressStore } from '@/app/stores/invoice-retry-progress-store';
import {
  planInvoiceRetryRestore,
  restoreInvoiceRetryWatchIfNeeded,
} from '@/lib/api/invoice-retry-watch';

function pageOf(rows: InvoiceRetryWatchRow[]) {
  return { content: rows, totalPages: 1 };
}

const inFlightRows: InvoiceRetryWatchRow[] = [
  {
    id: 1,
    status: 'PENDING',
    accountingSync: 'NOT_SYNCED',
    jobId: 10,
  },
  {
    id: 2,
    status: 'SALES_ORDER_SYNCED',
    accountingSync: 'NOT_SYNCED',
    jobId: 10,
  },
];

const settledRows: InvoiceRetryWatchRow[] = [
  { id: 1, status: 'SYNCED', accountingSync: 'SYNCED', jobId: 10 },
  { id: 2, status: 'FAILED', accountingSync: 'FAILED', jobId: 10 },
];

describe('planInvoiceRetryRestore', () => {
  test('restores currently in-flight invoices when no snapshot exists', () => {
    expect(planInvoiceRetryRestore(inFlightRows, [])).toEqual({
      invoiceIds: [1, 2],
      jobId: 10,
      alreadySettled: null,
    });
  });

  test('keeps the persisted batch so final counts stay complete', () => {
    const plan = planInvoiceRetryRestore(
      [
        { id: 1, status: 'SYNCED', accountingSync: 'SYNCED', jobId: 10 },
        { id: 2, status: 'SALES_ORDER_SYNCED', accountingSync: 'NOT_SYNCED', jobId: 10 },
        { id: 3, status: 'PENDING', accountingSync: 'NOT_SYNCED', jobId: 10 },
      ],
      [1, 2, 3, 4],
    );
    expect(plan.invoiceIds).toEqual([1, 2, 3, 4]);
    expect(plan.alreadySettled).toBeNull();
  });

  test('treats a persisted batch as settled when nothing is in flight', () => {
    const plan = planInvoiceRetryRestore(settledRows, [1, 2]);
    expect(plan.invoiceIds).toEqual([]);
    expect(plan.alreadySettled).toEqual({
      successCount: 1,
      failureCount: 1,
      pendingCount: 0,
      totalAttempted: 2,
    });
  });

  test('does not restore idle failed invoices', () => {
    expect(
      planInvoiceRetryRestore(
        [{ id: 9, status: 'FAILED', accountingSync: 'FAILED', jobId: 10 }],
        [],
      ),
    ).toEqual({ invoiceIds: [], alreadySettled: null });
  });
});

describe('restoreInvoiceRetryWatchIfNeeded', () => {
  beforeEach(() => {
    listPayments.mockReset();
    getAll.mockReset();
    useInvoiceRetryProgressStore.getState().clearWasInProgress();
  });

  test('does nothing when the backend has no in-flight retries', async () => {
    listPayments.mockResolvedValue(pageOf(settledRows));
    await expect(restoreInvoiceRetryWatchIfNeeded()).resolves.toBe(false);
    expect(useInvoiceRetryProgressStore.getState().syncStatus).toBeNull();
  });

  test('restores the bar from PENDING / SALES_ORDER_SYNCED and waits until backend settles', async () => {
    listPayments.mockResolvedValue(pageOf(inFlightRows));
    getAll
      .mockResolvedValueOnce(pageOf(inFlightRows))
      .mockResolvedValueOnce(pageOf(settledRows));

    await expect(restoreInvoiceRetryWatchIfNeeded()).resolves.toBe(true);

    const { syncStatus, watchedInvoiceIds } =
      useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('COMPLETED');
    expect(syncStatus?.successCount).toBe(1);
    expect(syncStatus?.failureCount).toBe(1);
    expect(syncStatus?.totalAttempted).toBe(2);
    expect(watchedInvoiceIds).toEqual([]);
    expect(getAll).toHaveBeenCalled();
  });

  test('uses the persisted batch so final counts include invoices that already settled', async () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2, 3, 4], 10);
    const snapshotRows: InvoiceRetryWatchRow[] = [
      { id: 1, status: 'SYNCED', accountingSync: 'SYNCED', jobId: 10 },
      { id: 2, status: 'SYNCED', accountingSync: 'SYNCED', jobId: 10 },
      { id: 3, status: 'PENDING', accountingSync: 'NOT_SYNCED', jobId: 10 },
      { id: 4, status: 'SALES_ORDER_SYNCED', accountingSync: 'NOT_SYNCED', jobId: 10 },
    ];
    const finishedRows: InvoiceRetryWatchRow[] = [
      { id: 1, status: 'SYNCED', accountingSync: 'SYNCED', jobId: 10 },
      { id: 2, status: 'SYNCED', accountingSync: 'SYNCED', jobId: 10 },
      { id: 3, status: 'SYNCED', accountingSync: 'SYNCED', jobId: 10 },
      { id: 4, status: 'FAILED', accountingSync: 'FAILED', jobId: 10 },
    ];
    listPayments.mockResolvedValue(pageOf(snapshotRows));
    getAll.mockResolvedValue(pageOf(finishedRows));

    await restoreInvoiceRetryWatchIfNeeded();

    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('COMPLETED');
    expect(syncStatus?.successCount).toBe(3);
    expect(syncStatus?.failureCount).toBe(1);
    expect(syncStatus?.totalAttempted).toBe(4);
  });

  test('completes immediately from API when a persisted batch has already finished', async () => {
    useInvoiceRetryProgressStore.getState().startRetry([1, 2], 10);
    listPayments.mockResolvedValue(pageOf(settledRows));

    await restoreInvoiceRetryWatchIfNeeded();

    const { syncStatus } = useInvoiceRetryProgressStore.getState();
    expect(syncStatus?.state).toBe('COMPLETED');
    expect(syncStatus?.successCount).toBe(1);
    expect(syncStatus?.failureCount).toBe(1);
    expect(getAll).not.toHaveBeenCalled();
  });
});
