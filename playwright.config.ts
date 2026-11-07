import { defineConfig, devices } from '@playwright/test';

const port = 4174;
const chromiumPath = process.env.PW_CHROMIUM_PATH; // use a system browser where Playwright's is unavailable

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // WebKit is slow under parallel load; a stalled page load is not an app failure
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://127.0.0.1:${port}/`, acceptDownloads: true },
  webServer: {
    // Serves dist/ with the production headers from public/_headers, including the CSP
    command: `node tests/e2e/serve.mjs ${process.cwd()}/dist ${port}`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: ['--no-sandbox'], ...(chromiumPath ? { executablePath: chromiumPath } : {}) },
      },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
  ],
});
