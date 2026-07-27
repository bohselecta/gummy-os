import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45_000,
  expect: { timeout: 8_000, toHaveScreenshot: { maxDiffPixelRatio: 0.015, animations: 'disabled' } },
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'test-results/html-report', open: 'never' }]]
    : [['line']],
  outputDir: 'test-results/artifacts',
  use: {
    baseURL: process.env.GUMMY_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    colorScheme: 'dark',
    reducedMotion: 'reduce'
  },
  webServer: process.env.GUMMY_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 800 },
        launchOptions: process.env.GUMMY_WEBKIT_LIB_PATH
          ? { env: { ...process.env, LD_LIBRARY_PATH: process.env.GUMMY_WEBKIT_LIB_PATH } }
          : {}
      }
    }
  ]
});
