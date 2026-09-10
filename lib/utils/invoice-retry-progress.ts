import { toAccountingSyncDisplay } from '@/lib/utils/accounting-sync';

export type InvoiceRetryWatchRow = {
  id: number;
  status?: string | null;
  accountingSync?: string | null;
  jobId?: number | null;
};

export type InvoiceRetryBatchProgress = {
  successCount: number;
  failureCount: number;
  pendingCount: number;
  totalAttempted: number;
};

function statusOf(row: InvoiceRetryWatchRow): string {
  return `${row.status ?? ''}`.toUpperCase();
}

/** True when Acumatica invoice finalization has finished. */
export function isInvoiceRetrySuccess(row: InvoiceRetryWatchRow): boolean {
  return (
    statusOf(row) === 'SYNCED' ||
    toAccountingSyncDisplay(row.accountingSync ?? row.status) === 'SYNCED'
  );
}

export function isInvoiceRetryFailure(row: InvoiceRetryWatchRow): boolean {
  if (isInvoiceRetrySuccess(row)) return false;
  return (
    statusOf(row) === 'FAILED' ||
    toAccountingSyncDisplay(row.accountingSync ?? row.status) === 'FAILED'
  );
}

/**
 * Sales-order-synced and pending invoices are still being processed
 * (Flame Tree SO → invoice polling). Treat them as in-progress.
 */
export function isInvoiceRetryPending(row: InvoiceRetryWatchRow): boolean {
  return !isInvoiceRetrySuccess(row) && !isInvoiceRetryFailure(row);
}

export function isInvoiceUnsynced(row: InvoiceRetryWatchRow): boolean {
  return !isInvoiceRetrySuccess(row);
}

export function summarizeInvoiceRetryBatch(
  rows: InvoiceRetryWatchRow[],
  watchedIds: number[],
  options?: { treatFailedAsPending?: boolean },
): InvoiceRetryBatchProgress {
  const watched = new Set(watchedIds);
  const matched = rows.filter((row) => watched.has(row.id));
  const treatFailedAsPending = options?.treatFailedAsPending ?? false;
  let successCount = 0;
  let failureCount = 0;
  let pendingCount = 0;

  for (const row of matched) {
    if (isInvoiceRetrySuccess(row)) {
      successCount += 1;
    } else if (isInvoiceRetryFailure(row) && !treatFailedAsPending) {
      failureCount += 1;
    } else {
      pendingCount += 1;
    }
  }

  const missing = watchedIds.length - matched.length;
  pendingCount += Math.max(0, missing);

  return {
    successCount,
    failureCount,
    pendingCount,
    totalAttempted: watchedIds.length,
  };
}

export function collectUnsyncedInvoiceIds(
  rows: InvoiceRetryWatchRow[],
): number[] {
  return rows.filter(isInvoiceUnsynced).map((row) => row.id);
}

/** Invoices the backend is still processing (PENDING, SALES_ORDER_SYNCED, …). */
export function collectInFlightInvoiceIds(
  rows: InvoiceRetryWatchRow[],
): number[] {
  return rows.filter(isInvoiceRetryPending).map((row) => row.id);
}

function uniqueIds(ids: number[]): number[] {
  return [...new Set(ids)];
}

/**
 * After a refresh, keep the original watched batch when any invoice is still
 * in flight so success/failure totals stay accurate. If the snapshot is gone,
 * fall back to whatever the API currently reports as in flight.
 */
export function resolveRestoredWatchIds(
  inFlightIds: number[],
  persistedWatchedIds: number[] = [],
): number[] {
  const inFlight = uniqueIds(inFlightIds);
  if (inFlight.length === 0) {
    return [];
  }

  const persisted = uniqueIds(persistedWatchedIds);
  if (persisted.length === 0) {
    return inFlight;
  }

  const persistedSet = new Set(persisted);
  const extra = inFlight.filter((id) => !persistedSet.has(id));
  return [...persisted, ...extra];
}

export function inferSharedJobId(
  rows: InvoiceRetryWatchRow[],
  invoiceIds: number[],
): number | undefined {
  const watched = new Set(invoiceIds);
  const jobIds = [
    ...new Set(
      rows
        .filter((row) => watched.has(row.id) && row.jobId != null)
        .map((row) => row.jobId as number),
    ),
  ];
  return jobIds.length === 1 ? jobIds[0] : undefined;
}
