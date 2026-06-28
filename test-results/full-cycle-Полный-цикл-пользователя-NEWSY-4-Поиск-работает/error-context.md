# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-cycle.spec.ts >> Полный цикл пользователя NEWSY >> 4. Поиск работает
- Location: tests\e2e\full-cycle.spec.ts:37:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.search-bar')
    - locator resolved to <div class="jsx-499a4a686618379 search-bar">…</div>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="jsx-2aa17f9974e988e2 popup-wrap">…</div> from <div>…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="jsx-2aa17f9974e988e2 popup-wrap">…</div> from <div>…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    29 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="jsx-2aa17f9974e988e2 popup-wrap">…</div> from <div>…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "NEWSY Logo NEWSY" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "NEWSY Logo" [ref=e7]
          - generic [ref=e8]: NEWSY
        - generic [ref=e10]:
          - button "Куда Все категории" [ref=e12] [cursor=pointer]:
            - generic [ref=e13]: Куда
            - generic [ref=e14]: Все категории
          - button "Когда Выберите даты" [ref=e17] [cursor=pointer]:
            - generic [ref=e18]: Когда
            - generic [ref=e19]: Выберите даты
          - button "Места Любое количество" [ref=e22] [cursor=pointer]:
            - generic [ref=e23]: Места
            - generic [ref=e24]: Любое количество
          - button [ref=e25] [cursor=pointer]:
            - img [ref=e26]
        - generic [ref=e29]:
          - link "Создать челендж" [ref=e30] [cursor=pointer]:
            - /url: /dashboard/challenges/new
          - button [ref=e32] [cursor=pointer]:
            - img [ref=e33]
            - img [ref=e35]
    - generic [ref=e38]:
      - generic [ref=e41]:
        - button "Закрыть" [ref=e42] [cursor=pointer]:
          - img [ref=e43]
        - generic [ref=e46]:
          - generic [ref=e47]:
            - img [ref=e48]
            - text: НОВИНКА
          - heading "Кооперативные квесты — уже здесь!" [level=2] [ref=e51]:
            - text: Кооперативные
            - text: квесты — уже здесь!
          - paragraph [ref=e52]:
            - text: Собери команду, выполняйте задания вместе
            - text: и получайте награды от брендов-партнёров.
          - generic [ref=e53]:
            - generic [ref=e54]:
              - img [ref=e55]
              - generic [ref=e57]: Реальные награды
            - generic [ref=e58]:
              - img [ref=e59]
              - generic [ref=e63]: Скидки от брендов
          - img "Квест" [ref=e64]
        - generic [ref=e65]:
          - paragraph [ref=e66]:
            - strong [ref=e67]: "Yandex Travel × NEWSY:"
            - text: выполни квест «Путь исследователя» и выиграй поездку на Алтай на двоих. Старт — 1 июля 2026.
          - generic [ref=e68]:
            - button "Смотреть квесты" [ref=e69] [cursor=pointer]
            - button "Не сейчас" [ref=e70] [cursor=pointer]
      - main [ref=e71]:
        - generic [ref=e72]:
          - button "Все подряд" [ref=e73] [cursor=pointer]:
            - img [ref=e74]
            - text: Все подряд
          - button "Спорт" [ref=e76] [cursor=pointer]:
            - img [ref=e77]
            - text: Спорт
          - button "Обучение" [ref=e82] [cursor=pointer]:
            - img [ref=e83]
            - text: Обучение
          - button "Квесты" [ref=e86] [cursor=pointer]:
            - img [ref=e87]
            - text: Квесты
          - button "Искусство" [ref=e91] [cursor=pointer]:
            - img [ref=e92]
            - text: Искусство
          - button "Технологии" [ref=e97] [cursor=pointer]:
            - img [ref=e98]
            - text: Технологии
        - generic [ref=e102]:
          - generic [ref=e103]: 🎯
          - heading "Челленджи пока не добавлены" [level=3] [ref=e104]
          - paragraph [ref=e105]: Скоро здесь появятся интересные активности
  - contentinfo [ref=e106]:
    - generic [ref=e107]:
      - generic [ref=e108]:
        - generic [ref=e109]:
          - link "NEWSY NEWSY" [ref=e110] [cursor=pointer]:
            - /url: /
            - img "NEWSY" [ref=e111]
            - generic [ref=e112]: NEWSY
          - paragraph [ref=e113]:
            - text: Платформа интерактивных челенджей.
            - text: Растей над собой, соревнуйся, побеждай.
          - generic [ref=e114]:
            - link "Telegram" [ref=e115] [cursor=pointer]:
              - /url: "#"
              - img [ref=e116]
            - link "VK" [ref=e118] [cursor=pointer]:
              - /url: "#"
              - img [ref=e119]
            - link "YouTube" [ref=e121] [cursor=pointer]:
              - /url: "#"
              - img [ref=e122]
            - link "Discord" [ref=e124] [cursor=pointer]:
              - /url: "#"
              - img [ref=e125]
        - generic [ref=e127]:
          - generic [ref=e128]:
            - heading "Платформа" [level=4] [ref=e129]
            - link "Главная" [ref=e130] [cursor=pointer]:
              - /url: /
              - text: Главная
              - img [ref=e131]
            - link "Каталог челенджей" [ref=e134] [cursor=pointer]:
              - /url: /search
              - text: Каталог челенджей
              - img [ref=e135]
            - link "Создать челендж" [ref=e138] [cursor=pointer]:
              - /url: /dashboard/challenges/new
              - text: Создать челендж
              - img [ref=e139]
            - link "Личный кабинет" [ref=e142] [cursor=pointer]:
              - /url: /dashboard
              - text: Личный кабинет
              - img [ref=e143]
          - generic [ref=e146]:
            - heading "Участникам" [level=4] [ref=e147]
            - link "Мой профиль" [ref=e148] [cursor=pointer]:
              - /url: /dashboard/profile
            - link "Достижения" [ref=e149] [cursor=pointer]:
              - /url: /favorites
            - link "Награды" [ref=e150] [cursor=pointer]:
              - /url: /favorites
            - link "Реферальная программа" [ref=e151] [cursor=pointer]:
              - /url: /referral
          - generic [ref=e152]:
            - heading "Организаторам" [level=4] [ref=e153]
            - link "Как создать ЧЕ" [ref=e154] [cursor=pointer]:
              - /url: /dashboard/challenges/new
            - link "Тарифы" [ref=e155] [cursor=pointer]:
              - /url: /analytics
            - link "Аналитика" [ref=e156] [cursor=pointer]:
              - /url: /analytics
            - link "API" [ref=e157] [cursor=pointer]:
              - /url: /api-docs
          - generic [ref=e158]:
            - heading "Поддержка" [level=4] [ref=e159]
            - link "Центр помощи" [ref=e160] [cursor=pointer]:
              - /url: /help
            - link "Правила сервиса" [ref=e161] [cursor=pointer]:
              - /url: /rules
            - link "Конфиденциальность" [ref=e162] [cursor=pointer]:
              - /url: /privacy
            - link "Контакты" [ref=e163] [cursor=pointer]:
              - /url: /help
      - generic [ref=e164]:
        - generic [ref=e165]:
          - heading "Будь в курсе" [level=4] [ref=e166]
          - paragraph [ref=e167]: Получай уведомления о новых челенджах и обновлениях
        - generic [ref=e168]:
          - textbox "your@email.com" [ref=e169]
          - button [ref=e170] [cursor=pointer]:
            - img [ref=e171]
      - generic [ref=e174]:
        - generic [ref=e175]: © 2026 NEWSY. Все права защищены.
        - generic [ref=e176]:
          - text: Сделано с
          - img [ref=e177]
          - text: в России
  - alert [ref=e179]
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
  20  |     await page.click('button[type="submit"]');
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
> 40  |     await page.click('.search-bar');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  121 |     await page.fill('input[name="email"]', `referral-${Date.now()}@newsy.ru`);
  122 |     await page.fill('input[name="password"]', 'RefTest123!');
  123 |     await page.fill('input[name="confirm"]', 'RefTest123!');
  124 |     await page.fill('input[name="referralCode"]', 'NEWSY-TEST');
  125 |     await page.click('button[type="submit"]');
  126 | 
  127 |     await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
  128 |     console.log('✅ Регистрация с реферальным кодом прошла');
  129 |   });
  130 | 
  131 |   test('12. Проверка 404 страницы', async ({ page }) => {
  132 |     const response = await page.goto(`${BASE_URL}/nonexistent-page`);
  133 |     // Next.js может вернуть 200 или 404
  134 |     console.log(`✅ Страница 404: статус ${response?.status()}`);
  135 |   });
  136 | });
  137 | 
```