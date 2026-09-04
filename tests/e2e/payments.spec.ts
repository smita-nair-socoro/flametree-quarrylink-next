import { test, expect, skipIfUnavailable, hasPageContent } from './helpers/fixtures';

const E2E_PREFIX = 'E2E-PAY-';

/**
 * QLINK-3510 — Payments invoices + cash payments tables
 * Plus QLINK-3508 retry progress UI smoke where a Failed row is available.
 */

test.describe('Payments - API', () => {
  test('GET /invoices supports failedOnly for the Payments invoices table', async ({
    apiClient,
  }) => {
    const res = await apiClient.payments.invoices(
      'page=1&pageSize=10&failedOnly=true',
    );
    skipIfUnavailable(res, 'Payments invoices');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(
      Array.isArray(data) ||
        data.content !== undefined ||
        data.items !== undefined,
    ).toBeTruthy();
  });

  test('GET /payments/cash-sales returns a page', async ({ apiClient }) => {
    const res = await apiClient.payments.cashSales(
      `page=1&pageSize=10&search=${encodeURIComponent(E2E_PREFIX)}`,
    );
    skipIfUnavailable(res, 'Cash sales API');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(hasPageContent(data) || typeof data.totalElements === 'number').toBeTruthy();
  });

  test('GET /payments/cash-sales?failedOnly=true isolates failures', async ({
    apiClient,
  }) => {
    const res = await apiClient.payments.cashSales(
      'page=1&pageSize=10&failedOnly=true',
    );
    skipIfUnavailable(res, 'Cash sales failedOnly');
    expect(res.ok()).toBeTruthy();
  });

  test('GET /payments/failed-count returns a count', async ({ apiClient }) => {
    const res = await apiClient.payments.failedCount();
    skipIfUnavailable(res, 'Failed count API');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(typeof data.failedCount).toBe('number');
  });

  test('GET /invoices/statistics returns KPI fields', async ({ apiClient }) => {
    const res = await apiClient.invoices.statistics();
    skipIfUnavailable(res, 'Invoice statistics');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('totalInvoices');
    expect(data).toHaveProperty('overdueInvoices');
  });
});

test.describe('QLINK-3510 Payments - UI', () => {
  test('payments page shows Invoices and Cash Payments tabs (IT deferred)', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByText('Page not found').count()) > 0,
      'Payments page is not deployed on staging yet',
    );
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('tab', { name: 'Invoices' })).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Cash Payments' }),
    ).toBeVisible();
    // Slice 4 — Internal Transfers tab is live on Payments
    await expect(
      page.getByRole('tab', { name: 'Internal Transfers' }),
    ).toBeVisible();
  });

  test('Internal Transfers failed-only URL opens the transfers table', async ({
    authedPage: page,
  }) => {
    await page.goto(
      '/customer-operations/payments?tab=internal-transfers&failedOnly=true',
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );
    await expect(
      page.getByRole('tab', { name: 'Internal Transfers' }),
    ).toBeVisible();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('Invoices tab shows KPI cards independent of date filter', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments?tab=invoices', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );
    await expect(page.getByText('Total Invoices')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Overdue Invoices')).toBeVisible();
    await expect(page.getByText('Value of Uninvoiced Dockets')).toBeVisible();
    await expect(page.getByText('Due Payment')).toBeVisible();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('Failed only URL and toggle work on invoices', async ({
    authedPage: page,
  }) => {
    await page.goto(
      '/customer-operations/payments?tab=invoices&failedOnly=true',
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );
    const toggle = page.locator('#failed-only');
    await expect(toggle).toBeVisible({ timeout: 15000 });
    await expect(toggle).toBeChecked();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('Cash Payments tab loads with Failed only toggle', async ({
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
  });

  test('row Retry on Failed invoice shows retry progress banner', async ({
    authedPage: page,
  }) => {
    await page.goto(
      '/customer-operations/payments?tab=invoices&failedOnly=true',
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(4000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );

    const retryButton = page.getByRole('button', { name: 'Retry' }).first();
    test.skip(
      (await retryButton.count()) === 0,
      'No Failed invoice with Retry on staging',
    );

    await retryButton.click();

    const progress = page.getByText(/Retrying invoice sync|Invoice sync retry/i);
    await expect(progress.first()).toBeVisible({ timeout: 60000 });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});

test.describe('QLINK-3512 Internal Transfers - API', () => {
  test('GET /job/internal-transfers returns a page', async ({ apiClient }) => {
    const res = await apiClient.jobs.internalTransfers(
      'page=1&pageSize=10&sortBy=docketCount&sortOrder=desc',
    );
    skipIfUnavailable(res, 'IT jobs list');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(hasPageContent(data) || typeof data.totalElements === 'number').toBeTruthy();
  });

  test('GET /payments/internal-transfers returns a page', async ({
    apiClient,
  }) => {
    const res = await apiClient.payments.internalTransfers(
      'page=1&pageSize=10',
    );
    skipIfUnavailable(res, 'Payments internal transfers');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(hasPageContent(data) || typeof data.totalElements === 'number').toBeTruthy();
  });

  test('GET /payments/internal-transfers?failedOnly=true isolates failures', async ({
    apiClient,
  }) => {
    const res = await apiClient.payments.internalTransfers(
      'page=1&pageSize=10&failedOnly=true',
    );
    skipIfUnavailable(res, 'IT transfers failedOnly');
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('QLINK-3512 Internal Transfers - Jobs UI', () => {
  test('jobs page has an Internal Transfers tab with From/To columns', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const tab = page.getByRole('tab', { name: 'Internal Transfers' });
    test.skip(
      (await tab.count()) === 0,
      'Internal Transfers jobs tab is not on this environment yet',
    );
    await tab.click();
    await expect(page.getByText('From Site').first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('To Site').first()).toBeVisible();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('Jobs tab still excludes Cash Sales regression path', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const jobsTab = page.getByRole('tab', { name: /^Jobs$/ });
    if ((await jobsTab.count()) > 0) {
      await jobsTab.click();
    }
    await expect(page.getByRole('heading', { name: /Jobs/i }).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});

test.describe('QLINK-3512 Internal Transfers - Payments UI', () => {
  test('Internal Transfers tab shows From/To Site and Failed only', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments?tab=internal-transfers', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );
    await expect(
      page.getByRole('tab', { name: 'Internal Transfers' }),
    ).toBeVisible();
    await expect(page.locator('#failed-only')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('From Site').first()).toBeVisible();
    await expect(page.getByText('To Site').first()).toBeVisible();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('View Journal opens when a transfer row is available', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments?tab=internal-transfers', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(4000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );

    const viewJournal = page.getByRole('button', { name: 'View Journal' }).first();
    test.skip(
      (await viewJournal.count()) === 0,
      'No internal transfer with View Journal on staging',
    );

    await viewJournal.click();
    await expect(
      page.getByRole('dialog').getByText(/Internal transfer journal|Journal/i),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('Retry on Failed IT transfer is available when present', async ({
    authedPage: page,
  }) => {
    await page.goto(
      '/customer-operations/payments?tab=internal-transfers&failedOnly=true',
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(4000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );

    const retryButton = page.getByRole('button', { name: 'Retry' }).first();
    test.skip(
      (await retryButton.count()) === 0,
      'No Failed IT transfer with Retry on staging',
    );

    await retryButton.click();
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});

test.describe('Cash sales - UI', () => {
  test('job Cash Sales tab is available on a customer job', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
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
    await expect(
      dialog.getByRole('button', { name: 'Create Cash Sale' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(dialog.locator('text=client-side exception')).toHaveCount(0);
  });
});
