import {test, expect} from '../fixtures/test';

test.describe.configure({mode: 'serial'});

test.describe('profile / update', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('updates the profile username and shows a success status', async ({authedPage: page}) => {
    await page.goto('/profile');
    await expect(page.getByTestId('profile-page')).toBeVisible();

    const newName = `alice_${Date.now()}`;
    const input = page.getByTestId('profile-username-input');
    await input.fill(newName);
    await page.getByTestId('profile-username-submit').click();

    // The form renders a role=status banner on success.
    await expect(page.getByRole('status').first()).toBeVisible();
    await expect(input).toHaveValue(newName);
  });

  test('updates the profile email and shows a success status', async ({authedPage: page}) => {
    await page.goto('/profile');

    const newEmail = `alice_${Date.now()}@example.test`;
    const input = page.getByTestId('profile-email-input');
    await input.fill(newEmail);
    await page.getByTestId('profile-email-submit').click();

    await expect(page.getByRole('status').first()).toBeVisible();
    await expect(input).toHaveValue(newEmail);
  });
});
