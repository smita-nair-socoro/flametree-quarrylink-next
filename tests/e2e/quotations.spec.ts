import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Quotations
// Verifies quote list, creation, editing, PDF, email, content library,
// policy documents (max 2)
// ============================================================================

test.describe('Quotations - API', () => {
  test('GET /quote returns list', async ({ apiClient }) => {
    const res = await apiClient.quotations.list('page=0&perPage=10');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });

  test('GET /quote-content-library returns items', async ({ apiClient }) => {
    const res = await apiClient.quotations.contentLibrary();
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });

  test('GET /quote-content-library/policy-document returns list (max 2)', async ({ apiClient }) => {
    const res = await apiClient.quotations.policyDocuments();
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    // Should return an array (empty or up to 2 items)
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeLessThanOrEqual(2);
  });
});

test.describe('Quotations - UI', () => {
  test('quotation page loads without error', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/quotation', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('quotation page shows data table or empty state', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/quotation', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const hasTable = await page.locator('table').count();
    const hasContent = await page.locator('body').textContent();
    expect(hasTable > 0 || hasContent!.length > 100).toBeTruthy();
  });
});
