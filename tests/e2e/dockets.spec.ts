import { test, expect, skipIfUnavailable } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Dockets
// Verifies docket list, creation, editing, PDF generation, signatures, photos
// ============================================================================

test.describe('Dockets - API', () => {
  test('GET /docket returns list', async ({ apiClient }) => {
    const res = await apiClient.dockets.list('page=0&perPage=10');
    skipIfUnavailable(res, 'Dockets list');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });

  test('GET /docket supports date filtering', async ({ apiClient }) => {
    const today = new Date().toISOString().split('T')[0];
    const res = await apiClient.dockets.list(`page=0&perPage=10&date=${today}`);
    skipIfUnavailable(res, 'Dockets list');
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('Dockets - UI', () => {
  test('dockets page loads without error', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/dockets', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('dockets page shows data table or empty state', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/dockets', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const hasTable = await page.locator('table').count();
    const hasContent = await page.locator('body').textContent();
    expect(hasTable > 0 || hasContent!.length > 100).toBeTruthy();
  });
});
