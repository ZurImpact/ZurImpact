import {test, expect} from '../fixtures/test';

test.describe.configure({mode: 'serial'});

/**
 * Edge cases for the email-change flow that complement profile/update.spec.ts
 * (which covers the happy path). Covers:
 *
 *  - 409 collision when the new email belongs to another user
 *  - /verify-email-change without a token (fallback UI)
 *  - /verify-email-change with an invalid token (rejected UI)
 *
 * The mock currently completes email changes immediately without minting a
 * token, so the verify-email-change happy path is not exercised here. Add it
 * once the mock (or real backend) issues a token via /users/me/email-change.
 */
test.describe('profile / email change', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('shows an error when the requested email is already in use', async ({authedPage: page}) => {
    await page.goto('/profile');
    await expect(page.getByTestId('profile-page')).toBeVisible();

    // The admin user (seeded under MOCK_TEST_MODE=1) owns admin@example.com.
    // Attempting to claim that address must surface a 409 in the UI.
    const input = page.getByTestId('profile-email-input');
    await input.fill('admin@example.com');
    await page.getByTestId('profile-email-submit').click();

    // The form renders a role=alert banner on rejected updates.
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(input).toHaveValue('admin@example.com');

    // The seeded email must not have been overwritten.
    await page.reload();
    await expect(page.getByTestId('profile-email-input')).toHaveValue('alice@example.com');
  });

  test('verify-email-change page without a token shows the fallback UI', async ({authedPage: page}) => {
    await page.goto('/verify-email-change');

    // Fallback CTA returns the user to the dashboard.
    await expect(page.getByRole('link', {name: /dashboard|home/i})).toBeVisible();
  });

  test('verify-email-change page with an invalid token shows the failure UI', async ({authedPage: page}) => {
    await page.goto('/verify-email-change?token=not-a-real-token');

    // The mock always 400s for /auth/verify-email-change, so the page must
    // render the rejected branch — assert on the role=alert banner.
    await expect(page.getByRole('alert')).toBeVisible();

    // And it must offer a way back to the profile page.
    await expect(page.getByRole('link', {name: /profile/i})).toBeVisible();
  });
});
