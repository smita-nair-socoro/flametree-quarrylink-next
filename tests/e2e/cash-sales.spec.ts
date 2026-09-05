import type { Page } from '@playwright/test';
import {
  test,
  expect,
  skipIfUnavailable,
  type ApiClient,
} from './helpers/fixtures';

/**
 * Cash sale e2e: collection-only eligibility, record/amend/void, Job Cash Sales tab,
 * Payments sync UI, and the hard rules from record-cash-sale-against-dockets.md.
 */

interface DocketRow {
  id: number;
  docketNumber: string;
  type?: string;
  status?: string;
  docketStatus?: string;
  jobItemType?: string;
  jobId?: number;
  jobNumber?: string;
  totalInvoiceAmount?: number;
}

interface CashSaleDetail {
  id: number;
  reference: string;
  jobId?: number;
  jobNumber?: string;
  paymentType: string;
  accountingSync?: string;
  voided?: boolean;
  dockets?: { docketId: number; docketNumber: string }[];
  amendments?: { newPaymentType: string }[];
}

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

/** Spec: cash sale eligible = COLLECTED collection only. */
async function findEligibleCashSaleDocket(
  apiClient: ApiClient,
): Promise<DocketRow | null> {
  const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
  return collected[0] ?? null;
}

async function findEligibleCashSaleDockets(
  apiClient: ApiClient,
  minCount: number,
): Promise<DocketRow[]> {
  const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
  return collected.slice(0, minCount);
}

async function dismissOpenDialogs(page: Page) {
  for (let i = 0; i < 3; i++) {
    const dialog = page.locator('[role="dialog"][data-state="open"]');
    if ((await dialog.count()) === 0) return;
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0, { timeout: 5000 }).catch(() => undefined);
  }
}

async function openJobCashSalesTab(
  page: Page,
  jobHint?: string,
): Promise<{ dialog: ReturnType<Page['getByRole']>; skipped: string | null }> {
  await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
  await dismissOpenDialogs(page);

  if (jobHint) {
    const searchBox = page.getByPlaceholder('Search jobs...');
    if ((await searchBox.count()) > 0) {
      await searchBox.fill(jobHint);
      await page.waitForTimeout(1500);
    }
  }

  const row = jobHint
    ? page.locator('table tbody tr').filter({ hasText: jobHint }).first()
    : page.locator('table tbody tr').first();
  if ((await row.count()) === 0) {
    return { dialog: page.getByRole('dialog'), skipped: 'No jobs available' };
  }
  await row.locator('td').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 15000 });

  const cashSalesTab = dialog.getByRole('tab', { name: 'Cash Sales' });
  if ((await cashSalesTab.count()) === 0) {
    return {
      dialog,
      skipped: 'Opened an internal transfer job or Cash Sales is not deployed',
    };
  }
  await cashSalesTab.click();
  return { dialog, skipped: null };
}

test.describe('Cash sales - QLINK-3509 slices 1–4', () => {
  test('API: record cash sale, amend payment type, then void', async ({
    apiClient,
  }) => {
    const docket = await findEligibleCashSaleDocket(apiClient);
    test.skip(!docket, 'No COLLECTED collection docket available');

    const createRes = await apiClient.payments.createCashSale({
      docketIds: [docket!.id],
      paymentType: 'Cash',
    });
    skipIfUnavailable(createRes, 'Create cash sale');
    expect(createRes.ok(), await createRes.text()).toBeTruthy();
    const created = (await createRes.json()) as CashSaleDetail;
    expect(created.reference).toMatch(/^CS-\d+/);
    expect(created.paymentType).toBe('Cash');
    expect(created.voided).toBeFalsy();

    const detailRes = await apiClient.payments.cashSale(created.id);
    expect(detailRes.ok()).toBeTruthy();
    const detail = (await detailRes.json()) as CashSaleDetail;
    expect(detail.dockets?.some((line) => line.docketId === docket!.id)).toBeTruthy();

    if (created.jobId) {
      const byJob = await apiClient.payments.cashSalesByJob(created.jobId);
      expect(byJob.ok()).toBeTruthy();
      const jobReceipts = cashSaleRows(await byJob.json());
      expect(jobReceipts.some((r) => r.id === created.id || r.reference === created.reference)).toBeTruthy();
    }

    const amendRes = await apiClient.payments.amendCashSalePaymentType(
      created.id,
      'EFTPOS',
    );
    skipIfUnavailable(amendRes, 'Amend cash sale payment type');
    expect(amendRes.ok(), await amendRes.text()).toBeTruthy();
    const amended = (await amendRes.json()) as CashSaleDetail;
    expect(amended.paymentType).toBe('EFTPOS');
    expect((amended.amendments?.length ?? 0) > 0).toBeTruthy();

    const voidRes = await apiClient.payments.voidCashSale(created.id, {
      reason: 'Recorded in error',
      reasonDetail: 'QLINK-3509 e2e cleanup',
    });
    skipIfUnavailable(voidRes, 'Void cash sale');
    expect(voidRes.ok(), await voidRes.text()).toBeTruthy();
    const voided = (await voidRes.json()) as CashSaleDetail;
    expect(voided.voided).toBeTruthy();
  });

  test('API: retry endpoint accepts a failed cash sale when present', async ({
    apiClient,
  }) => {
    const failedRes = await apiClient.payments.cashSales(
      'page=1&pageSize=10&failedOnly=true',
    );
    skipIfUnavailable(failedRes, 'Cash sales failedOnly');
    expect(failedRes.ok()).toBeTruthy();
    const failed = cashSaleRows(await failedRes.json()).filter((r) => !r.voided);
    test.skip(failed.length === 0, 'No failed (non-voided) cash sales to retry');

    const retryRes = await apiClient.payments.retryCashSale(failed[0].id);
    skipIfUnavailable(retryRes, 'Retry cash sale');
    expect([200, 204].includes(retryRes.status())).toBeTruthy();
  });

  test('UI: Job Cash Sales tab lists receipt and opens details/PDF action', async ({
    authedPage: page,
    apiClient,
  }) => {
    const listRes = await apiClient.payments.cashSales('page=1&pageSize=25');
    skipIfUnavailable(listRes, 'Cash sales list');
    expect(listRes.ok()).toBeTruthy();
    const receipts = cashSaleRows(await listRes.json()).filter(
      (r) => r.jobId || r.jobNumber,
    );
    test.skip(receipts.length === 0, 'No cash sales with job linkage on staging');

    const receipt = receipts[0];
    const search = receipt.jobNumber ?? String(receipt.jobId);
    const { dialog, skipped } = await openJobCashSalesTab(page, search);
    test.skip(!!skipped, skipped ?? undefined);

    await expect(
      dialog.getByRole('button', { name: 'Create Cash Sale' }),
    ).toBeVisible({ timeout: 15000 });

    await expect(dialog.getByText(receipt.reference)).toBeVisible({
      timeout: 15000,
    });

    const actions = dialog.getByRole('button', { name: 'Receipt actions' }).first();
    test.skip((await actions.count()) === 0, 'Receipt actions menu not visible');
    await actions.click();
    await expect(
      page.getByRole('menuitem', { name: 'View Details' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Download Receipt' }),
    ).toBeVisible();
    await page.getByRole('menuitem', { name: 'View Details' }).click();
    await expect(
      page.getByRole('dialog').filter({ hasText: `Cash Sale ${receipt.reference}` }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('UI: Cash Payments tab shows sync badge and Failed only filter', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments?tab=cash-payments', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );

    await expect(page.locator('#failed-only')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);

    const syncBadge = page
      .locator('text=/^(Synced|Failed|Pending|Syncing|Not synced)$/i')
      .first();
    if ((await syncBadge.count()) > 0) {
      await expect(syncBadge).toBeVisible();
    }

    await page.locator('#failed-only').click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);

    const retryBtn = page.getByRole('button', { name: /retry/i }).first();
    if ((await retryBtn.count()) > 0) {
      await expect(retryBtn).toBeVisible();
    }
  });

  test('UI: Create Cash Sale entry from job tab opens selection/confirm flow', async ({
    authedPage: page,
  }) => {
    const { dialog, skipped } = await openJobCashSalesTab(page);
    test.skip(!!skipped, skipped ?? undefined);

    const createBtn = dialog.getByRole('button', { name: 'Create Cash Sale' });
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click();

    const createDialog = page
      .getByRole('dialog')
      .filter({ hasText: /Create Cash Sale|Select dockets|Cash Sale/i })
      .last();
    await expect(createDialog).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});

test.describe('Cash sale eligibility & hard rules (spec)', () => {
  test('API: delivery DELIVERED docket is never cash-saleable', async ({
    apiClient,
  }) => {
    const delivered = await findDockets(apiClient, 'DELIVERY', 'DELIVERED');
    test.skip(delivered.length === 0, 'No DELIVERED delivery docket on staging');

    const res = await apiClient.payments.createCashSale({
      docketIds: [delivered[0].id],
      paymentType: 'Cash',
    });
    // Expect 4xx rejection naming the docket — never 2xx.
    expect(res.ok(), await res.text()).toBeFalsy();
    expect([400, 409, 422].includes(res.status())).toBeTruthy();
    const body = await res.text();
    expect(body).toMatch(new RegExp(delivered[0].docketNumber || String(delivered[0].id)));
  });

  test('API: READY collection docket is not cash-saleable (Collected only)', async ({
    apiClient,
  }) => {
    const ready = await findDockets(apiClient, 'COLLECTION', 'READY');
    test.skip(ready.length === 0, 'No READY collection docket on staging');

    const res = await apiClient.payments.createCashSale({
      docketIds: [ready[0].id],
      paymentType: 'Cash',
    });
    expect(res.ok(), await res.text()).toBeFalsy();
    expect([400, 409, 422].includes(res.status())).toBeTruthy();
  });

  test('API: already cash-sold / invoiced dockets are blocked', async ({
    apiClient,
  }) => {
    const cashSold = await findDockets(apiClient, 'COLLECTION', 'CASH_SALE');
    const invoiced = await findDockets(apiClient, 'COLLECTION', 'INVOICED');
    const blocked = cashSold[0] ?? invoiced[0];
    test.skip(!blocked, 'No CASH_SALE or INVOICED collection docket on staging');

    const res = await apiClient.payments.createCashSale({
      docketIds: [blocked!.id],
      paymentType: 'Cash',
    });
    expect(res.ok(), await res.text()).toBeFalsy();
    expect([400, 409, 422].includes(res.status())).toBeTruthy();
  });

  test('API: one selection creates one receipt; duplicate blocked after success', async ({
    apiClient,
  }) => {
    const dockets = await findEligibleCashSaleDockets(apiClient, 1);
    test.skip(dockets.length === 0, 'No COLLECTED collection docket available');

    const createRes = await apiClient.payments.createCashSale({
      docketIds: [dockets[0].id],
      paymentType: 'EFT',
    });
    skipIfUnavailable(createRes, 'Create cash sale');
    expect(createRes.ok(), await createRes.text()).toBeTruthy();
    const created = (await createRes.json()) as CashSaleDetail;
    expect(created.reference).toMatch(/^CS-\d+/);
    expect(created.dockets?.length ?? 1).toBe(1);

    const dupRes = await apiClient.payments.createCashSale({
      docketIds: [dockets[0].id],
      paymentType: 'Cash',
    });
    expect(dupRes.ok(), await dupRes.text()).toBeFalsy();
    expect([400, 409, 422].includes(dupRes.status())).toBeTruthy();

    // Cleanup so staging stays usable
    const voidRes = await apiClient.payments.voidCashSale(created.id, {
      reason: 'Recorded in error',
      reasonDetail: 'e2e duplicate-block cleanup',
    });
    skipIfUnavailable(voidRes, 'Void cash sale cleanup');
  });

  test('API: bulk selection of two collected dockets (same job) = one receipt', async ({
    apiClient,
  }) => {
    const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
    const byJob = new Map<number, DocketRow[]>();
    for (const row of collected) {
      if (!row.jobId) continue;
      const list = byJob.get(row.jobId) ?? [];
      list.push(row);
      byJob.set(row.jobId, list);
    }
    const pair = [...byJob.values()].find((rows) => rows.length >= 2);
    test.skip(!pair, 'Need two COLLECTED collection dockets on the same job');

    const ids = pair!.slice(0, 2).map((d) => d.id);
    const createRes = await apiClient.payments.createCashSale({
      docketIds: ids,
      paymentType: 'Credit Card',
    });
    skipIfUnavailable(createRes, 'Bulk create cash sale');
    expect(createRes.ok(), await createRes.text()).toBeTruthy();
    const created = (await createRes.json()) as CashSaleDetail;
    expect(created.reference).toMatch(/^CS-\d+/);
    expect(created.dockets?.length ?? ids.length).toBe(ids.length);

    const voidRes = await apiClient.payments.voidCashSale(created.id, {
      reason: 'Recorded in error',
      reasonDetail: 'e2e bulk cleanup',
    });
    skipIfUnavailable(voidRes, 'Void bulk cash sale cleanup');
  });

  test('API: mixed tender via two separate receipts when two dockets available', async ({
    apiClient,
  }) => {
    const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
    const byJob = new Map<number, DocketRow[]>();
    for (const row of collected) {
      if (!row.jobId) continue;
      const list = byJob.get(row.jobId) ?? [];
      list.push(row);
      byJob.set(row.jobId, list);
    }
    const pair = [...byJob.values()].find((rows) => rows.length >= 2);
    test.skip(!pair, 'Need two COLLECTED collection dockets on the same job for mixed tender');

    const [a, b] = pair!;
    const cashRes = await apiClient.payments.createCashSale({
      docketIds: [a.id],
      paymentType: 'Cash',
    });
    skipIfUnavailable(cashRes, 'Mixed tender cash receipt');
    expect(cashRes.ok(), await cashRes.text()).toBeTruthy();
    const cashSale = (await cashRes.json()) as CashSaleDetail;

    const eftposRes = await apiClient.payments.createCashSale({
      docketIds: [b.id],
      paymentType: 'EFTPOS',
    });
    skipIfUnavailable(eftposRes, 'Mixed tender EFTPOS receipt');
    expect(eftposRes.ok(), await eftposRes.text()).toBeTruthy();
    const eftposSale = (await eftposRes.json()) as CashSaleDetail;

    expect(cashSale.reference).not.toBe(eftposSale.reference);
    expect(cashSale.paymentType).toBe('Cash');
    expect(eftposSale.paymentType).toBe('EFTPOS');

    for (const receipt of [cashSale, eftposSale]) {
      const voidRes = await apiClient.payments.voidCashSale(receipt.id, {
        reason: 'Recorded in error',
        reasonDetail: 'e2e mixed tender cleanup',
      });
      skipIfUnavailable(voidRes, 'Void mixed tender cleanup');
    }
  });

  test('API: optional zero-value cash sale when a $0 collected docket exists', async ({
    apiClient,
  }) => {
    const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
    const zero = collected.find((d) => Number(d.totalInvoiceAmount ?? NaN) === 0);
    test.skip(!zero, 'No zero-value COLLECTED collection docket on staging');

    const createRes = await apiClient.payments.createCashSale({
      docketIds: [zero!.id],
      paymentType: 'Cash',
    });
    skipIfUnavailable(createRes, 'Zero-value cash sale');
    expect(createRes.ok(), await createRes.text()).toBeTruthy();
    const created = (await createRes.json()) as CashSaleDetail;

    const voidRes = await apiClient.payments.voidCashSale(created.id, {
      reason: 'Recorded in error',
      reasonDetail: 'e2e zero-value cleanup',
    });
    skipIfUnavailable(voidRes, 'Void zero-value cleanup');
  });

  test('API: IT dockets cannot be cash sold', async ({ apiClient }) => {
    const itRows = await findDockets(apiClient, 'INTERNAL', 'DELIVERED');
    const itAlt = await findDockets(apiClient, 'INTERNAL_TRANSFER', 'DELIVERED');
    const it = itRows[0] ?? itAlt[0];
    // Fallback: look for IT- docket numbers in delivered/collected lists
    let candidate = it;
    if (!candidate) {
      const delivered = await findDockets(apiClient, 'DELIVERY', 'DELIVERED');
      candidate =
        delivered.find((d) => d.docketNumber?.startsWith('IT-')) ?? undefined!;
    }
    test.skip(!candidate, 'No internal-transfer docket available to assert IT boundary');

    const res = await apiClient.payments.createCashSale({
      docketIds: [candidate!.id],
      paymentType: 'Cash',
    });
    expect(res.ok(), await res.text()).toBeFalsy();
  });

  test('UI: delivery selection leaves Invoice enabled and Cash Sale disabled', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await dismissOpenDialogs(page);
    await page.waitForTimeout(2000);

    const row = page.locator('table tbody tr').first();
    test.skip((await row.count()) === 0, 'No jobs available');
    await row.locator('td').first().click();
    const jobDialog = page.getByRole('dialog');
    await expect(jobDialog).toBeVisible({ timeout: 15000 });

    const invoicesTab = jobDialog.getByRole('tab', { name: /Invoices/i });
    test.skip((await invoicesTab.count()) === 0, 'Invoices tab missing');
    await invoicesTab.click();

    const createInvoice = jobDialog.getByRole('button', {
      name: /Create Invoice|Invoice/i,
    });
    // Prefer the shared selection entry if present
    const openSelection =
      (await createInvoice.count()) > 0
        ? createInvoice.first()
        : jobDialog.getByRole('button', { name: /Create Cash Sale/i }).first();

    // Navigate via Cash Sales → Create which opens the shared selection modal
    const cashSalesTab = jobDialog.getByRole('tab', { name: 'Cash Sales' });
    if ((await cashSalesTab.count()) > 0) {
      await cashSalesTab.click();
      const createCash = jobDialog.getByRole('button', { name: 'Create Cash Sale' });
      await expect(createCash).toBeVisible({ timeout: 10000 });
      await createCash.click();
    } else if ((await openSelection.count()) > 0) {
      await openSelection.click();
    } else {
      test.skip(true, 'No invoice/cash-sale selection entry point');
    }

    const selection = page
      .getByRole('dialog')
      .filter({ hasText: /Select dockets|Create Cash Sale|dockets selected/i })
      .last();
    await expect(selection).toBeVisible({ timeout: 15000 });

    const deliveryTab = selection.getByRole('tab', { name: /Delivery/i });
    if ((await deliveryTab.count()) > 0) {
      await deliveryTab.click();
      await page.waitForTimeout(500);
    }

    const checkbox = selection.locator('table tbody tr').first().locator('button[role="checkbox"], input[type="checkbox"]').first();
    test.skip((await checkbox.count()) === 0, 'No delivery dockets in selection for this job');
    await checkbox.click();
    await page.waitForTimeout(400);

    const cashSaleBtn = selection.getByRole('button', { name: /Cash Sale/i });
    const invoiceBtn = selection.getByRole('button', { name: /Invoice/i });
    test.skip((await cashSaleBtn.count()) === 0, 'Cash Sale action not in selection footer');

    await expect(cashSaleBtn.first()).toBeDisabled();
    if ((await invoiceBtn.count()) > 0) {
      // Invoice may still be enabled for delivered delivery dockets
      await expect(invoiceBtn.first()).toBeEnabled();
    }
  });

  test('UI: empty selection keeps Cash Sale disabled on Create flow', async ({
    authedPage: page,
  }) => {
    const { dialog, skipped } = await openJobCashSalesTab(page);
    test.skip(!!skipped, skipped ?? undefined);

    await dialog.getByRole('button', { name: 'Create Cash Sale' }).click();
    const selection = page
      .getByRole('dialog')
      .filter({ hasText: /Create Cash Sale|Select dockets|Cash Sale/i })
      .last();
    await expect(selection).toBeVisible({ timeout: 15000 });

    const cashSaleBtn = selection.getByRole('button', {
      name: /Cash Sale \(0 selected\)|Cash Sale/i,
    });
    // With nothing selected, Cash Sale should be disabled or absent from the enabled path
    if ((await cashSaleBtn.count()) > 0) {
      const enabledCount = await cashSaleBtn.evaluateAll((nodes) =>
        nodes.filter((n) => !(n as HTMLButtonElement).disabled).length,
      );
      // Prefer: all Cash Sale buttons disabled when selection is empty
      expect(enabledCount).toBe(0);
    }
  });
});
