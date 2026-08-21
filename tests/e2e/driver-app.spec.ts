import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Driver App
// Verifies the driver app page loads and is accessible
// ============================================================================

test.describe('Driver App - UI', () => {
  test('driver app page loads without error', async ({ authedPage: page }) => {
    await page.goto('/drivers-app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('driver app page renders content', async ({ authedPage: page }) => {
    await page.goto('/drivers-app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(50);
  });
});

test.describe('Driver App - API', () => {
  test('checklists endpoint is accessible', async ({ apiClient }) => {
    const res = await apiClient.checklists.list();
    expect([200, 404]).toContain(res.status());
  });
});
