import {test, expect} from '../fixtures/test';
import {blockTileRequests} from '../helpers/map';

test.describe('actions / not found', () => {
  test('shows a "not found" message when navigating to a missing action id', async ({authedPage: page}) => {
    await blockTileRequests(page);
    await page.goto('/actions/999999');

    // The detail page renders the not-found copy when the action lookup fails.
    // We assert via the back-to-dashboard CTA so we don't depend on the localized
    // error text.
    await expect(page.getByRole('button', {name: /back to dashboard/i})).toBeVisible();
  });
});
