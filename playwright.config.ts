import { defineConfig, devices } from '@playwright/test';

const PORT = 5183;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Pin to the browser actually pre-installed in this environment — the
    // @playwright/test version's default headless-shell revision isn't the
    // one on disk here. Harmless to keep outside this sandbox: it just
    // points at the same Chromium build `playwright install` would fetch.
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    },
  },

  projects: [
    // Auth setup — runs once before all authenticated projects, drives the
    // real login form against mocked Supabase Auth, and saves the resulting
    // session to e2e/.auth/user.json for reuse.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /e2e\/api\//,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      testIgnore: /e2e\/api\//,
      use: {
        ...devices['Pixel 7'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // API contract tests — no browser, no auth setup. Each spec spins up its
    // target Netlify Function directly (see e2e/api/functionServer.ts) and
    // hits it with Playwright's `request` fixture, so this project needs
    // neither `devices` nor storageState.
    {
      name: 'api',
      testMatch: /e2e\/api\/.*\.spec\.ts/,
    },
  ],

  // The app reads Supabase config at import time (src/lib/supabase.ts throws
  // without it) — every test intercepts the real Supabase/Netlify Function
  // calls, so these values never need to resolve to a real project.
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: 'https://e2e-placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'e2e-placeholder-anon-key',
    },
  },
});
