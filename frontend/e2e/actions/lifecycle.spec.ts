import {test, expect} from '../fixtures/test';
import {blockTileRequests} from '../helpers/map';

/**
 * Network-level assertions on the action lifecycle endpoints. The dev-mode
 * teleport spec (`gps-action-dev.spec.ts`) covers the UI happy path; this
 * spec proves that the right backend calls fire at the right moments — the
 * contract the FE has with the real Spring backend.
 *
 * Note: the FE does not currently expose a "cancel" affordance for actions
 * even though the mock and backend support /actions/cancelAction. When a
 * cancel UI lands, add the cancel-path case here.
 *
 * Note: all seeded actions are GPS — there are no non-GPS lifecycle paths
 * to exercise at this layer yet.
 */
test.describe('actions / lifecycle endpoints', () => {
  test.beforeEach(async ({authedPage: page}) => {
    await blockTileRequests(page);
  });

  test('starts the action by POSTing to /actions/startAction with the action id', async ({authedPage: page}) => {
    await page.goto('/actions/1?dev=true');
    await expect(page.getByTestId('map-container')).toBeVisible();

    const [startRequest] = await Promise.all([
      page.waitForRequest((req) => req.url().includes('/actions/startAction') && req.method() === 'POST'),
      (async () => {
        await page.getByTestId('start-action-btn').click();
        await page.getByTestId('confirm-start-action-btn').click();
      })(),
    ]);

    const url = new URL(startRequest.url());
    expect(url.searchParams.get('actionId')).toBe('1');

    // Idempotency: clicking the start button again must not fire a second call.
    await expect(page.getByTestId('start-action-btn')).toBeDisabled();
  });

  test('fires /actions/completeAction exactly once after the last checkpoint is reached', async ({
    authedPage: page,
  }) => {
    await page.goto('/actions/1?dev=true');
    await expect(page.getByTestId('map-container')).toBeVisible();

    // Start the action.
    await page.getByTestId('start-action-btn').click();
    await page.getByTestId('confirm-start-action-btn').click();
    await expect(page.getByTestId('start-action-btn')).toBeDisabled();

    // Count POSTs to /actions/completeAction across the whole walk-through.
    let completeCount = 0;
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/actions/completeAction')) {
        completeCount += 1;
      }
    });

    // Teleport through all checkpoints. The dev spec already proves this works;
    // here we only care that the final check-in triggers /completeAction.
    const teleportLocator = page.locator('[data-testid^="checkpoint-teleport-"]');
    const initialCount = await teleportLocator.count();
    expect(initialCount).toBeGreaterThan(0);

    // Final checkpoint click must also fire /completeAction; await both.
    for (let i = 0; i < initialCount - 1; i++) {
      const remaining = page.locator('[data-testid^="checkpoint-teleport-"]');
      await remaining.first().click();
      await expect(remaining).toHaveCount(initialCount - i - 1);
    }

    const [completeRequest] = await Promise.all([
      page.waitForRequest((req) => req.url().includes('/actions/completeAction') && req.method() === 'POST'),
      page.locator('[data-testid^="checkpoint-teleport-"]').first().click(),
    ]);

    const completeUrl = new URL(completeRequest.url());
    expect(completeUrl.searchParams.get('actionId')).toBe('1');

    // Give any in-flight follow-up call a chance to land, then assert exactly one.
    await expect(page.locator('[data-testid^="checkpoint-teleport-"]')).toHaveCount(0);
    expect(completeCount).toBe(1);
  });
});
