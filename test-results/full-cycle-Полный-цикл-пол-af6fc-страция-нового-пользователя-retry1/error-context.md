# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-cycle.spec.ts >> Полный цикл пользователя NEWSY >> 2. Регистрация нового пользователя
- Location: tests\e2e\full-cycle.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')
    - locator resolved to 2 elements. Proceeding with the first one: <button type="submit">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="auth-left">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="auth-left">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    53 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="auth-left">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e7]:
      - link "NEWSY" [ref=e8] [cursor=pointer]:
        - /url: /
        - heading "NEWSY" [level=1] [ref=e9]
      - paragraph [ref=e10]:
        - text: Платформа интерактивных челенджей.
        - text: Растей над собой, соревнуйся с друзьями и получай реальные награды.
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: 50k+
          - generic [ref=e14]: участников
        - generic [ref=e15]:
          - generic [ref=e16]: 1.2k
          - generic [ref=e17]: челенджей
        - generic [ref=e18]:
          - generic [ref=e19]: "4.9"
          - generic [ref=e20]: рейтинг
    - generic [ref=e22]:
      - generic [ref=e23]:
        - button "Вход" [ref=e24] [cursor=pointer]
        - button "Регистрация" [ref=e25] [cursor=pointer]
      - generic [ref=e28]:
        - generic [ref=e30]:
          - heading "С возвращением!" [level=2] [ref=e31]
          - paragraph [ref=e32]: Войдите в NEWSY, чтобы продолжить свои челенджи
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e35]: Email или Телефон
              - generic [ref=e36]:
                - img [ref=e38]
                - textbox "demo@newsy.ru" [ref=e41]
            - generic [ref=e42]:
              - generic [ref=e43]: Пароль
              - generic [ref=e44]:
                - img [ref=e46]
                - textbox "••••••••" [ref=e49]: TestPass123!
                - button [ref=e50] [cursor=pointer]:
                  - img [ref=e51]
            - button "Войти" [ref=e54] [cursor=pointer]:
              - text: Войти
              - img [ref=e55]
          - paragraph [ref=e57]:
            - text: Нет аккаунта?
            - link "Зарегистрироваться" [ref=e58] [cursor=pointer]:
              - /url: /register
        - generic [ref=e60]:
          - heading "Создать аккаунт" [level=2] [ref=e61]
          - paragraph [ref=e62]: Зарегистрируйтесь, чтобы участвовать в челленджи
          - generic [ref=e63]:
            - generic [ref=e64]:
              - generic [ref=e65]:
                - generic [ref=e66]: Имя
                - generic [ref=e67]:
                  - img [ref=e69]
                  - textbox "Алексей" [ref=e72]: Тест
              - generic [ref=e73]:
                - generic [ref=e74]: Фамилия
                - generic [ref=e75]:
                  - img [ref=e77]
                  - textbox "Иванов" [ref=e80]: Пользователь
            - generic [ref=e81]:
              - generic [ref=e82]: Email
              - generic [ref=e83]:
                - img [ref=e85]
                - textbox "demo@newsy.ru" [ref=e88]: test-1782663373055@newsy.ru
            - generic [ref=e89]:
              - generic [ref=e90]: Пароль
              - generic [ref=e91]:
                - img [ref=e93]
                - textbox "Минимум 6 символов" [ref=e96]
                - button [ref=e97] [cursor=pointer]:
                  - img [ref=e98]
            - generic [ref=e101]:
              - generic [ref=e102]: Повторите пароль
              - generic [ref=e103]:
                - img [ref=e105]
                - textbox "Повторите пароль" [active] [ref=e108]: TestPass123!
            - generic [ref=e109]:
              - generic [ref=e110]: Код приглашения (необязательно)
              - generic [ref=e111]:
                - img [ref=e113]
                - 'textbox "Например: IVANOV2026" [ref=e116]'
            - button "Зарегистрироваться" [ref=e117] [cursor=pointer]:
              - text: Зарегистрироваться
              - img [ref=e118]
          - paragraph [ref=e120]:
            - text: Уже есть аккаунт?
            - link "Войти" [ref=e121] [cursor=pointer]:
              - /url: /login
  - alert [ref=e122]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'https://newsy-demo.vercel.app';
  4   | 
  5   | test.describe('Полный цикл пользователя NEWSY', () => {
  6   | 
  7   |   test('1. Главная страница загружается', async ({ page }) => {
  8   |     await page.goto(BASE_URL);
  9   |     await expect(page).toHaveTitle(/NEWSY/);
  10  |     console.log('✅ Главная загружена');
  11  |   });
  12  | 
  13  |   test('2. Регистрация нового пользователя', async ({ page }) => {
  14  |     await page.goto(`${BASE_URL}/register`);
  15  |     await page.fill('input[name="firstName"]', 'Тест');
  16  |     await page.fill('input[name="lastName"]', 'Пользователь');
  17  |     await page.fill('input[name="email"]', `test-${Date.now()}@newsy.ru`);
  18  |     await page.fill('input[name="password"]', 'TestPass123!');
  19  |     await page.fill('input[name="confirm"]', 'TestPass123!');
> 20  |     await page.click('button[type="submit"]');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  21  | 
  22  |     // Ждём редиректа на главную
  23  |     await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
  24  |     console.log('✅ Регистрация прошла');
  25  |   });
  26  | 
  27  |   test('3. Авторизация', async ({ page }) => {
  28  |     await page.goto(`${BASE_URL}/login`);
  29  |     await page.fill('input[name="identifier"]', 'admin@newsy.ru');
  30  |     await page.fill('input[name="password"]', 'Newsy123!');
  31  |     await page.click('button[type="submit"]');
  32  | 
  33  |     await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
  34  |     console.log('✅ Авторизация прошла');
  35  |   });
  36  | 
  37  |   test('4. Поиск работает', async ({ page }) => {
  38  |     await page.goto(BASE_URL);
  39  |     // Клик на поисковую панель
  40  |     await page.click('.search-bar');
  41  |     await page.waitForTimeout(500);
  42  | 
  43  |     // Проверяем что модалка поиска открылась
  44  |     const modal = page.locator('.modal-overlay');
  45  |     await expect(modal).toBeVisible({ timeout: 5000 });
  46  |     console.log('✅ Модалка поиска открылась');
  47  |   });
  48  | 
  49  |   test('5. Профиль пользователя', async ({ page }) => {
  50  |     await page.goto(`${BASE_URL}/login`);
  51  |     await page.fill('input[name="identifier"]', 'admin@newsy.ru');
  52  |     await page.fill('input[name="password"]', 'Newsy123!');
  53  |     await page.click('button[type="submit"]');
  54  |     await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
  55  | 
  56  |     await page.goto(`${BASE_URL}/dashboard/profile`);
  57  |     await page.waitForTimeout(1000);
  58  | 
  59  |     // Проверяем что имя отображается
  60  |     const name = page.locator('.hero-name');
  61  |     await expect(name).toBeVisible();
  62  |     console.log('✅ Профиль загружен');
  63  |   });
  64  | 
  65  |   test('6. Страница создания челленджа', async ({ page }) => {
  66  |     await page.goto(`${BASE_URL}/login`);
  67  |     await page.fill('input[name="identifier"]', 'admin@newsy.ru');
  68  |     await page.fill('input[name="password"]', 'Newsy123!');
  69  |     await page.click('button[type="submit"]');
  70  |     await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
  71  | 
  72  |     await page.goto(`${BASE_URL}/dashboard/challenges/new`);
  73  |     await page.waitForTimeout(1000);
  74  | 
  75  |     // Проверяем что форма загрузилась
  76  |     const heading = page.locator('h1, h2, h3').first();
  77  |     await expect(heading).toBeVisible({ timeout: 5000 });
  78  |     console.log('✅ Страница создания челленджа загружена');
  79  |   });
  80  | 
  81  |   test('7. Проверка API челленджей', async ({ page }) => {
  82  |     const response = await page.goto(`${BASE_URL}/api/challenges`);
  83  |     expect(response?.status()).toBe(200);
  84  |     const data = await response?.json();
  85  |     expect(Array.isArray(data)).toBe(true);
  86  |     console.log(`✅ API отвечает, челленджей: ${data.length}`);
  87  |   });
  88  | 
  89  |   test('8. Проверка sitemap.xml', async ({ page }) => {
  90  |     const response = await page.goto(`${BASE_URL}/sitemap.xml`);
  91  |     expect(response?.status()).toBe(200);
  92  |     const text = await response?.text();
  93  |     expect(text).toContain('chillenge-russia.ru');
  94  |     console.log('✅ Sitemap работает');
  95  |   });
  96  | 
  97  |   test('9. Проверка robots.txt', async ({ page }) => {
  98  |     const response = await page.goto(`${BASE_URL}/robots.txt`);
  99  |     expect(response?.status()).toBe(200);
  100 |     const text = await response?.text();
  101 |     expect(text).toContain('User-agent');
  102 |     console.log('✅ Robots.txt работает');
  103 |   });
  104 | 
  105 |   test('10. Навигация работает', async ({ page }) => {
  106 |     await page.goto(BASE_URL);
  107 | 
  108 |     // Клик по логотипу — возврат на главную
  109 |     const logo = page.locator('.brand, a[href="/"]').first();
  110 |     if (await logo.isVisible()) {
  111 |       await logo.click();
  112 |       await page.waitForURL(BASE_URL + '/', { timeout: 5000 });
  113 |       console.log('✅ Навигация по логотипу работает');
  114 |     }
  115 |   });
  116 | 
  117 |   test('11. Регистрация с реферальным кодом', async ({ page }) => {
  118 |     await page.goto(`${BASE_URL}/register`);
  119 |     await page.fill('input[name="firstName"]', 'Реферал');
  120 |     await page.fill('input[name="lastName"]', 'Тестовый');
```