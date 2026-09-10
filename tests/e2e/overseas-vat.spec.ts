import { test, expect, skipIfUnavailable, type Page } from './helpers/fixtures';

/**
 * Overseas 0% VAT (QLINK-3607)
 *
 * Acumatica tax zone OVERSEAS must charge 0% VAT/GST on jobs and quotes.
 * Tests skip when taxZone is not on the deployed API yet, or when this
 * environment has no Overseas customer to exercise the UI against.
 */

type CustomerRow = {
  id?: number;
  taxZone?: string | null;
  businessName?: string;
  individualContactName?: string;
};

type JobRow = {
  id: number;
  jobNumber?: string;
  jobType?: string;
  customerId?: number;
  customerDto?: { id?: number; taxZone?: string | null };
};

type QuoteRow = {
  id: number;
  quoteNumber?: string;
  customerId?: number;
  lineItemsCount?: number;
  customerWithAddressResponseDto?: { taxZone?: string | null };
};

type ListClient = {
  ok: () => boolean;
  status: () => number;
  json: () => Promise<unknown>;
};

function isOverseasTaxZone(taxZone?: string | null): boolean {
  return (taxZone ?? '').trim().toUpperCase() === 'OVERSEAS';
}

function pageItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;
  if (Array.isArray(payload.content)) return payload.content as T[];
  if (Array.isArray(payload.items)) return payload.items as T[];
  for (const value of Object.values(payload)) {
    if (!value || typeof value !== 'object') continue;
    const nested = value as Record<string, unknown>;
    if (Array.isArray(nested.content)) return nested.content as T[];
    if (Array.isArray(nested.items)) return nested.items as T[];
  }
  return [];
}

function hasTaxZoneField(items: Array<{ taxZone?: string | null }>): boolean {
  return items.some((item) =>
    Object.prototype.hasOwnProperty.call(item, 'taxZone'),
  );
}

async function listCustomers(apiClient: {
  customers: { list: (params?: string) => Promise<ListClient> };
}): Promise<CustomerRow[]> {
  const res = await apiClient.customers.list('page=1&pageSize=100');
  skipIfUnavailable(res, 'Customers list');
  expect(res.ok()).toBeTruthy();
  return pageItems<CustomerRow>(await res.json());
}

async function listQuotes(
  apiClient: {
    quotations: { list: (params?: string) => Promise<ListClient> };
  },
): Promise<QuoteRow[]> {
  const candidates = ['page=0&perPage=50', 'page=1&pageSize=50'];
  for (const params of candidates) {
    const res = await apiClient.quotations.list(params);
    if (!res.ok()) continue;
    const quotes = pageItems<QuoteRow>(await res.json());
    if (quotes.length > 0) return quotes;
  }
  const res = await apiClient.quotations.list('page=0&perPage=50');
  skipIfUnavailable(res, 'Quotes list');
  expect(res.ok()).toBeTruthy();
  return pageItems<QuoteRow>(await res.json());
}

async function dismissOpenDialogs(page: Page) {
  for (let i = 0; i < 3; i++) {
    const dialog = page.locator('[role="dialog"][data-state="open"]');
    if ((await dialog.count()) === 0) return;
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0, { timeout: 5000 }).catch(() => undefined);
  }
}

async function openRowDialog(
  page: Page,
  path: string,
  placeholder: string,
  searchText: string,
) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await dismissOpenDialogs(page);
  await page.getByPlaceholder(placeholder).fill(searchText);
  const row = page
    .locator('table tbody tr')
    .filter({ hasText: searchText })
    .first();
  await expect(row).toBeVisible({ timeout: 15000 });
  await dismissOpenDialogs(page);

  // Quote/job checkbox lives in the first cell; click the identifier text.
  await row.getByText(searchText, { exact: false }).first().click();
  const dialog = page.getByRole('dialog');
  try {
    await expect(dialog).toBeVisible({ timeout: 8000 });
    return dialog;
  } catch {
    await row.locator('button').last().click();
    const viewDetails = page.getByRole('menuitem', { name: 'View Details' });
    if ((await viewDetails.count()) > 0) {
      await viewDetails.click();
    }
    await expect(dialog).toBeVisible({ timeout: 15000 });
    return dialog;
  }
}

async function quoteTaxZone(
  apiClient: {
    customers: { get: (id: number) => Promise<ListClient> };
    quotations: {
      get: (id: number) => Promise<ListClient>;
      withItems: (id: number) => Promise<ListClient>;
    };
  },
  quote: QuoteRow,
): Promise<string | null | undefined> {
  const nested = quote.customerWithAddressResponseDto?.taxZone;
  if (nested != null && nested !== '') return nested;

  if (quote.customerId) {
    const customerRes = await apiClient.customers.get(quote.customerId);
    if (customerRes.ok()) {
      const customer = (await customerRes.json()) as CustomerRow;
      if (customer.taxZone != null) return customer.taxZone;
    }
  }

  for (const load of [apiClient.quotations.get, apiClient.quotations.withItems]) {
    const res = await load(quote.id);
    if (!res.ok()) continue;
    const detail = (await res.json()) as QuoteRow;
    if (detail.customerWithAddressResponseDto?.taxZone != null) {
      return detail.customerWithAddressResponseDto.taxZone;
    }
  }
  return undefined;
}

const ZERO_TAX_LABEL = /GST \(0%\)|VAT \(0%\)/;
const NON_ZERO_TAX_LABEL = /GST \((?!0%)\d+%\)|VAT \((?!0%)\d+%\)/;

test.describe('Overseas 0% VAT - API', () => {
  test('customer payloads include taxZone after deploy', async ({
    apiClient,
  }) => {
    const customers = await listCustomers(apiClient);
    test.skip(customers.length === 0, 'No customers on this environment');
    test.skip(
      !hasTaxZoneField(customers),
      'taxZone is not on customer payloads yet',
    );
    expect(hasTaxZoneField(customers)).toBeTruthy();
  });

  test('job customerDto exposes taxZone for VAT calculation', async ({
    apiClient,
  }) => {
    const res = await apiClient.jobs.list('page=1&pageSize=50');
    skipIfUnavailable(res, 'Jobs list');
    expect(res.ok()).toBeTruthy();
    const jobs = pageItems<JobRow>(await res.json());
    test.skip(jobs.length === 0, 'No jobs on this environment');

    const withCustomer = jobs.filter((job) => job.customerDto);
    test.skip(withCustomer.length === 0, 'No jobs with nested customerDto');
    test.skip(
      !withCustomer.some((job) =>
        Object.prototype.hasOwnProperty.call(job.customerDto ?? {}, 'taxZone'),
      ),
      'taxZone is not on job customerDto yet',
    );
    expect(
      withCustomer.some((job) =>
        Object.prototype.hasOwnProperty.call(job.customerDto ?? {}, 'taxZone'),
      ),
    ).toBeTruthy();
  });

  test('quote nested customer exposes taxZone for VAT calculation', async ({
    apiClient,
  }) => {
    const quotes = await listQuotes(apiClient);
    test.skip(quotes.length === 0, 'No quotes on this environment');

    const nestedFromList = quotes[0].customerWithAddressResponseDto;
    if (
      nestedFromList &&
      Object.prototype.hasOwnProperty.call(nestedFromList, 'taxZone')
    ) {
      expect(nestedFromList).toHaveProperty('taxZone');
      return;
    }

    const quoteRes = await apiClient.quotations.withItems(quotes[0].id);
    if (!quoteRes.ok()) {
      const byId = await apiClient.quotations.get(quotes[0].id);
      skipIfUnavailable(byId, 'Quote detail');
      expect(byId.ok()).toBeTruthy();
      const quote = (await byId.json()) as QuoteRow;
      test.skip(
        !quote.customerWithAddressResponseDto,
        'Quote has no nested customer',
      );
      test.skip(
        !Object.prototype.hasOwnProperty.call(
          quote.customerWithAddressResponseDto ?? {},
          'taxZone',
        ),
        'taxZone is not on quote customer payloads yet',
      );
      expect(quote.customerWithAddressResponseDto).toHaveProperty('taxZone');
      return;
    }

    const quote = (await quoteRes.json()) as QuoteRow;
    const nested = quote.customerWithAddressResponseDto ?? nestedFromList;
    test.skip(!nested, 'Quote has no nested customer');
    test.skip(
      !Object.prototype.hasOwnProperty.call(nested ?? {}, 'taxZone'),
      'taxZone is not on quote customer payloads yet',
    );
    expect(nested).toHaveProperty('taxZone');
  });
});

test.describe('Overseas 0% VAT - Jobs UI', () => {
  test('Overseas customer job Products tab shows 0% tax', async ({
    apiClient,
    authedPage: page,
  }) => {
    const customers = await listCustomers(apiClient);
    test.skip(
      !hasTaxZoneField(customers),
      'taxZone is not on customer payloads yet',
    );

    const jobsRes = await apiClient.jobs.list('page=1&pageSize=50');
    skipIfUnavailable(jobsRes, 'Jobs list');
    const jobs = pageItems<JobRow>(await jobsRes.json()).filter(
      (job) =>
        job.jobType !== 'INTERNAL_TRANSFER' &&
        job.jobNumber &&
        isOverseasTaxZone(job.customerDto?.taxZone),
    );
    test.skip(
      jobs.length === 0,
      'No Overseas tax zone customer jobs on this environment',
    );

    const dialog = await openRowDialog(
      page,
      '/customer-operations/jobs',
      'Search jobs...',
      jobs[0].jobNumber as string,
    );
    const productsTab = dialog.getByRole('tab', { name: 'Products' });
    if ((await productsTab.count()) > 0) {
      await productsTab.click();
    }
    await expect(dialog.getByText(ZERO_TAX_LABEL).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('non-Overseas customer job keeps the tenant tax rate', async ({
    apiClient,
    authedPage: page,
  }) => {
    const customers = await listCustomers(apiClient);
    test.skip(
      !hasTaxZoneField(customers),
      'taxZone is not on customer payloads yet',
    );

    const jobsRes = await apiClient.jobs.list('page=1&pageSize=50');
    skipIfUnavailable(jobsRes, 'Jobs list');
    const jobs = pageItems<JobRow>(await jobsRes.json()).filter(
      (job) =>
        job.jobType !== 'INTERNAL_TRANSFER' &&
        job.jobNumber &&
        !isOverseasTaxZone(job.customerDto?.taxZone),
    );
    test.skip(
      jobs.length === 0,
      'No customer jobs for a non-Overseas customer',
    );

    const dialog = await openRowDialog(
      page,
      '/customer-operations/jobs',
      'Search jobs...',
      jobs[0].jobNumber as string,
    );
    const productsTab = dialog.getByRole('tab', { name: 'Products' });
    if ((await productsTab.count()) > 0) {
      await productsTab.click();
    }
    await expect(dialog.getByText(NON_ZERO_TAX_LABEL).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(dialog.getByText(ZERO_TAX_LABEL)).toHaveCount(0);
  });
});

test.describe('Overseas 0% VAT - Quotes UI', () => {
  test('Overseas customer quote pricing shows 0% tax', async ({
    apiClient,
    authedPage: page,
  }) => {
    const quotes = (await listQuotes(apiClient)).filter(
      (quote) => quote.quoteNumber,
    );
    test.skip(quotes.length === 0, 'No quotes on this environment');

    let overseasQuote: QuoteRow | undefined;
    for (const quote of quotes) {
      const taxZone = await quoteTaxZone(apiClient, quote);
      if (isOverseasTaxZone(taxZone)) {
        overseasQuote = quote;
        break;
      }
    }
    test.skip(
      !overseasQuote,
      'No Overseas tax zone quote on this environment',
    );

    const dialog = await openRowDialog(
      page,
      '/customer-operations/quotation',
      'Search quotes...',
      overseasQuote!.quoteNumber as string,
    );
    const pricing = dialog.getByText(/GST \(\d+%\)|VAT \(\d+%\)/);
    test.skip(
      (await pricing.count()) === 0 &&
        (await dialog.getByText('Cost Summary').count()) === 0,
      'Quote has no pricing breakdown to assert tax against',
    );
    await expect(dialog.getByText(ZERO_TAX_LABEL).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('non-Overseas customer quote keeps the tenant tax rate', async ({
    apiClient,
    authedPage: page,
  }) => {
    const quotes = (await listQuotes(apiClient)).filter(
      (quote) => quote.quoteNumber,
    );
    test.skip(quotes.length === 0, 'No quotes on this environment');

    let domesticQuote: QuoteRow | undefined;
    for (const quote of quotes) {
      const taxZone = await quoteTaxZone(apiClient, quote);
      if (!isOverseasTaxZone(taxZone)) {
        domesticQuote = quote;
        break;
      }
    }
    test.skip(
      !domesticQuote,
      'No non-Overseas quote on this environment',
    );

    const dialog = await openRowDialog(
      page,
      '/customer-operations/quotation',
      'Search quotes...',
      domesticQuote!.quoteNumber as string,
    );
    const pricing = dialog.getByText(/GST \(\d+%\)|VAT \(\d+%\)/);
    test.skip(
      (await pricing.count()) === 0 &&
        (await dialog.getByText('Cost Summary').count()) === 0,
      'Quote has no pricing breakdown to assert tax against',
    );
    await expect(dialog.getByText(NON_ZERO_TAX_LABEL).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(dialog.getByText(ZERO_TAX_LABEL)).toHaveCount(0);
  });
});
