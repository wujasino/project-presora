import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { mockAuthenticatedApp, TEST_USER } from './mocks/supabase';

const authFile = 'e2e/.auth/user.json';

/**
 * Drives the real login form once against a mocked Supabase Auth endpoint,
 * then saves the resulting localStorage session so every other test can
 * start already signed in (via `storageState` in playwright.config.ts)
 * instead of re-running the login flow per test.
 */
setup('authenticate', async ({ page }) => {
  await mockAuthenticatedApp(page);

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_USER.email, 'correct-horse-battery-staple');

  await page.waitForURL('**/profile');
  await expect(page.getByText(TEST_USER.email)).toBeVisible();

  await page.context().storageState({ path: authFile });
});
