#!/usr/bin/env bun
/**
 * Poll staging readiness: jobs API, payments API, payments page.
 */
const BASE_URL =
  process.env.E2E_BASE_URL ||
  'https://flametree-quarrylink-next-staging.onrender.com';
const ADMIN_EMAIL = 'admin@flametree.com.au';
const ADMIN_PASSWORD = 'FlameTree2026!';

async function login() {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const csrfCookie = (csrfRes.headers.get('set-cookie') || '').split(';')[0];

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: csrfCookie,
    },
    body: new URLSearchParams({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      csrfToken,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true',
    }),
    redirect: 'manual',
  });

  const loginCookie = loginRes.headers.get('set-cookie') || '';
  const match = loginCookie.match(/__Secure-authjs\.session-token=([^;]+)/);
  if (!match) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  return [csrfCookie, `__Secure-authjs.session-token=${match[1]}`]
    .filter(Boolean)
    .join('; ');
}

async function checkEndpoint(cookie, path, label) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: cookie },
    redirect: 'manual',
  });
  const body = res.status !== 204 ? (await res.text()).slice(0, 200) : '';
  return { label, path, status: res.status, body };
}

async function checkPage(cookie, path, label) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: cookie },
    redirect: 'manual',
  });
  return { label, path, status: res.status };
}

async function main() {
  const cookie = await login();
  console.log('Login: OK');

  const checks = await Promise.all([
    checkEndpoint(cookie, '/socoro/quarrylink/api/job?page=0&perPage=1', 'jobs-api'),
    checkEndpoint(
      cookie,
      '/socoro/quarrylink/api/payments/cash-sales?page=0&perPage=1',
      'payments-cash-sales-api',
    ),
    checkEndpoint(
      cookie,
      '/socoro/quarrylink/api/payments/failed-count',
      'payments-failed-count-api',
    ),
    checkPage(cookie, '/customer-operations/payments', 'payments-page'),
    checkPage(cookie, '/customer-operations/jobs', 'jobs-page'),
  ]);

  for (const c of checks) {
    console.log(`${c.label}: ${c.status}${c.body ? ` — ${c.body}` : ''}`);
  }

  const ready = checks.every((c) => c.status >= 200 && c.status < 400);
  process.exit(ready ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
