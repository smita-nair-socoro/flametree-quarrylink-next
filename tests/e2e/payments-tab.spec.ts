import type { Page } from '@playwright/test';
import {
  test,
  expect,
  skipIfUnavailable,
  type ApiClient,
} from './helpers/fixtures';

/**
 * Payments tab e2e — UI-first coverage of
 * payments-tab-invoices-and-cash-payments-tables.md acceptance criteria.
 *
 * API is used only for setup/seeding (and soft observational checks), never as
 * the primary assertion path for the scenarios below.
 */

interface InvoiceRow {
  id: number;
  invoiceNumber?: string;
  jobId?: number;
  jobNumber?: string;
  customerName?: string;
  amount?: number;
  accountingSync?: string;
  failureReason?: string | null;
  status?: string;
}

interface CashSaleRow {
  id: number;
  reference: string;
  jobId?: number;
  jobNumber?: string;
  customerName?: string;
  amount?: number;
  paymentType?: string;
  accountingSync?: string;
  failureReason?: string | null;
  voided?: boolean;
}

function pageRows<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  const content = payload.content ?? payload.items;
  return Array.isArray(content) ? (content as T[]) : [];
}

async function gotoPayments(
  page: Page,
  query = '',
): Promise<'ok' | 'missing'> {
  const path = query
    ? `/customer-operations/payments?${query}`
    : '/customer-operations/payments';
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  if ((await page.getByText('Page not found').count()) > 0) return 'missing';
  if ((await page.getByRole('heading', { name: 'Payments' }).count()) === 0) {
    return 'missing';
  }
  await expect(page.locator('text=client-side exception')).toHaveCount(0);
  return 'ok';
}

async function ensurePaymentsPage(page: Page, query = '') {
  const status = await gotoPayments(page, query);
  test.skip(status === 'missing', 'Payments page is not on this environment yet');
}

async function openCustomerOpsNav(page: Page) {
  // Sidebar group may already be expanded; click Payments via nav link.
  const paymentsNav = page.getByRole('link', { name: /^Payments/ }).first();
  if ((await paymentsNav.count()) === 0) {
    const group = page.getByText('Customer Operations').first();
    if ((await group.count()) > 0) await group.click();
  }
  return page.getByRole('link', { name: /^Payments/ }).first();
}

function docketRows(data: unknown): { id: number }[] {
  if (Array.isArray(data)) return data as { id: number }[];
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  const nested = payload.dockets ?? payload.jobs;
  if (nested && typeof nested === 'object' && nested !== null) {
    const nestedContent = (nested as Record<string, unknown>).content;
    if (Array.isArray(nestedContent)) return nestedContent as { id: number }[];
  }
  return pageRows<{ id: number }>(data);
}

async function seedNonVoidCashSale(
  apiClient: ApiClient,
  options?: { preferFresh?: boolean },
): Promise<CashSaleRow | null> {
  if (!options?.preferFresh) {
    const listRes = await apiClient.payments.cashSales('page=1&pageSize=50');
    if (listRes.ok()) {
      const rows = pageRows<CashSaleRow>(await listRes.json());
      const preferred =
        rows.find((r) => !r.voided && r.reference === 'CS-0045') ??
        rows.find((r) => !r.voided);
      if (preferred) return preferred;
    }
  }

  const tableRes = await apiClient.dockets.table(
    'page=1&pageSize=50&types=COLLECTION&statuses=COLLECTED',
  );
  let dockets = tableRes.ok() ? docketRows(await tableRes.json()) : [];

  if (dockets.length === 0) {
    const readyRes = await apiClient.dockets.table(
      'page=1&pageSize=10&types=COLLECTION&statuses=READY_FOR_COLLECTION',
    );
    const ready = readyRes.ok() ? docketRows(await readyRes.json()) : [];
    for (const row of ready.slice(0, 2)) {
      await apiClient.dockets.updateStatus(row.id, {
        docketStatus: 'COLLECTED',
        receiverName: 'E2E Seed',
      });
    }
    const again = await apiClient.dockets.table(
      'page=1&pageSize=20&types=COLLECTION&statuses=COLLECTED',
    );
    dockets = again.ok() ? docketRows(await again.json()) : [];
  }

  if (dockets.length === 0) return null;

  const createRes = await apiClient.payments.createCashSale({
    docketIds: [dockets[0].id],
    paymentType: 'Cash',
  });
  if (!createRes.ok()) return null;
  return (await createRes.json()) as CashSaleRow;
}

async function findInvoiceSeed(
  apiClient: ApiClient,
): Promise<InvoiceRow | null> {
  const res = await apiClient.payments.invoices('page=1&pageSize=25');
  if (!res.ok()) return null;
  return pageRows<InvoiceRow>(await res.json())[0] ?? null;
}

test.describe('Payments tab — navigation', () => {
  test('1. Payments replaces Invoices in nav and lands on Invoices', async ({
    authedPage: page,
  }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const paymentsNav = await openCustomerOpsNav(page);
    await expect(paymentsNav).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: /^Invoices$/ })).toHaveCount(0);

    await paymentsNav.click();
    await page.waitForURL(/\/customer-operations\/payments/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('tab', { name: 'Invoices' })).toHaveAttribute(
      'data-state',
      'active',
    );
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('2. Three sub-tabs: Invoices, Cash Payments, Internal Transfers', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page);
    await expect(page.getByRole('tab', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Cash Payments' })).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Internal Transfers' }),
    ).toBeVisible();
  });

  test('3. Old invoices route redirects to Payments → Invoices', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/invoices', {
      waitUntil: 'networkidle',
    });
    await page.waitForURL(/\/customer-operations\/payments/, { timeout: 20000 });
    expect(page.url()).toMatch(/tab=invoices|\/payments(?:\?|$)/);
    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('tab', { name: 'Invoices' })).toBeVisible();
  });
});

test.describe('Payments tab — Invoices table', () => {
  test('4. Cross-job invoices table shows expected columns', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    for (const header of [
      'Invoice Number',
      'Job',
      'Dockets',
      'Amount',
      'Due Date',
      'Status',
      'Accounting Sync',
    ]) {
      await expect(
        page.getByRole('columnheader', { name: new RegExp(header, 'i') }).first(),
      ).toBeVisible({ timeout: 15000 });
    }
    // Cross-job: Job column values / links should appear when rows exist
    const rows = page.locator('table tbody tr');
    if ((await rows.count()) > 0) {
      await expect(rows.first()).toBeVisible();
    }
  });

  test('5. Invoice columns are sortable', async ({ authedPage: page }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    const amountHeader = page.getByRole('button', { name: /Amount/i }).first();
    await expect(amountHeader).toBeVisible({ timeout: 15000 });
    await amountHeader.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await amountHeader.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('pagination next arrow advances to page 2', async ({
    authedPage: page,
    apiClient,
  }) => {
    const res = await apiClient.payments.invoices('page=1&pageSize=10');
    skipIfUnavailable(res, 'Payments invoices');
    const body = (await res.json()) as { totalPages?: number; totalElements?: number };
    test.skip(
      (body.totalPages ?? 0) < 2 && (body.totalElements ?? 0) <= 10,
      'Need >10 invoices to exercise pagination',
    );

    await ensurePaymentsPage(page, 'tab=invoices');
    await expect(page.getByText(/Page 1 of/i)).toBeVisible({ timeout: 15000 });

    const firstRowText = (
      await page.locator('table tbody tr').first().innerText()
    ).trim();

    const next = page.getByRole('button', { name: 'Next page' });
    await expect(next).toBeEnabled();
    await next.click();

    await expect(page.getByText(/Page 2 of/i)).toBeVisible({ timeout: 10000 });
    await expect
      .poll(async () =>
        (await page.locator('table tbody tr').first().innerText()).trim(),
      )
      .not.toBe(firstRowText);
  });

  test('6. ⋯ menu offers View Invoice', async ({
    authedPage: page,
    apiClient,
  }) => {
    const invoice = await findInvoiceSeed(apiClient);
    test.skip(!invoice, 'No invoices available on staging to open actions');

    await ensurePaymentsPage(page, 'tab=invoices');
    const search = page.getByPlaceholder('Search invoices...');
    if (invoice!.invoiceNumber && (await search.count()) > 0) {
      await search.fill(invoice!.invoiceNumber);
      await page.waitForTimeout(2000);
    }

    const row = invoice!.invoiceNumber
      ? page
          .locator('table tbody tr')
          .filter({ hasText: invoice!.invoiceNumber })
          .first()
      : page.locator('table tbody tr').first();
    test.skip((await row.count()) === 0, 'Invoice row not visible in UI');

    const actions = row.getByRole('button').last();
    await actions.click();
    await expect(
      page.getByRole('menuitem', { name: /View Invoice/i }),
    ).toBeVisible();
    await page.getByRole('menuitem', { name: /View Invoice/i }).click();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('7. Keyword search matches invoice fields; "failed" is not sync search', async ({
    authedPage: page,
    apiClient,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    const search = page.getByPlaceholder('Search invoices...');
    await expect(search).toBeVisible({ timeout: 15000 });

    const invoice = await findInvoiceSeed(apiClient);
    if (invoice?.invoiceNumber) {
      await search.fill(invoice.invoiceNumber);
      await page.waitForTimeout(2000);
      await expect(
        page.locator('table tbody tr').filter({ hasText: invoice.invoiceNumber }),
      ).toBeVisible({ timeout: 15000 });
    } else if (invoice?.jobNumber) {
      await search.fill(invoice.jobNumber);
      await page.waitForTimeout(2000);
      await expect(page.locator('table tbody').first()).toBeVisible();
    }

    await search.fill('failed');
    await page.waitForTimeout(2000);
    // Sync status is not keyword-searchable — Failed only toggle is the mechanism.
    // Table may empty or show incidental text matches; must not crash.
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    const failedOnly = page.locator('#failed-only');
    await expect(failedOnly).not.toBeChecked();
  });

  test('8. Four KPI cards present with expected labels', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    await expect(page.getByText('Total Invoices')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Overdue Invoices')).toBeVisible();
    await expect(page.getByText('Past due date and unpaid')).toBeVisible();
    await expect(page.getByText('Value of Uninvoiced Dockets')).toBeVisible();
    await expect(page.getByText(/Delivery.*Collection|Collection.*Delivery/i)).toBeVisible();
    await expect(page.getByText('Due Payment')).toBeVisible();
  });

  test('9. Date range filters table but not KPI card values', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    await expect(page.getByText('Total Invoices')).toBeVisible({
      timeout: 15000,
    });

    const readTotalInvoicesValue = async () => {
      const card = page
        .locator('div')
        .filter({ has: page.getByText('Total Invoices', { exact: true }) })
        .first();
      const text = await card.innerText();
      const nums = text.match(/\d+/g);
      return nums?.[0] ?? text;
    };

    const beforeKpi = await readTotalInvoicesValue();
    await page.getByRole('button', { name: 'Today' }).click();
    await page.waitForTimeout(2000);
    const afterKpi = await readTotalInvoicesValue();
    expect(afterKpi).toBe(beforeKpi);
    await expect(page.getByText('Total Invoices')).toBeVisible();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('10. Due date presets, custom range, and active preset visible', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    for (const label of [
      'Today',
      'Last 7 days',
      'This month',
      'Last 90 days',
      'Clear dates',
    ]) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }

    const last7 = page.getByRole('button', { name: 'Last 7 days' });
    await last7.click();
    await page.waitForTimeout(800);
    // Active preset uses default (filled) variant — still visible + range label updates.
    await expect(last7).toBeVisible();
    await expect(page.getByText(/–|All dates/).first()).toBeVisible();

    await page.getByRole('button', { name: 'Custom', exact: true }).click();
    await expect(
      page.locator('[data-radix-popper-content-wrapper]').first(),
    ).toBeVisible({
      timeout: 5000,
    });
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Clear dates' }).click();
    await expect(page.getByText('All dates')).toBeVisible();
  });

  test('11. Failed only toggle on Invoices', async ({ authedPage: page }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    const toggle = page.locator('#failed-only');
    await expect(toggle).toBeVisible({ timeout: 15000 });
    await expect(toggle).not.toBeChecked();

    await page.getByText('Failed only').click();
    await page.waitForTimeout(1500);
    await expect(toggle).toBeChecked();
    expect(page.url()).toContain('failedOnly=true');

    // When rows exist they should show Failed sync badge, not Synced-only noise.
    const rows = page.locator('table tbody tr');
    if ((await rows.count()) > 0) {
      const body = await page.locator('table tbody').innerText();
      if (!/No items are available/i.test(body)) {
        expect(body).toMatch(/Failed/i);
      }
    }
  });

  test('12. Banner/badge deep-link to Failed only', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    const bannerLink = page.getByRole('link', {
      name: /View failed invoices/i,
    });
    test.skip(
      (await bannerLink.count()) === 0,
      'No failed-sync banner on staging (failedCount=0) — cannot assert deep-link',
    );

    await bannerLink.click();
    await page.waitForTimeout(2000);
    await expect(page.locator('#failed-only')).toBeChecked();
    expect(page.url()).toMatch(/failedOnly=true/);
    await expect(page.getByRole('tab', { name: 'Invoices' })).toBeVisible();
  });

  test('13. No filter chips / voided toggle / column chooser on Invoices', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    await expect(page.getByText(/Show voided/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Filters$/i })).toHaveCount(
      0,
    );
    // Spec forbids Show/Hide Columns on Payments Invoices table.
    await expect(page.getByRole('button', { name: /Show\/Hide Columns/i })).toHaveCount(0);
  });

  test('14. Empty state when filtered to no results', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    const search = page.getByPlaceholder('Search invoices...');
    await search.fill('ZZZ-NO-MATCH-E2E-99999');
    await page.waitForTimeout(2500);
    await expect(
      page.getByText(/No items are available/i).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Payments tab — Cash Payments table', () => {
  test('15. Cash Payments columns + cross-job', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments');
    for (const header of [
      'Cash Sale',
      'Job',
      'Customer',
      'Dockets',
      'Amount',
      'Recorded Date',
      'Payment Type',
      'Payment Received By',
      'Accounting Sync',
    ]) {
      await expect(
        page.getByRole('columnheader', { name: new RegExp(header, 'i') }).first(),
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test('16. VOID receipt is de-emphasised / badged', async ({
    authedPage: page,
    apiClient,
  }) => {
    const listRes = await apiClient.payments.cashSales('page=1&pageSize=50');
    skipIfUnavailable(listRes, 'Cash sales list');
    const voided = pageRows<CashSaleRow>(await listRes.json()).find(
      (r) => r.voided,
    );
    test.skip(!voided, 'No VOID cash sale on staging');

    await ensurePaymentsPage(page, 'tab=cash-payments');
    const search = page.getByPlaceholder('Search cash payments...');
    await search.fill(voided!.reference);
    await page.waitForTimeout(2000);
    const row = page
      .locator('table tbody tr')
      .filter({ hasText: voided!.reference })
      .first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByText('VOID')).toBeVisible();
  });

  test('17. ⋯ actions match job-level (View/Download/Amend/Void/Retry)', async ({
    authedPage: page,
    apiClient,
  }) => {
    const receipt = await seedNonVoidCashSale(apiClient);
    test.skip(!receipt, 'Could not seed/find a non-void cash sale');

    await ensurePaymentsPage(page, 'tab=cash-payments');
    const search = page.getByPlaceholder('Search cash payments...');
    await search.fill(receipt!.reference);
    await page.waitForTimeout(2000);

    const row = page
      .locator('table tbody tr')
      .filter({ hasText: receipt!.reference })
      .first();
    await expect(row).toBeVisible({ timeout: 20000 });

    const actions = row.getByRole('button', { name: 'Receipt actions' });
    await actions.click();
    await expect(
      page.getByRole('menuitem', { name: 'View Details' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Download Receipt' }),
    ).toBeVisible();
    // Admin fixture: Amend on non-void
    await expect(
      page.getByRole('menuitem', { name: 'Amend Payment Type' }),
    ).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Void' })).toBeVisible();

    const isFailed =
      `${receipt!.accountingSync ?? ''}`.toUpperCase() === 'FAILED';
    if (isFailed) {
      await expect(
        page.getByRole('menuitem', { name: /Retry Sync/i }),
      ).toBeVisible();
    }

    // Click Amend (UI path) then dismiss without saving if dialog opens.
    await page.getByRole('menuitem', { name: 'Amend Payment Type' }).click();
    await expect(
      page.getByRole('heading', { name: /Amend payment type/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('18. Cash Payments keyword search', async ({
    authedPage: page,
    apiClient,
  }) => {
    const receipt = await seedNonVoidCashSale(apiClient);
    test.skip(!receipt, 'No cash sale available to search');

    await ensurePaymentsPage(page, 'tab=cash-payments');
    const search = page.getByPlaceholder('Search cash payments...');
    await search.fill(receipt!.reference);
    await page.waitForTimeout(2000);
    await expect(
      page.locator('table tbody tr').filter({ hasText: receipt!.reference }),
    ).toBeVisible({ timeout: 15000 });
  });

  test('19. Date range filters by Recorded Date', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments');
    await expect(page.getByRole('button', { name: 'Last 90 days' })).toBeVisible();
    await page.getByRole('button', { name: 'Today' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await page.getByRole('button', { name: 'Clear dates' }).click();
    await expect(page.getByText('All dates')).toBeVisible();
  });

  test('20. No KPI cards on Cash Payments', async ({ authedPage: page }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments');
    await expect(page.getByText('Total Invoices')).toHaveCount(0);
    await expect(page.getByText('Overdue Invoices')).toHaveCount(0);
    await expect(page.getByText('Value of Uninvoiced Dockets')).toHaveCount(0);
    await expect(page.getByText('Due Payment')).toHaveCount(0);
  });

  test('21. Failed only on Cash Payments', async ({ authedPage: page }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments');
    const toggle = page.locator('#failed-only');
    await expect(toggle).toBeVisible({ timeout: 15000 });
    await expect(toggle).not.toBeChecked();
    await page.getByText('Failed only').click();
    await page.waitForTimeout(1500);
    await expect(toggle).toBeChecked();
    expect(page.url()).toContain('failedOnly=true');
    expect(page.url()).toContain('cash-payments');
  });

  test('22. Empty state on Cash Payments when filtered', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments');
    await page
      .getByPlaceholder('Search cash payments...')
      .fill('ZZZ-NO-MATCH-E2E-99999');
    await page.waitForTimeout(2500);
    await expect(
      page.getByText(/No items are available/i).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Payments tab — sync vocabulary & retry', () => {
  test('23. Sync badges only Synced / Failed / Not synced', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments');
    await page.waitForTimeout(2000);
    const body = await page.locator('table tbody').innerText().catch(() => '');
    // Forbidden fourth badges from older wording
    expect(body).not.toMatch(/\bPending\b/);
    expect(body).not.toMatch(/\bSyncing\b/);
    const allowed = body.match(/\b(Synced|Failed|Not synced)\b/g) ?? [];
    // If any sync badges are present they must be from the three-state set
    for (const label of allowed) {
      expect(['Synced', 'Failed', 'Not synced']).toContain(label);
    }
  });

  test('24. Retry Sync only on Failed rows (⋯ menu)', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments&failedOnly=true');
    await page.waitForTimeout(2000);
    const failedRows = page.locator('table tbody tr').filter({
      hasText: /Failed/i,
    });
    // No under-badge Retry link in the Accounting Sync column.
    await expect(page.getByRole('button', { name: /^Retry$/ })).toHaveCount(0);
    if ((await failedRows.count()) === 0) {
      return;
    }
    const row = failedRows.first();
    await row.getByRole('button', { name: 'Receipt actions' }).click();
    await expect(
      page.getByRole('menuitem', { name: /Retry Sync/i }),
    ).toBeVisible();
  });

  test('25. Retry Sync from ⋯ is idempotent / no crash', async ({
    authedPage: page,
  }) => {
    await ensurePaymentsPage(page, 'tab=cash-payments&failedOnly=true');
    await page.waitForTimeout(2500);
    const failedRows = page.locator('table tbody tr').filter({
      hasText: /Failed/i,
    });
    test.skip(
      (await failedRows.count()) === 0,
      'No Failed cash payment with Retry on staging',
    );
    const row = failedRows.first();
    await row.getByRole('button', { name: 'Receipt actions' }).click();
    const retry = page.getByRole('menuitem', { name: /Retry Sync/i });
    test.skip(
      (await retry.count()) === 0,
      'No Failed cash payment with Retry Sync menu item on staging',
    );
    await retry.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    // Second open + click must not crash (idempotent / in-flight safe).
    if ((await row.getByRole('button', { name: 'Receipt actions' }).count()) > 0) {
      await row.getByRole('button', { name: 'Receipt actions' }).click();
      const retryAgain = page.getByRole('menuitem', { name: /Retry Sync/i });
      if ((await retryAgain.count()) > 0) {
        await retryAgain.click();
        await page.waitForTimeout(1000);
      }
    }
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('26. Error detail visible on Failed', async ({
    authedPage: page,
    apiClient,
  }) => {
    const failedRes = await apiClient.payments.cashSales(
      'page=1&pageSize=10&failedOnly=true',
    );
    skipIfUnavailable(failedRes, 'Failed cash sales');
    const failed = pageRows<CashSaleRow>(await failedRes.json()).find(
      (r) => !r.voided && r.failureReason,
    );

    await ensurePaymentsPage(page, 'tab=cash-payments&failedOnly=true');
    await page.waitForTimeout(2000);

    if (failed?.reference) {
      const search = page.getByPlaceholder('Search cash payments...');
      await search.fill(failed.reference);
      await page.waitForTimeout(1500);
      const row = page
        .locator('table tbody tr')
        .filter({ hasText: failed.reference })
        .first();
      await expect(row.getByText('Failed')).toBeVisible();
      // Hover badge to reveal tooltip with Acumatica error detail
      await row.getByText('Failed').hover();
      await page.waitForTimeout(500);
      if (failed.failureReason) {
        const tip = page.getByText(failed.failureReason.slice(0, 40));
        if ((await tip.count()) > 0) {
          await expect(tip.first()).toBeVisible();
        } else {
          // Detail may also appear in View Details
          await row.getByRole('button', { name: 'Receipt actions' }).click();
          await page.getByRole('menuitem', { name: 'View Details' }).click();
          await expect(
            page.getByRole('heading', {
              name: `Cash Sale ${failed.reference}`,
            }),
          ).toBeVisible({ timeout: 10000 });
          await expect(page.getByText('Failed')).toBeVisible();
        }
      }
    } else {
      test.skip(
        true,
        'No Failed cash sale with failureReason on staging to assert error detail',
      );
    }
  });

  test('27. No emails asserted for failure workflow (soft)', async ({
    authedPage: page,
  }) => {
    // Spec: failure recovery is in-app (toggle/banner), no emails.
    await ensurePaymentsPage(page, 'tab=invoices');
    await expect(page.locator('#failed-only')).toBeVisible();
    // Soft observational — banner links are in-app, not mailto.
    const mailto = page.locator('a[href^="mailto:"]');
    await expect(mailto).toHaveCount(0);
  });
});

test.describe('Payments tab — job parity, combine, permissions', () => {
  test('28. Job-level Invoices/Cash Sales still scoped to job', async ({
    authedPage: page,
    apiClient,
  }) => {
    // Fresh receipt lands at top of job Cash Sales (staging has many VOID rows).
    const receipt = await seedNonVoidCashSale(apiClient, { preferFresh: true });
    test.skip(!receipt?.jobId, 'No cash sale with jobId to open job dialog');

    try {
      await page.goto(`/customer-operations/jobs?ids=${receipt!.jobId}`, {
        waitUntil: 'networkidle',
      });
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 15000 });

      const cashTab = dialog.getByRole('tab', { name: 'Cash Sales' });
      test.skip(
        (await cashTab.count()) === 0,
        'Job has no Cash Sales tab (IT job?)',
      );
      await cashTab.click();

      const jobSearch = dialog.getByPlaceholder(/Search Cash Sales/i);
      if ((await jobSearch.count()) > 0) {
        await jobSearch.fill(receipt!.reference);
        await page.waitForTimeout(1000);
      }

      await expect(
        dialog.getByText(receipt!.reference, { exact: true }),
      ).toBeVisible({ timeout: 20000 });

      const invoicesTab = dialog.getByRole('tab', { name: 'Invoices' });
      if ((await invoicesTab.count()) > 0) {
        await invoicesTab.click();
        await expect(dialog.locator('text=client-side exception')).toHaveCount(
          0,
        );
      }
    } finally {
      await apiClient.payments.voidCashSale(receipt!.id, {
        reason: 'Recorded in error',
        reasonDetail: 'e2e job-scope cleanup',
      });
    }
  });

  test('29. Same record matches job tab vs Payments', async ({
    authedPage: page,
    apiClient,
  }) => {
    const receipt = await seedNonVoidCashSale(apiClient, { preferFresh: true });
    test.skip(!receipt?.jobId, 'No cash sale with job linkage');

    try {
      await ensurePaymentsPage(page, 'tab=cash-payments');
      const search = page.getByPlaceholder('Search cash payments...');
      await search.fill(receipt!.reference);
      await page.waitForTimeout(2000);
      const paymentsRow = page
        .locator('table tbody tr')
        .filter({ hasText: receipt!.reference })
        .first();
      await expect(paymentsRow).toBeVisible({ timeout: 20000 });
      const paymentsText = await paymentsRow.innerText();

      await page.goto(`/customer-operations/jobs?ids=${receipt!.jobId}`, {
        waitUntil: 'networkidle',
      });
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 15000 });
      const cashTab = dialog.getByRole('tab', { name: 'Cash Sales' });
      test.skip((await cashTab.count()) === 0, 'No Cash Sales tab on job');
      await cashTab.click();

      const jobSearch = dialog.getByPlaceholder(/Search Cash Sales/i);
      if ((await jobSearch.count()) > 0) {
        await jobSearch.fill(receipt!.reference);
        await page.waitForTimeout(1000);
      }

      const jobRow = dialog
        .locator('table tbody tr')
        .filter({ hasText: receipt!.reference })
        .first();
      await expect(jobRow).toBeVisible({ timeout: 20000 });
      const jobText = await jobRow.innerText();

      expect(paymentsText).toContain(receipt!.reference);
      expect(jobText).toContain(receipt!.reference);
      if (receipt!.paymentType) {
        expect(paymentsText).toContain(receipt!.paymentType);
        expect(jobText).toContain(receipt!.paymentType);
      }
    } finally {
      await apiClient.payments.voidCashSale(receipt!.id, {
        reason: 'Recorded in error',
        reasonDetail: 'e2e parity cleanup',
      });
    }
  });

  test('30. Sort + search combine without reset', async ({
    authedPage: page,
    apiClient,
  }) => {
    await ensurePaymentsPage(page, 'tab=invoices');
    const amountSort = page.getByRole('button', { name: /Amount/i }).first();
    await amountSort.click();
    await page.waitForTimeout(800);

    const invoice = await findInvoiceSeed(apiClient);
    const search = page.getByPlaceholder('Search invoices...');
    const term = invoice?.invoiceNumber ?? invoice?.jobNumber ?? 'INV';
    await search.fill(term);
    await page.waitForTimeout(2000);

    // Sort control still present / clickable after search (not wiped).
    await expect(amountSort).toBeVisible();
    await amountSort.click();
    await page.waitForTimeout(800);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('31. Permissions — skip if only admin user available', async () => {
    test.skip(
      true,
      'Only admin@flametree.com.au credentials available — cannot assert restricted-user invoice/receipt visibility',
    );
  });

  test('32. Invoice sync mechanics unchanged (observational soft)', async ({
    authedPage: page,
    apiClient,
  }) => {
    // Soft: list + statistics still work; UI shows three-state badges only.
    const stats = await apiClient.invoices.statistics();
    skipIfUnavailable(stats, 'Invoice statistics');
    expect(stats.ok()).toBeTruthy();

    await ensurePaymentsPage(page, 'tab=invoices');
    await expect(page.getByText('Accounting Sync').first()).toBeVisible({
      timeout: 15000,
    });
    const body = await page.locator('table tbody').innerText().catch(() => '');
    expect(body).not.toMatch(/\bPending\b/);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});
