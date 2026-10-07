import { type Page, type Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly mismatchWarning: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm password');
    this.submitButton = page.getByRole('button', { name: 'Create account' });
    this.mismatchWarning = page.getByText('Passwords do not match');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fill(email: string, password: string, confirm = password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirm);
  }

  async submit() {
    await this.submitButton.click();
  }

  /** After a successful signUp() call, the page switches to the 6-digit email-code step. */
  async expectOnVerifyCodeStep() {
    await expect(this.page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
  }
}
