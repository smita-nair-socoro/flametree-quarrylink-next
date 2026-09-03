import { test, expect } from './helpers/fixtures';

type JobRow = {
  id: number;
  jobNumber: string;
  poNumber?: string;
  poNumbers?: string[];
  quarrySupplierNames?: string[];
  customerDto?: { id?: number; businessName?: string };
  jobStatus?: string;
};

async function listJobs(
  apiClient: {
    jobs: { list: (params?: string) => Promise<{ ok: () => boolean; json: () => Promise<any> }> };
  },
  params = 'page=1&pageSize=50',
) {
  const res = await apiClient.jobs.list(params);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test.describe('Jobs table - Quarry and PO columns', () => {
  test('1 columns visible in correct positions on Jobs tab', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);

    const table = page.locator('table').first();
    test.skip((await table.count()) === 0, 'Jobs table is not visible');

    await expect(
      table.getByRole('columnheader', { name: 'Quarry / Supplier' }),
    ).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'PO' })).toBeVisible();

    const headerTexts = (await table.locator('thead th').allTextContents()).map(
      (text) => text.replace(/\s+/g, ' ').trim(),
    );
    const customerIndex = headerTexts.findIndex((text) => text === 'Customer');
    const quarryIndex = headerTexts.findIndex(
      (text) => text === 'Quarry / Supplier',
    );
    const projectIndex = headerTexts.findIndex(
      (text) => text === 'Project Name',
    );
    const poIndex = headerTexts.findIndex((text) => text === 'PO');
    expect(quarryIndex).toBe(customerIndex + 1);
    expect(poIndex).toBe(projectIndex + 1);
  });

  test('2 single quarry and PO show directly without badge', async ({
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const single = jobs.find(
      (job) =>
        (job.quarrySupplierNames?.length ?? 0) === 1 &&
        (job.poNumbers?.length ?? 0) === 1,
    );
    test.skip(!single, 'No single-value quarry/PO job available');
    expect(single!.quarrySupplierNames![0]).toBeTruthy();
    expect(single!.poNumbers![0]).toBeTruthy();
  });

  test('3 multi quarry shows first +N and hover lists all', async ({
    authedPage: page,
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const multi = jobs.find(
      (job) => (job.quarrySupplierNames?.length ?? 0) > 1,
    );
    test.skip(!multi, 'No multi-quarry job available');

    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Search jobs...').fill(multi!.jobNumber);
    await expect(
      page.locator('table tbody tr').filter({ hasText: multi!.jobNumber }),
    ).toBeVisible({ timeout: 15000 });

    // Close any auto-opened job dialog from deep-links/prior runs.
    if (await page.getByRole('dialog').count()) {
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }

    const cell = page.getByTestId('job-quarry-cell').first();
    await expect(cell).toContainText(multi!.quarrySupplierNames![0]);
    await expect(cell.getByTestId('multi-value-badge')).toHaveText(
      `+${multi!.quarrySupplierNames!.length - 1}`,
    );
    await cell.focus();
    await cell.hover({ force: true });
    const tooltip = page.locator('[data-slot="tooltip-content"], [role="tooltip"]').last();
    await expect(tooltip).toBeVisible({ timeout: 10000 });
    for (const name of multi!.quarrySupplierNames!) {
      await expect(tooltip).toContainText(name);
    }
  });

  test('4 multi PO shows first +N and hover lists all', async ({
    authedPage: page,
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const multi = jobs.find((job) => (job.poNumbers?.length ?? 0) > 1);
    test.skip(!multi, 'No multi-PO job available');

    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Search jobs...').fill(multi!.jobNumber);
    await expect(
      page.locator('table tbody tr').filter({ hasText: multi!.jobNumber }),
    ).toBeVisible({ timeout: 15000 });
    if (await page.getByRole('dialog').count()) {
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }

    const cell = page.getByTestId('job-po-cell').first();
    await expect(cell).toContainText(multi!.poNumbers![0]);
    await expect(cell.getByTestId('multi-value-badge')).toHaveText(
      `+${multi!.poNumbers!.length - 1}`,
    );
    await cell.focus();
    await cell.hover({ force: true });
    const tooltip = page.locator('[data-slot="tooltip-content"], [role="tooltip"]').last();
    await expect(tooltip).toBeVisible({ timeout: 10000 });
    for (const po of multi!.poNumbers!) {
      await expect(tooltip).toContainText(po);
    }
  });

  test('5 API aggregates are distinct (duplicates collapsed)', async ({
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    for (const job of jobs) {
      const quarries = job.quarrySupplierNames ?? [];
      const pos = job.poNumbers ?? [];
      expect(new Set(quarries.map((v) => v.toLowerCase())).size).toBe(
        quarries.length,
      );
      expect(new Set(pos.map((v) => v.toLowerCase())).size).toBe(pos.length);
    }
  });

  test('6 empty quarry/PO cells render em dash', async ({
    authedPage: page,
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const empty = jobs.find(
      (job) =>
        (job.quarrySupplierNames?.length ?? 0) === 0 ||
        (job.poNumbers?.length ?? 0) === 0,
    );
    test.skip(!empty, 'No empty quarry/PO job available');

    await page.goto(`/customer-operations/jobs?ids=${empty!.id}`, {
      waitUntil: 'networkidle',
    });
    if ((empty!.quarrySupplierNames?.length ?? 0) === 0) {
      await expect(page.getByTestId('job-quarry-cell').first()).toHaveText('—');
    }
    if ((empty!.poNumbers?.length ?? 0) === 0) {
      await expect(page.getByTestId('job-po-cell').first()).toHaveText('—');
    }
  });

  test('7 PO case variants treated as same in aggregates', async ({
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    for (const job of jobs) {
      const lower = (job.poNumbers ?? []).map((v) => v.toLowerCase());
      expect(new Set(lower).size).toBe(lower.length);
    }
  });

  test('8 long value truncates and badge stays visible', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    const badge = page.getByTestId('multi-value-badge').first();
    test.skip((await badge.count()) === 0, 'No +N badge available');
    await expect(badge).toBeVisible();
    const truncated = page.locator('[data-testid="job-po-cell"] .truncate, [data-testid="job-quarry-cell"] .truncate').first();
    if ((await truncated.count()) > 0) {
      await expect(truncated).toBeVisible();
    }
  });

  test('9 filter by Quarry/Supplier any-line-item match', async ({
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const withQuarry = jobs.find(
      (job) => (job.quarrySupplierNames?.length ?? 0) > 0,
    );
    const quarry =
      data.quarrySuppliers?.find(
        (option: { name?: string }) =>
          option.name?.toLowerCase() ===
          withQuarry?.quarrySupplierNames?.[0]?.toLowerCase(),
      ) ?? data.quarrySuppliers?.[0];
    test.skip(!withQuarry || !quarry, 'No quarry filter options');
    const filtered = await listJobs(
      apiClient,
      `page=1&pageSize=25&quarrySupplierIds=${quarry.id}`,
    );
    const matched: JobRow[] = filtered.jobs?.content ?? [];
    expect(matched.length).toBeGreaterThan(0);
    expect(
      matched.every((job) =>
        (job.quarrySupplierNames ?? []).some(
          (name) => name.toLowerCase() === String(quarry.name).toLowerCase(),
        ),
      ),
    ).toBeTruthy();
  });

  test('10 filter by PO any-line-item match', async ({ apiClient }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const withPo = jobs.find((job) => (job.poNumbers?.length ?? 0) > 0);
    test.skip(!withPo, 'No job with PO');
    const po = withPo!.poNumbers![0];
    const filtered = await listJobs(
      apiClient,
      `page=1&pageSize=25&poNumbers=${encodeURIComponent(po)}`,
    );
    const matched: JobRow[] = filtered.jobs?.content ?? [];
    expect(matched.length).toBeGreaterThan(0);
    expect(matched.some((job) => job.id === withPo!.id)).toBeTruthy();
    expect(
      matched.every((job) =>
        (job.poNumbers ?? []).some(
          (value) => value.toLowerCase() === po.toLowerCase(),
        ),
      ),
    ).toBeTruthy();
  });

  test('11 multi-select POs OR within filter', async ({ apiClient }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const pos = [
      ...new Set(
        jobs.flatMap((job) => job.poNumbers ?? []).filter(Boolean),
      ),
    ].slice(0, 2);
    test.skip(pos.length < 2, 'Need at least two distinct POs');
    const filtered = await listJobs(
      apiClient,
      `page=1&pageSize=50&poNumbers=${encodeURIComponent(pos[0])}&poNumbers=${encodeURIComponent(pos[1])}`,
    );
    const matched: JobRow[] = filtered.jobs?.content ?? [];
    expect(matched.length).toBeGreaterThan(0);
    expect(
      matched.every((job) =>
        (job.poNumbers ?? []).some((value) =>
          pos.some((po) => po.toLowerCase() === value.toLowerCase()),
        ),
      ),
    ).toBeTruthy();
  });

  test('12 combine PO + Quarry + Status as AND', async ({ apiClient }) => {
    const data = await listJobs(apiClient);
    const quarry = data.quarrySuppliers?.[0];
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const withBoth = jobs.find(
      (job) =>
        (job.poNumbers?.length ?? 0) > 0 &&
        (job.quarrySupplierNames?.length ?? 0) > 0 &&
        job.jobStatus,
    );
    test.skip(!quarry || !withBoth, 'No job with quarry+PO+status');
    const po = withBoth!.poNumbers![0];
    const status = withBoth!.jobStatus!;
    const filtered = await listJobs(
      apiClient,
      `page=1&pageSize=50&quarrySupplierIds=${quarry.id}&poNumbers=${encodeURIComponent(po)}&statuses=${status}`,
    );
    const matched: JobRow[] = filtered.jobs?.content ?? [];
    for (const job of matched) {
      expect(job.jobStatus).toBe(status);
      expect(
        (job.poNumbers ?? []).some(
          (value) => value.toLowerCase() === po.toLowerCase(),
        ),
      ).toBeTruthy();
    }
  });

  test('13 search full/partial PO returns job', async ({
    authedPage: page,
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const withPo = jobs.find((job) => (job.poNumbers?.length ?? 0) > 0);
    test.skip(!withPo, 'No job with PO');
    const po = withPo!.poNumbers![0];
    const partial = po.slice(0, Math.max(3, Math.min(po.length, 6)));

    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Search jobs...').fill(partial);
    await expect(
      page.locator('table tbody tr').filter({ hasText: withPo!.jobNumber }),
    ).toBeVisible({ timeout: 15000 });
  });

  test('14 search quarry/supplier name returns job', async ({
    authedPage: page,
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const withQuarry = jobs.find(
      (job) => (job.quarrySupplierNames?.length ?? 0) > 0,
    );
    test.skip(!withQuarry, 'No job with quarry');
    const quarry = withQuarry!.quarrySupplierNames![0];

    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Search jobs...').fill(quarry);
    await expect(
      page.locator('table tbody tr').filter({ hasText: withQuarry!.jobNumber }),
    ).toBeVisible({ timeout: 15000 });
  });

  test('15 filter secondary PO still returns job with leading cell value', async ({
    apiClient,
  }) => {
    const data = await listJobs(apiClient);
    const jobs: JobRow[] = data.jobs?.content ?? [];
    const multi = jobs.find((job) => (job.poNumbers?.length ?? 0) > 1);
    test.skip(!multi, 'No multi-PO job');
    const secondary = multi!.poNumbers![1];
    const filtered = await listJobs(
      apiClient,
      `page=1&pageSize=25&poNumbers=${encodeURIComponent(secondary)}`,
    );
    const matched: JobRow[] = filtered.jobs?.content ?? [];
    const hit = matched.find((job) => job.id === multi!.id);
    expect(hit).toBeTruthy();
    expect(hit!.poNumbers![0]).toBe(multi!.poNumbers![0]);
  });

  test('16 sort Quarry/Supplier blanks last', async ({ apiClient }) => {
    const asc = await listJobs(
      apiClient,
      'page=1&pageSize=25&sortBy=quarrySupplierName&sortOrder=asc',
    );
    const desc = await listJobs(
      apiClient,
      'page=1&pageSize=25&sortBy=quarrySupplierName&sortOrder=desc',
    );
    for (const payload of [asc, desc]) {
      const jobs: JobRow[] = payload.jobs?.content ?? [];
      const firstEmpty = jobs.findIndex(
        (job) => (job.quarrySupplierNames?.length ?? 0) === 0,
      );
      if (firstEmpty >= 0) {
        expect(
          jobs.slice(firstEmpty).every(
            (job) => (job.quarrySupplierNames?.length ?? 0) === 0,
          ),
        ).toBeTruthy();
      }
    }
  });

  test('17 sort PO blanks last', async ({ apiClient }) => {
    const asc = await listJobs(
      apiClient,
      'page=1&pageSize=25&sortBy=poNumber&sortOrder=asc',
    );
    const desc = await listJobs(
      apiClient,
      'page=1&pageSize=25&sortBy=poNumber&sortOrder=desc',
    );
    for (const data of [asc, desc]) {
      const jobs: JobRow[] = data.jobs?.content ?? [];
      const firstEmpty = jobs.findIndex(
        (job) => (job.poNumbers?.length ?? 0) === 0,
      );
      if (firstEmpty >= 0) {
        expect(
          jobs
            .slice(firstEmpty)
            .every((job) => (job.poNumbers?.length ?? 0) === 0),
        ).toBeTruthy();
      }
    }
  });

  test('18 Show/Hide Columns toggles Quarry and PO', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    const showHide = page.getByRole('button', { name: 'Show/Hide Columns' });
    test.skip((await showHide.count()) === 0, 'Show/Hide Columns missing');

    await showHide.click();
    const poToggle = page.getByRole('menuitemcheckbox', { name: 'PO' });
    await expect(poToggle).toBeChecked();
    await poToggle.click();
    await expect(
      page.locator('table').getByRole('columnheader', { name: 'PO' }),
    ).toHaveCount(0);

    await showHide.click();
    await page.getByRole('menuitemcheckbox', { name: 'PO' }).click();
    await expect(
      page.locator('table').getByRole('columnheader', { name: 'PO' }),
    ).toBeVisible();
  });

  test('19 column preference persists in sessionStorage', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    const showHide = page.getByRole('button', { name: 'Show/Hide Columns' });
    test.skip((await showHide.count()) === 0, 'Show/Hide Columns missing');

    await showHide.click();
    await page.getByRole('menuitemcheckbox', { name: 'PO' }).click();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const keys = Object.keys(sessionStorage);
          return keys.find((key) => key.includes('columnVisibility')) ?? null;
        }),
      )
      .not.toBeNull();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(
      page.locator('table').getByRole('columnheader', { name: 'PO' }),
    ).toHaveCount(0);

    // restore for later tests
    await page.getByRole('button', { name: 'Show/Hide Columns' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'PO' }).click();
  });

  test('20 pagination/search spans full result set', async ({ apiClient }) => {
    const page1 = await listJobs(apiClient, 'page=1&pageSize=5');
    const total = page1.jobs?.totalElements ?? 0;
    test.skip(total <= 5, 'Not enough jobs to verify cross-page search');
    const jobs: JobRow[] = page1.jobs?.content ?? [];
    const withPo = jobs.find((job) => (job.poNumbers?.length ?? 0) > 0);
    test.skip(!withPo, 'No PO on first page');
    const po = withPo!.poNumbers![0];
    const searched = await listJobs(
      apiClient,
      `page=1&pageSize=5&search=${encodeURIComponent(po)}`,
    );
    const matched: JobRow[] = searched.jobs?.content ?? [];
    expect(matched.some((job) => job.id === withPo!.id)).toBeTruthy();
  });

  test('21 PO typeahead lazy + capped, not on page load', async ({
    authedPage: page,
    apiClient,
  }) => {
    const capped = await apiClient.jobs.purchaseOrders('limit=50');
    test.skip(!capped.ok(), `purchase-orders unavailable (${capped.status()})`);
    const list = await capped.json();
    expect(Array.isArray(list)).toBeTruthy();
    expect(list.length).toBeLessThanOrEqual(50);

    const poListUrls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/job/purchase-orders')) {
        poListUrls.push(request.url());
      }
    });
    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    expect(poListUrls).toEqual([]);

    const poChip = page
      .locator('button.border-dashed')
      .filter({ hasText: /^PO/ });
    test.skip((await poChip.count()) === 0, 'PO chip missing');
    await poChip.first().click();
    await expect
      .poll(() => poListUrls.length, { timeout: 10000 })
      .toBeGreaterThan(0);
  });

  test('22 Internal Transfers excluded from Jobs tab', async ({
    authedPage: page,
    apiClient,
  }) => {
    const jobsRes = await apiClient.jobs.list('page=1&pageSize=50');
    expect(jobsRes.ok()).toBeTruthy();
    const jobsData = await jobsRes.json();
    const content: Array<{ jobType?: string; jobNumber?: string }> =
      jobsData.jobs?.content ?? [];
    expect(
      content.every(
        (job) =>
          !job.jobType ||
          String(job.jobType).toUpperCase() !== 'INTERNAL_TRANSFER',
      ),
    ).toBeTruthy();

    await page.goto('/customer-operations/jobs', { waitUntil: 'networkidle' });
    const itTab = page.getByRole('tab', { name: /Internal Transfers/i });
    test.skip((await itTab.count()) === 0, 'IT tab missing');
    await expect(itTab.first()).toBeVisible();
  });

  test('23 existing Status filter and jobNumber sort still work', async ({
    apiClient,
  }) => {
    const data = await listJobs(
      apiClient,
      'page=1&pageSize=10&sortBy=jobNumber&sortOrder=desc',
    );
    expect(Array.isArray(data.statuses)).toBeTruthy();
    expect(Array.isArray(data.customers)).toBeTruthy();
    expect(Array.isArray(data.accountManagers)).toBeTruthy();
    expect(Array.isArray(data.quarrySuppliers)).toBeTruthy();
    expect(data.purchaseOrders).toBeUndefined();

    if (data.statuses?.length) {
      const status = data.statuses[0];
      const filtered = await listJobs(
        apiClient,
        `page=1&pageSize=10&statuses=${status}`,
      );
      const jobs: JobRow[] = filtered.jobs?.content ?? [];
      expect(jobs.every((job) => job.jobStatus === status)).toBeTruthy();
    }
  });
});
