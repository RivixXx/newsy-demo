import { expect, test } from '@playwright/test';

test('landing page is available', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.locator('body')).toBeVisible();
});

test('registration page is available', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator('form')).toBeVisible();
});
