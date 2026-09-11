import {
  test,
  expect,
  skipIfUnavailable,
  type ApiClient,
} from './helpers/fixtures';

/**
 * Prepaid quote → job: toggle, collection-only, unpaid gates, Record Cash Sale,
 * surcharge, lock, convert inherit, hide docket cash sale, UI Prepay/Record Cash Sale.
 *
 * Do not use skipIfUnavailable on expected 409 prepaid gates — that helper
 * treats 409 as "endpoint missing" and would hide real failures.
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
  accountManagerSub?: string;
  projectName?: string;
  expiryDate?: string;
  lineItemsCount?: number;
  inclDeliveryCost?: boolean;
  version?: number;
  prepay?: boolean;
  pricingLocked?: boolean;
  cashSaleReceiptId?: number | null;
  emailRecipients?: string[];
  quoteNumber?: string;
}

interface QuoteItemRow {
  id?: number;
  quoteId?: number;
  quoteItemType?: string;
  productName?: string;
  totalProductSellPrice?: number;
  productSellQty?: number;
  productSellPrice?: number;
  customerDeliveryAddress?: Record<string, unknown>;
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
}

interface ReceiptDetail {
  id: number;
  quoteId?: number;
  jobId?: number;
  paymentType?: string;
  materialAmount?: number;
  surchargeAmount?: number;
  amount?: number;
  paidLineItems?: unknown[];
  voided?: boolean;
}

function rowsFrom(data: unknown, keys: string[] = ['content', 'items']): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }
  for (const nestedKey of ['quotes', 'jobs', 'customers', 'jobItems']) {
    const nested = payload[nestedKey];
    if (nested && typeof nested === 'object') {
      const inner = rowsFrom(nested, keys);
      if (inner.length) return inner;
    }
  }
  return [];
}

async function responseText(res: { json: () => Promise<unknown> }): Promise<string> {
  try {
    return JSON.stringify(await res.json());
  } catch {
    return '';
  }
}

function asQuote(row: unknown): QuoteRow {
  return row as QuoteRow;
}

async function listQuotes(apiClient: ApiClient): Promise<QuoteRow[]> {
  const res = await apiClient.quotations.list('page=1&pageSize=50');
  if (!res.ok()) return [];
  return rowsFrom(await res.json(), ['content', 'items']).map(asQuote);
}

async function getQuote(apiClient: ApiClient, id: number): Promise<QuoteRow | null> {
  const res = await apiClient.quotations.get(id);
  if (!res.ok()) return null;
  return (await res.json()) as QuoteRow;
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

async function findCollectionItemTemplate(
  apiClient: ApiClient,
): Promise<QuoteItemRow | null> {
  const quotes = await listQuotes(apiClient);
  for (const quote of quotes.slice(0, 20)) {
    const items = await quoteItems(apiClient, quote.id);
    const collection = items.find(
      (item) =>
        `${item.quoteItemType ?? ''}`.toUpperCase() === 'COLLECTION' &&
        Number(item.totalProductSellPrice ?? item.productSellQty ?? 0) > 0,
    );
    if (collection) return collection;
  }
  for (const quote of quotes.slice(0, 20)) {
    const items = await quoteItems(apiClient, quote.id);
    const collection = items.find(
      (item) => `${item.quoteItemType ?? ''}`.toUpperCase() === 'COLLECTION',
    );
    if (collection) return collection;
  }
  return null;
}

async function findDeliveryItemTemplate(
  apiClient: ApiClient,
): Promise<QuoteItemRow | null> {
  const quotes = await listQuotes(apiClient);
  for (const quote of quotes.slice(0, 20)) {
    const items = await quoteItems(apiClient, quote.id);
    const delivery = items.find(
      (item) => `${item.quoteItemType ?? ''}`.toUpperCase() === 'DELIVERY',
    );
    if (delivery) return delivery;
  }
  return null;
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
  const current = (await getQuote(apiClient, quote.id)) ?? quote;
  return apiClient.quotations.update(current.id, {
    ...current,
    ...patch,
    version: current.version,
  });
}

async function createPrepaidDraftQuote(
  apiClient: ApiClient,
): Promise<QuoteRow | null> {
  const quotes = await listQuotes(apiClient);
  const seed =
    quotes.find((q) => q.accountManagerSub && q.customerId) ?? quotes[0];
  if (!seed) return null;
  const detail = (await getQuote(apiClient, seed.id)) ?? seed;
  const expiry =
    detail.expiryDate && new Date(detail.expiryDate).getTime() > Date.now()
      ? detail.expiryDate
      : '2027-12-31T23:59:59';
  const res = await apiClient.quotations.create({
    customerId: detail.customerId,
    projectName: `E2E Prepaid ${Date.now()}`,
    quoteStatus: 'DRAFT',
    expiryDate: expiry,
    accountManagerSub: detail.accountManagerSub,
    lineItemsCount: 0,
    inclDeliveryCost: false,
    version: 0,
    prepay: true,
    emailRecipients: detail.emailRecipients ?? [],
  });
  if (!res.ok()) return null;
  return (await res.json()) as QuoteRow;
}

async function ensureCollectionLine(
  apiClient: ApiClient,
  quote: QuoteRow,
): Promise<boolean> {
  const existing = await quoteItems(apiClient, quote.id);
  if (
    existing.some(
      (item) => `${item.quoteItemType ?? ''}`.toUpperCase() === 'COLLECTION',
    )
  ) {
    return true;
  }
  const template = await findCollectionItemTemplate(apiClient);
  if (!template) return false;
  const res = await apiClient.quotations.createItem(
    cloneItemForQuote(template, quote.id, 'COLLECTION'),
  );
  return res.ok();
}

async function voidIfPresent(apiClient: ApiClient, receiptId?: number | null) {
  if (!receiptId) return;
  await apiClient.payments.voidCashSale(receiptId, {
    reason: 'Recorded in error',
    reasonDetail: 'e2e prepaid cleanup',
  });
}

test.describe('Prepaid quote to job - API', () => {
  test('creating a quote with prepay true stores the flag', async ({
    apiClient,
  }) => {
    const created = await createPrepaidDraftQuote(apiClient);
    if (!created) {
      const list = await apiClient.quotations.list('page=1&pageSize=5');
      skipIfUnavailable(list, 'Quote create/list');
      test.skip(true, 'Could not create a prepaid draft quote on staging');
    }
    const detail = await getQuote(apiClient, created!.id);
    expect(detail?.prepay).toBe(true);
    expect(detail?.pricingLocked ?? false).toBe(false);
  });

  test('turning prepay on is rejected when Delivery line items exist', async ({
    apiClient,
  }) => {
    const quotes = await listQuotes(apiClient);
    test.skip(quotes.length === 0, 'No quotes on staging');
    let target: QuoteRow | null = null;
    for (const quote of quotes.slice(0, 25)) {
      const items = await quoteItems(apiClient, quote.id);
      const hasDelivery = items.some(
        (item) => `${item.quoteItemType ?? ''}`.toUpperCase() === 'DELIVERY',
      );
      const locked = Boolean(quote.pricingLocked);
      if (hasDelivery && !locked && quote.quoteStatus === 'DRAFT') {
        target = (await getQuote(apiClient, quote.id)) ?? quote;
        break;
      }
    }
    test.skip(!target, 'No unlocked DRAFT quote with Delivery lines');
    const res = await putQuote(apiClient, target!, { prepay: true });
    expect(res.status()).toBe(409);
    expect(await responseText(res)).toContain(
      'Prepay cannot be turned on while Delivery line items exist',
    );
  });

  test('prepaid quotes reject Delivery line items', async ({ apiClient }) => {
    const quote = await createPrepaidDraftQuote(apiClient);
    if (!quote) {
      test.skip(true, 'Could not create a prepaid draft quote');
    }
    const delivery = await findDeliveryItemTemplate(apiClient);
    test.skip(!delivery, 'No Delivery line item template on staging');
    const res = await apiClient.quotations.createItem(
      cloneItemForQuote(delivery!, quote!.id, 'DELIVERY'),
    );
    expect(res.status()).toBe(409);
    expect(await responseText(res)).toContain(COLLECTION_ONLY);
  });

  test('approving an unpaid prepaid quote is blocked', async ({ apiClient }) => {
    const quote = await createPrepaidDraftQuote(apiClient);
    if (!quote) {
      test.skip(true, 'Could not create a prepaid draft quote');
    }
    const hasLine = await ensureCollectionLine(apiClient, quote!);
    test.skip(!hasLine, 'Could not add a Collection line item');
    const pending = await putQuote(apiClient, quote!, {
      quoteStatus: 'PENDING',
      prepay: true,
    });
    if (!pending.ok()) {
      test.skip(
        true,
        `Could not move prepaid quote to PENDING (${pending.status()})`,
      );
    }
    const pendingQuote = (await pending.json()) as QuoteRow;
    const approve = await putQuote(apiClient, pendingQuote, {
      quoteStatus: 'APPROVED',
      prepay: true,
    });
    expect(approve.status()).toBe(409);
    expect(await responseText(approve)).toContain(PAYMENT_REQUIRED_TO_APPROVE);

    const decision = await apiClient.quotations.decision(pendingQuote.id, {
      status: 'APPROVED',
      decisionMakerName: 'E2E Prepaid',
    });
    expect([409, 400, 500]).toContain(decision.status());
    expect(await responseText(decision)).toMatch(
      /Payment is required before this prepaid quote can be approved/i,
    );
  });

  test('Record Cash Sale locks the quote and applies a 3.75% CC surcharge', async ({
    apiClient,
  }) => {
    const quote = await createPrepaidDraftQuote(apiClient);
    if (!quote) {
      test.skip(true, 'Could not create a prepaid draft quote');
    }
    const hasLine = await ensureCollectionLine(apiClient, quote!);
    test.skip(!hasLine, 'Could not add a Collection line item');

    const cash = await apiClient.payments.createPrepaidQuoteCashSale(
      quote!.id,
      'Cash',
    );
    expect(
      cash.ok(),
      `Cash prepaid sale failed (${cash.status()}): ${await responseText(cash)}`,
    ).toBeTruthy();
    const cashReceipt = (await cash.json()) as ReceiptDetail;
    expect(cashReceipt.quoteId).toBe(quote!.id);
    expect(Number(cashReceipt.surchargeAmount ?? 0)).toBe(0);
    expect(Array.isArray(cashReceipt.paidLineItems)).toBeTruthy();

    const paid = await getQuote(apiClient, quote!.id);
    expect(paid?.pricingLocked).toBe(true);
    expect(paid?.cashSaleReceiptId).toBe(cashReceipt.id);

    const toggle = await putQuote(apiClient, paid!, { prepay: false });
    expect(toggle.status()).toBe(409);
    expect(await responseText(toggle)).toContain(TOGGLE_LOCKED);

    const amendCc = await apiClient.payments.amendCashSalePaymentType(
      cashReceipt.id,
      'Credit Card',
    );
    expect(amendCc.status()).toBe(409);
    expect(await responseText(amendCc)).toContain(PREPAID_CC_AMEND);

    await voidIfPresent(apiClient, cashReceipt.id);

    const unlocked = await getQuote(apiClient, quote!.id);
    expect(unlocked?.pricingLocked ?? false).toBe(false);

    const cc = await apiClient.payments.createPrepaidQuoteCashSale(
      quote!.id,
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
    expect(surcharge).toBe(Math.round(material * 0.0375 * 100) / 100);

    await voidIfPresent(apiClient, ccReceipt.id);
  });

  test('paid prepaid quote converts to a job that inherits receipt and lock', async ({
    apiClient,
  }) => {
    const quote = await createPrepaidDraftQuote(apiClient);
    if (!quote) {
      test.skip(true, 'Could not create a prepaid draft quote');
    }
    const hasLine = await ensureCollectionLine(apiClient, quote!);
    test.skip(!hasLine, 'Could not add a Collection line item');

    const cash = await apiClient.payments.createPrepaidQuoteCashSale(
      quote!.id,
      'Cash',
    );
    if (!cash.ok()) {
      test.skip(true, `Could not record prepaid cash sale (${cash.status()})`);
    }
    const receipt = (await cash.json()) as ReceiptDetail;

    const pending = await putQuote(apiClient, quote!, {
      quoteStatus: 'PENDING',
      prepay: true,
    });
    if (!pending.ok()) {
      await voidIfPresent(apiClient, receipt.id);
      test.skip(true, `Could not move quote to PENDING (${pending.status()})`);
    }
    const pendingQuote = (await pending.json()) as QuoteRow;
    const approve = await apiClient.quotations.decision(pendingQuote.id, {
      status: 'APPROVED',
      decisionMakerName: 'E2E Prepaid',
    });
    if (!approve.ok()) {
      await voidIfPresent(apiClient, receipt.id);
      test.skip(true, `Could not approve paid prepaid quote (${approve.status()})`);
    }

    const convert = await apiClient.quotations.convertToJob(pendingQuote.id);
    if (!convert.ok()) {
      await voidIfPresent(apiClient, receipt.id);
      test.skip(true, `Could not convert quote to job (${convert.status()})`);
    }
    const job = (await convert.json()) as JobRow;
    expect(job.prepay).toBe(true);
    expect(job.pricingLocked).toBe(true);
    expect(job.cashSaleReceiptId).toBe(receipt.id);

    const receiptAfter = await apiClient.payments.cashSale(receipt.id);
    if (receiptAfter.ok()) {
      const detail = (await receiptAfter.json()) as ReceiptDetail;
      expect(detail.jobId).toBe(job.id);
    }
  });

  test('unpaid prepaid jobs cannot raise dockets', async ({ apiClient }) => {
    const jobsRes = await apiClient.jobs.list('page=1&pageSize=25');
    skipIfUnavailable(jobsRes, 'Jobs list');
    const jobs = rowsFrom(await jobsRes.json()) as JobRow[];
    let target: JobRow | null = null;
    let jobItem: JobItemRow | null = null;
    for (const row of jobs) {
      if (
        `${row.jobType ?? ''}`.toUpperCase() === 'INTERNAL_TRANSFER' ||
        row.pricingLocked ||
        row.cashSaleReceiptId
      ) {
        continue;
      }
      const detailRes = await apiClient.jobs.get(row.id);
      if (!detailRes.ok()) continue;
      const detail = (await detailRes.json()) as JobRow;
      const itemsRes = await apiClient.jobs.jobItems(row.id);
      if (!itemsRes.ok()) continue;
      const items = rowsFrom(await itemsRes.json()) as JobItemRow[];
      const delivery = items.filter((item) =>
        `${item.jobItemType ?? item.type ?? ''}`.toUpperCase().includes('DELIVERY'),
      );
      const collection = items.find((item) =>
        `${item.jobItemType ?? item.type ?? ''}`.toUpperCase().includes('COLLECTION'),
      );
      if (delivery.length === 0 && collection && !detail.pricingLocked) {
        target = detail;
        jobItem = collection;
        break;
      }
    }
    test.skip(!target || !jobItem, 'No collection-only unpaid job to toggle');

    const turnedOn = await apiClient.jobs.update(target!.id, {
      version: target!.version,
      customerId: target!.customerId,
      projectName: target!.projectName,
      jobStatus: target!.jobStatus,
      poNumber: target!.poNumber,
      contactPersonName: target!.contactPersonName,
      contactPersonPhone: target!.contactPersonPhone,
      emailRecipients: target!.emailRecipients ?? [],
      estimatedStartDate: target!.estimatedStartDate,
      startTimeWindow: target!.startTimeWindow,
      endTimeWindow: target!.endTimeWindow,
      prepay: true,
    });
    if (!turnedOn.ok()) {
      test.skip(
        true,
        `Could not turn prepay on for job ${target!.id} (${turnedOn.status()})`,
      );
    }

    try {
      const start = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const end = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      const date = start;
      const docketRes = await apiClient.dockets.create({
        jobId: target!.id,
        jobItemId: jobItem!.id,
        pickUpAddress: {
          locationType: 'QUARRY',
          formattedAddress: 'E2E prepaid pickup',
          city: 'Suva',
          country: 'Fiji',
        },
        deliveryCollectionDate: date,
        deliveryCollectionStartTime: start,
        deliveryCollectionEndTime: end,
        customerContactName: target!.contactPersonName ?? 'E2E',
        customerContactPhone: target!.contactPersonPhone ?? '000',
        docketEmailRecipients: ['e2e@flametree.com.au'],
        plannedLoadSize: 1,
      });
      expect(docketRes.status()).toBe(409);
      expect(await responseText(docketRes)).toContain(
        PAYMENT_REQUIRED_TO_RAISE_DOCKET,
      );
    } finally {
      const latestRes = await apiClient.jobs.get(target!.id);
      const latest = latestRes.ok()
        ? ((await latestRes.json()) as JobRow)
        : target!;
      await apiClient.jobs.update(target!.id, {
        version: latest.version,
        customerId: latest.customerId,
        projectName: latest.projectName,
        jobStatus: latest.jobStatus,
        poNumber: latest.poNumber,
        contactPersonName: latest.contactPersonName,
        contactPersonPhone: latest.contactPersonPhone,
        emailRecipients: latest.emailRecipients ?? [],
        estimatedStartDate: latest.estimatedStartDate,
        startTimeWindow: latest.startTimeWindow,
        endTimeWindow: latest.endTimeWindow,
        prepay: false,
      });
    }
  });

  test('docket cash sale is rejected on a prepaid job', async ({ apiClient }) => {
    const tableRes = await apiClient.dockets.table(
      'page=1&pageSize=50&types=COLLECTION&statuses=COLLECTED',
    );
    if (!tableRes.ok()) {
      skipIfUnavailable(tableRes, 'Collected collection dockets');
    }
    const dockets = rowsFrom(await tableRes.json()) as Array<{
      id: number;
      jobId?: number;
    }>;
    test.skip(dockets.length === 0, 'No COLLECTED collection dockets');

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
      const hasDelivery = items.some((item) =>
        `${item.jobItemType ?? item.type ?? ''}`.toUpperCase().includes('DELIVERY'),
      );
      if (hasDelivery) continue;
      job = found;
      docketIds = [detail.id];
      break;
    }
    test.skip(!job, 'No collection-only job with a Collected docket');

    const turnedOn = await apiClient.jobs.update(job!.id, {
      version: job!.version,
      customerId: job!.customerId,
      projectName: job!.projectName,
      jobStatus: job!.jobStatus,
      poNumber: job!.poNumber,
      contactPersonName: job!.contactPersonName,
      contactPersonPhone: job!.contactPersonPhone,
      emailRecipients: job!.emailRecipients ?? [],
      estimatedStartDate: job!.estimatedStartDate,
      startTimeWindow: job!.startTimeWindow,
      endTimeWindow: job!.endTimeWindow,
      prepay: true,
    });
    if (!turnedOn.ok()) {
      test.skip(true, `Could not mark job ${job!.id} prepaid (${turnedOn.status()})`);
    }

    try {
      const cashSale = await apiClient.payments.createCashSale({
        docketIds,
        paymentType: 'Cash',
      });
      expect(cashSale.status()).toBe(409);
      expect(await responseText(cashSale)).toContain(PREPAID_CANNOT_DOCKET_CASH_SALE);
    } finally {
      const latestRes = await apiClient.jobs.get(job!.id);
      const latest = latestRes.ok()
        ? ((await latestRes.json()) as JobRow)
        : job!;
      await apiClient.jobs.update(job!.id, {
        version: latest.version,
        customerId: latest.customerId,
        projectName: latest.projectName,
        jobStatus: latest.jobStatus,
        poNumber: latest.poNumber,
        contactPersonName: latest.contactPersonName,
        contactPersonPhone: latest.contactPersonPhone,
        emailRecipients: latest.emailRecipients ?? [],
        estimatedStartDate: latest.estimatedStartDate,
        startTimeWindow: latest.startTimeWindow,
        endTimeWindow: latest.endTimeWindow,
        prepay: false,
      });
    }
  });
});

test.describe('Prepaid quote to job - UI', () => {
  test('quote form shows Prepay and Record Cash Sale for an unpaid prepaid quote', async ({
    authedPage: page,
    apiClient,
  }) => {
    const quote = await createPrepaidDraftQuote(apiClient);
    if (!quote) {
      test.skip(true, 'Could not create a prepaid draft quote');
    }
    await ensureCollectionLine(apiClient, quote!);
    await page.goto(
      `/customer-operations/quotation?openQuoteId=${quote!.id}`,
      { waitUntil: 'domcontentloaded' },
    );
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
    const jobsRes = await apiClient.jobs.list('page=1&pageSize=25');
    skipIfUnavailable(jobsRes, 'Jobs list');
    const jobs = rowsFrom(await jobsRes.json()) as JobRow[];
    let target: JobRow | null = null;
    for (const row of jobs) {
      if (`${row.jobType ?? ''}`.toUpperCase() === 'INTERNAL_TRANSFER') continue;
      const detailRes = await apiClient.jobs.get(row.id);
      if (!detailRes.ok()) continue;
      const detail = (await detailRes.json()) as JobRow;
      if (detail.prepay) {
        target = detail;
        break;
      }
    }
    if (!target) {
      for (const row of jobs) {
        if (`${row.jobType ?? ''}`.toUpperCase() === 'INTERNAL_TRANSFER') continue;
        const detailRes = await apiClient.jobs.get(row.id);
        if (!detailRes.ok()) continue;
        const detail = (await detailRes.json()) as JobRow;
        if (detail.pricingLocked) continue;
        const itemsRes = await apiClient.jobs.jobItems(row.id);
        if (!itemsRes.ok()) continue;
        const items = rowsFrom(await itemsRes.json()) as JobItemRow[];
        const hasDelivery = items.some((item) =>
          `${item.jobItemType ?? item.type ?? ''}`.toUpperCase().includes('DELIVERY'),
        );
        if (hasDelivery) continue;
        const turnedOn = await apiClient.jobs.update(detail.id, {
          version: detail.version,
          customerId: detail.customerId,
          projectName: detail.projectName,
          jobStatus: detail.jobStatus,
          poNumber: detail.poNumber,
          contactPersonName: detail.contactPersonName,
          contactPersonPhone: detail.contactPersonPhone,
          emailRecipients: detail.emailRecipients ?? [],
          estimatedStartDate: detail.estimatedStartDate,
          startTimeWindow: detail.startTimeWindow,
          endTimeWindow: detail.endTimeWindow,
          prepay: true,
        });
        if (!turnedOn.ok()) continue;
        target = (await turnedOn.json()) as JobRow;
        break;
      }
    }
    test.skip(!target, 'No prepaid (or collection-only) job for UI check');

    await page.goto(`/customer-operations/jobs?ids=${target!.id}`, {
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
  });

  test('Payments Cash Payments table has no Prepaid column', async ({
    authedPage: page,
  }) => {
    await page.goto('/customer-operations/payments?tab=cash-payments', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);
    test.skip(
      (await page.getByText('Page not found').count()) > 0,
      'Payments page is not on staging',
    );
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
    await expect(page.getByText('Prepaid', { exact: true })).toHaveCount(0);
  });
});
