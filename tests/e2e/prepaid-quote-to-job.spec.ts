import { test, expect, type ApiClient } from './helpers/fixtures';

/**
 * Prepaid quote → job. Seed from real staging quotes (duplicate / clone lines).
 * Do not skip expected 409 gates — fail if seed cannot be built.
 */

const PAYMENT_REQUIRED_TO_APPROVE =
  'Payment is required before this prepaid quote can be approved';
const PAYMENT_REQUIRED_TO_RAISE_DOCKET =
  'Payment is required before dockets can be raised on this prepaid job';
const COLLECTION_ONLY =
  'Prepaid quotes and jobs can only have Collection line items';
const TOGGLE_LOCKED =
  'Prepay cannot be changed after a cash sale has been recorded';
const PREPAID_CANNOT_DOCKET_CASH_SALE =
  'Prepaid jobs cannot record a cash sale against dockets; payment is already recorded on the job';
const PREPAID_CC_AMEND =
  'Payment type cannot be amended to or from Credit Card on a prepaid cash sale';

interface QuoteRow {
  id: number;
  quoteStatus?: string;
  customerId?: number;
  customerName?: string;
  accountManagerSub?: string;
  accountManagerName?: string;
  projectName?: string;
  expiryDate?: string;
  lineItemsCount?: number;
  inclDeliveryCost?: boolean;
  version?: number;
  prepay?: boolean;
  pricingLocked?: boolean;
  cashSaleReceiptId?: number | null;
  emailRecipients?: string[];
  email?: string;
  phone?: string;
  poNumber?: string;
  totalSellPrice?: number;
  quoteNumber?: string;
}

interface QuoteItemRow {
  id?: number;
  quoteId?: number;
  quoteItemType?: string;
  productName?: string;
  totalProductSellPrice?: number;
  productSellQty?: number;
  [key: string]: unknown;
}

interface JobRow {
  id: number;
  jobStatus?: string;
  jobType?: string;
  projectName?: string;
  customerId?: number;
  contactPersonName?: string;
  contactPersonPhone?: string;
  poNumber?: string;
  emailRecipients?: string[];
  estimatedStartDate?: string;
  startTimeWindow?: string;
  endTimeWindow?: string;
  version?: number;
  prepay?: boolean;
  pricingLocked?: boolean;
  cashSaleReceiptId?: number | null;
}

interface JobItemRow {
  id: number;
  jobItemType?: string;
  type?: string;
  remainingQuantity?: number;
}

interface ReceiptDetail {
  id: number;
  quoteId?: number;
  jobId?: number;
  paymentType?: string;
  materialAmount?: number;
  surchargeAmount?: number;
  paidLineItems?: unknown[];
}

function rowsFrom(data: unknown, keys: string[] = ['content', 'items']): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }
  for (const nestedKey of ['quotes', 'jobs', 'customers', 'jobItems', 'dockets']) {
    const nested = payload[nestedKey];
    if (nested && typeof nested === 'object') {
      const inner = rowsFrom(nested, keys);
      if (inner.length) return inner;
    }
  }
  return [];
}

async function responseText(
  res: { text: () => Promise<string>; json?: () => Promise<unknown> },
): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function futureExpiry(): string {
  return '2027-12-31T00:00:00.000';
}

function localDateTimePlusHours(hours: number): string {
  const d = new Date(Date.now() + hours * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function itemType(item: { quoteItemType?: string; jobItemType?: string; type?: string }): string {
  return `${item.quoteItemType ?? item.jobItemType ?? item.type ?? ''}`.toUpperCase();
}

function quoteWriteBody(
  detail: QuoteRow,
  patch: Partial<QuoteRow> & { projectName: string; prepay?: boolean },
): Record<string, unknown> {
  return {
    customerId: detail.customerId,
    customerName: detail.customerName ?? '',
    email: detail.email ?? '',
    phone: detail.phone ?? '',
    projectName: patch.projectName,
    quoteStatus: 'DRAFT',
    expiryDate: futureExpiry(),
    accountManagerSub:
      detail.accountManagerSub || 'f92e0468-1091-70a9-fe7e-f7ad687c6252',
    accountManagerName: detail.accountManagerName ?? '',
    version: patch.version ?? 1,
    lineItemsCount: patch.lineItemsCount ?? 0,
    inclDeliveryCost: detail.inclDeliveryCost ?? false,
    prepay: Boolean(patch.prepay),
    poNumber: detail.poNumber,
    emailRecipients: ['smita.nair@socoro.com.au'],
  };
}

async function listQuotes(apiClient: ApiClient): Promise<QuoteRow[]> {
  const res = await apiClient.quotations.list('page=1&pageSize=50');
  expect(
    res.ok(),
    `Quote list failed (${res.status()}): ${await responseText(res)}`,
  ).toBeTruthy();
  return rowsFrom(await res.json()) as QuoteRow[];
}

async function getQuote(apiClient: ApiClient, id: number): Promise<QuoteRow> {
  const [detailRes, withRes] = await Promise.all([
    apiClient.quotations.get(id),
    apiClient.quotations.withItems(id),
  ]);
  expect(
    detailRes.ok() || withRes.ok(),
    `GET quote ${id} failed (detail ${detailRes.status()}, items ${withRes.status()})`,
  ).toBeTruthy();
  const detail = detailRes.ok() ? ((await detailRes.json()) as QuoteRow) : ({} as QuoteRow);
  const withItems = withRes.ok()
    ? ((await withRes.json()) as QuoteRow)
    : ({} as QuoteRow);
  return {
    ...withItems,
    ...detail,
    id,
    customerId: withItems.customerId ?? detail.customerId,
    accountManagerSub: withItems.accountManagerSub ?? detail.accountManagerSub,
    accountManagerName: withItems.accountManagerName ?? detail.accountManagerName,
    prepay: detail.prepay ?? withItems.prepay,
    pricingLocked: detail.pricingLocked ?? withItems.pricingLocked,
    cashSaleReceiptId: detail.cashSaleReceiptId ?? withItems.cashSaleReceiptId,
    version: detail.version ?? withItems.version,
  };
}

async function quoteItems(
  apiClient: ApiClient,
  quoteId: number,
): Promise<QuoteItemRow[]> {
  const res = await apiClient.quotations.withItems(quoteId);
  if (!res.ok()) return [];
  const data = await res.json();
  const items = (data as { quoteItems?: QuoteItemRow[] }).quoteItems;
  if (Array.isArray(items)) return items;
  return rowsFrom(data) as QuoteItemRow[];
}

async function classifyQuote(
  apiClient: ApiClient,
  quote: QuoteRow,
): Promise<{ items: QuoteItemRow[]; hasDelivery: boolean; hasCollection: boolean }> {
  const items = await quoteItems(apiClient, quote.id);
  return {
    items,
    hasDelivery: items.some((item) => itemType(item).includes('DELIVERY')),
    hasCollection: items.some((item) => itemType(item).includes('COLLECTION')),
  };
}

function cloneItemForQuote(
  template: QuoteItemRow,
  quoteId: number,
  type: 'COLLECTION' | 'DELIVERY',
): Record<string, unknown> {
  const {
    id: _id,
    quoteId: _quoteId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    createdBy: _createdBy,
    lastModifiedBy: _lastModifiedBy,
    ...rest
  } = template;
  return {
    ...rest,
    quoteId,
    quoteItemType: type,
  };
}

async function putQuote(
  apiClient: ApiClient,
  quote: QuoteRow,
  patch: Partial<QuoteRow>,
) {
  const current = await getQuote(apiClient, quote.id);
  return apiClient.quotations.update(current.id, {
    ...quoteWriteBody(current, {
      projectName: patch.projectName ?? current.projectName ?? 'E2E Prepaid',
      prepay: patch.prepay ?? current.prepay,
      lineItemsCount: current.lineItemsCount,
      version: current.version,
    }),
    quoteStatus: patch.quoteStatus ?? current.quoteStatus,
    version: current.version,
    id: current.id,
  });
}

async function duplicateQuote(
  apiClient: ApiClient,
  source: QuoteRow,
  prepay: boolean,
): Promise<QuoteRow> {
  const fetched = await getQuote(apiClient, source.id);
  const detail: QuoteRow = {
    ...fetched,
    customerId: fetched.customerId ?? source.customerId,
    accountManagerSub: fetched.accountManagerSub ?? source.accountManagerSub,
    accountManagerName: fetched.accountManagerName ?? source.accountManagerName,
    customerName: fetched.customerName ?? source.customerName,
  };
  expect(
    detail.customerId && detail.accountManagerSub,
    `Quote ${source.id} is missing customerId/accountManagerSub (list AM=${source.accountManagerSub}, detail AM=${fetched.accountManagerSub})`,
  ).toBeTruthy();
  const res = await apiClient.quotations.duplicate(
    source.id,
    quoteWriteBody(detail, {
      projectName: `E2E Prepaid ${Date.now()}`,
      prepay,
      lineItemsCount: detail.lineItemsCount ?? 0,
    }),
  );
  expect(
    res.ok(),
    `Duplicate quote ${source.id} failed (${res.status()}): ${await responseText(res)}`,
  ).toBeTruthy();
  const created = (await res.json()) as QuoteRow;
  if (prepay && !created.prepay) {
    const toggled = await putQuote(apiClient, created, { prepay: true });
    expect(
      toggled.ok(),
      `Turning prepay on duplicated quote ${created.id} failed (${toggled.status()}): ${await responseText(toggled)}`,
    ).toBeTruthy();
    return getQuote(apiClient, created.id);
  }
  return getQuote(apiClient, created.id);
}

async function createPrepaidQuoteFromTemplate(
  apiClient: ApiClient,
  template: QuoteRow,
): Promise<QuoteRow> {
  const detail = await getQuote(apiClient, template.id);
  const res = await apiClient.quotations.create(
    quoteWriteBody(detail, {
      projectName: `E2E Prepaid ${Date.now()}`,
      prepay: true,
      lineItemsCount: 0,
    }),
  );
  expect(
    res.ok(),
    `Create prepaid quote failed (${res.status()}): ${await responseText(res)}`,
  ).toBeTruthy();
  return (await res.json()) as QuoteRow;
}

async function ensureCollectionLine(
  apiClient: ApiClient,
  quote: QuoteRow,
  template: QuoteItemRow,
): Promise<void> {
  const existing = await quoteItems(apiClient, quote.id);
  if (existing.some((item) => itemType(item).includes('COLLECTION'))) return;
  const res = await apiClient.quotations.createItem(
    cloneItemForQuote(template, quote.id, 'COLLECTION'),
  );
  expect(
    res.ok(),
    `Clone collection line onto quote ${quote.id} failed (${res.status()}): ${await responseText(res)}`,
  ).toBeTruthy();
}

/** Duplicate a collection-only quote (preferred) or create + clone a collection line. */
async function seedPrepaidCollectionQuote(apiClient: ApiClient): Promise<QuoteRow> {
  const quotes = await listQuotes(apiClient);
  expect(quotes.length, 'Staging has no quotes to seed from').toBeGreaterThan(0);

  let collectionTemplate: QuoteItemRow | null = null;
  for (const quote of quotes) {
    const classified = await classifyQuote(apiClient, quote);
    const sell = classified.items.find(
      (item) =>
        itemType(item).includes('COLLECTION') &&
        Number(item.totalProductSellPrice ?? item.productSellQty ?? 0) > 0,
    );
    if (sell) collectionTemplate = sell;
    if (classified.hasCollection && !classified.hasDelivery) {
      const duplicated = await duplicateQuote(apiClient, quote, true);
      expect(duplicated.prepay).toBe(true);
      return duplicated;
    }
  }

  const created = await createPrepaidQuoteFromTemplate(apiClient, quotes[0]);
  expect(
    collectionTemplate,
    'Staging has no Collection quote line to clone onto a prepaid quote',
  ).toBeTruthy();
  await ensureCollectionLine(apiClient, created, collectionTemplate!);
  return getQuote(apiClient, created.id);
}

async function seedDraftQuoteWithDelivery(apiClient: ApiClient): Promise<QuoteRow> {
  const quotes = await listQuotes(apiClient);
  for (const quote of quotes) {
    const classified = await classifyQuote(apiClient, quote);
    if (classified.hasDelivery) {
      return duplicateQuote(apiClient, quote, false);
    }
  }
  throw new Error('Staging has no quote with a Delivery line item to duplicate');
}

async function voidIfPresent(apiClient: ApiClient, receiptId?: number | null) {
  if (!receiptId) return;
  await apiClient.payments.voidCashSale(receiptId, {
    reason: 'Recorded in error',
    reasonDetail: 'e2e prepaid cleanup',
  });
}

function jobUpdateBody(job: JobRow, prepay: boolean): Record<string, unknown> {
  return {
    version: job.version,
    customerId: job.customerId,
    projectName: job.projectName,
    jobStatus: job.jobStatus,
    poNumber: job.poNumber,
    contactPersonName: job.contactPersonName,
    contactPersonPhone: job.contactPersonPhone,
    emailRecipients: job.emailRecipients ?? [],
    estimatedStartDate: job.estimatedStartDate,
    startTimeWindow: job.startTimeWindow,
    endTimeWindow: job.endTimeWindow,
    prepay,
  };
}

async function findCollectionOnlyJob(
  apiClient: ApiClient,
): Promise<{ job: JobRow; item: JobItemRow } | null> {
  const jobsRes = await apiClient.jobs.list('page=1&pageSize=15');
  expect(
    jobsRes.ok(),
    `Jobs list failed (${jobsRes.status()}): ${await responseText(jobsRes)}`,
  ).toBeTruthy();
  const jobs = rowsFrom(await jobsRes.json()) as JobRow[];
  for (const row of jobs.slice(0, 8)) {
    if (`${row.jobType ?? ''}`.toUpperCase() === 'INTERNAL_TRANSFER') continue;
    const detailRes = await apiClient.jobs.get(row.id);
    if (!detailRes.ok()) continue;
    const detail = (await detailRes.json()) as JobRow;
    if (detail.pricingLocked || detail.cashSaleReceiptId) continue;
    const itemsRes = await apiClient.jobs.jobItems(row.id);
    if (!itemsRes.ok()) continue;
    const items = rowsFrom(await itemsRes.json()) as JobItemRow[];
    const hasDelivery = items.some((item) => itemType(item).includes('DELIVERY'));
    const collection = items.find((item) => itemType(item).includes('COLLECTION'));
    if (hasDelivery || !collection) continue;
    return { job: detail, item: collection };
  }
  return null;
}

async function markCollectionCollected(
  apiClient: ApiClient,
  docketId: number,
): Promise<boolean> {
  const ready = await apiClient.dockets.updateStatus(docketId, {
    docketStatus: 'READY_FOR_COLLECTION',
  });
  if (!ready.ok() && ready.status() !== 400 && ready.status() !== 409) {
    return false;
  }
  const collected = await apiClient.dockets.updateStatus(docketId, {
    docketStatus: 'COLLECTED',
    receiverName: 'E2E Prepaid Seed',
  });
  return collected.ok();
}

async function ensureCollectedCollectionDockets(
  apiClient: ApiClient,
): Promise<Array<{ id: number; jobId?: number }>> {
  const collectedRes = await apiClient.dockets.table(
    'page=1&pageSize=50&types=COLLECTION&statuses=COLLECTED',
  );
  const collected = collectedRes.ok()
    ? (rowsFrom(await collectedRes.json()) as Array<{ id: number; jobId?: number }>)
    : [];
  if (collected.length) return collected;

  const readyRes = await apiClient.dockets.table(
    'page=1&pageSize=20&types=COLLECTION&statuses=READY_FOR_COLLECTION',
  );
  const prepRes = await apiClient.dockets.table(
    'page=1&pageSize=20&types=COLLECTION&statuses=PREPARING',
  );
  const candidates = [
    ...(readyRes.ok() ? (rowsFrom(await readyRes.json()) as Array<{ id: number }>) : []),
    ...(prepRes.ok() ? (rowsFrom(await prepRes.json()) as Array<{ id: number }>) : []),
  ];
  for (const row of candidates.slice(0, 5)) {
    await markCollectionCollected(apiClient, row.id);
  }
  const after = await apiClient.dockets.table(
    'page=1&pageSize=50&types=COLLECTION&statuses=COLLECTED',
  );
  return after.ok()
    ? (rowsFrom(await after.json()) as Array<{ id: number; jobId?: number }>)
    : [];
}

async function findPickupAddress(
  apiClient: ApiClient,
): Promise<Record<string, unknown>> {
  const fallback = {
    locationType: 'ADDRESS',
    formattedAddress: 'E2E prepaid pickup',
    city: 'Suva',
    country: 'Fiji',
  };
  const tableRes = await apiClient.dockets.table('page=1&pageSize=20');
  if (!tableRes.ok()) return fallback;
  const dockets = rowsFrom(await tableRes.json()) as Array<{ id: number }>;
  for (const row of dockets.slice(0, 10)) {
    const detailRes = await apiClient.dockets.get(row.id);
    if (!detailRes.ok()) continue;
    const detail = (await detailRes.json()) as {
      pickUpAddress?: Record<string, unknown>;
    };
    if (detail.pickUpAddress) {
      return {
        ...detail.pickUpAddress,
        locationType:
          detail.pickUpAddress.locationType === 'COORDINATES'
            ? 'COORDINATES'
            : 'ADDRESS',
      };
    }
  }
  return fallback;
}

test.describe('Prepaid quote to job - API', () => {
  test('creating a quote with prepay true stores the flag', async ({
    apiClient,
  }) => {
    const created = await seedPrepaidCollectionQuote(apiClient);
    expect(created.prepay).toBe(true);
    expect(created.pricingLocked ?? false).toBe(false);
  });

  test('turning prepay on is rejected when Delivery line items exist', async ({
    apiClient,
  }) => {
    const draft = await seedDraftQuoteWithDelivery(apiClient);
    const res = await putQuote(apiClient, draft, { prepay: true });
    expect(res.status()).toBe(409);
    expect(await responseText(res)).toContain(
      'Prepay cannot be turned on while Delivery line items exist',
    );
  });

  test('prepaid quotes reject Delivery line items', async ({ apiClient }) => {
    const quote = await seedPrepaidCollectionQuote(apiClient);
    const quotes = await listQuotes(apiClient);
    let delivery: QuoteItemRow | null = null;
    for (const row of quotes) {
      const items = await quoteItems(apiClient, row.id);
      delivery =
        items.find((item) => itemType(item).includes('DELIVERY')) ?? null;
      if (delivery) break;
    }
    expect(delivery, 'Staging has no Delivery line item template').toBeTruthy();
    const res = await apiClient.quotations.createItem(
      cloneItemForQuote(delivery!, quote.id, 'DELIVERY'),
    );
    expect(res.status()).toBe(409);
    expect(await responseText(res)).toContain(COLLECTION_ONLY);
  });

  test('approving an unpaid prepaid quote is blocked', async ({ apiClient }) => {
    const quote = await seedPrepaidCollectionQuote(apiClient);
    const pending = await putQuote(apiClient, quote, {
      quoteStatus: 'PENDING',
      prepay: true,
    });
    expect(
      pending.ok(),
      `Could not move prepaid quote to PENDING (${pending.status()}): ${await responseText(pending)}`,
    ).toBeTruthy();
    const pendingQuote = (await pending.json()) as QuoteRow;
    const decision = await apiClient.quotations.decision(pendingQuote.id, {
      status: 'APPROVED',
      decisionMakerName: 'E2E Prepaid',
    });
    expect([409, 400, 500]).toContain(decision.status());
    expect(await responseText(decision)).toContain(PAYMENT_REQUIRED_TO_APPROVE);
  });

  test('Record Cash Sale locks the quote and applies a 3.75% CC surcharge', async ({
    apiClient,
  }) => {
    const quote = await seedPrepaidCollectionQuote(apiClient);
    const cash = await apiClient.payments.createPrepaidQuoteCashSale(
      quote.id,
      'Cash',
    );
    expect(
      cash.ok(),
      `Cash prepaid sale failed (${cash.status()}): ${await responseText(cash)}`,
    ).toBeTruthy();
    const cashReceipt = (await cash.json()) as ReceiptDetail;
    expect(cashReceipt.quoteId).toBe(quote.id);
    expect(Number(cashReceipt.surchargeAmount ?? 0)).toBe(0);
    expect(Array.isArray(cashReceipt.paidLineItems)).toBeTruthy();

    const paid = await getQuote(apiClient, quote.id);
    expect(paid.pricingLocked).toBe(true);
    expect(paid.cashSaleReceiptId).toBe(cashReceipt.id);

    const toggle = await putQuote(apiClient, paid, { prepay: false });
    expect(toggle.status()).toBe(409);
    expect(await responseText(toggle)).toContain(TOGGLE_LOCKED);

    const amendCc = await apiClient.payments.amendCashSalePaymentType(
      cashReceipt.id,
      'Credit Card',
    );
    expect(amendCc.status()).toBe(409);
    expect(await responseText(amendCc)).toContain(PREPAID_CC_AMEND);

    await voidIfPresent(apiClient, cashReceipt.id);
    const unlocked = await getQuote(apiClient, quote.id);
    expect(unlocked.pricingLocked ?? false).toBe(false);

    const cc = await apiClient.payments.createPrepaidQuoteCashSale(
      quote.id,
      'Credit Card',
    );
    expect(
      cc.ok(),
      `Credit Card prepaid sale failed (${cc.status()}): ${await responseText(cc)}`,
    ).toBeTruthy();
    const ccReceipt = (await cc.json()) as ReceiptDetail;
    const material = Number(ccReceipt.materialAmount ?? 0);
    const surcharge = Number(ccReceipt.surchargeAmount ?? 0);
    expect(material).toBeGreaterThan(0);
    expect(surcharge).toBeCloseTo(Math.round(material * 0.0375 * 100) / 100, 2);

    await voidIfPresent(apiClient, ccReceipt.id);
  });

  test('paid prepaid quote converts to a job that inherits receipt and lock', async ({
    apiClient,
  }) => {
    const quote = await seedPrepaidCollectionQuote(apiClient);
    const cash = await apiClient.payments.createPrepaidQuoteCashSale(
      quote.id,
      'Cash',
    );
    expect(
      cash.ok(),
      `Could not record prepaid cash sale (${cash.status()}): ${await responseText(cash)}`,
    ).toBeTruthy();
    const receipt = (await cash.json()) as ReceiptDetail;

    const pending = await putQuote(apiClient, quote, {
      quoteStatus: 'PENDING',
      prepay: true,
    });
    expect(
      pending.ok(),
      `Could not move quote to PENDING (${pending.status()}): ${await responseText(pending)}`,
    ).toBeTruthy();
    const pendingQuote = (await pending.json()) as QuoteRow;
    const approve = await apiClient.quotations.decision(pendingQuote.id, {
      status: 'APPROVED',
      decisionMakerName: 'E2E Prepaid',
    });
    expect(
      approve.ok(),
      `Could not approve paid prepaid quote (${approve.status()}): ${await responseText(approve)}`,
    ).toBeTruthy();

    const convert = await apiClient.quotations.convertToJob(pendingQuote.id);
    expect(
      convert.ok(),
      `Could not convert quote to job (${convert.status()}): ${await responseText(convert)}`,
    ).toBeTruthy();
    const job = (await convert.json()) as JobRow;
    expect(job.prepay).toBe(true);
    expect(job.pricingLocked).toBe(true);
    expect(job.cashSaleReceiptId).toBe(receipt.id);

    const receiptAfter = await apiClient.payments.cashSale(receipt.id);
    expect(receiptAfter.ok()).toBeTruthy();
    const detail = (await receiptAfter.json()) as ReceiptDetail;
    expect(detail.jobId).toBe(job.id);
  });

  test('unpaid prepaid jobs cannot raise dockets', async ({ apiClient }) => {
    const found = await findCollectionOnlyJob(apiClient);
    expect(found, 'No collection-only job to toggle Prepay on').toBeTruthy();
    const pickup = await findPickupAddress(apiClient);
    const turnedOn = await apiClient.jobs.update(
      found!.job.id,
      jobUpdateBody(found!.job, true),
    );
    expect(
      turnedOn.ok(),
      `Could not turn prepay on for job ${found!.job.id} (${turnedOn.status()}): ${await responseText(turnedOn)}`,
    ).toBeTruthy();

    try {
      const start = localDateTimePlusHours(2);
      const end = localDateTimePlusHours(4);
      const remaining = Number(found!.item.remainingQuantity ?? 1);
      const docketRes = await apiClient.dockets.create({
        jobId: found!.job.id,
        jobItemId: found!.item.id,
        pickUpAddress: pickup,
        deliveryCollectionDate: start,
        deliveryCollectionStartTime: start,
        deliveryCollectionEndTime: end,
        customerContactName: found!.job.contactPersonName || 'E2E Prepaid',
        customerContactPhone: found!.job.contactPersonPhone || '6790000000',
        docketEmailRecipients: ['admin@flametree.com.au'],
        plannedLoadSize: Math.min(1, remaining),
      });
      expect(
        docketRes.status(),
        `Docket create status ${docketRes.status()}: ${await responseText(docketRes)}`,
      ).toBe(409);
      expect(await responseText(docketRes)).toContain(PAYMENT_REQUIRED_TO_RAISE_DOCKET);
    } finally {
      const latestRes = await apiClient.jobs.get(found!.job.id);
      const latest = latestRes.ok()
        ? ((await latestRes.json()) as JobRow)
        : found!.job;
      await apiClient.jobs.update(found!.job.id, jobUpdateBody(latest, false));
    }
  });

  test('docket cash sale is rejected on a prepaid job', async ({ apiClient }) => {
    const dockets = await ensureCollectedCollectionDockets(apiClient);
    expect(dockets.length, 'No COLLECTED collection dockets on staging').toBeGreaterThan(
      0,
    );

    let job: JobRow | null = null;
    let docketIds: number[] = [];
    for (const docket of dockets) {
      const detailRes = await apiClient.dockets.get(docket.id);
      if (!detailRes.ok()) continue;
      const detail = (await detailRes.json()) as {
        job?: JobRow;
        jobId?: number;
        id: number;
      };
      const jobId = detail.job?.id ?? detail.jobId ?? docket.jobId;
      if (!jobId) continue;
      const jobRes = await apiClient.jobs.get(jobId);
      if (!jobRes.ok()) continue;
      const found = (await jobRes.json()) as JobRow;
      if (
        `${found.jobType ?? ''}`.toUpperCase() === 'INTERNAL_TRANSFER' ||
        found.pricingLocked
      ) {
        continue;
      }
      const itemsRes = await apiClient.jobs.jobItems(jobId);
      if (!itemsRes.ok()) continue;
      const items = rowsFrom(await itemsRes.json()) as JobItemRow[];
      if (items.some((item) => itemType(item).includes('DELIVERY'))) continue;
      job = found;
      docketIds = [detail.id];
      break;
    }
    expect(job, 'No collection-only job with a Collected docket').toBeTruthy();

    const turnedOn = await apiClient.jobs.update(job!.id, jobUpdateBody(job!, true));
    expect(
      turnedOn.ok(),
      `Could not mark job ${job!.id} prepaid (${turnedOn.status()}): ${await responseText(turnedOn)}`,
    ).toBeTruthy();

    try {
      const cashSale = await apiClient.payments.createCashSale({
        docketIds,
        paymentType: 'Cash',
      });
      expect(cashSale.status()).toBe(409);
      expect(await responseText(cashSale)).toContain(PREPAID_CANNOT_DOCKET_CASH_SALE);
    } finally {
      const latestRes = await apiClient.jobs.get(job!.id);
      const latest = latestRes.ok() ? ((await latestRes.json()) as JobRow) : job!;
      await apiClient.jobs.update(job!.id, jobUpdateBody(latest, false));
    }
  });
});

test.describe('Prepaid quote to job - UI', () => {
  test('quote form shows Prepay and Record Cash Sale for an unpaid prepaid quote', async ({
    authedPage: page,
    apiClient,
  }) => {
    const quote = await seedPrepaidCollectionQuote(apiClient);
    await page.goto(`/customer-operations/quotation?openQuoteId=${quote.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText('Prepay', { exact: true }).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.getByRole('button', { name: 'Record Cash Sale' }).first(),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('PREPAID').first()).toBeVisible();
  });

  test('prepaid job Cash Sales tab hides Create Cash Sale', async ({
    authedPage: page,
    apiClient,
  }) => {
    const found = await findCollectionOnlyJob(apiClient);
    expect(found, 'No collection-only job for prepaid UI check').toBeTruthy();
    const turnedOn = await apiClient.jobs.update(
      found!.job.id,
      jobUpdateBody(found!.job, true),
    );
    expect(
      turnedOn.ok(),
      `Could not mark job prepaid (${turnedOn.status()}): ${await responseText(turnedOn)}`,
    ).toBeTruthy();
    const prepaid = (await turnedOn.json()) as JobRow;

    try {
      await page.goto(`/customer-operations/jobs?ids=${prepaid.id}`, {
        waitUntil: 'domcontentloaded',
      });
      const cashTab = page.getByRole('tab', { name: /Cash Sales/i });
      await expect(cashTab).toBeVisible({ timeout: 20000 });
      await cashTab.click();
      await expect(page.getByRole('button', { name: 'Create Cash Sale' })).toHaveCount(
        0,
      );
      await expect(page.getByRole('button', { name: 'Create Invoice' })).toHaveCount(
        0,
      );
    } finally {
      const latestRes = await apiClient.jobs.get(prepaid.id);
      const latest = latestRes.ok()
        ? ((await latestRes.json()) as JobRow)
        : prepaid;
      await apiClient.jobs.update(prepaid.id, jobUpdateBody(latest, false));
    }
  });

  test('Payments Cash Payments table has no Prepaid column', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments?tab=cash-payments', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.getByText('Prepaid', { exact: true })).toHaveCount(0);
  });
});
