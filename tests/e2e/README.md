# E2E Test Suite — Flametree QuarryLink

End-to-end tests for the Flametree QuarryLink application, built with [Playwright](https://playwright.dev/).

## Quick Start

From the `quarrylink-next` project root:

```powershell
# Run all tests against staging
.\run-e2e.ps1

# List all tests without running them
.\run-e2e.ps1 -List
```

On Linux/Mac:

```bash
./run-e2e.sh              # run all tests
./run-e2e.sh --list       # list all tests
```

## Commands

| Command (PowerShell) | Command (Bash) | Description |
|---|---|---|
| `.\run-e2e.ps1` | `./run-e2e.sh` | Run all tests against staging |
| `.\run-e2e.ps1 -Local` | `./run-e2e.sh --local` | Run against `http://localhost:3000` |
| `.\run-e2e.ps1 -Docker` | `./run-e2e.sh --docker` | Spin up Docker, run tests, tear down |
| `.\run-e2e.ps1 -List` | `./run-e2e.sh --list` | List all tests without running |
| `.\run-e2e.ps1 -Report` | `./run-e2e.sh --report` | Open the HTML report in browser |
| `.\run-e2e.ps1 -Help` | `./run-e2e.sh --help` | Show usage |

You can also use npm scripts:

```bash
npm run e2e              # same as run-e2e (staging)
npm run e2e:staging      # list reporter
npm run e2e:docker       # Docker runner (PowerShell)
npm run e2e:docker:bash  # Docker runner (bash)
npm run e2e:report       # open HTML report
npm run e2e:install      # install Playwright browsers
```

## Test Structure

All tests live in `tests/e2e/`:

```
tests/e2e/
├── helpers/
│   └── fixtures.ts          # Shared auth helpers, API client, Playwright fixtures
├── auth.spec.ts             # Login, session, logout, protected routes
├── dashboard.spec.ts        # Dashboard, sidebar, navigation
├── customers.spec.ts        # Customer list, reporting, sync status, UI
├── products.spec.ts         # Product list, reporting, sync status, UI
├── jobs.spec.ts             # Job list, pagination, UI
├── dockets.spec.ts          # Docket list, date filtering, UI
├── quotations.spec.ts       # Quote list, content library, policy docs (max 2)
├── logistics.spec.ts        # Drivers, trucks, hauliers, scheduler, dispatch
├── inventory.spec.ts        # Quarries, materials, stockpile, weigh-bridge, production
├── system.spec.ts           # Users, accounting, MYOB Acumatica, tenant management
├── sync.spec.ts             # Sync status API, UI persistence, page refresh
├── driver-app.spec.ts       # Driver app page, checklists
├── run-e2e-docker.ps1       # Docker runner (Windows)
└── run-e2e-docker.sh        # Docker runner (Linux/Mac)
```

~70 tests across 12 feature files, covering:
- Authentication (login, session, logout, protected routes)
- Customers (list, reporting, sync status, UI)
- Products (list, reporting, sync status, UI)
- Jobs (list, pagination, UI)
- Dockets (list, date filtering, UI)
- Quotations (list, content library, policy documents max 2)
- Logistics (drivers, trucks, hauliers, scheduler, dispatch, schedule)
- Inventory (quarries, materials, stockpile, weigh-bridge, production)
- System (user management, accounting, MYOB Acumatica, tenant management)
- Sync & Polling (sync status API, UI persistence across refresh)
- Driver App (driver app page, checklists)
- Dashboard & Navigation (sidebar, page routing)

## Running Tests

### Against Staging (default)

Tests run against `https://flametree-quarrylink-next-staging.onrender.com` by default.

```powershell
.\run-e2e.ps1
```

### Against Local Instance

Start the app locally (`npm run dev`), then:

```powershell
.\run-e2e.ps1 -Local
```

### Via Docker (isolated environment)

The Docker runner builds the app image, starts a container, runs tests, and tears down automatically.

1. Copy `.env.e2e.example` to `.env.e2e` and fill in the values:

```bash
cp .env.e2e.example .env.e2e
```

2. Run:

```powershell
.\run-e2e.ps1 -Docker
```

Flags:
- `-Docker` with `--no-build` — skip Docker image build (use existing image)
- `-Docker` with `--keep` — keep container running after tests (for debugging)

## Reports

After a test run, reports are generated in:

| Report | Location | How to view |
|---|---|---|
| HTML | `playwright-report/index.html` | `.\run-e2e.ps1 -Report` |
| JSON | `test-results/results.json` | Machine-readable |
| Console | stdout | Color-coded summary with pass/fail per suite |

The HTML report includes:
- Pass/fail counts per test suite
- Screenshots on failure
- Video recordings on failure
- Stack traces and error context

## Configuration

Playwright config: `playwright.config.ts`

Key settings:
- **Browser**: Chromium
- **Timeout**: 60s per test, 15s for assertions
- **Retries**: 1 on CI, 0 locally
- **Parallelism**: Disabled (sequential, 1 worker)
- **Base URL**: `E2E_BASE_URL` env var or staging URL
- **Trace**: Captured on first retry
- **Screenshots**: Only on failure
- **Video**: Retained on failure

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `E2E_BASE_URL` | No | Target URL (defaults to staging) |
| `E2E_AUTH_SECRET` | Only for Docker | NextAuth secret |
| `E2E_DATABASE_URL` | Only for Docker | Neon pooled connection string |
| `E2E_DIRECT_URL` | Only for Docker | Neon direct connection string |
| `E2E_DOWNSTREAM_URL` | Only for Docker | QuarryLink service URL |
| `E2E_TENANT_FUSION_URL` | No | Tenant Fusion service URL |
| `E2E_CLOUDFRONT_URL` | No | CloudFront public URL |
| `E2E_S3_BUCKET` | No | S3 tenant assets bucket |
| `E2E_RESEND_API_KEY` | No | Resend API key |
| `E2E_EMAIL_FROM` | No | From email address |

## Test Credentials

Tests use the staging admin account:
- Email: `admin@flametree.com.au`
- Password: `FlameTree2026!`

## Adding New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import shared fixtures:

```typescript
import { test, expect } from './helpers/fixtures';

test.describe('My Feature - API', () => {
  test('GET /my-feature returns list', async ({ apiClient }) => {
    // apiClient is already authenticated
    const res = await apiClient['request'].get(`${BASE_URL}/socoro/quarrylink/api/my-feature`, {
      headers: { Cookie: apiClient['cookie'] },
    });
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('My Feature - UI', () => {
  test('page loads without error', async ({ authedPage: page }) => {
    // authedPage is already logged in
    await page.goto('/my-feature', { waitUntil: 'networkidle' });
    await expect(page.locator('text=client-side exception')).toHaveCount(0);
  });
});
```

3. Available fixtures:
   - `authedPage` — A `Page` already logged in as admin
   - `apiClient` — An authenticated API client with helper methods
   - `authedRequest` — A raw `APIRequestContext` (use `apiClient` instead)

## Troubleshooting

**Tests timeout against staging**: Staging on Render may take 30+ seconds to wake up. The default 60s timeout should be enough, but you can increase it in `playwright.config.ts`.

**Login fails**: Verify the staging admin credentials haven't changed. Update them in `tests/e2e/helpers/fixtures.ts`.

**Docker runner fails**: Ensure `.env.e2e` exists and has all required variables. Check Docker is running.

**Playwright browsers not installed**: Run `npm run e2e:install` or `npx playwright install chromium`.
