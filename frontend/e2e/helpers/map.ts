import type {Page} from '@playwright/test';

/**
 * Aborts all OpenStreetMap tile requests so the Leaflet map renders its DOM
 * but never blocks the test waiting for tile downloads (which are flaky and
 * rate-limited in CI). Map markers, popups, and the DOM container all still
 * render — we only suppress the imagery.
 */
export async function blockTileRequests(page: Page): Promise<void> {
  await page.route('**/tile.openstreetmap.org/**', (route) => route.abort());
  await page.route('**/*.tile.openstreetmap.org/**', (route) => route.abort());
}
