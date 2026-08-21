import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: System
// Verifies user management, accounting, tenant management, MYOB Acumatica
// ============================================================================

test.describe('System - Users API', () => {
  test('GET /user returns list', async ({ apiClient }) => {
    const res = await apiClient.users.list('page=0&perPage=10');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

test.describe('System - Accounting API', () => {
  test('GET /accounting/status returns status', async ({ apiClient }) => {
    const res = await apiClient.accounting.status();
    // May return 200 or 404 depending on configuration
    expect([200, 404]).toContain(res.status());
  });
});

test.describe('System - MYOB Acumatica API', () => {
  test('GET /myob-acumatica/connections returns connections', async ({ apiClient }) => {
    const res = await apiClient.myobAcumatica.connections();
    // May return 200 or 404 depending on configuration
    expect([200, 404]).toContain(res.status());
  });
});

test.describe('System - Departments API', () => {
  test('GET /department returns list', async ({ apiClient }) => {
    const res = await apiClient.departments.list();
    expect([200, 404]).toContain(res.status());
  });
});

test.describe('System - UI', () => {
  test('user management page loads without error', async ({ authedPage: page }) => {
    await page.goto('/system/user-management', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('accounting page loads without error', async ({ authedPage: page }) => {
    await page.goto('/system/accounting', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('tenant management page loads without error', async ({ authedPage: page }) => {
    await page.goto('/system/tenant-management', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('camera page loads without error', async ({ authedPage: page }) => {
    await page.goto('/system/camera', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
