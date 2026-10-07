import { test, expect } from './fixtures';
import { mockAuthenticatedApp } from './mocks/supabase';

test.describe('Command palette', () => {
  test('Ctrl/Cmd+K opens the palette and search filters results, with no a11y warning', async ({ page, dashboardPage, consoleIssues }) => {
    // Regression test: CommandDialog rendered DialogContent with no
    // DialogTitle, which Radix flags as a console warning on every
    // authenticated page (the palette is mounted globally in AppShell).
    await mockAuthenticatedApp(page);
    await dashboardPage.goto();

    // AppShell (and the CommandPalette mounted inside it) is lazy-loaded —
    // wait for it to actually be interactive before dispatching the
    // shortcut, or the keydown listener may not be attached yet.
    await dashboardPage.avatarMenuButton.waitFor({ state: 'visible' });
    await dashboardPage.openCommandPalette();
    await expect(page.getByPlaceholder('Search or jump to…')).toBeVisible();

    await page.getByPlaceholder('Search or jump to…').fill('Reports');
    await expect(page.getByRole('option', { name: /Reports/i })).toBeVisible();

    await page.getByRole('option', { name: /Reports/i }).click();
    await expect(page).toHaveURL(/\/reports/);

    const a11yWarnings = consoleIssues.filter(i => /DialogTitle|DialogContent/i.test(i.text));
    expect(a11yWarnings, JSON.stringify(a11yWarnings)).toEqual([]);
  });

  test('Escape closes the palette', async ({ page, dashboardPage }) => {
    await mockAuthenticatedApp(page);
    await dashboardPage.goto();

    // AppShell (and the CommandPalette mounted inside it) is lazy-loaded —
    // wait for it to actually be interactive before dispatching the
    // shortcut, or the keydown listener may not be attached yet.
    await dashboardPage.avatarMenuButton.waitFor({ state: 'visible' });
    await dashboardPage.openCommandPalette();
    await expect(page.getByPlaceholder('Search or jump to…')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('Search or jump to…')).not.toBeVisible();
  });
});
