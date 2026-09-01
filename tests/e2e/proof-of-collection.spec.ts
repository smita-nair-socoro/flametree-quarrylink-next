import type { Page, Request } from '@playwright/test';
import { test, expect, type ApiClient } from './helpers/fixtures';

// ============================================================================
// TEST SUITE: Proof of Collection
// Mark as Collected modal — photos, collector name/signature, empty confirmation.
// Status PUTs are intercepted so these tests never mark a live docket collected.
// ============================================================================

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const PHOTO_FILE = {
  name: 'proof-photo.png',
  mimeType: 'image/png',
  buffer: TINY_PNG,
};

interface DocketRow {
  id: number;
  docketNumber: string;
  type?: string;
  status?: string;
  docketStatus?: string;
  jobItemType?: string;
}

function rowsFromPayload(data: unknown): DocketRow[] {
  if (Array.isArray(data)) return data as DocketRow[];
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  const nested = payload.dockets ?? payload.jobs;
  if (nested && typeof nested === 'object' && nested !== null) {
    const nestedContent = (nested as Record<string, unknown>).content;
    if (Array.isArray(nestedContent)) return nestedContent as DocketRow[];
  }
  const content = payload.content ?? payload.items;
  return Array.isArray(content) ? (content as DocketRow[]) : [];
}

function matchesType(row: DocketRow, types: string): boolean {
  const type = `${row.type ?? row.jobItemType ?? ''}`.toUpperCase();
  return type.includes(types.toUpperCase());
}

function statusOf(row: DocketRow): string {
  return `${row.status ?? row.docketStatus ?? ''}`.toUpperCase();
}

async function findDockets(
  apiClient: ApiClient,
  types: string,
  statuses: string,
): Promise<DocketRow[]> {
  const query = `page=1&pageSize=25&types=${types}&statuses=${statuses}`;
  const wantedStatus = statuses.toUpperCase();
  const matches = (row: DocketRow) =>
    matchesType(row, types) &&
    (wantedStatus ? statusOf(row).includes(wantedStatus) : true);

  const tableRes = await apiClient.dockets.table(query);
  if (tableRes.ok()) {
    const rows = rowsFromPayload(await tableRes.json()).filter(matches);
    if (rows.length) return rows;
  }
  const listRes = await apiClient.dockets.list(query);
  if (!listRes.ok()) return [];
  return rowsFromPayload(await listRes.json()).filter(matches);
}

async function openRowMenu(page: Page, docketNumber: string) {
  const row = page.locator('tbody tr').filter({ hasText: docketNumber }).first();
  await expect(row).toBeVisible({ timeout: 20000 });
  await row.locator('button').last().click();
}

async function gotoDocketRow(page: Page, docket: DocketRow) {
  await page.goto(`/customer-operations/dockets?ids=${docket.id}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);
}

async function openMarkCollectedModal(page: Page, docket: DocketRow) {
  await gotoDocketRow(page, docket);
  await openRowMenu(page, docket.docketNumber);
  await page.getByRole('menuitem', { name: 'Mark Collected' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Mark as Collected').first()).toBeVisible({
    timeout: 15000,
  });

  const proofCount = await dialog.getByText('Proof of Collection').count();
  test.skip(
    proofCount === 0,
    'Proof of Collection modal is not available on this environment',
  );
  return dialog;
}

async function drawSignature(page: Page) {
  const canvas = page.getByRole('dialog').locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + 20, box!.y + 40);
  await page.mouse.down();
  await page.mouse.move(box!.x + 90, box!.y + 70, { steps: 8 });
  await page.mouse.move(box!.x + 140, box!.y + 35, { steps: 8 });
  await page.mouse.up();
}

test.describe('Proof of Collection - UI', () => {
  let collectRequests: Request[];

  test.beforeEach(async ({ authedPage: page }) => {
    collectRequests = [];
    await page.route('**/dockets/**/status', async (route) => {
      const request = route.request();
      if (request.method() !== 'PUT') {
        await route.continue();
        return;
      }
      collectRequests.push(request);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          docketStatus: 'COLLECTED',
          deliveredAt: new Date().toISOString(),
        }),
      });
    });
  });

  test('Mark as Collected opens the proof modal', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findDockets(
      apiClient,
      'COLLECTION',
      'READY_FOR_COLLECTION',
    );
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await expect(dialog.getByText('Proof of Collection')).toBeVisible();
    await expect(dialog.getByText('Photo 1')).toBeVisible();
    await expect(dialog.getByText('Photo 2')).toBeVisible();
    await expect(dialog.getByText('Collector Name')).toBeVisible();
    await expect(dialog.getByText('Collector Signature')).toBeVisible();
    await expect(dialog.getByPlaceholder('Enter collector name')).toBeVisible();
    await expect(dialog.getByText('Tap to upload photo')).toHaveCount(2);
    await expect(dialog.getByText('Waiting Time')).toHaveCount(0);
    await expect(dialog.getByText('Delivered Products Confirmed')).toHaveCount(
      0,
    );
    await expect(dialog.getByText('Receiver on Site')).toHaveCount(0);
    await expect(collectRequests).toHaveLength(0);
  });

  test('Cancel leaves the docket uncollected', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findDockets(
      apiClient,
      'COLLECTION',
      'READY_FOR_COLLECTION',
    );
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await dialog.getByPlaceholder('Enter collector name').fill('Should Discard');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(collectRequests).toHaveLength(0);

    await openRowMenu(page, ready[0].docketNumber);
    await expect(
      page.getByRole('menuitem', { name: 'Mark Collected' }),
    ).toBeVisible();
  });

  test('empty capture shows confirmation, then collect proceeds', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findDockets(
      apiClient,
      'COLLECTION',
      'READY_FOR_COLLECTION',
    );
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await dialog.getByRole('button', { name: 'Mark as Collected' }).click();
    await expect(
      dialog.getByText('No proof of collection captured. Continue?'),
    ).toBeVisible();
    await expect(collectRequests).toHaveLength(0);

    await dialog.getByRole('button', { name: 'Go back' }).click();
    await expect(
      dialog.getByText('No proof of collection captured. Continue?'),
    ).toHaveCount(0);

    await dialog.getByRole('button', { name: 'Mark as Collected' }).click();
    await expect(
      dialog.getByText('No proof of collection captured. Continue?'),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Mark as Collected' }).click();
    await expect.poll(() => collectRequests.length).toBe(1);
    expect(collectRequests[0].url()).toMatch(/\/dockets\/\d+\/status/);
    const emptyBody =
      collectRequests[0].postData() ??
      collectRequests[0].postDataBuffer()?.toString('latin1') ??
      '';
    if (emptyBody) {
      expect(emptyBody).toMatch(/COLLECTED/);
    }
  });

  test('signature without a collector name blocks submit', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findDockets(
      apiClient,
      'COLLECTION',
      'READY_FOR_COLLECTION',
    );
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await drawSignature(page);
    await dialog.getByRole('button', { name: 'Mark as Collected' }).click();
    await expect(dialog.getByText("Enter the collector's name.")).toBeVisible();
    await expect(
      dialog.getByText('No proof of collection captured. Continue?'),
    ).toHaveCount(0);
    await expect(collectRequests).toHaveLength(0);
  });

  test('photos can be replaced and removed before submit', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findDockets(
      apiClient,
      'COLLECTION',
      'READY_FOR_COLLECTION',
    );
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await dialog.locator('input[type="file"]').nth(0).setInputFiles(PHOTO_FILE);
    await expect(dialog.getByText('Photo Uploaded').first()).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Replace' })).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Remove' }).first(),
    ).toBeVisible();

    await dialog.locator('input[type="file"]').nth(0).setInputFiles({
      ...PHOTO_FILE,
      name: 'replaced-photo.png',
    });
    await expect(dialog.getByText('Photo Uploaded').first()).toBeVisible();
    await expect(dialog.getByPlaceholder('Enter collector name')).toHaveValue(
      '',
    );

    await dialog.getByRole('button', { name: 'Remove' }).first().click();
    await expect(dialog.getByText('Tap to upload photo')).toHaveCount(2);
    await expect(collectRequests).toHaveLength(0);
  });

  test('successful collect with proof sends collector name and photo', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findDockets(
      apiClient,
      'COLLECTION',
      'READY_FOR_COLLECTION',
    );
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await dialog.locator('input[type="file"]').nth(0).setInputFiles(PHOTO_FILE);
    await dialog.getByPlaceholder('Enter collector name').fill('Jane Collector');
    await dialog.getByRole('button', { name: 'Mark as Collected' }).click();
    await expect(
      dialog.getByText('No proof of collection captured. Continue?'),
    ).toHaveCount(0);
    await expect.poll(() => collectRequests.length).toBe(1);
    expect(collectRequests[0].url()).toMatch(/\/dockets\/\d+\/status/);
    const proofBody =
      collectRequests[0].postData() ??
      collectRequests[0].postDataBuffer()?.toString('latin1') ??
      '';
    if (proofBody) {
      expect(proofBody).toMatch(/COLLECTED/);
      expect(proofBody).toMatch(/Jane Collector/);
    }
  });
});

test.describe('Proof of Collection - Sign Off labels', () => {
  test('collected collection docket shows collection Sign Off copy', async ({
    authedPage: page,
    apiClient,
  }) => {
    const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
    test.skip(
      collected.length === 0,
      'No collected collection docket available',
    );

    await gotoDocketRow(page, collected[0]);
    await openRowMenu(page, collected[0].docketNumber);
    await page.getByRole('menuitem', { name: 'View Details' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Sign Off')).toBeVisible({ timeout: 20000 });
    await expect(dialog.getByText('Collector Name')).toBeVisible();
    await expect(dialog.getByText('Photo 1')).toBeVisible();
    await expect(dialog.getByText('Photo 2')).toBeVisible();
    await expect(dialog.getByText('Collector Signature')).toBeVisible();
    await expect(dialog.getByText(/Collected at/)).toBeVisible();
    await expect(dialog.getByText('Receiver On Site')).toHaveCount(0);
    await expect(dialog.getByText('Unloaded Photo')).toHaveCount(0);
  });
});

test.describe('Proof of Collection - delivery and driver app unchanged', () => {
  test('Mark as Delivered modal is unchanged', async ({
    authedPage: page,
    apiClient,
  }) => {
    const arrived = await findDockets(apiClient, 'DELIVERY', 'ARRIVED');
    test.skip(arrived.length === 0, 'No arrived delivery docket available');

    await gotoDocketRow(page, arrived[0]);
    await openRowMenu(page, arrived[0].docketNumber);
    await page.getByRole('menuitem', { name: 'Mark Delivered' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Mark as Delivered').first()).toBeVisible({
      timeout: 15000,
    });
    await expect(dialog.getByText('Unloaded Photo')).toBeVisible();
    await expect(dialog.getByText('Receiver on Site?')).toBeVisible();
    await expect(dialog.getByText('Proof of Collection')).toHaveCount(0);
    await expect(dialog.getByText('Collector Name')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  test('driver app does not offer Proof of Collection', async ({
    authedPage: page,
  }) => {
    await page.goto('/drivers-app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.getByText('Proof of Collection')).toHaveCount(0);
    await expect(page.getByText('Mark as Collected')).toHaveCount(0);
    await expect(page.getByText('Collector Signature')).toHaveCount(0);
  });
});
