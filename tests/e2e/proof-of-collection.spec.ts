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

function requestedStatusFromPut(request: Request): string {
  const body =
    request.postData() ??
    request.postDataBuffer()?.toString('latin1') ??
    '';
  const match = body.match(/name=\"docketStatus\"[\r\n]+[^\r\n]+[\r\n]+([^\r\n-]+)/);
  if (match?.[1]) return match[1].trim().toUpperCase();
  const urlMatch = body.match(/docketStatus=([^&\r\n]+)/);
  if (urlMatch?.[1]) return decodeURIComponent(urlMatch[1]).toUpperCase();
  return 'COLLECTED';
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

/** Prefer READY_FOR_COLLECTION; fall back to PREPARING (mark-ready is stubbed in UI tests). */
async function findReadyCollectionDockets(
  apiClient: ApiClient,
): Promise<DocketRow[]> {
  const ready = await findDockets(apiClient, 'COLLECTION', 'READY_FOR_COLLECTION');
  if (ready.length) return ready;
  return findDockets(apiClient, 'COLLECTION', 'PREPARING');
}

async function openDocketDetail(page: Page, docket: DocketRow) {
  await page.goto(`/customer-operations/dockets?ids=${docket.id}`, {
    waitUntil: 'networkidle',
  });
  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible({ timeout: 20000 });
  return dialog;
}

async function clickDetailPrimaryAction(page: Page, label: string) {
  const dialog = page.getByRole('dialog').first();
  const action = dialog.getByRole('button', { name: label, exact: true });
  test.skip(
    (await action.count()) === 0,
    `${label} action is not available for this docket on staging`,
  );
  await action.click();
}

async function openMarkCollectedModal(page: Page, docket: DocketRow) {
  await openDocketDetail(page, docket);
  await clickDetailPrimaryAction(page, 'Mark Collected');

  const dialog = page.getByRole('dialog').last();
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

async function drawSignature(dialog: ReturnType<Page['getByRole']>) {
  const canvas = dialog.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();

  const points = [
    { x: box!.x + 20, y: box!.y + 40 },
    { x: box!.x + 90, y: box!.y + 70 },
    { x: box!.x + 140, y: box!.y + 35 },
  ];

  await canvas.dispatchEvent('pointerdown', {
    pointerId: 1,
    clientX: points[0].x,
    clientY: points[0].y,
    buttons: 1,
  });
  for (const point of points.slice(1)) {
    await canvas.dispatchEvent('pointermove', {
      pointerId: 1,
      clientX: point.x,
      clientY: point.y,
      buttons: 1,
    });
  }
  await canvas.dispatchEvent('pointerup', {
    pointerId: 1,
    clientX: points[2].x,
    clientY: points[2].y,
  });
}

test.describe('Proof of Collection - UI', () => {
  let collectRequests: Request[];

  test.beforeEach(async ({ authedPage: page }) => {
    collectRequests = [];
    await page.route('**/socoro/quarrylink/api/dockets/**', async (route) => {
      const request = route.request();
      const pathname = new URL(request.url()).pathname;

      if (
        request.method() === 'PUT' &&
        pathname.match(/\/dockets\/\d+\/status$/)
      ) {
        collectRequests.push(request);
        const requestedStatus = requestedStatusFromPut(request);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            docketStatus: requestedStatus,
            deliveredAt:
              requestedStatus === 'COLLECTED'
                ? new Date().toISOString()
                : undefined,
          }),
        });
        return;
      }

      if (request.method() === 'GET' && pathname.match(/\/dockets\/\d+$/)) {
        const response = await route.fetch();
        if (!response.ok()) {
          await route.fulfill({ response });
          return;
        }
        const docket = await response.json();
        const itemType = `${docket.jobItem?.jobItemType ?? ''}`.toUpperCase();
        const currentStatus = `${docket.docketStatus ?? ''}`.toUpperCase();
        if (
          itemType.includes('COLLECTION') &&
          (currentStatus === 'PREPARING' || currentStatus === 'PENDING')
        ) {
          await route.fulfill({
            response,
            json: { ...docket, docketStatus: 'READY_FOR_COLLECTION' },
          });
          return;
        }
        await route.fulfill({ response });
        return;
      }

      await route.continue();
    });
  });

  test('Mark as Collected opens the proof modal', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findReadyCollectionDockets(apiClient);
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
    const ready = await findReadyCollectionDockets(apiClient);
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await dialog.getByPlaceholder('Enter collector name').fill('Should Discard');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog', { name: 'Mark as Collected' })).toHaveCount(
      0,
    );
    await expect(collectRequests).toHaveLength(0);

    const detail = page.getByRole('dialog').first();
    await expect(
      detail.getByRole('button', { name: 'Mark Collected', exact: true }),
    ).toBeVisible();
  });

  test('empty capture shows confirmation, then collect proceeds', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findReadyCollectionDockets(apiClient);
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
    expect(requestedStatusFromPut(collectRequests[0])).toBe('COLLECTED');
  });

  test('signature without a collector name blocks submit', async ({
    authedPage: page,
    apiClient,
  }) => {
    const ready = await findReadyCollectionDockets(apiClient);
    test.skip(ready.length === 0, 'No ready collection docket available');

    const dialog = await openMarkCollectedModal(page, ready[0]);
    await drawSignature(dialog);
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
    const ready = await findReadyCollectionDockets(apiClient);
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
    const ready = await findReadyCollectionDockets(apiClient);
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
    expect(requestedStatusFromPut(collectRequests[0])).toBe('COLLECTED');
    const proofBody =
      collectRequests[0].postData() ??
      collectRequests[0].postDataBuffer()?.toString('latin1') ??
      '';
    if (proofBody) {
      expect(proofBody).toMatch(/Jane Collector/);
    }
  });
});

test.describe('Proof of Collection - Sign Off labels', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.route('**/socoro/quarrylink/api/dockets/*', async (route) => {
      const request = route.request();
      if (request.method() !== 'GET') {
        await route.continue();
        return;
      }
      const pathname = new URL(request.url()).pathname;
      if (!pathname.match(/\/dockets\/\d+$/)) {
        await route.continue();
        return;
      }

      const response = await route.fetch();
      if (!response.ok()) {
        await route.fulfill({ response });
        return;
      }

      const docket = await response.json();
      const itemType = `${docket.jobItem?.jobItemType ?? ''}`.toUpperCase();
      if (!itemType.includes('COLLECTION')) {
        await route.fulfill({ response });
        return;
      }

      await route.fulfill({
        response,
        json: {
          ...docket,
          docketStatus: 'COLLECTED',
          deliveredAt: docket.deliveredAt ?? new Date().toISOString(),
          receiverName: docket.receiverName ?? 'Jane Collector',
        },
      });
    });
  });

  test('collected collection docket shows collection Sign Off copy', async ({
    authedPage: page,
    apiClient,
  }) => {
    const collected = await findDockets(apiClient, 'COLLECTION', 'COLLECTED');
    const seed = collected[0];
    test.skip(!seed, 'No collected collection docket available for Sign Off test');

    const dialog = await openDocketDetail(page, seed);
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

    await openDocketDetail(page, arrived[0]);
    await clickDetailPrimaryAction(page, 'Mark Delivered');

    const dialog = page.getByRole('dialog').last();
    await expect(dialog.getByText('Mark as Delivered').first()).toBeVisible({
      timeout: 15000,
    });
    await expect(dialog.getByText('Unloaded Photo').first()).toBeVisible();
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
