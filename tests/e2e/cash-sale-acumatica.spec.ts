import {
  test,
  expect,
  skipIfUnavailable,
  type ApiClient,
} from './helpers/fixtures';

/**
 * Acumatica-centric coverage for record-cash-sale-against-dockets.md §9, §12, §15.2.
 * Push happens on confirm (synchronous). Zero-value must stay Not synced, never Failed.
 */

interface DocketRow {
  id: number;
  docketNumber: string;
  type?: string;
  status?: string;
  docketStatus?: string;
  jobItemType?: string;
  totalInvoiceAmount?: number;
}

interface CashSaleDetail {
  id: number;
  reference: string;
  paymentType: string;
  accountingSync?: string;
  failureReason?: string | null;
  voided?: boolean;
  amount?: number;
}

const SYNC_STATES = ['SYNCED', 'FAILED', 'NOT_SYNCED'] as const;

function rowsFromPayload(data: unknown): DocketRow[] {
  if (Array.isArray(data)) return data as DocketRow[];
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  const nested = payload.dockets ?? payload.jobs;
  if (nested && typeof nested === 'object' && nested !== null) {
    const nestedContent = (nested as Record<string, unknown>).content;
    if (Array.isArray(nestedContent)) return nestedContent as DocketRow[];
  }
  const content = payload.content ?? payload.items;
  return Array.isArray(content) ? (content as DocketRow[]) : [];
}

function cashSaleRows(data: unknown): CashSaleDetail[] {
  if (Array.isArray(data)) return data as CashSaleDetail[];
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  const content = payload.content ?? payload.items;
  return Array.isArray(content) ? (content as CashSaleDetail[]) : [];
}

function statusOf(row: DocketRow): string {
  return `${row.status ?? row.docketStatus ?? ''}`.toUpperCase();
}

function matchesType(row: DocketRow, types: string): boolean {
  const type = `${row.type ?? row.jobItemType ?? ''}`.toUpperCase();
  return type.includes(types.toUpperCase());
}

function syncOf(row: Pick<CashSaleDetail, 'accountingSync'>): string {
  return `${row.accountingSync ?? ''}`.toUpperCase();
}

async function findDockets(
  apiClient: ApiClient,
  types: string,
  statuses: string,
): Promise<DocketRow[]> {
  const query = `page=1&pageSize=50&types=${types}&statuses=${statuses}`;
  const wantedStatus = statuses.toUpperCase();
  const matches = (row: DocketRow) =>
    matchesType(row, types) &&
    (wantedStatus ? statusOf(row).includes(wantedStatus) : true);

  const tableRes = await apiClient.dockets.table(query);
  if (tableRes.ok()) {
    const rows = rowsFromPayload(await tableRes.json()).filter(matches);
    if (rows.length) return rows;
  }
  const listRes = await apiClient.dockets.list(query);
  if (!listRes.ok()) return [];
  return rowsFromPayload(await listRes.json()).filter(matches);
}

async function markCollectionCollected(
  apiClient: ApiClient,
  docketId: number,
): Promise<boolean> {
  const ready = await apiClient.dockets.updateStatus(docketId, {
    docketStatus: 'READY_FOR_COLLECTION',
  });
  if (!ready.ok() && ready.status() !== 400 && ready.status() !== 409) {
    return false;
  }
  const collected = await apiClient.dockets.updateStatus(docketId, {
    docketStatus: 'COLLECTED',
    receiverName: 'E2E Seed',
  });
  return collected.ok();
}

async function ensureCollectedDockets(
  apiClient: ApiClient,
  minCount: number,
): Promise<DocketRow[]> {
  let collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
  if (collected.length >= minCount) return collected.slice(0, minCount);

  const listRes = await apiClient.payments.cashSales('page=1&pageSize=25');
  if (listRes.ok()) {
    const receipts = cashSaleRows(await listRes.json()).filter(
      (r) => !r.voided && syncOf(r) !== 'FAILED',
    );
    for (const receipt of receipts) {
      const voidRes = await apiClient.payments.voidCashSale(receipt.id, {
        reason: 'Recorded in error',
        reasonDetail: 'e2e Acumatica seed: release dockets',
      });
      if (!voidRes.ok()) continue;
      collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
      if (collected.length >= minCount) return collected.slice(0, minCount);
    }
  }

  const ready = await findDockets(apiClient, 'COLLECTION', 'READY_FOR_COLLECTION');
  const preparing = await findDockets(apiClient, 'COLLECTION', 'PREPARING');
  for (const row of [...ready, ...preparing]) {
    if (collected.length >= minCount) break;
    await markCollectionCollected(apiClient, row.id);
    collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
  }
  return collected.slice(0, minCount);
}

async function createCashSale(
  apiClient: ApiClient,
  paymentType = 'Cash',
): Promise<CashSaleDetail | null> {
  const dockets = await ensureCollectedDockets(apiClient, 1);
  if (dockets.length === 0) return null;
  const createRes = await apiClient.payments.createCashSale({
    docketIds: [dockets[0].id],
    paymentType,
  });
  skipIfUnavailable(createRes, 'Create cash sale (Acumatica push)');
  expect(createRes.ok(), await createRes.text()).toBeTruthy();
  return (await createRes.json()) as CashSaleDetail;
}

test.describe('Cash sale × Acumatica (§9 / §12 / §15.2)', () => {
  test.describe.configure({ timeout: 180000 });

  test('confirming records locally then pushes (Synced / Failed / Not synced)', async ({
    apiClient,
  }) => {
    const created = await createCashSale(apiClient);
    test.skip(!created, 'No COLLECTED collection docket to push');

    expect(created!.reference).toMatch(/^CS-\d+/);
    expect(SYNC_STATES).toContain(syncOf(created!));
    if (syncOf(created!) === 'FAILED') {
      expect(created!.failureReason, 'Failed push must store Acumatica error text').toBeTruthy();
      expect(created!.failureReason).not.toMatch(/TP-001 |FTD /);
    }

    const detailRes = await apiClient.payments.cashSale(created!.id);
    expect(detailRes.ok()).toBeTruthy();
    const detail = (await detailRes.json()) as CashSaleDetail;
    expect(detail.reference).toBe(created!.reference);
    expect(SYNC_STATES).toContain(syncOf(detail));
  });

  test('zero-value cash sale stays Not synced and is never Failed', async ({
    apiClient,
  }) => {
    await ensureCollectedDockets(apiClient, 1);
    const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
    const zero = collected.find((d) => Number(d.totalInvoiceAmount ?? NaN) === 0);
    test.skip(!zero, 'No $0 COLLECTED collection docket — cannot assert skip-push');

    const createRes = await apiClient.payments.createCashSale({
      docketIds: [zero!.id],
      paymentType: 'Cash',
    });
    skipIfUnavailable(createRes, 'Zero-value cash sale');
    expect(createRes.ok(), await createRes.text()).toBeTruthy();
    const created = (await createRes.json()) as CashSaleDetail;
    expect(syncOf(created)).toBe('NOT_SYNCED');
    expect(created.failureReason ?? '').toMatch(/[Zz]ero|[Nn]ot pushed|reject/i);

    const voidRes = await apiClient.payments.voidCashSale(created.id, {
      reason: 'Recorded in error',
      reasonDetail: 'e2e zero-value Acumatica skip cleanup',
    });
    skipIfUnavailable(voidRes, 'Void zero-value cleanup');
  });

  test('Failed receipts are isolated by failedOnly and expose error text', async ({
    apiClient,
  }) => {
    const failedRes = await apiClient.payments.cashSales(
      'page=1&pageSize=20&failedOnly=true',
    );
    skipIfUnavailable(failedRes, 'Cash sales failedOnly');
    expect(failedRes.ok()).toBeTruthy();
    const failed = cashSaleRows(await failedRes.json()).filter((r) => !r.voided);
    test.skip(failed.length === 0, 'No Failed cash sale on staging to assert error text');

    const row = failed.find((r) => r.failureReason) ?? failed[0];
    expect(syncOf(row)).toBe('FAILED');
    expect(row.failureReason, 'Acumatica error text must be stored on Failed').toBeTruthy();

    const detailRes = await apiClient.payments.cashSale(row.id);
    expect(detailRes.ok()).toBeTruthy();
    const detail = (await detailRes.json()) as CashSaleDetail;
    expect(detail.failureReason).toBeTruthy();
  });

  test('Retry re-attempts a Failed push without 5xx; second retry is idempotent', async ({
    apiClient,
  }) => {
    const failedRes = await apiClient.payments.cashSales(
      'page=1&pageSize=10&failedOnly=true',
    );
    skipIfUnavailable(failedRes, 'Failed cash sales for retry');
    const failed = cashSaleRows(await failedRes.json()).filter((r) => !r.voided);
    test.skip(failed.length === 0, 'No Failed cash sale to retry');

    const first = await apiClient.payments.retryCashSale(failed[0].id);
    expect(first.status(), await first.text()).toBeLessThan(500);
    expect([200, 204, 400, 409, 422].includes(first.status())).toBeTruthy();

    const second = await apiClient.payments.retryCashSale(failed[0].id);
    expect(second.status(), await second.text()).toBeLessThan(500);

    const afterRes = await apiClient.payments.cashSale(failed[0].id);
    expect(afterRes.ok()).toBeTruthy();
    const after = (await afterRes.json()) as CashSaleDetail;
    expect(SYNC_STATES).toContain(syncOf(after));
    if (syncOf(after) === 'FAILED') {
      expect(after.failureReason).toBeTruthy();
    }
  });

  test('Amend Payment Type on a live receipt does not 5xx and keeps a valid sync badge', async ({
    apiClient,
  }) => {
    const created = await createCashSale(apiClient, 'Cash');
    test.skip(!created, 'No docket to amend after push');

    try {
      const amendRes = await apiClient.payments.amendCashSalePaymentType(
        created!.id,
        'EFTPOS',
      );
      skipIfUnavailable(amendRes, 'Amend payment type (Acumatica correction push)');
      expect(amendRes.ok(), await amendRes.text()).toBeTruthy();
      const amended = (await amendRes.json()) as CashSaleDetail;
      expect(amended.paymentType).toBe('EFTPOS');
      expect(SYNC_STATES).toContain(syncOf(amended));
    } finally {
      await apiClient.payments.voidCashSale(created!.id, {
        reason: 'Recorded in error',
        reasonDetail: 'e2e amend-acumatica cleanup',
      });
    }
  });

  test('Voiding a receipt that was pushed does not 5xx (reversal or cancel pending)', async ({
    apiClient,
  }) => {
    const created = await createCashSale(apiClient, 'EFT');
    test.skip(!created, 'No docket to void after push');

    const voidRes = await apiClient.payments.voidCashSale(created!.id, {
      reason: 'Recorded in error',
      reasonDetail: 'e2e void-acumatica reversal',
    });
    skipIfUnavailable(voidRes, 'Void cash sale after Acumatica push');
    expect(voidRes.ok(), await voidRes.text()).toBeTruthy();
    const voided = (await voidRes.json()) as CashSaleDetail;
    expect(voided.voided).toBeTruthy();
    expect(SYNC_STATES).toContain(syncOf(voided));
  });

  test('UI: Payments Cash Payments Failed only + no email alerts', async ({
    authedPage: page,
  }) => {
    await page.goto(
      '/customer-operations/payments?tab=cash-payments&failedOnly=true',
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page not on this environment',
    );

    await expect(page.locator('#failed-only')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#failed-only')).toBeChecked();
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);

    const body = await page.locator('table tbody').innerText().catch(() => '');
    if (!/No items are available/i.test(body) && /Failed/i.test(body)) {
      const row = page.locator('table tbody tr').filter({ hasText: /Failed/i }).first();
      await row.getByRole('button', { name: 'Receipt actions' }).click();
      await expect(
        page.getByRole('menuitem', { name: /Retry Sync/i }),
      ).toBeVisible();
    }
  });
});
