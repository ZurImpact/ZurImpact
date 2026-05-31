import {test, expect} from '../fixtures/test';
import {getLatestVerifyToken} from '../helpers/mockState';

test.describe.configure({mode: 'serial'});

/**
 * Helper: fills the register form. Kept inline so we don't grow the helper
 * surface for a single-spec utility.
 */
async function fillRegisterForm(
  page: import('@playwright/test').Page,
  {username, email, password}: {username: string; email: string; password: string},
): Promise<void> {
  await page.goto('/register');
  await page.getByLabel(/^username$/i).fill(username);
  await page.getByLabel(/^email$/i).fill(email);
  // Two password inputs: "Password" then "Confirm Password".
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill(password);
  await passwordInputs.nth(1).fill(password);
  await page.getByRole('button', {name: /create account/i}).click();
}

test.describe('auth / register', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('register → verify-email → sign in with the new account', async ({page, request}) => {
    const stamp = Date.now();
    const username = `new_user_${stamp}`;
    const email = `new_user_${stamp}@example.test`;
    const password = 'Password1!';

    await fillRegisterForm(page, {username, email, password});

    // FE navigates to /verify-email with pendingEmail state after a successful
    // POST /auth/register. URL is /verify-email (no token).
    await expect(page).toHaveURL(/\/verify-email/);

    // Grab the dev-only verify token the mock emitted for this email.
    const token = await getLatestVerifyToken(request, email);
    expect(token, 'mock server should have issued a verify token').not.toBeNull();

    // Visiting /verify-email?token=... triggers the verify thunk.
    await page.goto(`/verify-email?token=${token!}`);
    await expect(page.getByRole('link', {name: /continue to sign in/i})).toBeVisible();

    // Sign in with the freshly verified account.
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', {name: /sign in/i}).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('surfaces an error and stays on /register when the username is already taken', async ({page}) => {
    // The seeded user "alice" is always present after resetState().
    await fillRegisterForm(page, {
      username: 'alice',
      email: `unique_${Date.now()}@example.test`,
      password: 'Password1!',
    });

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test('surfaces an error and stays on /register when the email is already taken', async ({page}) => {
    // alice's seeded email lives in get_current_user.json.
    await fillRegisterForm(page, {
      username: `unique_user_${Date.now()}`,
      email: 'alice@example.com',
      password: 'Password1!',
    });

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test('blocks login for an unverified account and redirects to /verify-email', async ({page, request}) => {
    const stamp = Date.now();
    const username = `unverified_${stamp}`;
    const email = `unverified_${stamp}@example.test`;
    const password = 'Password1!';

    // Register but do NOT consume the verify token.
    await fillRegisterForm(page, {username, email, password});
    await expect(page).toHaveURL(/\/verify-email/);

    // Sanity check: a token was issued but the account is still unverified.
    const token = await getLatestVerifyToken(request, email);
    expect(token).not.toBeNull();

    // Attempt to sign in. The mock returns 403 email_not_verified, which the
    // login page handles by redirecting to /verify-email?pending=1.
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', {name: /sign in/i}).click();

    await expect(page).toHaveURL(/\/verify-email\?pending=1/);
  });

  test('resend-verification form on /verify-email?pending=1 issues a fresh token', async ({page, request}) => {
    const stamp = Date.now();
    const username = `resend_${stamp}`;
    const email = `resend_${stamp}@example.test`;

    await fillRegisterForm(page, {username, email, password: 'Password1!'});
    await expect(page).toHaveURL(/\/verify-email/);

    const firstToken = await getLatestVerifyToken(request, email);
    expect(firstToken).not.toBeNull();

    // Hit the pending screen which mounts the resend form, then submit.
    await page.goto('/verify-email?pending=1');
    await page.getByLabel(/email/i).fill(email);
    await page.getByRole('button', {name: /resend|send/i}).click();

    // FE swaps the form for a success message on fulfilled.
    await expect(page.getByText(/check your inbox|sent again|resent/i)).toBeVisible();

    // The mock should have minted a second token for this email.
    const secondToken = await getLatestVerifyToken(request, email);
    expect(secondToken).not.toBeNull();
    expect(secondToken).not.toBe(firstToken);
  });
});
