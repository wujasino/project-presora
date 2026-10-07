import { test, expect } from './fixtures';
import { mockAuthenticatedApp, buildAnalysis, buildProfile } from './mocks/supabase';

test.describe('Dashboard', () => {
  test('renders the latest brand scan with a trust score', async ({ page, dashboardPage, consoleIssues }) => {
    await mockAuthenticatedApp(page, {
      analyses: [buildAnalysis({ brand_name: 'Nike', trust_score: 78 })],
    });

    await dashboardPage.goto();

    await expect(page.getByText('Nike').first()).toBeVisible();
    await expect(page.getByText('78').first()).toBeVisible();
    expect(consoleIssues, JSON.stringify(consoleIssues)).toEqual([]);
  });

  test('shows per-model confidence from analyses.sources, not a placeholder', async ({ page, dashboardPage }) => {
    await mockAuthenticatedApp(page, {
      analyses: [buildAnalysis({
        sources: [
          { model: 'GPT-4o', sentiment: 70, association: 80, confidence: 91 },
          { model: 'Claude', sentiment: 78, association: 84, confidence: 62 },
        ],
      })],
    });

    await dashboardPage.goto();

    // Regression coverage: HomeHub used to fabricate per-model numbers by
    // cycling aggregate fields; it now reads the real analyses.sources data.
    await expect(page.getByText('91')).toBeVisible();
    await expect(page.getByText('62')).toBeVisible();
  });

  test('offers to enable a model instead of a fabricated number when sources is missing', async ({ page, dashboardPage }) => {
    await mockAuthenticatedApp(page, {
      analyses: [buildAnalysis({ sources: null })],
    });

    await dashboardPage.goto();

    // HomeHub used to render a bare "–" for a model with no real per-model
    // data; it now offers a concrete next step instead ("Enable & rescan"
    // while scanning is on, "not queried" while it's paused) — either way,
    // never a fabricated confidence number standing in for real data.
    await expect(page.getByText('Enable & rescan').first()).toBeVisible();
  });

  test('user menu shows the signed-in email and can sign out', async ({ page, dashboardPage }) => {
    await mockAuthenticatedApp(page);
    await page.route('**/auth/v1/logout*', route => route.fulfill({ status: 204, body: '' }));

    await dashboardPage.goto();
    await dashboardPage.openUserMenu();
    await expect(page.getByText('e2e.tester@example.com').first()).toBeVisible();

    await dashboardPage.signOutButton.click();
    await expect(page).toHaveURL('/');
  });
});
