import {test, expect} from '../fixtures/test';
import {getLatestVerifyToken} from '../helpers/mockState';

test.describe.configure({mode: 'serial'});

test.describe('auth / register', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('register → verify-email → sign in with the new account', async ({page, request}) => {
    const stamp = Date.now();
    const username = `new_user_${stamp}`;
    const email = `new_user_${stamp}@example.test`;
    const password = 'Password1!';

    await page.goto('/register');
    await page.getByLabel(/^username$/i).fill(username);
    await page.getByLabel(/^email$/i).fill(email);

    // There are two password inputs (password + confirm). The first label match
    // is "Password", the second "Confirm Password".
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);

    await page.getByRole('button', {name: /create account/i}).click();

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
});
