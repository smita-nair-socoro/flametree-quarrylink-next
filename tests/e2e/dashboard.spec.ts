import { test, expect } from './helpers/fixtures';

async function expandSidebarGroup(page: import('@playwright/test').Page, title: string) {
  const trigger = page.getByRole('button', { name: title }).first();
  if ((await trigger.count()) === 0) return;
  const expanded = await trigger.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await trigger.click();
  }
}

async function openSidebarLink(page: import('@playwright/test').Page, group: string, name: string, urlPart: string) {
  await expandSidebarGroup(page, group);
  const link = page.getByRole('link', { name, exact: true }).first();
  await expect(link).toBeVisible({ timeout: 15000 });
  await link.click();
  await expect(page).toHaveURL(new RegExp(urlPart), { timeout: 20000 });
}

test.describe('Dashboard', () => {
  test('dashboard page loads after login', async ({ authedPage: page }) => {
    await expect(page.locator('[data-slot="sidebar-inset"]').first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('sidebar displays user info', async ({ authedPage: page }) => {
    await expect(page.locator('[data-sidebar="sidebar"]').first()).toBeVisible({
      timeout: 20000,
    });
    const pageText = (await page.locator('body').textContent()) ?? '';
    expect(pageText.length).toBeGreaterThan(100);
    const hasUserInfo =
      /flametree|Flame Tree|admin@|Welcome back/i.test(pageText);
    expect(hasUserInfo, 'Page should contain user info').toBeTruthy();
  });
});

test.describe('Navigation', () => {
  test('can navigate to customers from sidebar', async ({ authedPage: page }) => {
    await openSidebarLink(
      page,
      'Customer Operations',
      'Customers',
      'customers',
    );
  });

  test('can navigate to products from sidebar', async ({ authedPage: page }) => {
    await openSidebarLink(
      page,
      'Inventory & Production',
      'Products',
      'products',
    );
  });

  test('can navigate to jobs from sidebar', async ({ authedPage: page }) => {
    await openSidebarLink(page, 'Customer Operations', 'Jobs', 'jobs');
  });
});
