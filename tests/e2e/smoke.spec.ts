import { expect, test } from '@playwright/test';

test('public challenge catalog is the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Найди свой челлендж' })).toBeVisible();
});

test('registration page is available', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator('form')).toBeVisible();
});
