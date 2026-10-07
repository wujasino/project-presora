import { type Page, type Locator, expect } from '@playwright/test';

export type SettingsTab = 'account' | 'notifications' | 'security' | 'privacy' | 'billing' | 'referral';

const TAB_LABEL: Record<SettingsTab, string> = {
  account: 'Account',
  notifications: 'Notifications',
  security: 'Security',
  privacy: 'Privacy',
  billing: 'Billing',
  referral: 'Refer a friend',
};

export class SettingsPage {
  readonly resumeButton: Locator;
  readonly cancelsAtPeriodEndText: Locator;
  readonly referralError: Locator;
  readonly referralLink: Locator;

  constructor(private page: Page) {
    this.resumeButton = page.getByRole('button', { name: 'Resume' });
    this.cancelsAtPeriodEndText = page.getByText('Cancels at period end');
    this.referralError = page.locator('p.text-destructive');
    // "Your referral link" is a plain <p>, not a <label>, so this targets the readonly input directly.
    this.referralLink = page.locator('input[readonly]').first();
  }

  async goto(tab?: SettingsTab) {
    await this.page.goto(tab ? `/settings?tab=${tab}` : '/settings');
  }

  tabButton(tab: SettingsTab): Locator {
    // Scoped to the sidebar <nav> — the header also has an unrelated bell
    // icon button whose aria-label is "Notifications", which collides with
    // this tab's visible text under a plain page-wide getByRole lookup.
    return this.page.locator('nav').getByRole('button', { name: TAB_LABEL[tab] });
  }

  async openTab(tab: SettingsTab) {
    await this.tabButton(tab).click();
  }

  async expectTabActive(tab: SettingsTab) {
    await expect(this.tabButton(tab)).toHaveClass(/text-primary/);
  }
}
