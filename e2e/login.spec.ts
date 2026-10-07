import { test, expect } from './fixtures';
import { mockAuthenticatedApp, mockAuthLoginFailure, TEST_USER } from './mocks/supabase';

test.describe('Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('valid credentials redirect to /profile', async ({ page, loginPage }) => {
    await mockAuthenticatedApp(page);
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, 'correct-horse-battery-staple');

    await expect(page).toHaveURL(/\/profile/);
  });

  test('invalid credentials show an inline error and stay on /login', async ({ page, loginPage }) => {
    await mockAuthLoginFailure(page);
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, 'wrong-password');

    await loginPage.expectError(/incorrect email or password/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test('forgot-password flow requests a reset code', async ({ page, loginPage }) => {
    await page.route('**/.netlify/functions/send-reset-otp*', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    );

    await loginPage.goto();
    await loginPage.forgotPasswordLink.click();
    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();

    await page.getByLabel('E-mail').fill(TEST_USER.email);
    await page.getByRole('button', { name: 'Send code' }).click();

    await expect(page.getByRole('heading', { name: 'Enter code' })).toBeVisible();
  });

  test('required fields block submission before any network call is made', async ({ page, loginPage }) => {
    let authCalled = false;
    await page.route('**/auth/v1/token*', route => { authCalled = true; route.abort(); });

    await loginPage.goto();
    await loginPage.submitButton.click();

    // Native HTML5 `required` validation should keep the browser from
    // submitting the form at all.
    await expect(page).toHaveURL(/\/login/);
    expect(authCalled).toBe(false);
  });
});
