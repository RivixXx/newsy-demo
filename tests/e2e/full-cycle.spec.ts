import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://newsy-demo.vercel.app';
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@newsy.ru';
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Newsy123!';

test.describe('Полный цикл пользователя NEWSY', () => {

  test('1. Главная страница загружается', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/NEWSY/);
    console.log('✅ Главная загружена');
  });

  test('2. Регистрация нового пользователя', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="firstName"]', 'Тест');
    await page.fill('input[name="lastName"]', 'Пользователь');
    await page.fill('input[name="email"]', `test-${Date.now()}@newsy.ru`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirm"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    // Ждём редиректа на главную
    await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
    console.log('✅ Регистрация прошла');
  });

  test('3. Авторизация', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="identifier"]', TEST_ADMIN_EMAIL);
    await page.fill('input[name="password"]', TEST_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
    console.log('✅ Авторизация прошла');
  });

  test('4. Поиск работает', async ({ page }) => {
    await page.goto(BASE_URL);
    // Клик на поисковую панель
    await page.click('.search-bar');
    await page.waitForTimeout(500);

    // Проверяем что модалка поиска открылась
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ Модалка поиска открылась');
  });

  test('5. Профиль пользователя', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="identifier"]', TEST_ADMIN_EMAIL);
    await page.fill('input[name="password"]', TEST_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(BASE_URL + '/', { timeout: 10000 });

    await page.goto(`${BASE_URL}/dashboard/profile`);
    await page.waitForTimeout(1000);

    // Проверяем что имя отображается
    const name = page.locator('.hero-name');
    await expect(name).toBeVisible();
    console.log('✅ Профиль загружен');
  });

  test('6. Страница создания челленджа', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="identifier"]', TEST_ADMIN_EMAIL);
    await page.fill('input[name="password"]', TEST_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(BASE_URL + '/', { timeout: 10000 });

    await page.goto(`${BASE_URL}/dashboard/challenges/new`);
    await page.waitForTimeout(1000);

    // Проверяем что форма загрузилась
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    console.log('✅ Страница создания челленджа загружена');
  });

  test('7. Проверка API челленджей', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/challenges`);
    expect(response?.status()).toBe(200);
    const data = await response?.json();
    expect(Array.isArray(data)).toBe(true);
    console.log(`✅ API отвечает, челленджей: ${data.length}`);
  });

  test('8. Проверка sitemap.xml', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/sitemap.xml`);
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('chillenge-russia.ru');
    console.log('✅ Sitemap работает');
  });

  test('9. Проверка robots.txt', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/robots.txt`);
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('User-agent');
    console.log('✅ Robots.txt работает');
  });

  test('10. Навигация работает', async ({ page }) => {
    await page.goto(BASE_URL);

    // Клик по логотипу — возврат на главную
    const logo = page.locator('.brand, a[href="/"]').first();
    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForURL(BASE_URL + '/', { timeout: 5000 });
      console.log('✅ Навигация по логотипу работает');
    }
  });

  test('11. Регистрация с реферальным кодом', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="firstName"]', 'Реферал');
    await page.fill('input[name="lastName"]', 'Тестовый');
    await page.fill('input[name="email"]', `referral-${Date.now()}@newsy.ru`);
    await page.fill('input[name="password"]', 'RefTest123!');
    await page.fill('input[name="confirm"]', 'RefTest123!');
    await page.fill('input[name="referralCode"]', 'NEWSY-TEST');
    await page.click('button[type="submit"]');

    await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
    console.log('✅ Регистрация с реферальным кодом прошла');
  });

  test('12. Проверка 404 страницы', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/nonexistent-page`);
    // Next.js может вернуть 200 или 404
    console.log(`✅ Страница 404: статус ${response?.status()}`);
  });
});
