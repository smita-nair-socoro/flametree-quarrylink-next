import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for Flametree QuarryLink.
 *
 * Tests can run against:
 * - Staging Render instance (default): E2E_BASE_URL not set or pointing to staging
 * - Local Docker instance: Set E2E_BASE_URL=http://localhost:3000
 *
 * Reports:
 * - HTML report: playwright-report/index.html
 * - JSON report: test-results/results.json
 * - Console summary: built-in
 *
 * Run:
 *   npm run e2e              # Run all tests against staging
 *   npm run e2e:local       # Run against local Docker instance
 *   npm run e2e:docker      # Spin up Docker, run tests, tear down
 *   npm run e2e:report      # Open HTML report
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL:
      process.env.E2E_BASE_URL ||
      'https://flametree-quarrylink-next-staging.onrender.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results/output',
});
