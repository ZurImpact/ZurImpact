import {test, expect} from '../fixtures/test';
import {blockTileRequests} from '../helpers/map';

/**
 * Regression lock for ZI-269 — when the GPS action detail page is open, the
 * sticky top nav and other overlays must render above the Leaflet map. Leaflet
 * sets its own high z-indexes on tile/marker panes, so the fix bumps the nav's
 * z-index above them.
 *
 * The check is structural: we assert the nav is visible and clickable while the
 * map container is also visible — i.e. it's not being painted under the map.
 */
test.describe('regression / ZI-269 map overlay z-index', () => {
  test('app nav stays above the Leaflet map on the GPS action detail page', async ({authedPage: page}) => {
    await blockTileRequests(page);
    await page.goto('/actions/1?dev=true');

    const map = page.getByTestId('map-container');
    const nav = page.getByTestId('app-nav');

    await expect(map).toBeVisible();
    await expect(nav).toBeVisible();

    // If the map painted over the nav, the nav box would be obscured at
    // viewport coordinates within its bounding box. Verify the nav is the
    // topmost element at one of its centers.
    const navBox = await nav.boundingBox();
    expect(navBox).not.toBeNull();
    if (!navBox) return;

    const centerX = navBox.x + navBox.width / 2;
    const centerY = navBox.y + navBox.height / 2;

    const topMostInsideNav = await page.evaluate(
      ({x, y}) => {
        const el = document.elementFromPoint(x, y);
        return el ? el.closest('[data-testid="app-nav"]') !== null : false;
      },
      {x: centerX, y: centerY},
    );
    expect(topMostInsideNav).toBe(true);
  });
});
