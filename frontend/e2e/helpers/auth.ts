import type {APIRequestContext, BrowserContext, Page} from '@playwright/test';

/**
 * Credentials used by every fixture. Mirrors the mock-server seed (see
 * frontend/mock-server/index.js — mockCurrentUser + admin user gated behind
 * MOCK_TEST_MODE=1).
 */
export const TEST_USERS = {
  user: {username: 'alice', password: 'Password1!'},
  admin: {username: 'admin', password: 'Password1!'},
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

/**
 * The frontend proxies /backend_war_exploded/api -> the mock server on port
 * 4000. Tests call the proxy through the Vite dev server (baseURL) so the
 * AUTH_SESSION cookie is scoped to the same origin the browser uses.
 */
const API_BASE = '/backend_war_exploded/api';

interface LoginViaApiOptions {
  user?: TestUserKey;
}

/**
 * Performs the real /auth/login flow through the API and returns nothing —
 * the resulting AUTH_SESSION cookie is stored on the shared request context
 * (which BrowserContext.request shares cookies with).
 */
export async function loginViaApi(request: APIRequestContext, options: LoginViaApiOptions = {}): Promise<void> {
  const key = options.user ?? 'user';
  const {username, password} = TEST_USERS[key];
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: {username, password},
  });
  if (!response.ok()) {
    throw new Error(`loginViaApi failed: ${response.status()} ${await response.text()}`);
  }
}

/**
 * Full UI login flow — only used by the login spec itself. Other specs should
 * prefer loginViaApi for speed and to avoid coupling to translation strings.
 */
export async function loginViaUi(page: Page, options: LoginViaApiOptions = {}): Promise<void> {
  const key = options.user ?? 'user';
  const {username, password} = TEST_USERS[key];
  await page.goto('/login');
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', {name: /sign in|log in|submit/i}).click();
  await page.waitForURL(/\/dashboard/);
}

/**
 * Force the BrowserContext to drop the AUTH_SESSION cookie. Useful for tests
 * that need to verify protected-route redirects.
 */
export async function clearSession(context: BrowserContext): Promise<void> {
  await context.clearCookies();
}
