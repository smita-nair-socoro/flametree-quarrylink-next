# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flametree.spec.ts >> Logout >> logout clears session and redirects to login
- Location: tests\e2e\flametree.spec.ts:307:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - alert [ref=f1e2]
  - generic [ref=f1e3]:
    - main [ref=f1e4]:
      - paragraph [ref=f1e9]: Loading...
    - region "Notifications alt+T"
```

# Test source

```ts
  220 |     const mainContent = page.locator('main').first();
  221 | 
  222 |     // At least one should be visible
  223 |     await expect(sidebar.or(mainContent)).toBeVisible({ timeout: 15000 });
  224 |   });
  225 | 
  226 |   test('customer operations page loads without client-side error', async ({ page }) => {
  227 |     await loginAsAdmin(page);
  228 | 
  229 |     // Navigate to customers page
  230 |     await page.goto('/customer-operations/customers', { waitUntil: 'networkidle' });
  231 | 
  232 |     // Wait for any API calls to settle
  233 |     await page.waitForTimeout(5000);
  234 | 
  235 |     // Check that no error boundary is shown
  236 |     const errorText = page.locator('text=client-side exception');
  237 |     await expect(errorText).toHaveCount(0);
  238 | 
  239 |     // Check that the page rendered something (not a blank page)
  240 |     const body = page.locator('body');
  241 |     await expect(body).not.toBeEmpty();
  242 |   });
  243 | 
  244 |   test('products page loads without blank screen', async ({ page }) => {
  245 |     await loginAsAdmin(page);
  246 | 
  247 |     // Navigate to products page
  248 |     await page.goto('/inventory/products', { waitUntil: 'networkidle' });
  249 | 
  250 |     // Wait for any API calls to settle
  251 |     await page.waitForTimeout(5000);
  252 | 
  253 |     // Check that no error boundary is shown
  254 |     const errorText = page.locator('text=client-side exception');
  255 |     await expect(errorText).toHaveCount(0);
  256 | 
  257 |     // Check that the page rendered something
  258 |     const body = page.locator('body');
  259 |     await expect(body).not.toBeEmpty();
  260 |   });
  261 | 
  262 |   test('quotation page loads and displays data', async ({ page }) => {
  263 |     await loginAsAdmin(page);
  264 | 
  265 |     // Navigate to quotation page
  266 |     await page.goto('/customer-operations/quotation', { waitUntil: 'networkidle' });
  267 | 
  268 |     // Wait for any API calls to settle
  269 |     await page.waitForTimeout(5000);
  270 | 
  271 |     // Check that no error boundary is shown
  272 |     const errorText = page.locator('text=client-side exception');
  273 |     await expect(errorText).toHaveCount(0);
  274 | 
  275 |     // Check that the page rendered something
  276 |     const body = page.locator('body');
  277 |     await expect(body).not.toBeEmpty();
  278 |   });
  279 | 
  280 |   test('sidebar displays user name and email', async ({ page }) => {
  281 |     await loginAsAdmin(page);
  282 | 
  283 |     await page.waitForLoadState('networkidle');
  284 |     await page.waitForTimeout(5000);
  285 | 
  286 |     // The sidebar should show the user's email or name somewhere.
  287 |     // Note: The sidebar fetches user details from the orchestrator. If the user
  288 |     // doesn't exist in the orchestrator DB, it falls back to the NextAuth session
  289 |     // data (email from the session). We check for the email domain.
  290 |     const pageText = await page.locator('body').textContent();
  291 |     // The page should contain some text (not just raw JS)
  292 |     expect(pageText!.length).toBeGreaterThan(100);
  293 |     // Check for either the email, the name, or "FlameTree" somewhere
  294 |     const hasUserInfo =
  295 |       pageText!.includes('flametree') ||
  296 |       pageText!.includes('FlameTree') ||
  297 |       pageText!.includes('admin@');
  298 |     expect(hasUserInfo, 'Page should contain user info').toBeTruthy();
  299 |   });
  300 | });
  301 | 
  302 | // ============================================================================
  303 | // TEST GROUP: Logout
  304 | // ============================================================================
  305 | 
  306 | test.describe('Logout', () => {
  307 |   test('logout clears session and redirects to login', async ({ page, request }) => {
  308 |     await loginAsAdmin(page);
  309 | 
  310 |     // Trigger logout via the NextAuth signout API endpoint
  311 |     // NextAuth v5 exposes POST /api/auth/signout
  312 |     await request.post(`${BASE_URL}/api/auth/signout`, {
  313 |       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  314 |       data: 'csrfToken=&callbackUrl=/login&json=true',
  315 |     });
  316 | 
  317 |     // Navigate to a protected page - should redirect to login
  318 |     await page.goto('/dashboard', { waitUntil: 'networkidle' });
  319 | 
> 320 |     await page.waitForURL((url) => url.pathname.includes('/login'), {
      |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  321 |       timeout: 15000,
  322 |     });
  323 |   });
  324 | });
  325 | 
```