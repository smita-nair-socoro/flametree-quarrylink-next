import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Logistics
// Verifies drivers, trucks, hauliers, dispatch, schedule
// ============================================================================

test.describe('Logistics - Drivers API', () => {
  test('GET /driver returns list', async ({ apiClient }) => {
    const res = await apiClient.drivers.list('page=0&perPage=10');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

test.describe('Logistics - Trucks API', () => {
  test('GET /truck returns list', async ({ apiClient }) => {
    const res = await apiClient.trucks.list('page=0&perPage=10');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

test.describe('Logistics - Hauliers API', () => {
  test('GET /haulier returns list', async ({ apiClient }) => {
    const res = await apiClient.hauliers.list('page=0&perPage=10');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

test.describe('Logistics - Scheduler API', () => {
  test('GET /scheduler/events returns events for date range', async ({ apiClient }) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const res = await apiClient.scheduler.events(start, end);
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('Logistics - UI', () => {
  test('drivers page loads without error', async ({ authedPage: page }) => {
    await page.goto('/logistics/drivers', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('trucks page loads without error', async ({ authedPage: page }) => {
    await page.goto('/logistics/trucks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('haulier page loads without error', async ({ authedPage: page }) => {
    await page.goto('/logistics/haulier', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('dispatch page loads without error', async ({ authedPage: page }) => {
    await page.goto('/logistics/dispatch', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('schedule page loads without error', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/schedule', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
