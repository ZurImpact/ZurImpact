import {test, expect} from '@playwright/test';

/**
 * Smoke test that the public landing page boots without errors. Per-flow
 * specs live in the topic folders (auth/, actions/, rewards/, ...).
 */
test('public landing page loads', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ZurImpact/i);
  await expect(page.getByTestId('app-nav')).toBeVisible();
});
