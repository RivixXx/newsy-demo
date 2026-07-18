# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-cycle.spec.ts >> Регистрация >> Регистрация участника — wizard
- Location: tests\e2e\full-cycle.spec.ts:111:7

# Error details

```
Test timeout of 20000ms exceeded.
```

```
Error: locator.click: Test timeout of 20000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Далее/ }).first()

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
        - text: Платформа интерактивных челленджей.
        - text: Соревнуйся, выполняй задания и получай награды.
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
                - textbox "••••••••" [ref=e49]
                - button [ref=e50] [cursor=pointer]:
                  - img [ref=e51]
            - button "Войти" [ref=e54] [cursor=pointer]:
              - text: Войти
              - img [ref=e55]
          - paragraph [ref=e57]:
            - link "Забыли пароль?" [ref=e58] [cursor=pointer]:
              - /url: /forgot-password
          - paragraph [ref=e59]:
            - text: Нет аккаунта?
            - link "Зарегистрироваться" [ref=e60] [cursor=pointer]:
              - /url: /register
        - generic [ref=e62]:
          - heading "Создать аккаунт" [level=2] [ref=e63]
          - paragraph [ref=e64]: Зарегистрируйтесь в NEWSY, чтобы участвовать в челленджах
          - generic [ref=e70]:
            - generic:
              - generic: Я хочу
              - generic:
                - button "Участвовать Находить и выполнять челленджи":
                  - generic:
                    - img
                  - generic: Участвовать
                  - generic: Находить и выполнять челленджи
                  - generic:
                    - img
                - button "Запускать челленджи Создавать конкурсы для аудитории":
                  - generic:
                    - img
                  - generic: Запускать челленджи
                  - generic: Создавать конкурсы для аудитории
            - generic [ref=e71]:
              - generic [ref=e72]:
                - generic [ref=e73]:
                  - generic [ref=e74]: Имя
                  - generic [ref=e75]:
                    - img [ref=e77]
                    - textbox "Алексей" [ref=e80]: Тест
                - generic [ref=e81]:
                  - generic [ref=e82]: Фамилия
                  - generic [ref=e83]:
                    - img [ref=e85]
                    - textbox "Иванов" [ref=e88]: Участник
              - generic [ref=e89]:
                - generic [ref=e90]: Email
                - generic [ref=e91]:
                  - img [ref=e93]
                  - textbox "demo@newsy.ru" [active] [ref=e96]: test-1784309052092-eo52@newsy.test
              - generic [ref=e97]:
                - generic [ref=e98]:
                  - generic [ref=e99]: Пол
                  - combobox [ref=e101] [cursor=pointer]:
                    - option "Не указан" [selected]
                    - option "Мужской"
                    - option "Женский"
                - generic [ref=e102]:
                  - generic [ref=e103]: Дата рождения
                  - generic [ref=e104]:
                    - img [ref=e106]
                    - textbox [ref=e108]:
                      - /placeholder: дд.мм.гггг
            - generic [ref=e109]:
              - generic [ref=e110]:
                - generic [ref=e111]: Пароль
                - generic [ref=e112]:
                  - img [ref=e114]
                  - textbox "Минимум 8 символов" [ref=e117]
                  - button [ref=e118] [cursor=pointer]:
                    - img [ref=e119]
              - generic [ref=e122]:
                - generic [ref=e123]: Повторите пароль
                - generic [ref=e124]:
                  - img [ref=e126]
                  - textbox "Повторите пароль" [ref=e129]
              - generic [ref=e130]:
                - generic [ref=e131]: Код приглашения (необязательно)
                - generic [ref=e132]:
                  - img [ref=e134]
                  - 'textbox "Например: IVANOV2026" [ref=e137]'
          - generic [ref=e138]:
            - button "Назад" [ref=e139] [cursor=pointer]:
              - img [ref=e140]
              - text: Назад
            - button "Зарегистрироваться" [ref=e142] [cursor=pointer]:
              - text: Зарегистрироваться
              - img [ref=e143]
          - paragraph [ref=e145]:
            - text: Уже есть аккаунт?
            - link "Войти" [ref=e146] [cursor=pointer]:
              - /url: /login
  - alert [ref=e147]
```

# Test source

```ts
  23  |     await expect(page).toHaveTitle(/NEWSY/i);
  24  |     await expect(page.getByRole('heading', { name: /Создавай и запускай/i })).toBeVisible();
  25  |     await expect(page.getByRole('link', { name: /Создать челлендж/ })).toHaveAttribute('href', '/register');
  26  |   });
  27  | 
  28  |   test('Explore (/explore)', async ({ page }) => {
  29  |     await page.goto(`${BASE}/explore`);
  30  |     await expect(page.getByRole('heading', { name: /Найди свой челлендж/ })).toBeVisible();
  31  |     const search = page.locator('input[placeholder*="Поиск"]');
  32  |     await expect(search).toBeVisible();
  33  |     await search.fill('Nike');
  34  |     await expect(page.getByRole('button', { name: 'Спорт' })).toBeVisible();
  35  |     await expect(page.getByRole('button', { name: 'Образование' })).toBeVisible();
  36  |     await expect(page.getByRole('button', { name: 'Москва' })).toBeVisible();
  37  |     await expect(page.getByRole('button', { name: 'Онлайн' })).toBeVisible();
  38  |     const cards = page.locator('a[href*="/challenges/"]');
  39  |     expect(await cards.count()).toBeGreaterThan(0);
  40  |   });
  41  | 
  42  |   test('Pricing (/pricing)', async ({ page }) => {
  43  |     const resp = await page.goto(`${BASE}/pricing`);
  44  |     expect(resp?.status()).toBeLessThan(500);
  45  |   });
  46  | 
  47  |   test('API Docs (/api-docs)', async ({ page }) => {
  48  |     await page.goto(`${BASE}/api-docs`);
  49  |     await expect(page.getByRole('heading', { name: /API Documentation/ })).toBeVisible();
  50  |   });
  51  | 
  52  |   test('Referral (/referral)', async ({ page }) => {
  53  |     await page.goto(`${BASE}/referral`);
  54  |     await expect(page.getByRole('heading', { name: 'Реферальная программа' })).toBeVisible();
  55  |     await expect(page.getByText('Войдите, чтобы получить')).toBeVisible();
  56  |   });
  57  | 
  58  |   test('Feed (/feed)', async ({ page }) => {
  59  |     await page.goto(`${BASE}/feed`);
  60  |     await expect(page.getByRole('heading', { name: /Лента активности/ })).toBeVisible();
  61  |   });
  62  | 
  63  |   test('Stories (/stories)', async ({ page }) => {
  64  |     const resp = await page.goto(`${BASE}/stories`);
  65  |     expect(resp?.status()).toBeLessThan(500);
  66  |   });
  67  | 
  68  |   test('Live (/live)', async ({ page }) => {
  69  |     const resp = await page.goto(`${BASE}/live`);
  70  |     expect(resp?.status()).toBeLessThan(500);
  71  |   });
  72  | 
  73  |   test('Challenge detail (/challenges/1)', async ({ page }) => {
  74  |     await page.goto(`${BASE}/challenges/1`);
  75  |     await expect(page.locator('body')).toBeVisible();
  76  |   });
  77  | 
  78  |   test('Leaderboard (/challenges/1/leaderboard)', async ({ page }) => {
  79  |     const resp = await page.goto(`${BASE}/challenges/1/leaderboard`);
  80  |     expect(resp?.status()).toBeLessThan(500);
  81  |   });
  82  | 
  83  |   test('Organizer profile (/organizer/1)', async ({ page }) => {
  84  |     const resp = await page.goto(`${BASE}/organizer/1`);
  85  |     expect(resp?.status()).toBeLessThan(500);
  86  |   });
  87  | 
  88  |   test('Все ключевые страницы доступны (no 500)', async ({ page }) => {
  89  |     const routes = ['/', '/explore', '/feed', '/pricing', '/referral', '/login', '/register'];
  90  |     for (const route of routes) {
  91  |       const resp = await page.goto(`${BASE}${route}`);
  92  |       expect(resp?.status(), `GET ${route}`).toBeLessThan(500);
  93  |     }
  94  |   });
  95  | });
  96  | 
  97  | // ─── РЕГИСТРАЦИЯ ───
  98  | 
  99  | test.describe('Регистрация', () => {
  100 | 
  101 |   test('Страница регистрации загружается', async ({ page }) => {
  102 |     await page.goto(`${BASE}/register`);
  103 |     // "Создать аккаунт" — заголовок, "Я хочу" — label
  104 |     await expect(page.getByText('Создать аккаунт')).toBeVisible();
  105 |     await expect(page.getByRole('button', { name: /Участвовать/ })).toBeVisible();
  106 |     await expect(page.getByRole('button', { name: /Запускать челленджи/ })).toBeVisible();
  107 |     // Кнопка "Далее"
  108 |     await expect(page.getByRole('button', { name: /Далее/ })).toBeVisible();
  109 |   });
  110 | 
  111 |   test('Регистрация участника — wizard', async ({ page }) => {
  112 |     const email = uniqueEmail();
  113 |     await page.goto(`${BASE}/register`);
  114 | 
  115 |     // Step 0: "Участвовать" уже выбрано по умолчанию → Далее
  116 |     await page.getByRole('button', { name: /Далее/ }).click();
  117 |     await page.waitForTimeout(1000);
  118 | 
  119 |     // Step 1: Личные данные
  120 |     await page.fill('input[name="firstName"]', 'Тест');
  121 |     await page.fill('input[name="lastName"]', 'Участник');
  122 |     await page.fill('input[name="email"]', email);
> 123 |     await page.getByRole('button', { name: /Далее/ }).first().click();
      |                                                               ^ Error: locator.click: Test timeout of 20000ms exceeded.
  124 |     await page.waitForTimeout(1000);
  125 | 
  126 |     // Step 2: Пароль
  127 |     await page.locator('input[name="password"]').first().fill('TestPass123!');
  128 |     // Submit
  129 |     await page.locator('form').getByRole('button', { type: 'submit' }).click({ timeout: 5000 });
  130 |     await page.waitForTimeout(3000);
  131 | 
  132 |     const url = page.url();
  133 |     expect(url).not.toContain('/register');
  134 |   });
  135 | 
  136 |   test('Регистрация организатора — wizard с типом аккаунта', async ({ page }) => {
  137 |     await page.goto(`${BASE}/register`);
  138 | 
  139 |     // Step 0: "Запускать челленджи"
  140 |     await page.getByRole('button', { name: /Запускать челленджи/ }).click();
  141 |     await page.waitForTimeout(300);
  142 | 
  143 |     // Кнопка "Далее"
  144 |     await page.getByRole('button', { name: /Далее/ }).click();
  145 |     await page.waitForTimeout(500);
  146 | 
  147 |     // Step 1: Тип аккаунта
  148 |     await expect(page.getByText('Тип аккаунта')).toBeVisible();
  149 |     await expect(page.getByRole('button', { name: 'ИП' })).toBeVisible();
  150 | 
  151 |     // Выбираем ИП → Далее
  152 |     await page.getByRole('button', { name: 'ИП' }).click();
  153 |     await page.getByRole('button', { name: /Далее/ }).click();
  154 |     await page.waitForTimeout(500);
  155 | 
  156 |     // Step 2: Личные данные
  157 |     await expect(page.locator('input[name="firstName"]')).toBeVisible();
  158 |   });
  159 | 
  160 |   test('Ссылка "Забыли пароль" на странице входа', async ({ page }) => {
  161 |     await page.goto(`${BASE}/login`);
  162 |     await page.getByRole('link', { name: /Забыли пароль/ }).click();
  163 |     await expect(page).toHaveURL(/forgot-password/);
  164 |   });
  165 | 
  166 |   test('Страница "Забыли пароль"', async ({ page }) => {
  167 |     await page.goto(`${BASE}/forgot-password`);
  168 |     await expect(page.getByRole('heading', { name: /Сброс пароля/ })).toBeVisible();
  169 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  170 |     await expect(page.getByRole('button', { name: /Отправить/ })).toBeVisible();
  171 |   });
  172 | 
  173 |   test('Страница "Сброс пароля"', async ({ page }) => {
  174 |     await page.goto(`${BASE}/reset-password?token=fake-token-123`);
  175 |     await expect(page.getByRole('heading', { name: 'Новый пароль' })).toBeVisible();
  176 |     await expect(page.locator('input[type="password"]').first()).toBeVisible();
  177 |   });
  178 | 
  179 |   test('Навигация register ↔ login', async ({ page }) => {
  180 |     await page.goto(`${BASE}/register`);
  181 |     await page.getByRole('link', { name: /Войти/ }).first().click();
  182 |     await expect(page).toHaveURL(/login/);
  183 | 
  184 |     await page.getByRole('link', { name: /Зарегистрироваться/ }).click();
  185 |     await expect(page).toHaveURL(/register/);
  186 |   });
  187 | });
  188 | 
  189 | // ─── ВХОД ───
  190 | 
  191 | test.describe('Вход в систему', () => {
  192 | 
  193 |   test('Страница входа загружается', async ({ page }) => {
  194 |     await page.goto(`${BASE}/login`);
  195 |     // Заголовок "С возвращением!"
  196 |     await expect(page.getByText('С возвращением!')).toBeVisible();
  197 |     await expect(page.locator('input[name="identifier"]')).toBeVisible();
  198 |     await expect(page.locator('input[name="password"]').first()).toBeVisible();
  199 |     await expect(page.getByRole('button', { name: /Войти/ })).toBeVisible();
  200 |   });
  201 | 
  202 |   test('Вход с неверными данными', async ({ page }) => {
  203 |     await page.goto(`${BASE}/login`);
  204 |     await page.fill('input[name="identifier"]', 'nonexistent@test.com');
  205 |     await page.locator('input[name="password"]').first().fill('WrongPass123!');
  206 |     await page.getByRole('button', { name: /Войти/ }).click();
  207 |     await page.waitForTimeout(3000);
  208 |     // Остаёмся на странице входа — не редиректит
  209 |     expect(page.url()).toContain('/login');
  210 |   });
  211 | 
  212 |   test('Вход с тестовым админом', async ({ page }) => {
  213 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  214 |     const url = page.url();
  215 |     expect(url.includes('/explore') || url.includes('/dashboard') || url.endsWith('/')).toBeTruthy();
  216 |   });
  217 | });
  218 | 
  219 | // ─── DASHBOARD ───
  220 | 
  221 | test.describe('Dashboard — все страницы', () => {
  222 | 
  223 |   test.beforeEach(async ({ page }) => {
```