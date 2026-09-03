import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * Shared fixtures and helpers for Flametree QuarryLink E2E tests.
 *
 * Provides:
 * - authedPage: A Page that is already logged in as admin
 * - authedRequest: An APIRequestContext with session cookies
 * - apiClient: Helper methods for common API calls
 */

export const BASE_URL =
  process.env.E2E_BASE_URL || 'https://flametree-quarrylink-next-staging.onrender.com';

export const ADMIN_EMAIL = 'admin@flametree.com.au';
export const ADMIN_PASSWORD = 'FlameTree2026!';

/** Skip when staging is missing an endpoint or the DB schema is not migrated yet. */
export function skipIfUnavailable(
  res: { status: () => number },
  label: string,
) {
  const status = res.status();
  if ([403, 404, 409, 500, 501, 502, 503].includes(status)) {
    test.skip(true, `${label} unavailable on staging (${status})`);
  }
}

/** True when the payload is a list or Spring-style page wrapper. */
export function hasPageContent(data: unknown): boolean {
  if (Array.isArray(data)) return true;
  if (!data || typeof data !== 'object') return false;
  const payload = data as Record<string, unknown>;
  if (payload.items !== undefined || payload.content !== undefined) return true;
  for (const value of Object.values(payload)) {
    if (!value || typeof value !== 'object') continue;
    const nested = value as Record<string, unknown>;
    if (Array.isArray(nested.content) || nested.items !== undefined) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// API-level login helper (returns cookie string)
// ---------------------------------------------------------------------------
export async function loginViaAPI(
  request: APIRequestContext,
): Promise<{ cookie: string; sessionToken: string }> {
  const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`);
  expect(csrfResponse.ok()).toBeTruthy();
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;

  const setCookieHeader = csrfResponse.headers()['set-cookie'] || '';
  const csrfCookie = setCookieHeader.split(';')[0] || '';

  const loginResponse = await request.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
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
    },
  );

  const loginSetCookie = loginResponse.headers()['set-cookie'] || '';
  const sessionCookieMatch = loginSetCookie.match(
    /__Secure-authjs\.session-token=([^;]+)/,
  );
  expect(
    sessionCookieMatch,
    'Session cookie should be set after login',
  ).toBeTruthy();

  return {
    cookie: [csrfCookie, `__Secure-authjs.session-token=${sessionCookieMatch![1]}`]
      .filter(Boolean)
      .join('; '),
    sessionToken: sessionCookieMatch![1],
  };
}

// ---------------------------------------------------------------------------
// UI-level login helper
// ---------------------------------------------------------------------------
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 30000,
  });
}

// ---------------------------------------------------------------------------
// API client helper — wraps common API calls with auth
// ---------------------------------------------------------------------------
export class ApiClient {
  constructor(
    private request: APIRequestContext,
    private cookie: string,
  ) {}

  private async get(path: string) {
    return this.request.get(`${BASE_URL}${path}`, {
      headers: { Cookie: this.cookie },
    });
  }

  private async post(path: string, body?: unknown) {
    return this.request.post(`${BASE_URL}${path}`, {
      headers: {
        Cookie: this.cookie,
        'Content-Type': 'application/json',
      },
      data: body ? JSON.stringify(body) : undefined,
    });
  }

  private async put(path: string, body?: unknown) {
    return this.request.put(`${BASE_URL}${path}`, {
      headers: {
        Cookie: this.cookie,
        'Content-Type': 'application/json',
      },
      data: body ? JSON.stringify(body) : undefined,
    });
  }

  private async delete(path: string) {
    return this.request.delete(`${BASE_URL}${path}`, {
      headers: { Cookie: this.cookie },
    });
  }

  private async postMultipart(
    path: string,
    file: { name: string; mimeType: string; buffer: Buffer },
  ) {
    return this.request.post(`${BASE_URL}${path}`, {
      headers: { Cookie: this.cookie },
      multipart: {
        file: {
          name: file.name,
          mimeType: file.mimeType,
          buffer: file.buffer,
        },
      },
    });
  }

  // -- Products --
  products = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/product${params ? `?${params}` : ''}`),
    syncStatus: () => this.get('/socoro/quarrylink/api/product/sync-status'),
    pullFromAcc: () => this.put('/socoro/quarrylink/api/product/pull-from-acc-software'),
    reporting: () => this.get('/socoro/quarrylink/api/product/reporting'),
  };

  // -- Customers --
  customers = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/customer${params ? `?${params}` : ''}`),
    syncStatus: () => this.get('/socoro/quarrylink/api/customer/sync-status'),
    syncAll: () => this.put('/socoro/quarrylink/api/customer/sync-all-from-acc-software'),
    reporting: () => this.get('/socoro/quarrylink/api/customer/reporting'),
  };

  // -- Jobs --
  jobs = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/job${params ? `?${params}` : ''}`),
    purchaseOrders: (params?: string) =>
      this.get(
        `/socoro/quarrylink/api/job/purchase-orders${params ? `?${params}` : ''}`,
      ),
    attachments: (jobId: number) =>
      this.get(`/socoro/quarrylink/api/job/${jobId}/attachments`),
    uploadAttachment: (
      jobId: number,
      params: {
        category: string;
        fileName: string;
        file: { name: string; mimeType: string; buffer: Buffer };
      },
    ) =>
      this.postMultipart(
        `/socoro/quarrylink/api/job/${jobId}/attachments?category=${encodeURIComponent(params.category)}&fileName=${encodeURIComponent(params.fileName)}`,
        params.file,
      ),
    deleteAttachment: (jobId: number, attachmentId: number) =>
      this.delete(
        `/socoro/quarrylink/api/job/${jobId}/attachments/${attachmentId}`,
      ),
    downloadAttachment: (jobId: number, attachmentId: number) =>
      this.get(
        `/socoro/quarrylink/api/job/${jobId}/attachments/${attachmentId}`,
      ),
  };

  // -- Dockets --
  dockets = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/docket${params ? `?${params}` : ''}`),
    table: (params?: string) =>
      this.get(`/socoro/quarrylink/api/dockets/table${params ? `?${params}` : ''}`),
  };

  // -- Quotations --
  quotations = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/quote${params ? `?${params}` : ''}`),
    contentLibrary: () => this.get('/socoro/quarrylink/api/quote-content-library'),
    policyDocuments: () => this.get('/socoro/quarrylink/api/quote-content-library/policy-document'),
  };

  // -- Quarries / Suppliers --
  quarries = {
    list: () => this.get('/socoro/quarrylink/api/quarries'),
  };

  // -- Materials --
  materials = {
    list: () => this.get('/socoro/quarrylink/api/material'),
  };

  // -- Drivers --
  drivers = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/driver${params ? `?${params}` : ''}`),
  };

  // -- Trucks --
  trucks = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/truck${params ? `?${params}` : ''}`),
  };

  // -- Hauliers --
  hauliers = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/haulier${params ? `?${params}` : ''}`),
  };

  // -- Users --
  users = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/user${params ? `?${params}` : ''}`),
  };

  // -- Invoices --
  invoices = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/invoice${params ? `?${params}` : ''}`),
  };

  // -- Scheduler --
  scheduler = {
    events: (start: string, end: string) =>
      this.get(`/socoro/quarrylink/api/scheduler/events?start=${start}&end=${end}`),
  };

  // -- Accounting --
  accounting = {
    status: () => this.get('/socoro/quarrylink/api/accounting/status'),
  };

  // -- MYOB Acumatica --
  myobAcumatica = {
    connections: () => this.get('/socoro/quarrylink/api/myob-acumatica/connections'),
  };

  // -- Tenant Fusion (tenant management) --
  tenantFusion = {
    tenants: () => this.get('/quarrylink/tenant-fusion/api/tenants'),
  };

  // -- Payments --
  payments = {
    invoices: (params?: string) =>
      this.get(`/socoro/quarrylink/api/invoices${params ? `?${params}` : ''}`),
    cashSales: (params?: string) =>
      this.get(
        `/socoro/quarrylink/api/payments/cash-sales${params ? `?${params}` : ''}`,
      ),
    cashSalesByJob: (jobId: number) =>
      this.get(`/socoro/quarrylink/api/payments/jobs/${jobId}/cash-sales`),
    cashSale: (id: number) =>
      this.get(`/socoro/quarrylink/api/payments/cash-sales/${id}`),
    createCashSale: (body: { docketIds: number[]; paymentType: string }) =>
      this.post('/socoro/quarrylink/api/payments/cash-sales', body),
    amendCashSalePaymentType: (id: number, paymentType: string) =>
      this.put(`/socoro/quarrylink/api/payments/cash-sales/${id}/payment-type`, {
        paymentType,
      }),
    voidCashSale: (
      id: number,
      body: { reason: string; reasonDetail?: string },
    ) => this.post(`/socoro/quarrylink/api/payments/cash-sales/${id}/void`, body),
    internalTransfers: (params?: string) =>
      this.get(
        `/socoro/quarrylink/api/payments/internal-transfers${params ? `?${params}` : ''}`,
      ),
    failedCount: () =>
      this.get('/socoro/quarrylink/api/payments/failed-count'),
    retryCashSale: (id: number) =>
      this.put(`/socoro/quarrylink/api/payments/cash-sales/${id}/retry`),
    retryInvoice: (id: number) =>
      this.put(`/socoro/quarrylink/api/invoices/${id}/retry`),
    retryInternalTransferJournal: (journalId: number) =>
      this.put(
        `/socoro/quarrylink/api/payments/internal-transfers/journals/${journalId}/retry`,
      ),
  };

  // -- Checklists --
  checklists = {
    list: () => this.get('/socoro/quarrylink/api/checklist'),
  };

  // -- Departments --
  departments = {
    list: () => this.get('/socoro/quarrylink/api/department'),
  };
}

// ---------------------------------------------------------------------------
// Custom fixture types
// ---------------------------------------------------------------------------
interface AuthedFixtures {
  authedPage: Page;
  authedRequest: APIRequestContext;
  apiClient: ApiClient;
}

// ---------------------------------------------------------------------------
// Extended test fixture with auth helpers
// ---------------------------------------------------------------------------
export const test = base.extend<AuthedFixtures>({
  authedPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
  authedRequest: async ({ request }, use) => {
    // The default request context doesn't have cookies.
    // Tests that need auth should use apiClient fixture instead.
    await use(request);
  },
  apiClient: async ({ request }, use) => {
    const { cookie } = await loginViaAPI(request);
    const client = new ApiClient(request, cookie);
    await use(client);
  },
});

export { expect };
