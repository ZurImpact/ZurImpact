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

  test('decrements user points and reward availability after redemption', async ({authedPage: page}) => {
    await page.goto('/rewards');

    // Seed: alice has 123 points; reward "1" costs 50 and starts with availability 45.
    // After redeeming once: 123 - 50 = 73 points; availability 45 - 1 = 44.
    const rewardCard = page.locator('[data-testid="reward-card"][data-reward-id="1"]');
    const userPoints = page.getByTestId('user-points');

    await expect(userPoints).toContainText('123');
    await expect(rewardCard).toContainText('45');

    await rewardCard.getByTestId('reward-redeem-btn').click();
    await page.getByTestId('reward-confirm-redeem-btn').click();

    // Voucher dialog appears with the generated code.
    await expect(page.getByText(/VCHR-/)).toBeVisible();

    // Closing the dialog triggers a re-fetch of currentUser + rewards, which
    // is what surfaces the decremented values in the UI.
    // The voucher dialog renders both an explicit "Close" button and a Radix
    // X-icon close button with sr-only "Close" text — pick the first.
    await page.getByRole('button', {name: /close/i}).first().click();

    await expect(userPoints).toContainText('73');
    await expect(rewardCard).toContainText('44');

    // The original 150-point reward (id "4") was disabled at 123 points and
    // must remain disabled now that the user has only 73.
    const expensive = page.locator('[data-testid="reward-card"][data-reward-id="4"]');
    await expect(expensive.getByTestId('reward-redeem-btn')).toBeDisabled();
  });

  test('blocks the redemption when the user has just dropped below the cost', async ({authedPage: page}) => {
    // After two redemptions of the 50-pt coffee, alice has 23 points left and
    // the 75-pt Bio Market reward (id "2") becomes unaffordable.
    await page.goto('/rewards');

    const coffee = page.locator('[data-testid="reward-card"][data-reward-id="1"]');
    const bioMarket = page.locator('[data-testid="reward-card"][data-reward-id="2"]');

    // Bio Market starts affordable (123 >= 75) — sanity check.
    await expect(bioMarket.getByTestId('reward-redeem-btn')).toBeEnabled();

    for (let i = 0; i < 2; i++) {
      await coffee.getByTestId('reward-redeem-btn').click();
      await page.getByTestId('reward-confirm-redeem-btn').click();
      await expect(page.getByText(/VCHR-/)).toBeVisible();
      // The voucher dialog renders both an explicit "Close" button and a Radix
      // X-icon close button with sr-only "Close" text — pick the first.
      await page.getByRole('button', {name: /close/i}).first().click();
    }

    await expect(page.getByTestId('user-points')).toContainText('23');
    await expect(bioMarket.getByTestId('reward-redeem-btn')).toBeDisabled();
  });
});
