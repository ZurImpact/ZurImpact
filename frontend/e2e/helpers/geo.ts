import type {BrowserContext} from '@playwright/test';

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Grant geolocation permission to the context and set an initial coordinate.
 * Once granted, subsequent setGeolocation calls fire `watchPosition` callbacks
 * in the page, allowing tests to drive GPS check-ins deterministically.
 */
export async function grantGeo(context: BrowserContext, initial: LatLng): Promise<void> {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation(initial);
}

/**
 * Walks the browser through a sequence of coordinates, optionally pausing
 * between updates to let the page's watchPosition callbacks fire. The pause
 * defaults to 250ms which is enough for Chromium to deliver the next position.
 */
export async function walkTo(
  context: BrowserContext,
  coords: LatLng[],
  options: {pauseMs?: number} = {},
): Promise<void> {
  const pauseMs = options.pauseMs ?? 250;
  for (const coord of coords) {
    await context.setGeolocation(coord);
    // We deliberately sleep here — Chromium's watchPosition cadence is not
    // observable from outside the page, so the only way to wait for the
    // next callback is a small fixed delay.
    await new Promise((r) => setTimeout(r, pauseMs));
  }
}
