import type {APIRequestContext} from '@playwright/test';

// Hit the mock server directly rather than via the Vite proxy.
// In real-backend mode, Vite strips `/backend_war_exploded` so both Tomcat layouts work.
// In mock mode (`VITE_USE_MOCK=1`), the proxy keeps the prefix because the mock registers
// routes under `/backend_war_exploded/api`. Test-only endpoints also only exist on the mock.
const MOCK_BASE = 'http://localhost:4000/backend_war_exploded/api';
const RESET_URL = `${MOCK_BASE}/_test/reset`;
const DEV_TOKENS_URL = `${MOCK_BASE}/auth/dev-tokens`;

/**
 * Restores the mock server to its seed state — seeded user, seeded admin,
 * initial points + reward availability counters, no sessions or tokens.
 *
 * Gated on the server side behind MOCK_TEST_MODE=1 (set by the Playwright
 * webServer config). Throws when the server is not in test mode so we fail
 * loudly instead of silently sharing state between specs.
 */
export async function resetMockState(request: APIRequestContext): Promise<void> {
  const response = await request.post(RESET_URL);
  if (response.status() === 404) {
    throw new Error('resetMockState: /_test/reset returned 404 — mock server is not running with MOCK_TEST_MODE=1.');
  }
  if (!response.ok()) {
    throw new Error(`resetMockState failed: ${response.status()} ${await response.text()}`);
  }
}

export interface DevToken {
  email: string;
  token: string;
  url: string;
}

interface DevTokensResponse {
  verifyEmail: DevToken[];
  passwordReset: DevToken[];
}

/**
 * Reads outstanding verify/reset tokens from the mock server. Used by the
 * register and password-reset specs to grab the token the mock emitted
 * without scraping stdout.
 */
export async function getDevTokens(request: APIRequestContext): Promise<DevTokensResponse> {
  const response = await request.get(DEV_TOKENS_URL);
  if (!response.ok()) {
    throw new Error(`getDevTokens failed: ${response.status()} ${await response.text()}`);
  }
  return (await response.json()) as DevTokensResponse;
}

/**
 * Returns the most recent verify-email token issued for `email`, or null.
 */
export async function getLatestVerifyToken(request: APIRequestContext, email: string): Promise<string | null> {
  const tokens = await getDevTokens(request);
  const match = [...tokens.verifyEmail].reverse().find((t) => t.email === email);
  return match?.token ?? null;
}

/**
 * Returns the most recent password-reset token issued for `email`, or null.
 */
export async function getLatestResetToken(request: APIRequestContext, email: string): Promise<string | null> {
  const tokens = await getDevTokens(request);
  const match = [...tokens.passwordReset].reverse().find((t) => t.email === email);
  return match?.token ?? null;
}
