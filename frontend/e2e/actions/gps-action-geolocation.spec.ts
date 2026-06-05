import {test, expect} from '../fixtures/test';
import {blockTileRequests} from '../helpers/map';

/**
 * Exercises the GPS action page through the *real* browser geolocation API,
 * driven by Playwright's `context.setGeolocation`. The sibling spec
 * `gps-action-dev.spec.ts` covers the `?dev=true` teleport shortcut; this one
 * covers the production code path where `navigator.geolocation.watchPosition`
 * is the trigger for checkpoint completion.
 *
 * NB: the app calls `toast.success()` / `toast.error()` but does not mount a
 * `<Toaster />` provider, so toast text never reaches the DOM. All assertions
 * here use durable DOM signals (button state, progress count, completion
 * banner, "Your Location" card) instead.
 *
 * Two scenarios:
 *
 *   1. Happy path — grant geolocation, walk through every checkpoint by
 *      setting the browser's reported coordinates to each checkpoint in
 *      sequence, and assert the UI advances accordingly.
 *
 *   2. Denied path — no permission grant; assert the page degrades to a
 *      usable state instead of locking the user out.
 */

// Coordinates of action id 1's four subTasks, from
// mock-server/payload/get_actions.json. MEDIUM threshold = 12.5m radius, so
// setting the geolocation exactly to a checkpoint reliably triggers a
// check-in for that checkpoint and nothing else (neighbouring checkpoints are
// ~150m+ apart).
const ACTION_1_CHECKPOINTS: ReadonlyArray<{
  index: number;
  name: string;
  lat: number;
  lng: number;
}> = [
  {index: 1, name: 'Start: Main Square', lat: 47.3769, lng: 8.5417},
  {index: 2, name: 'Checkpoint 1: City Park', lat: 47.378, lng: 8.543},
  {index: 3, name: 'Checkpoint 2: Old Town', lat: 47.3792, lng: 8.5445},
  {index: 4, name: 'Destination: Coffee Shop', lat: 47.3805, lng: 8.546},
];

const TOTAL_CHECKPOINTS = ACTION_1_CHECKPOINTS.length;

test.describe('actions / gps action (real geolocation)', () => {
  test.beforeEach(async ({authedPage: page}) => {
    await blockTileRequests(page);
  });

  test('walks through every checkpoint when the browser reports the checkpoint coordinates', async ({
    context,
    authedPage: page,
  }) => {
    // Permission must be granted on the BrowserContext, not the Page —
    // navigator.geolocation enforces this at the security-origin level.
    await context.grantPermissions(['geolocation']);

    // Seed a far-away location so the user is NOT within any checkpoint's
    // 12.5m radius on mount. Otherwise watchPosition would auto-complete
    // checkpoint 1 the moment the action starts.
    await context.setGeolocation({latitude: 0, longitude: 0});

    await page.goto('/actions/1'); // NB: no ?dev=true — real-geo code path
    await expect(page.getByTestId('map-container')).toBeVisible();

    // Sanity: with permission granted + a location set, the page should
    // render the "Your Location" indicator card. Use exact match to avoid
    // collisions with the "Your location is being tracked" status text.
    await expect(page.getByText('Your Location', {exact: true})).toBeVisible();

    // Start the action via the confirmation dialog. The start button
    // becoming disabled (label flips to "Already started") is the durable
    // post-start signal — no Toaster is mounted in this app, so toast
    // assertions don't work.
    await page.getByTestId('start-action-btn').click();
    await page.getByTestId('confirm-start-action-btn').click();
    await expect(page.getByTestId('start-action-btn')).toBeDisabled();

    // Walk to each checkpoint one at a time. setGeolocation pushes a new
    // position into the running watchPosition() handler in the page, which
    // fires the checkpoint completion logic in applyLocalLocation(). The
    // progress count rendered in the header is the most stable signal that
    // the per-checkpoint network round-trip has been applied to Redux.
    for (const cp of ACTION_1_CHECKPOINTS) {
      await context.setGeolocation({latitude: cp.lat, longitude: cp.lng});

      await expect(page.getByText(`${cp.index} / ${TOTAL_CHECKPOINTS} checkpoints`).first()).toBeVisible();
    }

    // Final state: the "All checkpoints reached!" banner is a real DOM
    // element (not a toast) and is the page's signal that finishGpsAction
    // has been dispatched.
    await expect(page.getByText(/all checkpoints reached/i)).toBeVisible();
  });

  test('degrades gracefully when the browser denies geolocation permission', async ({context, authedPage: page}) => {
    // Default Playwright permission for geolocation is denied — we make that
    // explicit here for readers and to insulate the test from any future
    // change in default behavior.
    await context.clearPermissions();

    await page.goto('/actions/1');
    await expect(page.getByTestId('map-container')).toBeVisible();

    // With no permission, watchPosition never reports a position, so
    // `userLocation` stays null and the "Your Location" indicator card
    // never renders. Exact match avoids colliding with the unrelated
    // "Your location is being tracked" status text.
    //
    // Give the page a beat to settle, then assert the card is absent.
    await page.waitForTimeout(500);
    await expect(page.getByText('Your Location', {exact: true})).toHaveCount(0);

    // The page degrades gracefully rather than locking the user out — the
    // start button is still rendered and enabled. The user simply can't
    // progress through checkpoints without a location signal.
    await expect(page.getByTestId('start-action-btn')).toBeEnabled();

    // And the progress count remains at zero — no checkpoint has been
    // completed.
    await expect(page.getByText(`0 / ${TOTAL_CHECKPOINTS} checkpoints`).first()).toBeVisible();
  });
});
