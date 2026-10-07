import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly avatarMenuButton: Locator;
  readonly signOutButton: Locator;

  constructor(private page: Page) {
    // AppNavbar's avatar-popover trigger has an explicit aria-label, which
    // is what the accessible name computes to (an aria-label always wins
    // over visible text content) — matching on the AvatarFallback initials
    // ("E", from TEST_USER.email in e2e/mocks/supabase.ts) stopped working
    // the moment the aria-label was added and never found the button again.
    this.avatarMenuButton = page.getByRole('button', { name: 'Account menu' });
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async openUserMenu() {
    await this.avatarMenuButton.click();
  }

  async signOut() {
    await this.openUserMenu();
    await this.signOutButton.click();
  }

  /**
   * Ctrl/Cmd+K is a browser-reserved shortcut (address-bar focus) that
   * Chromium can swallow before the page's own keydown listener ever sees
   * it — even headless. Dispatching the event directly in page context
   * tests what we actually care about (CommandPalette.tsx's own handler)
   * without depending on the browser delivering the OS-level combo.
   */
  async openCommandPalette() {
    await this.page.evaluate(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    });
  }
}
