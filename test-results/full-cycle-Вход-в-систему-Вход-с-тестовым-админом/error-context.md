# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-cycle.spec.ts >> Вход в систему >> Вход с тестовым админом
- Location: tests\e2e\full-cycle.spec.ts:212:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
                - textbox "demo@newsy.ru" [ref=e41]: admin@newsy.ru
            - generic [ref=e42]:
              - generic [ref=e43]: Пароль
              - generic [ref=e44]:
                - img [ref=e46]
                - textbox "••••••••" [ref=e49]: Newsy123!
                - button [ref=e50] [cursor=pointer]:
                  - img [ref=e51]
            - button "Входим..." [disabled] [ref=e54] [cursor=pointer]:
              - text: Входим...
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
            - generic [ref=e71]:
              - generic [ref=e72]: Я хочу
              - generic [ref=e73]:
                - button "Участвовать Находить и выполнять челленджи" [ref=e74] [cursor=pointer]:
                  - img [ref=e76]
                  - generic [ref=e82]: Участвовать
                  - generic [ref=e83]: Находить и выполнять челленджи
                  - img [ref=e85]
                - button "Запускать челленджи Создавать конкурсы для аудитории" [ref=e87] [cursor=pointer]:
                  - img [ref=e89]
                  - generic [ref=e91]: Запускать челленджи
                  - generic [ref=e92]: Создавать конкурсы для аудитории
            - generic:
              - generic:
                - generic:
                  - generic: Имя
                  - generic:
                    - generic:
                      - img
                    - textbox "Алексей"
                - generic:
                  - generic: Фамилия
                  - generic:
                    - generic:
                      - img
                    - textbox "Иванов"
              - generic:
                - generic: Email
                - generic:
                  - generic:
                    - img
                  - textbox "demo@newsy.ru"
              - generic:
                - generic:
                  - generic: Пол
                  - generic:
                    - combobox:
                      - option "Не указан" [selected]
                      - option "Мужской"
                      - option "Женский"
                - generic:
                  - generic: Дата рождения
                  - generic:
                    - generic:
                      - img
                    - textbox:
                      - /placeholder: дд.мм.гггг
            - generic:
              - generic:
                - generic: Пароль
                - generic:
                  - generic:
                    - img
                  - textbox "Минимум 8 символов"
                  - button:
                    - img
              - generic:
                - generic: Повторите пароль
                - generic:
                  - generic:
                    - img
                  - textbox "Повторите пароль"
              - generic:
                - generic: Код приглашения (необязательно)
                - generic:
                  - generic:
                    - img
                  - 'textbox "Например: IVANOV2026"'
          - button "Далее" [ref=e94] [cursor=pointer]:
            - text: Далее
            - img [ref=e95]
          - paragraph [ref=e97]:
            - text: Уже есть аккаунт?
            - link "Войти" [ref=e98] [cursor=pointer]:
              - /url: /login
  - alert [ref=e99]
```

# Test source

```ts
  115 |     // Step 0: "Участвовать" уже выбрано по умолчанию → Далее
  116 |     await page.getByRole('button', { name: /Далее/ }).click();
  117 |     await page.waitForTimeout(1000);
  118 | 
  119 |     // Step 1: Личные данные
  120 |     await page.fill('input[name="firstName"]', 'Тест');
  121 |     await page.fill('input[name="lastName"]', 'Участник');
  122 |     await page.fill('input[name="email"]', email);
  123 |     await page.getByRole('button', { name: /Далее/ }).first().click();
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
> 215 |     expect(url.includes('/explore') || url.includes('/dashboard') || url.endsWith('/')).toBeTruthy();
      |                                                                                         ^ Error: expect(received).toBeTruthy()
  216 |   });
  217 | });
  218 | 
  219 | // ─── DASHBOARD ───
  220 | 
  221 | test.describe('Dashboard — все страницы', () => {
  222 | 
  223 |   test.beforeEach(async ({ page }) => {
  224 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  225 |   });
  226 | 
  227 |   const dashPages = [
  228 |     ['/dashboard', 'Dashboard'],
  229 |     ['/dashboard/achievements', 'Достижения'],
  230 |     ['/dashboard/daily', 'Ежедневные'],
  231 |     ['/dashboard/shop', 'Магазин'],
  232 |     ['/dashboard/recommendations', 'Рекомендации'],
  233 |     ['/dashboard/partner', 'Партнёр'],
  234 |     ['/dashboard/organizer', 'Организатор'],
  235 |     ['/dashboard/organizer/finances', 'Финансы'],
  236 |     ['/dashboard/profile', 'Профиль'],
  237 |   ];
  238 | 
  239 |   for (const [path, name] of dashPages) {
  240 |     test(`${name} (${path})`, async ({ page }) => {
  241 |       const resp = await page.goto(`${BASE}${path}`);
  242 |       expect(resp?.status(), `GET ${path}`).toBeLessThan(500);
  243 |     });
  244 |   }
  245 | 
  246 |   test('Создание челленджа (/dashboard/challenges/new)', async ({ page }) => {
  247 |     const resp = await page.goto(`${BASE}/dashboard/challenges/new`);
  248 |     expect(resp?.status()).toBeLessThan(500);
  249 |   });
  250 | });
  251 | 
  252 | // ─── GEOЛОКАЦИЯ ───
  253 | 
  254 | test.describe('Геолокация', () => {
  255 | 
  256 |   test('Фильтр по региону на explore', async ({ page }) => {
  257 |     await page.goto(`${BASE}/explore`);
  258 |     await page.getByRole('button', { name: 'Москва' }).click();
  259 |     await page.waitForTimeout(300);
  260 |     await page.getByRole('button', { name: 'Онлайн' }).click();
  261 |     await page.waitForTimeout(300);
  262 |     await page.getByRole('button', { name: 'Все регионы' }).click();
  263 |     await page.waitForTimeout(300);
  264 |   });
  265 | 
  266 |   test('Challenge detail — геоданные', async ({ page }) => {
  267 |     await page.goto(`${BASE}/challenges/1`);
  268 |     await expect(page.locator('body')).toBeVisible();
  269 |   });
  270 | });
  271 | 
  272 | // ─── API ───
  273 | 
  274 | test.describe('API — smoke', () => {
  275 | 
  276 |   test('GET /api/challenges', async ({ request }) => {
  277 |     const resp = await request.get(`${BASE}/api/challenges`);
  278 |     expect(resp.status()).toBe(200);
  279 |   });
  280 | 
  281 |   test('GET /api/v1/challenges', async ({ request }) => {
  282 |     const resp = await request.get(`${BASE}/api/v1/challenges`);
  283 |     expect(resp.status()).toBe(200);
  284 |   });
  285 | 
  286 |   test('GET /api/achievements', async ({ request }) => {
  287 |     const resp = await request.get(`${BASE}/api/achievements`);
  288 |     expect(resp.status()).toBeLessThan(500);
  289 |   });
  290 | 
  291 |   test('POST /api/auth/reset-password — невалидный токен', async ({ request }) => {
  292 |     const resp = await request.post(`${BASE}/api/auth/reset-password`, {
  293 |       data: { token: 'fake', newPassword: 'test1234' },
  294 |     });
  295 |     expect(resp.status()).toBeLessThan(500);
  296 |   });
  297 | 
  298 |   test('POST /api/challenges/1/chat — 401 без авторизации', async ({ request }) => {
  299 |     const resp = await request.post(`${BASE}/api/challenges/1/chat`, {
  300 |       data: { text: 'test' },
  301 |     });
  302 |     expect(resp.status()).toBe(401);
  303 |   });
  304 | });
  305 | 
  306 | // ─── НАВИГАЦИЯ ───
  307 | 
  308 | test.describe('Навигация', () => {
  309 | 
  310 |   test('Back-link с feed → главная', async ({ page }) => {
  311 |     await page.goto(`${BASE}/feed`);
  312 |     await page.getByRole('link', { name: /На главную/ }).first().click();
  313 |     await page.waitForTimeout(1000);
  314 |     expect(page.url().endsWith('/') || page.url().includes('/explore')).toBeTruthy();
  315 |   });
```