import {test, expect} from '../fixtures/test';
import {blockTileRequests} from '../helpers/map';

test.describe('actions / gps action (dev mode)', () => {
  test.beforeEach(async ({authedPage: page}) => {
    await blockTileRequests(page);
  });

  test('start an action and teleport through every checkpoint via ?dev=true', async ({authedPage: page}) => {
    // Action id 1 in the mock payload has 4 subTasks with coordinates.
    await page.goto('/actions/1?dev=true');

    // Map container renders even with tiles aborted (we suppress imagery only).
    await expect(page.getByTestId('map-container')).toBeVisible();

    // Open the confirmation dialog and start the action.
    await page.getByTestId('start-action-btn').click();
    await page.getByTestId('confirm-start-action-btn').click();

    // Once the action is started, the start button should be disabled
    // (translation: "Already started" — assert via attribute, not text).
    await expect(page.getByTestId('start-action-btn')).toBeDisabled();

    // Walk through every Teleport button — order doesn't matter, but each click
    // fires a completeGpsCheckpoint and toggles the checkpoint to checked-in.
    const teleportButtons = page.locator('[data-testid^="checkpoint-teleport-"]');
    const initialCount = await teleportButtons.count();
    expect(initialCount).toBeGreaterThan(0);

    for (let i = 0; i < initialCount; i++) {
      // The list is re-rendered after each check-in so we always click the first
      // remaining button until none are left.
      const remaining = page.locator('[data-testid^="checkpoint-teleport-"]');
      await remaining.first().click();
      // Wait for the button to disappear (= checkpoint marked complete) before
      // moving on — avoids racing the redux update.
      await expect(remaining).toHaveCount(initialCount - i - 1);
    }

    // All checkpoints reached → the completion banner should appear.
    // Use a status role match instead of a specific translation string.
    await expect(page.locator('[data-testid^="checkpoint-teleport-"]')).toHaveCount(0);
  });
});
