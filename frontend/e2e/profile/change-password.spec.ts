import {test, expect} from '../fixtures/test';
import {TEST_USERS} from '../helpers/auth';

test.describe.configure({mode: 'serial'});

test.describe('profile / change password', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('changing the password signs the user out and lets them sign in with the new one', async ({
    authedPage: page,
  }) => {
    const newPassword = 'BrandNew2!';
    await page.goto('/profile');

    // Three password inputs render on the profile page: current / new / confirm.
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(TEST_USERS.user.password);
    await passwordInputs.nth(1).fill(newPassword);
    await passwordInputs.nth(2).fill(newPassword);

    await page.getByRole('button', {name: /change password/i}).click();

    // Backend revokes sessions; FE redirects to /login with reason=password_changed.
    await expect(page).toHaveURL(/\/login/);

    // Old password no longer works.
    await page.getByLabel(/username/i).fill(TEST_USERS.user.username);
    await page.getByLabel(/password/i).fill(TEST_USERS.user.password);
    await page.getByRole('button', {name: /sign in/i}).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // New password does.
    await page.getByLabel(/password/i).fill(newPassword);
    await page.getByRole('button', {name: /sign in/i}).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows an error when the current password is wrong', async ({authedPage: page}) => {
    await page.goto('/profile');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('not-my-real-password');
    await passwordInputs.nth(1).fill('AnotherOne2!');
    await passwordInputs.nth(2).fill('AnotherOne2!');

    await page.getByRole('button', {name: /change password/i}).click();

    // Still on /profile, with an alert visible.
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/profile/);
  });
});
