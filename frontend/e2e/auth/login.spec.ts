import {test, expect} from '../fixtures/test';
import {clearSession, loginViaUi} from '../helpers/auth';

test.describe.configure({mode: 'serial'});

test.describe('auth / login', () => {
  test.beforeEach(async ({resetState}) => {
    await resetState();
  });

  test('logs in with valid credentials and lands on the dashboard', async ({page}) => {
    await loginViaUi(page, {user: 'user'});
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('app-nav')).toBeVisible();
    await expect(page.getByTestId('user-points')).toBeVisible();
  });

  test('shows an invalid-credentials banner when the password is wrong', async ({page}) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('alice');
    await page.getByLabel(/password/i).fill('definitely-wrong');
    await page.getByRole('button', {name: /sign in/i}).click();

    // The error banner uses role=alert; assert visibility without depending on
    // a translation string (we only ship EN/DE — the role contract is stable).
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated visits to /dashboard to /login', async ({page, context}) => {
    await clearSession(context);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logs out via the nav and returns to /login', async ({authedPage: page}) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('app-nav')).toBeVisible();

    await page.getByRole('button', {name: /sign\s*out|logout/i}).click();
    await expect(page).toHaveURL(/\/login/);

    // After logout the points badge should be gone (it only renders when authed).
    await expect(page.getByTestId('user-points')).toHaveCount(0);
  });
});
