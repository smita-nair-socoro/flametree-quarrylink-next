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
    attachments: (jobId: number) =>
      this.get(`/socoro/quarrylink/api/job/${jobId}/attachments`),
  };

  // -- Dockets --
  dockets = {
    list: (params?: string) => this.get(`/socoro/quarrylink/api/docket${params ? `?${params}` : ''}`),
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
