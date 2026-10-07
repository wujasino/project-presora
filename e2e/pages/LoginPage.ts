import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    // No role="alert" in the app — errors render as a plain <p>, matched by color class via text.
    this.errorMessage = page.locator('p.text-red-400');
    this.forgotPasswordLink = page.getByRole('button', { name: 'Forgot your password?' });
    this.registerLink = page.getByRole('link', { name: 'Register' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorMessage).toContainText(message);
  }
}
