import {test, expect} from '../fixtures/test';

test.describe('i18n / language switch', () => {
  test('renders the login page in German when the i18nextLng localStorage key is set to de', async ({
    page,
    context,
  }) => {
    // i18next-browser-languagedetector reads `i18nextLng` from localStorage first
    // (see frontend/src/utility/i18n.ts). Seed it before the app boots.
    await context.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'de');
    });

    await page.goto('/login');

    // German login form heading: "Anmelden". Use a heading selector so we don't
    // collide with other "Anmelden" strings on the page.
    await expect(page.getByRole('heading', {name: /anmelden/i})).toBeVisible();
  });

  test('falls back to English when no language is configured', async ({page}) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', {name: /sign in/i})).toBeVisible();
  });
});
