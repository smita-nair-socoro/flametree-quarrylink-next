import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Products
// Verifies product list, sync, pricing, reporting
// ============================================================================

test.describe('Products - API', () => {
  test('GET /product returns list', async ({ apiClient }) => {
    const res = await apiClient.products.list('page=0&perPage=10');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
    expect(Array.isArray(data) || data.items !== undefined).toBeTruthy();
  });

  test('GET /product/reporting returns stats', async ({ apiClient }) => {
    const res = await apiClient.products.reporting();
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });

  test('GET /product/sync-status returns valid state', async ({ apiClient }) => {
    const res = await apiClient.products.syncStatus();
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(['IDLE', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).toContain(data.state);
    expect(['PRODUCT', 'CUSTOMER']).toContain(data.entityType);
  });

  test('product sync status is consistently retrievable', async ({ apiClient }) => {
    const res1 = await apiClient.products.syncStatus();
    const res2 = await apiClient.products.syncStatus();
    expect(res1.ok()).toBeTruthy();
    expect(res2.ok()).toBeTruthy();
    const data1 = await res1.json();
    const data2 = await res2.json();
    expect(data1.state).toBe(data2.state);
  });
});

test.describe('Products - UI', () => {
  test('products page loads without error', async ({ authedPage: page }) => {
    await page.goto('/inventory/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('products page shows data table or empty state', async ({ authedPage: page }) => {
    await page.goto('/inventory/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const hasTable = await page.locator('table').count();
    const hasContent = await page.locator('body').textContent();
    expect(hasTable > 0 || hasContent!.length > 100).toBeTruthy();
  });

  test('products page sync progress bar does not cause errors', async ({ authedPage: page }) => {
    await page.goto('/inventory/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // The sync progress bar should not cause any errors
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('text=Error')).toHaveCount(0);
  });
});
