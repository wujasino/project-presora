import { test, expect } from './fixtures';
import { mockAuthenticatedApp, buildProfile } from './mocks/supabase';

test.describe('Settings — Billing', () => {
  test('a canceled subscription shows the status and a working Resume button', async ({ page, settingsPage }) => {
    // Regression test: Settings.tsx used to spell this state 'cancelled' while
    // the backend (stripe-webhook.js) writes 'canceled' — the mismatch meant
    // no status dot, no label, and no Resume button ever rendered for a
    // genuinely canceled subscription. See git history for the fix.
    await mockAuthenticatedApp(page, {
      profile: buildProfile({ subscription_status: 'canceled' }),
    });

    await settingsPage.goto('billing');

    await expect(settingsPage.cancelsAtPeriodEndText).toBeVisible();
    await expect(settingsPage.resumeButton).toBeVisible();
    await expect(settingsPage.resumeButton).toBeEnabled();
  });

  test('an active subscription shows no cancellation banner', async ({ page, settingsPage }) => {
    await mockAuthenticatedApp(page, {
      profile: buildProfile({ subscription_status: 'active' }),
    });

    await settingsPage.goto('billing');

    await expect(settingsPage.cancelsAtPeriodEndText).not.toBeVisible();
    await expect(settingsPage.resumeButton).not.toBeVisible();
  });

  test('offers a direct Stripe billing-portal link as a fallback', async ({ page, settingsPage }) => {
    await mockAuthenticatedApp(page, {
      profile: buildProfile({ subscription_status: 'active' }),
    });

    await settingsPage.goto('billing');

    const portalLink = page.getByRole('link', { name: 'Manage billing on Stripe' });
    await expect(portalLink).toBeVisible();
    await expect(portalLink).toHaveAttribute('href', /^https:\/\/billing\.stripe\.com\//);
    await expect(portalLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Settings — Referral', () => {
  test('shows the referral link and progress from the API', async ({ page, settingsPage }) => {
    await mockAuthenticatedApp(page);
    await settingsPage.goto('referral');

    await expect(settingsPage.referralLink).toHaveValue(/presora\.app\/register\?ref=/);
    await expect(page.getByText(/friends? referred/)).toBeVisible();
  });

  test('a failed referral lookup shows an inline error, not a crash', async ({ page, settingsPage, consoleIssues }) => {
    await mockAuthenticatedApp(page);
    await page.route('**/.netlify/functions/referral*', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Database error' }) })
    );

    await settingsPage.goto('referral');

    await expect(settingsPage.referralError).toBeVisible();
    expect(consoleIssues.some(i => i.type === 'pageerror')).toBe(false);
  });
});

test.describe('Settings — navigation', () => {
  test('switching tabs updates the active tab and URL', async ({ page, settingsPage }) => {
    await mockAuthenticatedApp(page);
    await settingsPage.goto();

    await settingsPage.openTab('notifications');
    await settingsPage.expectTabActive('notifications');

    await settingsPage.openTab('security');
    await settingsPage.expectTabActive('security');
  });
});
