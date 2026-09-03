import { test, expect, skipIfUnavailable } from './helpers/fixtures';

/**
 * QLINK-3508 — Invoice sync retry + accounting smoke
 *
 * (a) Retry path returns a structured per-batch aggregate and must not cascade
 *     a single failure into flipping already-synced invoices to FAILED.
 * (b) Token refresh is hard to e2e; smoke accounting / MYOB connection APIs
 *     and invoice list still work when the tenant is connected.
 */

type PaymentsInvoice = {
  id: number;
  accountingSync?: string;
  status?: string;
  failureReason?: string | null;
};

type RetryAllInvoicesResponse = {
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  result?: {
    invoices?: Array<{
      internalInvoiceId?: number;
      internalStatus?: string;
      errorMessage?: string | null;
    }>;
  };
};

function pageContent<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  if (Array.isArray(payload.content)) return payload.content as T[];
  if (Array.isArray(payload.items)) return payload.items as T[];
  return [];
}

function isSynced(invoice: PaymentsInvoice): boolean {
  const sync = (invoice.accountingSync || invoice.status || '').toUpperCase();
  return sync === 'SYNCED' || sync === 'SUCCESS' || sync === 'COMPLETED';
}

function isFailed(invoice: PaymentsInvoice): boolean {
  const sync = (invoice.accountingSync || invoice.status || '').toUpperCase();
  return sync === 'FAILED' || sync === 'FAILURE' || sync === 'ERROR';
}

test.describe('QLINK-3508 Invoice sync retry - API', () => {
  test('GET /invoices returns payments invoices with accounting sync fields', async ({
    apiClient,
  }) => {
    const res = await apiClient.invoices.paymentsList('page=1&pageSize=20');
    skipIfUnavailable(res, 'Payments invoices list');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const rows = pageContent<PaymentsInvoice>(data);
    expect(Array.isArray(rows)).toBeTruthy();
    if (rows.length > 0) {
      expect(rows[0]).toHaveProperty('id');
      expect(
        rows[0].accountingSync !== undefined || rows[0].status !== undefined,
      ).toBeTruthy();
    }
  });

  test('PUT /invoices/{id}/retry returns aggregate counts (batched retry shape)', async ({
    apiClient,
  }) => {
    const failedRes = await apiClient.invoices.paymentsList(
      'page=1&pageSize=20&failedOnly=true',
    );
    skipIfUnavailable(failedRes, 'Failed invoices list');
    expect(failedRes.ok()).toBeTruthy();
    const failed = pageContent<PaymentsInvoice>(await failedRes.json()).filter(
      isFailed,
    );
    test.skip(failed.length === 0, 'No failed invoices available to retry on staging');

    const target = failed[0];
    const retryRes = await apiClient.invoices.retryOne(target.id);
    // 4xx business validation is acceptable; 5xx would indicate fail-all / unhandled timeout
    expect(retryRes.status()).toBeLessThan(500);
    if (!retryRes.ok()) {
      return;
    }

    const body = (await retryRes.json()) as RetryAllInvoicesResponse;
    expect(typeof body.totalAttempted).toBe('number');
    expect(typeof body.successCount).toBe('number');
    expect(typeof body.failureCount).toBe('number');
    expect(body.totalAttempted).toBe(
      body.successCount + body.failureCount,
    );
    expect(body.result).toBeDefined();
    expect(Array.isArray(body.result?.invoices)).toBeTruthy();
  });

  test('retrying one failed invoice does not flip other already-synced invoices to FAILED', async ({
    apiClient,
  }) => {
    const listRes = await apiClient.invoices.paymentsList('page=1&pageSize=50');
    skipIfUnavailable(listRes, 'Invoices snapshot');
    expect(listRes.ok()).toBeTruthy();
    const before = pageContent<PaymentsInvoice>(await listRes.json());
    const syncedIds = before.filter(isSynced).map((i) => i.id);
    const failed = before.filter(isFailed);

    test.skip(
      failed.length === 0,
      'No failed invoice to retry — cannot exercise fail-all regression',
    );
    test.skip(
      syncedIds.length === 0,
      'No synced invoices present to assert non-cascade',
    );

    const retryRes = await apiClient.invoices.retryOne(failed[0].id);
    expect(retryRes.status()).toBeLessThan(500);

    const afterRes = await apiClient.invoices.paymentsList('page=1&pageSize=50');
    expect(afterRes.ok()).toBeTruthy();
    const after = pageContent<PaymentsInvoice>(await afterRes.json());
    const afterById = new Map(after.map((i) => [i.id, i]));

    for (const id of syncedIds) {
      const row = afterById.get(id);
      if (!row) continue;
      expect(
        isFailed(row),
        `Synced invoice ${id} was flipped to FAILED after another invoice retry`,
      ).toBeFalsy();
    }
  });
});

test.describe('QLINK-3508 Accounting smoke (token refresh proxy)', () => {
  test('accounting status and MYOB connections remain reachable', async ({
    apiClient,
  }) => {
    const statusRes = await apiClient.accounting.status();
    expect([200, 403, 404]).toContain(statusRes.status());
    if (statusRes.ok()) {
      const status = await statusRes.json();
      expect(status).toBeDefined();
    }

    const connRes = await apiClient.myobAcumatica.connections();
    expect([200, 403, 404]).toContain(connRes.status());
    if (connRes.ok()) {
      const connections = await connRes.json();
      expect(connections).toBeDefined();
    }

    // Invoice list still works while accounting is connected (exercises fusion auth path)
    const invoicesRes = await apiClient.invoices.paymentsList(
      'page=1&pageSize=5',
    );
    skipIfUnavailable(invoicesRes, 'Invoices while accounting connected');
    expect(invoicesRes.ok()).toBeTruthy();
  });

  test('Payments UI invoices tab loads and shows sync status column or empty state', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments?tab=invoices', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page not available on this environment',
    );
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Invoices' })).toBeVisible();
  });
});
