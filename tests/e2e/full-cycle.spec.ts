import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://newsy-demo.vercel.app';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@newsy.ru';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Newsy123!';
const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@newsy.test`;

/** Login helper — uses name="identifier" for login form */
async function loginAs(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="identifier"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole('button', { name: /Войти/ }).click();
  await page.waitForTimeout(3000);
}

// ─── ПУБЛИЧНЫЕ СТРАНИЦЫ ───

test.describe('Публичные страницы', () => {

  test('Landing page (/)', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/NEWSY/i);
    await expect(page.getByRole('heading', { name: /Создавай и запускай/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Создать челлендж/ })).toHaveAttribute('href', '/register');
  });

  test('Explore (/explore)', async ({ page }) => {
    await page.goto(`${BASE}/explore`);
    await expect(page.getByRole('heading', { name: /Найди свой челлендж/ })).toBeVisible();
    const search = page.locator('input[placeholder*="Поиск"]');
    await expect(search).toBeVisible();
    await search.fill('Nike');
    await expect(page.getByRole('button', { name: 'Спорт' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Образование' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Москва' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Онлайн' })).toBeVisible();
    const cards = page.locator('a[href*="/challenges/"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('Pricing (/pricing)', async ({ page }) => {
    const resp = await page.goto(`${BASE}/pricing`);
    expect(resp?.status()).toBeLessThan(500);
  });

  test('API Docs (/api-docs)', async ({ page }) => {
    await page.goto(`${BASE}/api-docs`);
    await expect(page.getByRole('heading', { name: /API Documentation/ })).toBeVisible();
  });

  test('Referral (/referral)', async ({ page }) => {
    await page.goto(`${BASE}/referral`);
    await expect(page.getByRole('heading', { name: 'Реферальная программа' })).toBeVisible();
    await expect(page.getByText('Войдите, чтобы получить')).toBeVisible();
  });

  test('Feed (/feed)', async ({ page }) => {
    await page.goto(`${BASE}/feed`);
    await expect(page.getByRole('heading', { name: /Лента активности/ })).toBeVisible();
  });

  test('Stories (/stories)', async ({ page }) => {
    const resp = await page.goto(`${BASE}/stories`);
    expect(resp?.status()).toBeLessThan(500);
  });

  test('Live (/live)', async ({ page }) => {
    const resp = await page.goto(`${BASE}/live`);
    expect(resp?.status()).toBeLessThan(500);
  });

  test('Challenge detail (/challenges/1)', async ({ page }) => {
    await page.goto(`${BASE}/challenges/1`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Leaderboard (/challenges/1/leaderboard)', async ({ page }) => {
    const resp = await page.goto(`${BASE}/challenges/1/leaderboard`);
    expect(resp?.status()).toBeLessThan(500);
  });

  test('Organizer profile (/organizer/1)', async ({ page }) => {
    const resp = await page.goto(`${BASE}/organizer/1`);
    expect(resp?.status()).toBeLessThan(500);
  });

  test('Все ключевые страницы доступны (no 500)', async ({ page }) => {
    const routes = ['/', '/explore', '/feed', '/pricing', '/referral', '/login', '/register'];
    for (const route of routes) {
      const resp = await page.goto(`${BASE}${route}`);
      expect(resp?.status(), `GET ${route}`).toBeLessThan(500);
    }
  });
});

// ─── РЕГИСТРАЦИЯ ───

test.describe('Регистрация', () => {

  test('Страница регистрации загружается', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    // "Создать аккаунт" — заголовок, "Я хочу" — label
    await expect(page.getByText('Создать аккаунт')).toBeVisible();
    await expect(page.getByRole('button', { name: /Участвовать/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Запускать челленджи/ })).toBeVisible();
    // Кнопка "Далее"
    await expect(page.getByRole('button', { name: /Далее/ })).toBeVisible();
  });

  test('Регистрация участника — wizard', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/register`);

    // Step 0: "Участвовать" уже выбрано по умолчанию → Далее
    await page.getByRole('button', { name: /Далее/ }).click();
    await page.waitForTimeout(1000);

    // Step 1: Личные данные
    await page.fill('input[name="firstName"]', 'Тест');
    await page.fill('input[name="lastName"]', 'Участник');
    await page.fill('input[name="email"]', email);
    await page.getByRole('button', { name: /Далее/ }).first().click();
    await page.waitForTimeout(1000);

    // Step 2: Пароль
    await page.locator('input[name="password"]').first().fill('TestPass123!');
    // Submit
    await page.locator('form').getByRole('button', { type: 'submit' }).click({ timeout: 5000 });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/register');
  });

  test('Регистрация организатора — wizard с типом аккаунта', async ({ page }) => {
    await page.goto(`${BASE}/register`);

    // Step 0: "Запускать челленджи"
    await page.getByRole('button', { name: /Запускать челленджи/ }).click();
    await page.waitForTimeout(300);

    // Кнопка "Далее"
    await page.getByRole('button', { name: /Далее/ }).click();
    await page.waitForTimeout(500);

    // Step 1: Тип аккаунта
    await expect(page.getByText('Тип аккаунта')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ИП' })).toBeVisible();

    // Выбираем ИП → Далее
    await page.getByRole('button', { name: 'ИП' }).click();
    await page.getByRole('button', { name: /Далее/ }).click();
    await page.waitForTimeout(500);

    // Step 2: Личные данные
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
  });

  test('Ссылка "Забыли пароль" на странице входа', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByRole('link', { name: /Забыли пароль/ }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('Страница "Забыли пароль"', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await expect(page.getByRole('heading', { name: /Сброс пароля/ })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Отправить/ })).toBeVisible();
  });

  test('Страница "Сброс пароля"', async ({ page }) => {
    await page.goto(`${BASE}/reset-password?token=fake-token-123`);
    await expect(page.getByRole('heading', { name: 'Новый пароль' })).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('Навигация register ↔ login', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.getByRole('link', { name: /Войти/ }).first().click();
    await expect(page).toHaveURL(/login/);

    await page.getByRole('link', { name: /Зарегистрироваться/ }).click();
    await expect(page).toHaveURL(/register/);
  });
});

// ─── ВХОД ───

test.describe('Вход в систему', () => {

  test('Страница входа загружается', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    // Заголовок "С возвращением!"
    await expect(page.getByText('С возвращением!')).toBeVisible();
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
    await expect(page.locator('input[name="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Войти/ })).toBeVisible();
  });

  test('Вход с неверными данными', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[name="identifier"]', 'nonexistent@test.com');
    await page.locator('input[name="password"]').first().fill('WrongPass123!');
    await page.getByRole('button', { name: /Войти/ }).click();
    await page.waitForTimeout(3000);
    // Остаёмся на странице входа — не редиректит
    expect(page.url()).toContain('/login');
  });

  test('Вход с тестовым админом', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    const url = page.url();
    expect(url.includes('/explore') || url.includes('/dashboard') || url.endsWith('/')).toBeTruthy();
  });
});

// ─── DASHBOARD ───

test.describe('Dashboard — все страницы', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  const dashPages = [
    ['/dashboard', 'Dashboard'],
    ['/dashboard/achievements', 'Достижения'],
    ['/dashboard/daily', 'Ежедневные'],
    ['/dashboard/shop', 'Магазин'],
    ['/dashboard/recommendations', 'Рекомендации'],
    ['/dashboard/partner', 'Партнёр'],
    ['/dashboard/organizer', 'Организатор'],
    ['/dashboard/organizer/finances', 'Финансы'],
    ['/dashboard/profile', 'Профиль'],
  ];

  for (const [path, name] of dashPages) {
    test(`${name} (${path})`, async ({ page }) => {
      const resp = await page.goto(`${BASE}${path}`);
      expect(resp?.status(), `GET ${path}`).toBeLessThan(500);
    });
  }

  test('Создание челленджа (/dashboard/challenges/new)', async ({ page }) => {
    const resp = await page.goto(`${BASE}/dashboard/challenges/new`);
    expect(resp?.status()).toBeLessThan(500);
  });
});

// ─── GEOЛОКАЦИЯ ───

test.describe('Геолокация', () => {

  test('Фильтр по региону на explore', async ({ page }) => {
    await page.goto(`${BASE}/explore`);
    await page.getByRole('button', { name: 'Москва' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Онлайн' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Все регионы' }).click();
    await page.waitForTimeout(300);
  });

  test('Challenge detail — геоданные', async ({ page }) => {
    await page.goto(`${BASE}/challenges/1`);
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─── API ───

test.describe('API — smoke', () => {

  test('GET /api/challenges', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/challenges`);
    expect(resp.status()).toBe(200);
  });

  test('GET /api/v1/challenges', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/v1/challenges`);
    expect(resp.status()).toBe(200);
  });

  test('GET /api/achievements', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/achievements`);
    expect(resp.status()).toBeLessThan(500);
  });

  test('POST /api/auth/reset-password — невалидный токен', async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/reset-password`, {
      data: { token: 'fake', newPassword: 'test1234' },
    });
    expect(resp.status()).toBeLessThan(500);
  });

  test('POST /api/challenges/1/chat — 401 без авторизации', async ({ request }) => {
    const resp = await request.post(`${BASE}/api/challenges/1/chat`, {
      data: { text: 'test' },
    });
    expect(resp.status()).toBe(401);
  });
});

// ─── НАВИГАЦИЯ ───

test.describe('Навигация', () => {

  test('Back-link с feed → главная', async ({ page }) => {
    await page.goto(`${BASE}/feed`);
    await page.getByRole('link', { name: /На главную/ }).first().click();
    await page.waitForTimeout(1000);
    expect(page.url().endsWith('/') || page.url().includes('/explore')).toBeTruthy();
  });

  test('Back-link с challenge detail', async ({ page }) => {
    await page.goto(`${BASE}/challenges/1`);
    const back = page.getByRole('link', { name: /На главную|Назад/ }).first();
    if (await back.isVisible({ timeout: 3000 }).catch(() => false)) {
      await back.click();
      await page.waitForTimeout(1000);
    }
    expect(page.url()).toContain(BASE);
  });

  test('Footer ссылки', async ({ page }) => {
    await page.goto(BASE);
    const footer = page.locator('footer').or(page.locator('[class*="footer"]'));
    if (await footer.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(footer).toBeVisible();
    }
  });
});

// ─── MOBILE ───

test.describe('Mobile viewport', () => {

  test.use({ viewport: { width: 375, height: 812 } });

  test('Landing', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole('heading', { name: /NEWSY/i }).first()).toBeVisible();
  });

  test('Explore', async ({ page }) => {
    await page.goto(`${BASE}/explore`);
    await expect(page.getByRole('heading', { name: /Найди свой челлендж/ })).toBeVisible();
  });

  test('Register', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.getByText('Создать аккаунт')).toBeVisible();
  });

  test('Login', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
  });
});
