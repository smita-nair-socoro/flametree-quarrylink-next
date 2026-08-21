import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Dashboard & Navigation
// Verifies the main dashboard, sidebar navigation, and page routing
// ============================================================================

test.describe('Dashboard', () => {
  test('dashboard page loads after login', async ({ authedPage: page }) => {
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('[data-sidebar="sidebar"], [class*="sidebar"]').first();
    const mainContent = page.locator('main').first();
    await expect(sidebar.or(mainContent)).toBeVisible({ timeout: 15000 });
  });

  test('sidebar displays user info', async ({ authedPage: page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const pageText = await page.locator('body').textContent();
    expect(pageText!.length).toBeGreaterThan(100);

    const hasUserInfo =
      pageText!.includes('flametree') ||
      pageText!.includes('FlameTree') ||
      pageText!.includes('admin@');
    expect(hasUserInfo, 'Page should contain user info').toBeTruthy();
  });
});

test.describe('Navigation', () => {
  test('can navigate to customers from sidebar', async ({ authedPage: page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try clicking a customers link in the sidebar
    const customersLink = page.locator('a[href*="customers"]').first();
    if (await customersLink.count()) {
      await customersLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('customers');
    }
  });

  test('can navigate to products from sidebar', async ({ authedPage: page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const productsLink = page.locator('a[href*="products"]').first();
    if (await productsLink.count()) {
      await productsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('products');
    }
  });

  test('can navigate to jobs from sidebar', async ({ authedPage: page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const jobsLink = page.locator('a[href*="jobs"]').first();
    if (await jobsLink.count()) {
      await jobsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('jobs');
    }
  });
});
