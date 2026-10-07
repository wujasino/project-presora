import { test, expect } from './fixtures';
import { mockAuth, buildSession } from './mocks/supabase';

test.describe('Register', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('successful signup moves to the email-code step', async ({ page, registerPage }) => {
    await mockAuth(page, buildSession({ email: 'new.user@example.com' }));

    await registerPage.goto();
    await registerPage.fill('new.user@example.com', 'Str0ng!Passw0rd', 'Str0ng!Passw0rd');
    await registerPage.submit();

    await registerPage.expectOnVerifyCodeStep();
  });

  test('mismatched passwords are flagged before submit', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.fill('new.user@example.com', 'Str0ng!Passw0rd', 'different-password');

    await expect(registerPage.mismatchWarning).toBeVisible();
    await expect(registerPage.submitButton).toBeDisabled();
  });

  test('signup failure (e.g. email already registered) shows an inline error', async ({ page, registerPage }) => {
    await page.route('**/auth/v1/signup*', route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'user_already_exists', error_description: 'User already registered', msg: 'User already registered' }),
      })
    );

    await registerPage.goto();
    await registerPage.fill('existing.user@example.com', 'Str0ng!Passw0rd', 'Str0ng!Passw0rd');
    await registerPage.submit();

    await expect(page.getByText(/already registered/i)).toBeVisible();
  });
});
