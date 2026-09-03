import type { Page } from '@playwright/test';
import {
  test,
  expect,
  skipIfUnavailable,
  type ApiClient,
} from './helpers/fixtures';

/**
 * QLINK-3509 cross-slice e2e: record cash sale, Job Cash Sales tab + PDF,
 * sync badges/retry when failed rows exist, amend payment type, void.
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

async function findEligibleCashSaleDocket(
  apiClient: ApiClient,
): Promise<DocketRow | null> {
  const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
  if (collected[0]) return collected[0];
  const delivered = await findDockets(apiClient, 'DELIVERY', 'DELIVERED');
  return delivered[0] ?? null;
}

async function dismissOpenDialogs(page: Page) {
  for (let i = 0; i < 3; i++) {
    const dialog = page.locator('[role="dialog"][data-state="open"]');
    if ((await dialog.count()) === 0) return;
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0, { timeout: 5000 }).catch(() => undefined);
  }
}

test.describe('Cash sales - QLINK-3509 slices 1–4', () => {
  test('API: record cash sale, amend payment type, then void', async ({
    apiClient,
  }) => {
    const docket = await findEligibleCashSaleDocket(apiClient);
    test.skip(
      !docket,
      'No COLLECTED collection or DELIVERED delivery docket available',
    );

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
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await dismissOpenDialogs(page);

    const search = receipt.jobNumber ?? String(receipt.jobId);
    const searchBox = page.getByPlaceholder('Search jobs...');
    if ((await searchBox.count()) > 0 && receipt.jobNumber) {
      await searchBox.fill(receipt.jobNumber);
      await page.waitForTimeout(1500);
    }

    const row = page
      .locator('table tbody tr')
      .filter({ hasText: search })
      .first();
    test.skip(
      (await row.count()) === 0,
      `Job ${search} not visible in jobs table`,
    );
    await row.locator('td').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const cashSalesTab = dialog.getByRole('tab', { name: 'Cash Sales' });
    test.skip(
      (await cashSalesTab.count()) === 0,
      'Cash Sales tab not deployed or internal-transfer job',
    );
    await cashSalesTab.click();
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
      .locator('text=/^(Synced|Failed|Pending|Syncing)$/i')
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
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await dismissOpenDialogs(page);
    await page.waitForTimeout(3000);

    const row = page.locator('table tbody tr').first();
    test.skip((await row.count()) === 0, 'No jobs available');
    await row.locator('td').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const cashSalesTab = dialog.getByRole('tab', { name: 'Cash Sales' });
    test.skip(
      (await cashSalesTab.count()) === 0,
      'Opened an internal transfer job or Cash Sales is not deployed',
    );
    await cashSalesTab.click();

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
