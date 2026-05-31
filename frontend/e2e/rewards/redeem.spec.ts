import {test, expect} from '../fixtures/test';

test.describe.configure({mode: 'serial'});

test.describe('rewards / redeem', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('redeem an affordable voucher and receive a voucher code', async ({authedPage: page}) => {
    await page.goto('/rewards');

    // Reward id "1" (Free Coffee) costs 50 points; the seeded user (alice) has 123 points.
    const rewardCard = page.locator('[data-testid="reward-card"][data-reward-id="1"]');
    await expect(rewardCard).toBeVisible();
    await rewardCard.getByTestId('reward-redeem-btn').click();

    // Confirmation dialog → confirm the redemption.
    await page.getByTestId('reward-confirm-redeem-btn').click();

    // The success dialog shows the voucher code (mock-server generates VCHR-XXXX).
    await expect(page.getByText(/VCHR-/)).toBeVisible();
  });

  test('disables redeem button when the user cannot afford the reward', async ({authedPage: page}) => {
    await page.goto('/rewards');

    // Reward id "4" costs 150 — more than the seeded 123 points.
    const expensive = page.locator('[data-testid="reward-card"][data-reward-id="4"]');
    await expect(expensive.getByTestId('reward-redeem-btn')).toBeDisabled();
  });
});
