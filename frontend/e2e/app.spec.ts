import {test, expect} from '@playwright/test';

/**
 * Placeholder E2E test — verifies the app loads in a real browser.
 * Add real user-flow tests here once pages are implemented.
 */
test('app loads successfully', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ZurImpact/i);
});
