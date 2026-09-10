import { APIClient } from '@/lib/api/APIClient';
import {
  collectUnsyncedInvoiceIds,
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

function toWatchRow(
  row: Pick<Invoice, 'id' | 'status' | 'accountingSync'> | PaymentsInvoice,
): InvoiceRetryWatchRow {
  return {
    id: row.id,
    status: row.status,
    accountingSync: row.accountingSync,
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
  jobId: number;
  invoiceIds: number[];
  onProgress?: (progress: InvoiceRetryBatchProgress) => void;
  isHttpSettled?: () => boolean;
}): Promise<InvoiceRetryBatchProgress> {
  const { jobId, invoiceIds, onProgress, isHttpSettled } = options;
  const startedAt = Date.now();
  const timeoutMs = timeoutMsFor(invoiceIds.length);

  let latest = summarizeInvoiceRetryBatch([], invoiceIds, {
    treatFailedAsPending: true,
  });
  onProgress?.(latest);

  while (Date.now() - startedAt < timeoutMs) {
    const rows = await fetchAllJobInvoiceRows(jobId);
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
}
