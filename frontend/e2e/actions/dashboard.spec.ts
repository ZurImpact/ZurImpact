import {test, expect} from '../fixtures/test';

test.describe('actions / dashboard', () => {
  test('authenticated user sees action cards on /dashboard', async ({authedPage: page}) => {
    await page.goto('/dashboard');

    // At least one action card from the mock-server payload should render.
    const cards = page.getByTestId('action-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('clicking a GPS action card opens the action detail page', async ({authedPage: page}) => {
    await page.goto('/dashboard');

    const firstCard = page.getByTestId('action-card').first();
    const actionId = await firstCard.getAttribute('data-action-id');
    expect(actionId).not.toBeNull();

    await firstCard.click();
    await expect(page).toHaveURL(new RegExp(`/actions/${actionId}$`));
  });
});
