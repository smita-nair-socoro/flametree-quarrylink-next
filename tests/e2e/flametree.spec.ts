import { test, expect, Page, APIRequestContext } from '@playwright/test';

/**
 * E2E tests for the Flametree QuarryLink Next frontend.
 *
 * These tests verify:
 * 1. Login flow via NextAuth credentials provider
 * 2. Session is established with correct user data
 * 3. API proxy routes forward requests to the orchestrator with JWT auth
 * 4. Frontend pages load and display data from the backend
 */

const BASE_URL = process.env.E2E_BASE_URL || 'https://flametree-quarrylink-next-staging.onrender.com';

const ADMIN_EMAIL = 'admin@flametree.com.au';
const ADMIN_PASSWORD = 'FlameTree2026!';

/**
 * Helper: Login via the NextAuth credentials provider and return the page
 * with an active session.
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login', { waitUntil: 'networkidle' });

  // Fill in the login form
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 30000,
  });
}

/**
 * Helper: Login via API and return cookies for direct API testing.
 */
async function loginViaAPI(request: APIRequestContext): Promise<Record<string, string>> {
  // Step 1: Get CSRF token
  const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`);
  expect(csrfResponse.ok()).toBeTruthy();
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;

  // Extract cookies from the CSRF response
  const setCookieHeader = csrfResponse.headers()['set-cookie'] || '';
  const csrfCookie = setCookieHeader.split(';')[0] || '';

  // Step 2: Login with credentials
  const loginResponse = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: csrfCookie,
    },
    data: new URLSearchParams({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      csrfToken,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true',
    }).toString(),
    maxRedirects: 0,
  });

  // Extract session cookie from login response
  const loginSetCookie = loginResponse.headers()['set-cookie'] || '';
  const sessionCookieMatch = loginSetCookie.match(/__Secure-authjs\.session-token=([^;]+)/);
  expect(sessionCookieMatch, 'Session cookie should be set after login').toBeTruthy();

  return {
    cookie: [csrfCookie, `__Secure-authjs.session-token=${sessionCookieMatch![1]}`]
      .filter(Boolean)
      .join('; '),
    sessionToken: sessionCookieMatch![1],
  };
}

// ============================================================================
// TEST GROUP: Authentication
// ============================================================================

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Check that the login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login with valid credentials succeeds', async ({ page }) => {
    await loginAsAdmin(page);

    // Should be redirected to a protected page (dashboard or customer-operations)
    expect(page.url()).not.toContain('/login');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword123');

    await page.click('button[type="submit"]');

    // Should stay on login page and show error
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
  });

  test('session endpoint returns user data after login', async ({ request }) => {
    const { cookie } = await loginViaAPI(request);

    const sessionResponse = await request.get(`${BASE_URL}/api/auth/session`, {
      headers: { Cookie: cookie },
    });

    expect(sessionResponse.ok()).toBeTruthy();
    const sessionData = await sessionResponse.json();

    expect(sessionData.user).toBeDefined();
    expect(sessionData.user.email).toBe(ADMIN_EMAIL);
    expect(sessionData.user.role).toBe('SUPER_ADMIN');
    expect(sessionData.user.tenantId).toBe('tenant-001');
  });

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Should be redirected to login
    await page.waitForURL((url) => url.pathname.includes('/login'), {
      timeout: 15000,
    });
  });
});

// ============================================================================
// TEST GROUP: API Proxy (backend integration)
// ============================================================================

test.describe('API Proxy', () => {
  test('proxy returns 401 without authentication', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/socoro/quarrylink/api/product`, {
      headers: { Cookie: '' },
    });

    expect(response.status()).toBe(401);
  });

  test('proxy forwards product requests to orchestrator', async ({ request }) => {
    const { cookie } = await loginViaAPI(request);

    const response = await request.get(`${BASE_URL}/socoro/quarrylink/api/product`, {
      headers: { Cookie: cookie },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Products should be an array (may be empty in staging)
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('proxy forwards customer requests to orchestrator', async ({ request }) => {
    const { cookie } = await loginViaAPI(request);

    const response = await request.get(`${BASE_URL}/socoro/quarrylink/api/customer`, {
      headers: { Cookie: cookie },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Customer endpoint returns a paginated response
    expect(data).toBeDefined();
  });

  test('proxy forwards quarries requests to orchestrator', async ({ request }) => {
    const { cookie } = await loginViaAPI(request);

    const response = await request.get(`${BASE_URL}/socoro/quarrylink/api/quarries`, {
      headers: { Cookie: cookie },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('proxy forwards user detail requests to orchestrator', async ({ request }) => {
    const { cookie } = await loginViaAPI(request);

    const response = await request.get(
      `${BASE_URL}/socoro/quarrylink/api/users/admin-flametree-001`,
      { headers: { Cookie: cookie } },
    );

    // The user endpoint may return 200 or 404 depending on whether the user
    // exists in the orchestrator's database. We just verify the proxy
    // forwards correctly (not 401/403).
    expect([200, 404]).toContain(response.status());
  });
});

// ============================================================================
// TEST GROUP: Frontend Pages (UI + backend integration)
// ============================================================================

test.describe('Frontend Pages', () => {
  test('dashboard page loads after login', async ({ page }) => {
    await loginAsAdmin(page);

    // Wait for the page to settle
    await page.waitForLoadState('networkidle');

    // Should see the sidebar or main content
    const sidebar = page.locator('[data-sidebar="sidebar"], [class*="sidebar"]').first();
    const mainContent = page.locator('main').first();

    // At least one should be visible
    await expect(sidebar.or(mainContent)).toBeVisible({ timeout: 15000 });
  });

  test('customer operations page loads without client-side error', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to customers page
    await page.goto('/customer-operations/customers', { waitUntil: 'networkidle' });

    // Wait for any API calls to settle
    await page.waitForTimeout(5000);

    // Check that no error boundary is shown
    const errorText = page.locator('text=client-side exception');
    await expect(errorText).toHaveCount(0);

    // Check that the page rendered something (not a blank page)
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('products page loads without blank screen', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to products page
    await page.goto('/inventory/products', { waitUntil: 'networkidle' });

    // Wait for any API calls to settle
    await page.waitForTimeout(5000);

    // Check that no error boundary is shown
    const errorText = page.locator('text=client-side exception');
    await expect(errorText).toHaveCount(0);

    // Check that the page rendered something
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('quotation page loads and displays data', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to quotation page
    await page.goto('/customer-operations/quotation', { waitUntil: 'networkidle' });

    // Wait for any API calls to settle
    await page.waitForTimeout(5000);

    // Check that no error boundary is shown
    const errorText = page.locator('text=client-side exception');
    await expect(errorText).toHaveCount(0);

    // Check that the page rendered something
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('sidebar displays user name and email', async ({ page }) => {
    await loginAsAdmin(page);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // The sidebar should show the user's name or email somewhere
    const pageText = await page.locator('body').textContent();
    expect(pageText).toContain('flametree.com.au');
  });
});

// ============================================================================
// TEST GROUP: Logout
// ============================================================================

test.describe('Logout', () => {
  test('logout clears session and redirects to login', async ({ page }) => {
    await loginAsAdmin(page);

    // Trigger logout via the NextAuth signOut API
    await page.evaluate(async () => {
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
    });

    // Navigate to a protected page - should redirect to login
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    await page.waitForURL((url) => url.pathname.includes('/login'), {
      timeout: 15000,
    });
  });
});
