import {defineConfig, devices} from '@playwright/test';

/**
 * Playwright E2E test configuration for ZürImpact frontend.
 *
 * Run with: yarn e2e
 * Install browsers first: npx playwright install
 *
 * The suite runs against the Express mock server (MOCK_TEST_MODE=1 enables the
 * /_test/reset endpoint and seeds an admin user). Two `webServer` entries are
 * used so Playwright waits for both the mock server (port 4000) and the Vite
 * dev server (port 5173) to be reachable before starting tests.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  // app.spec.ts is the old placeholder — kept as a smoke test that the app boots.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'html',

  expect: {
    timeout: 5000,
  },

  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    testIdAttribute: 'data-testid',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],

  webServer: [
    {
      // Mock backend — MOCK_TEST_MODE=1 unlocks /_test/reset and seeds admin user.
      command: 'MOCK_TEST_MODE=1 yarn mock',
      // /actions is public and returns 200 → safe readiness probe.
      url: 'http://localhost:4000/backend_war_exploded/api/actions',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'VITE_USE_MOCK=1 yarn dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
