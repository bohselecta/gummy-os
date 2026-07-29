import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /deep-smoke\.spec\.mjs/,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/playwright-deep-report', open: 'never' }]],
  outputDir: 'artifacts/deep-test-results',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium-deep', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-deep', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-deep', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: 'npm run build && GUMMY_TEST_MODE=1 npm start',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
