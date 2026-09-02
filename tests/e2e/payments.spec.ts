import { test, expect, skipIfUnavailable, hasPageContent } from './helpers/fixtures';

const E2E_PREFIX = 'E2E-PAY-';

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

  test('GET /payments/internal-transfers returns a page', async ({
    apiClient,
  }) => {
    const res = await apiClient.payments.internalTransfers(
      `page=1&pageSize=10&search=${encodeURIComponent(E2E_PREFIX)}`,
    );
    skipIfUnavailable(res, 'Internal transfers API');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(hasPageContent(data) || typeof data.totalElements === 'number').toBeTruthy();
  });

  test('GET /payments/failed-count returns a count', async ({ apiClient }) => {
    const res = await apiClient.payments.failedCount();
    skipIfUnavailable(res, 'Failed count API');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(typeof data.failedCount).toBe('number');
  });
});

test.describe('Payments - UI', () => {
  test('payments page loads invoices table without a client exception', async ({
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
    await expect(
      page.getByRole('tab', { name: 'Internal Transfers' }),
    ).toBeVisible();
  });

  test('Failed only toggle is present on the invoices table', async ({
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
    await expect(page.locator('#failed-only')).toBeVisible({ timeout: 15000 });
    const toggle = page.locator('#failed-only');
    if ((await toggle.count()) > 0) {
      await toggle.click();
    }
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });

  test('Cash Payments tab loads', async ({ authedPage: page }) => {
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

  test('Internal Transfers tab loads and accepts a search query', async ({
    authedPage: page,
  }) => {
    await page.goto(
      `/customer-operations/payments?tab=internal-transfers&search=${encodeURIComponent(E2E_PREFIX)}`,
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByRole('heading', { name: 'Payments' }).count()) === 0,
      'Payments page is not on this environment yet',
    );
    await expect(page.locator('#failed-only')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});

test.describe('Internal Transfers - Jobs UI', () => {
  test('jobs page has an Internal Transfers tab', async ({
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
