import {test, expect} from '../fixtures/test';
import {getLatestResetToken} from '../helpers/mockState';
import {TEST_USERS} from '../helpers/auth';

test.describe.configure({mode: 'serial'});

test.describe('auth / password reset', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('requests a reset link, sets a new password, and signs in with it', async ({page, request}) => {
    const seedEmail = 'alice@example.com'; // matches get_current_user.json seed
    const newPassword = 'NewPassword2!';

    // 1. Request reset
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill(seedEmail);
    await page.getByRole('button', {name: /send reset link/i}).click();

    // The forgot-password page swaps to a success card on fulfillment.
    // The card renders an "If an account with that address exists, we've sent
    // a password reset link" paragraph — assert via the stable substring.
    await expect(page.getByText(/sent a password reset link/i)).toBeVisible();

    // 2. Pull the reset token the mock emitted.
    const token = await getLatestResetToken(request, seedEmail);
    expect(token, 'mock server should have issued a reset token').not.toBeNull();

    // 3. Confirm reset
    await page.goto(`/reset-password?token=${token!}`);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(newPassword);
    await passwordInputs.nth(1).fill(newPassword);
    await page.getByRole('button', {name: /reset password/i}).click();

    // Success card shows a "Sign in" link.
    await expect(page.getByRole('link', {name: /^sign in$/i})).toBeVisible();

    // 4. Old password no longer works.
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(TEST_USERS.user.username);
    await page.getByLabel(/password/i).fill(TEST_USERS.user.password);
    await page.getByRole('button', {name: /sign in/i}).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // 5. New password does.
    await page.getByLabel(/password/i).fill(newPassword);
    await page.getByRole('button', {name: /sign in/i}).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows a missing-token error when /reset-password has no token', async ({page}) => {
    await page.goto('/reset-password');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('link', {name: /request a new one/i})).toBeVisible();
  });
});
