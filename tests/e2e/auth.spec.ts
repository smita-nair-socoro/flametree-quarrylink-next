import { test, expect, BASE_URL } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Authentication
// Verifies login, session, logout, and protected route access
// ============================================================================

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login with valid credentials succeeds', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@flametree.com.au');
    await page.fill('input[type="password"]', 'FlameTree2026!');
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 30000,
    });
    expect(page.url()).not.toContain('/login');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
  });

  test('session endpoint returns user data after login', async ({ apiClient }) => {
    // Use the raw request to check the session endpoint
    const response = await apiClient['request'].get(`${BASE_URL}/api/auth/session`, {
      headers: { Cookie: apiClient['cookie'] },
    });
    expect(response.ok()).toBeTruthy();
    const sessionData = await response.json();

    expect(sessionData.user).toBeDefined();
    expect(sessionData.user.email).toBe('admin@flametree.com.au');
    expect(sessionData.user.role).toBe('SUPER_ADMIN');
    expect(sessionData.user.tenantId).toBe('tenant-001');
  });

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    // The redirect may go to /login or show a login form
    await page.waitForURL(
      (url) => url.pathname.includes('/login') || url.pathname.includes('/signin'),
      { timeout: 30000 },
    ).catch(() => {
      // If no redirect, check if a login form is shown (some deployments
      // render the login form on the same URL instead of redirecting)
    });
    // Verify we're not on a protected page with content
    const hasLoginForm = await page.locator('input[type="password"]').count();
    expect(hasLoginForm > 0 || page.url().includes('/login') || page.url().includes('/signin')).toBeTruthy();
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@flametree.com.au');
    await page.fill('input[type="password"]', 'FlameTree2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 30000,
    });

    // Trigger logout
    const csrfToken = await page.evaluate(async () => {
      const res = await fetch('/api/auth/csrf');
      const data = await res.json();
      return data.csrfToken;
    });

    await page.evaluate(async (token) => {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `csrfToken=${token}&callbackUrl=/login&json=true`,
      });
    }, csrfToken);

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForURL((url) => url.pathname.includes('/login'), {
      timeout: 30000,
    });
  });
});
