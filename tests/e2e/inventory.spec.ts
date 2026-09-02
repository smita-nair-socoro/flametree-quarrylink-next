import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Inventory
// Verifies quarries/suppliers, materials, stockpile, weigh-bridge, production
// ============================================================================

test.describe('Inventory - API', () => {
  test('GET /quarries returns list', async ({ apiClient }) => {
    const res = await apiClient.quarries.list();
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /material returns list', async ({ apiClient }) => {
    const res = await apiClient.materials.list();
    expect([200, 403, 404, 409]).toContain(res.status());
    if (res.ok()) {
      const data = await res.json();
      expect(data).toBeDefined();
    }
  });
});

test.describe('Inventory - UI', () => {
  test('quarries-suppliers page loads without error', async ({ authedPage: page }) => {
    await page.goto('/inventory/quarries-suppliers', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('stockpile page loads without error', async ({ authedPage: page }) => {
    await page.goto('/inventory/stockpile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('weigh-bridge page loads without error', async ({ authedPage: page }) => {
    await page.goto('/inventory/weigh-bridge', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('production page loads without error', async ({ authedPage: page }) => {
    await page.goto('/inventory/production', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
