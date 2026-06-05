import {test, expect} from '../fixtures/test';

test.describe('admin / dashboard', () => {
  test('admin sees the Create GPS Action button on the dashboard', async ({adminPage: page}) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', {name: /create gps action/i})).toBeVisible();
  });

  test('non-admin user does not see the Create GPS Action button', async ({authedPage: page}) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', {name: /create gps action/i})).toHaveCount(0);
  });
});
