import { APIClient } from '@/lib/api/APIClient';
import { useInvoiceRetryProgressStore } from '@/app/stores/invoice-retry-progress-store';
import {
  collectInFlightInvoiceIds,
  collectUnsyncedInvoiceIds,
  inferSharedJobId,
  resolveRestoredWatchIds,
  summarizeInvoiceRetryBatch,
  type InvoiceRetryBatchProgress,
  type InvoiceRetryWatchRow,
} from '@/lib/utils/invoice-retry-progress';
import { delay } from '@/lib/utils/time';
import type { Invoice } from '@/lib/types/job';
import type { PaymentsInvoice } from '@/lib/types/payments';

const POLL_INTERVAL_MS = 2_000;
const PER_INVOICE_TIMEOUT_MS = 45_000;
const MIN_TIMEOUT_MS = 60_000;
const MAX_TIMEOUT_MS = 15 * 60_000;

let watchGeneration = 0;
let activeWatchCount = 0;
let restorePromise: Promise<boolean> | null = null;

export function isInvoiceRetryWatchActive(): boolean {
  return activeWatchCount > 0;
}

function toWatchRow(
  row:
    | Pick<Invoice, 'id' | 'status' | 'accountingSync'>
    | PaymentsInvoice,
): InvoiceRetryWatchRow {
  return {
    id: row.id,
    status: row.status,
    accountingSync: row.accountingSync,
    jobId: 'jobId' in row ? row.jobId : undefined,
  };
}

export async function fetchAllJobInvoiceRows(
  jobId: number,
): Promise<InvoiceRetryWatchRow[]> {
  const pageSize = 100;
  let page = 1;
  const rows: InvoiceRetryWatchRow[] = [];

  for (;;) {
    const result = await APIClient.invoices.getAll(jobId, { page, pageSize });
    const content = result.content ?? [];
    rows.push(...content.map(toWatchRow));
    const totalPages = result.totalPages ?? 1;
    if (page >= totalPages || content.length === 0) {
      break;
    }
    page += 1;
  }

  return rows;
}

export async function fetchAllPaymentsInvoiceRows(): Promise<
  InvoiceRetryWatchRow[]
> {
  const pageSize = 100;
  let page = 1;
  const rows: InvoiceRetryWatchRow[] = [];

  for (;;) {
    const result = await APIClient.invoices.listPayments({ page, pageSize });
    const content = result.content ?? [];
    rows.push(...content.map(toWatchRow));
    const totalPages = result.totalPages ?? 1;
    if (page >= totalPages || content.length === 0) {
      break;
    }
    page += 1;
  }

  return rows;
}

export async function resolveUnsyncedInvoiceIdsForJob(
  jobId: number,
): Promise<number[]> {
  const rows = await fetchAllJobInvoiceRows(jobId);
  return collectUnsyncedInvoiceIds(rows);
}

function timeoutMsFor(invoiceCount: number): number {
  return Math.min(
    MAX_TIMEOUT_MS,
    Math.max(MIN_TIMEOUT_MS, invoiceCount * PER_INVOICE_TIMEOUT_MS),
  );
}

export async function watchInvoiceRetryBatch(options: {
  jobId?: number;
  invoiceIds: number[];
  onProgress?: (progress: InvoiceRetryBatchProgress) => void;
  isHttpSettled?: () => boolean;
}): Promise<InvoiceRetryBatchProgress> {
  const { jobId, invoiceIds, onProgress, isHttpSettled } = options;
  const generation = ++watchGeneration;
  activeWatchCount += 1;
  const startedAt = Date.now();
  const timeoutMs = timeoutMsFor(invoiceIds.length);
  const fetchRows = () =>
    jobId != null ? fetchAllJobInvoiceRows(jobId) : fetchAllPaymentsInvoiceRows();

  let latest = summarizeInvoiceRetryBatch([], invoiceIds, {
    treatFailedAsPending: true,
  });
  if (generation === watchGeneration) {
    onProgress?.(latest);
  }

  try {
    while (Date.now() - startedAt < timeoutMs) {
      if (generation !== watchGeneration) {
        return latest;
      }
      const rows = await fetchRows();
      if (generation !== watchGeneration) {
        return latest;
      }
      latest = summarizeInvoiceRetryBatch(rows, invoiceIds, {
        treatFailedAsPending: !(isHttpSettled?.() ?? false),
      });
      onProgress?.(latest);
      if (latest.pendingCount === 0) {
        return latest;
      }
      await delay(POLL_INTERVAL_MS);
    }

    return {
      ...latest,
      failureCount: latest.failureCount + latest.pendingCount,
      pendingCount: 0,
    };
  } finally {
    activeWatchCount = Math.max(0, activeWatchCount - 1);
  }
}

export function planInvoiceRetryRestore(
  rows: InvoiceRetryWatchRow[],
  persistedWatchedIds: number[] = [],
): {
  invoiceIds: number[];
  jobId?: number;
  alreadySettled: InvoiceRetryBatchProgress | null;
} {
  const inFlightIds = collectInFlightInvoiceIds(rows);
  const invoiceIds = resolveRestoredWatchIds(inFlightIds, persistedWatchedIds);

  if (invoiceIds.length > 0) {
    return {
      invoiceIds,
      jobId: inferSharedJobId(rows, invoiceIds),
      alreadySettled: null,
    };
  }

  if (persistedWatchedIds.length > 0) {
    return {
      invoiceIds: [],
      alreadySettled: summarizeInvoiceRetryBatch(rows, persistedWatchedIds),
    };
  }

  return { invoiceIds: [], alreadySettled: null };
}

async function restoreInvoiceRetryWatch(): Promise<boolean> {
  if (isInvoiceRetryWatchActive()) {
    return false;
  }

  const rows = await fetchAllPaymentsInvoiceRows();
  if (isInvoiceRetryWatchActive()) {
    return false;
  }

  const store = useInvoiceRetryProgressStore.getState();
  const plan = planInvoiceRetryRestore(rows, store.watchedInvoiceIds);

  if (plan.alreadySettled) {
    store.completeFromBatch(plan.alreadySettled);
    return true;
  }

  if (plan.invoiceIds.length === 0) {
    if (store.syncStatus?.state === 'IN_PROGRESS') {
      store.clearWasInProgress();
    }
    return false;
  }

  if (isInvoiceRetryWatchActive()) {
    return false;
  }

  const generationBeforeWatch = watchGeneration;
  if (
    store.syncStatus?.state !== 'IN_PROGRESS' ||
    store.watchedInvoiceIds.length === 0
  ) {
    store.startRetry(plan.invoiceIds, plan.jobId ?? store.jobId ?? undefined);
  }

  const batch = await watchInvoiceRetryBatch({
    jobId: plan.jobId ?? store.jobId ?? undefined,
    invoiceIds: plan.invoiceIds,
    onProgress: (progress) =>
      useInvoiceRetryProgressStore.getState().applyBatchProgress(progress),
    // The original HTTP retry belongs to a previous page session.
    isHttpSettled: () => true,
  });

  if (watchGeneration !== generationBeforeWatch + 1) {
    return false;
  }

  useInvoiceRetryProgressStore.getState().completeFromBatch(batch);
  return true;
}

/**
 * On page load, re-attach the progress bar to backend in-flight retries
 * (PENDING / SALES_ORDER_SYNCED) even if the in-memory store was wiped.
 */
export function restoreInvoiceRetryWatchIfNeeded(): Promise<boolean> {
  if (restorePromise) {
    return restorePromise;
  }
  restorePromise = restoreInvoiceRetryWatch().finally(() => {
    restorePromise = null;
  });
  return restorePromise;
}
