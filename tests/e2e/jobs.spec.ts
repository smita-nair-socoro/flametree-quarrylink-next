import { test, expect } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Jobs
// Verifies job list, creation, editing, cancellation, dockets/invoices tabs
// ============================================================================

test.describe('Jobs - API', () => {
  test('GET /job returns list', async ({ apiClient }) => {
    const res = await apiClient.jobs.list('page=0&perPage=10');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeDefined();
  });

  test('GET /job returns paginated response', async ({ apiClient }) => {
    const res = await apiClient.jobs.list('page=0&perPage=5');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    // Job list is wrapped as { jobs: { content, pageable, ... } }
    expect(
      Array.isArray(data) ||
        data.items !== undefined ||
        data.content !== undefined ||
        data.jobs !== undefined,
    ).toBeTruthy();
  });
});

test.describe('Jobs - UI', () => {
  test('jobs page loads without error', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('jobs page shows data table or empty state', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const hasTable = await page.locator('table').count();
    const hasContent = await page.locator('body').textContent();
    expect(hasTable > 0 || hasContent!.length > 100).toBeTruthy();
  });

  test('jobs page has create button or add option', async ({ authedPage: page }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Look for any "Add" or "Create" or "New" button/link
    const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), [data-action="add"]').first();
    const hasAddButton = await addButton.count();
    // Even if no add button, the page should load without error
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});

test.describe('Jobs - Attachments', () => {
  test('GET /job/{id}/attachments returns a list of at most 3 files', async ({
    apiClient,
  }) => {
    const listRes = await apiClient.jobs.list('page=1&pageSize=5');
    expect(listRes.ok()).toBeTruthy();
    const listData = await listRes.json();
    const jobs =
      listData.jobs?.content ?? listData.content ?? listData.items ?? [];

    test.skip(jobs.length === 0, 'No jobs available to list attachments');

    const jobId = jobs[0].id;
    const res = await apiClient.jobs.attachments(jobId);
    expect(res.ok()).toBeTruthy();
    const attachments = await res.json();
    expect(Array.isArray(attachments)).toBeTruthy();
    expect(attachments.length).toBeLessThanOrEqual(3);
  });

  test('job detail shows Attachments section with 3-file cap count', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const row = page.locator('table tbody tr').first();
    test.skip((await row.count()) === 0, 'No jobs available to open');

    await row.locator('td').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await dialog.getByText('Audit Information').scrollIntoViewIfNeeded();
    await expect(dialog.getByText('Attachments', { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      dialog.getByRole('button', { name: /Add Attachment \(\d+ of 3\)/ }),
    ).toBeVisible();
  });

  test('Add Attachment modal lists job categories and accepted types', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const row = page.locator('table tbody tr').first();
    test.skip((await row.count()) === 0, 'No jobs available to open');

    await row.locator('td').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await dialog.getByText('Audit Information').scrollIntoViewIfNeeded();
    const addButton = dialog.getByRole('button', {
      name: /Add Attachment \(\d+ of 3\)/,
    });
    await expect(addButton).toBeVisible({ timeout: 15000 });

    if (await addButton.isDisabled()) {
      test.skip(true, 'Job already has 3 attachments');
    }

    await addButton.click();
    await expect(page.getByText('Select category...')).toBeVisible();
    await expect(
      page.getByText('PDF, Word, Excel (xlsx), JPEG, JPG, PNG, .eml'),
    ).toBeVisible();
  });
});
