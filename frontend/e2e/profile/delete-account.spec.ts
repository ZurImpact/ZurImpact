import {test, expect} from '../fixtures/test';
import {TEST_USERS} from '../helpers/auth';

test.describe.configure({mode: 'serial'});

test.describe('profile / delete account', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('deleting the account logs the user out and prevents re-login', async ({authedPage: page}) => {
    await page.goto('/profile');

    // The delete handler uses window.confirm — auto-accept the dialog.
    page.once('dialog', (dialog) => {
      void dialog.accept();
    });

    await page.getByTestId('profile-delete-btn').click();

    // FE navigates to /login after deletion succeeds.
    await expect(page).toHaveURL(/\/login/);

    // Trying to sign back in with the same credentials should now fail
    // (the user no longer exists on the mock server).
    await page.getByLabel(/username/i).fill(TEST_USERS.user.username);
    await page.getByLabel(/password/i).fill(TEST_USERS.user.password);
    await page.getByRole('button', {name: /sign in/i}).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
