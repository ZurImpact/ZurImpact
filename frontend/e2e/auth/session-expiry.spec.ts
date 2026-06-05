import {test, expect} from '../fixtures/test';

test.describe('auth / session expiry', () => {
  test('clearing the AUTH_SESSION cookie sends the user back to /login on next protected nav', async ({
    authedPage: page,
    context,
  }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('app-nav')).toBeVisible();

    // Simulate the session disappearing (server-side eviction, manual cookie
    // wipe, etc). The next request to a protected route should redirect.
    await context.clearCookies();

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});
