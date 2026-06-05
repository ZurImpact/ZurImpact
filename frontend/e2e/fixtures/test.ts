import {test as base, expect, type APIRequestContext, type BrowserContext, type Page} from '@playwright/test';
import {loginViaApi, type TestUserKey} from '../helpers/auth';
import {resetMockState} from '../helpers/mockState';

export interface ZiFixtures {
  /** A page authenticated as the seeded `alice` user, with mock state reset. */
  authedPage: Page;
  /** A page authenticated as the seeded admin, with mock state reset. */
  adminPage: Page;
  /** Reset the mock server mid-test (e.g. between nested describes). */
  resetState: () => Promise<void>;
}

/**
 * Logs in via API and copies the resulting AUTH_SESSION cookie onto the
 * BrowserContext so the next `page.goto` sees the user as authenticated.
 *
 * APIRequestContext and BrowserContext maintain separate cookie jars, so we
 * read cookies from the request's storage state and inject them into the
 * browser context manually.
 */
async function loginAs(context: BrowserContext, request: APIRequestContext, user: TestUserKey): Promise<void> {
  await loginViaApi(request, {user});
  const storage = await request.storageState();
  if (storage.cookies.length > 0) {
    await context.addCookies(storage.cookies);
  }
}

export const test = base.extend<ZiFixtures>({
  resetState: async ({request}, use) => {
    await use(async () => {
      await resetMockState(request);
    });
  },

  authedPage: async ({page, context, request}, use) => {
    await resetMockState(request);
    await loginAs(context, request, 'user');
    await use(page);
  },

  adminPage: async ({page, context, request}, use) => {
    await resetMockState(request);
    await loginAs(context, request, 'admin');
    await use(page);
  },
});

export {expect};
