# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-cycle.spec.ts >> Навигация >> Back-link с feed → главная
- Location: tests\e2e\full-cycle.spec.ts:310:7

# Error details

```
Test timeout of 20000ms exceeded.
```

```
Error: locator.click: Test timeout of 20000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /На главную/ }).first()
    - locator resolved to <a href="/">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="region-wrap">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="region-wrap">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  28 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="region-wrap">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - banner [ref=e4]:
        - generic [ref=e5]:
          - link "NEWSY Logo NEWSY" [ref=e7] [cursor=pointer]:
            - /url: /
            - img "NEWSY Logo" [ref=e8]
            - generic [ref=e9]: NEWSY
          - generic [ref=e11]:
            - button "Все категории" [ref=e13] [cursor=pointer]:
              - generic [ref=e14]: Все категории
            - button "Когда" [ref=e17] [cursor=pointer]:
              - generic [ref=e18]: Когда
            - generic [ref=e21]:
              - img [ref=e22]
              - textbox "Найти челлендж по названию..." [ref=e25]
            - button [ref=e26] [cursor=pointer]:
              - img [ref=e27]
          - generic [ref=e30]:
            - button "Весь мир" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
              - generic [ref=e35]: Весь мир
            - link "Создать челендж" [ref=e36] [cursor=pointer]:
              - /url: /dashboard/challenges/new
            - button [ref=e38] [cursor=pointer]:
              - img [ref=e39]
              - img [ref=e41]
      - generic [ref=e46]:
        - button "Закрыть" [ref=e47] [cursor=pointer]:
          - img [ref=e48]
        - generic [ref=e51]:
          - img [ref=e53]
          - heading "Где вы находитесь?" [level=2] [ref=e56]
          - paragraph [ref=e57]: Чтобы показывать челленджи рядом с вами
        - generic [ref=e58]:
          - img [ref=e59]
          - textbox "Тамбов" [active] [ref=e62]
        - button "Определить автоматически" [ref=e63] [cursor=pointer]:
          - img [ref=e64]
          - text: Определить автоматически
        - button "Показать все города" [ref=e66] [cursor=pointer]
      - generic [ref=e68]:
        - link "На главную" [ref=e69] [cursor=pointer]:
          - /url: /
          - img [ref=e70]
          - text: На главную
        - banner [ref=e72]:
          - heading "Лента активности" [level=1] [ref=e73]
          - paragraph [ref=e74]: Последние выполненные этапы от участников NEWSY
        - generic [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e79]:
              - generic [ref=e80]: Михаил Зорин
              - generic [ref=e81]: 17 дн. назад
            - generic [ref=e82]:
              - generic [ref=e83]: 📝 Поделись результатом
              - link "Фотографируй рассвет в своём городе — 7 дней красоты" [ref=e84] [cursor=pointer]:
                - /url: /challenges/5cee1266-cc47-478f-a5fc-a896305ad6e2
                - text: Фотографируй рассвет в своём городе — 7 дней красоты
                - img [ref=e85]
              - paragraph [ref=e89]: Готово
            - generic [ref=e90]:
              - button "Нравится" [ref=e91] [cursor=pointer]:
                - img [ref=e92]
                - generic [ref=e94]: Нравится
              - button "Комментарии" [ref=e95] [cursor=pointer]:
                - img [ref=e96]
                - generic [ref=e98]: Комментарии
              - button [ref=e99] [cursor=pointer]:
                - img [ref=e100]
          - generic [ref=e106]:
            - generic [ref=e109]:
              - generic [ref=e110]: Михаил Зорин
              - generic [ref=e111]: 17 дн. назад
            - generic [ref=e112]:
              - generic [ref=e113]: 📝 Тест на внимательность
              - link "Фотографируй рассвет в своём городе — 7 дней красоты" [ref=e114] [cursor=pointer]:
                - /url: /challenges/5cee1266-cc47-478f-a5fc-a896305ad6e2
                - text: Фотографируй рассвет в своём городе — 7 дней красоты
                - img [ref=e115]
            - generic [ref=e119]:
              - button "Нравится" [ref=e120] [cursor=pointer]:
                - img [ref=e121]
                - generic [ref=e123]: Нравится
              - button "Комментарии" [ref=e124] [cursor=pointer]:
                - img [ref=e125]
                - generic [ref=e127]: Комментарии
              - button [ref=e128] [cursor=pointer]:
                - img [ref=e129]
          - generic [ref=e135]:
            - generic [ref=e138]:
              - generic [ref=e139]: Михаил Зорин
              - generic [ref=e140]: 17 дн. назад
            - generic [ref=e141]:
              - generic [ref=e142]: 📝 Точка наблюдения
              - link "Фотографируй рассвет в своём городе — 7 дней красоты" [ref=e143] [cursor=pointer]:
                - /url: /challenges/5cee1266-cc47-478f-a5fc-a896305ad6e2
                - text: Фотографируй рассвет в своём городе — 7 дней красоты
                - img [ref=e144]
            - generic [ref=e148]:
              - button "Нравится" [ref=e149] [cursor=pointer]:
                - img [ref=e150]
                - generic [ref=e152]: Нравится
              - button "Комментарии" [ref=e153] [cursor=pointer]:
                - img [ref=e154]
                - generic [ref=e156]: Комментарии
              - button [ref=e157] [cursor=pointer]:
                - img [ref=e158]
          - generic [ref=e164]:
            - generic [ref=e167]:
              - generic [ref=e168]: Михаил Зорин
              - generic [ref=e169]: 17 дн. назад
            - generic [ref=e170]:
              - generic [ref=e171]: 📝 Первый рассвет — День 1
              - link "Фотографируй рассвет в своём городе — 7 дней красоты" [ref=e172] [cursor=pointer]:
                - /url: /challenges/5cee1266-cc47-478f-a5fc-a896305ad6e2
                - text: Фотографируй рассвет в своём городе — 7 дней красоты
                - img [ref=e173]
            - generic [ref=e177]:
              - button "Нравится" [ref=e178] [cursor=pointer]:
                - img [ref=e179]
                - generic [ref=e181]: Нравится
              - button "Комментарии" [ref=e182] [cursor=pointer]:
                - img [ref=e183]
                - generic [ref=e185]: Комментарии
              - button [ref=e186] [cursor=pointer]:
                - img [ref=e187]
          - generic [ref=e193]:
            - generic [ref=e196]:
              - generic [ref=e197]: Михаил Зорин
              - generic [ref=e198]: 17 дн. назад
            - generic [ref=e199]:
              - generic [ref=e200]: 📝 Зарегистрируйся и заполни профиль
              - link "Фотографируй рассвет в своём городе — 7 дней красоты" [ref=e201] [cursor=pointer]:
                - /url: /challenges/5cee1266-cc47-478f-a5fc-a896305ad6e2
                - text: Фотографируй рассвет в своём городе — 7 дней красоты
                - img [ref=e202]
              - paragraph [ref=e206]: rivixxx@gmail.com
            - generic [ref=e207]:
              - button "Нравится" [ref=e208] [cursor=pointer]:
                - img [ref=e209]
                - generic [ref=e211]: Нравится
              - button "Комментарии" [ref=e212] [cursor=pointer]:
                - img [ref=e213]
                - generic [ref=e215]: Комментарии
              - button [ref=e216] [cursor=pointer]:
                - img [ref=e217]
    - contentinfo [ref=e223]:
      - generic [ref=e224]:
        - generic [ref=e225]:
          - generic [ref=e226]:
            - link "NEWSY NEWSY" [ref=e227] [cursor=pointer]:
              - /url: /
              - img "NEWSY" [ref=e228]
              - generic [ref=e229]: NEWSY
            - paragraph [ref=e230]:
              - text: Платформа интерактивных челенджей.
              - text: Соревнуйся, выполняй задания, побеждай.
            - generic [ref=e231]:
              - link "Telegram" [ref=e232] [cursor=pointer]:
                - /url: "#"
                - img [ref=e233]
              - link "VK" [ref=e235] [cursor=pointer]:
                - /url: "#"
                - img [ref=e236]
              - link "YouTube" [ref=e238] [cursor=pointer]:
                - /url: "#"
                - img [ref=e239]
              - link "Discord" [ref=e241] [cursor=pointer]:
                - /url: "#"
                - img [ref=e242]
          - generic [ref=e244]:
            - generic [ref=e245]:
              - heading "Для участников" [level=4] [ref=e246]
              - link "Реферальная программа" [ref=e247] [cursor=pointer]:
                - /url: /referral
              - link "Как создать ЧИ" [ref=e248] [cursor=pointer]:
                - /url: /dashboard/challenges/new
              - link "Тарифы" [ref=e249] [cursor=pointer]:
                - /url: /dashboard/subscription
              - link "API" [ref=e250] [cursor=pointer]:
                - /url: /api-docs
            - generic [ref=e251]:
              - heading "Поддержка" [level=4] [ref=e252]
              - link "Центр помощи" [ref=e253] [cursor=pointer]:
                - /url: /help
              - link "Правила сервиса" [ref=e254] [cursor=pointer]:
                - /url: /terms
              - link "Конфиденциальность" [ref=e255] [cursor=pointer]:
                - /url: /privacy
              - link "Контакты" [ref=e256] [cursor=pointer]:
                - /url: mailto:support@chillenge-russia.ru
        - generic [ref=e257]:
          - generic [ref=e258]:
            - heading "Будь в курсе" [level=4] [ref=e259]
            - paragraph [ref=e260]: Получай уведомления о новых челенджах и обновлениях
          - generic [ref=e261]:
            - textbox "your@email.com" [ref=e262]
            - button [ref=e263] [cursor=pointer]:
              - img [ref=e264]
        - generic [ref=e267]:
          - generic [ref=e268]: © 2026 NEWSY. Все права защищены.
          - generic [ref=e269]:
            - text: Сделано с
            - img [ref=e270]
            - text: в России
  - alert [ref=e272]
```

# Test source

```ts
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
> 312 |     await page.getByRole('link', { name: /На главную/ }).first().click();
      |                                                                  ^ Error: locator.click: Test timeout of 20000ms exceeded.
  313 |     await page.waitForTimeout(1000);
  314 |     expect(page.url().endsWith('/') || page.url().includes('/explore')).toBeTruthy();
  315 |   });
  316 | 
  317 |   test('Back-link с challenge detail', async ({ page }) => {
  318 |     await page.goto(`${BASE}/challenges/1`);
  319 |     const back = page.getByRole('link', { name: /На главную|Назад/ }).first();
  320 |     if (await back.isVisible({ timeout: 3000 }).catch(() => false)) {
  321 |       await back.click();
  322 |       await page.waitForTimeout(1000);
  323 |     }
  324 |     expect(page.url()).toContain(BASE);
  325 |   });
  326 | 
  327 |   test('Footer ссылки', async ({ page }) => {
  328 |     await page.goto(BASE);
  329 |     const footer = page.locator('footer').or(page.locator('[class*="footer"]'));
  330 |     if (await footer.isVisible({ timeout: 3000 }).catch(() => false)) {
  331 |       await expect(footer).toBeVisible();
  332 |     }
  333 |   });
  334 | });
  335 | 
  336 | // ─── MOBILE ───
  337 | 
  338 | test.describe('Mobile viewport', () => {
  339 | 
  340 |   test.use({ viewport: { width: 375, height: 812 } });
  341 | 
  342 |   test('Landing', async ({ page }) => {
  343 |     await page.goto(BASE);
  344 |     await expect(page.getByRole('heading', { name: /NEWSY/i }).first()).toBeVisible();
  345 |   });
  346 | 
  347 |   test('Explore', async ({ page }) => {
  348 |     await page.goto(`${BASE}/explore`);
  349 |     await expect(page.getByRole('heading', { name: /Найди свой челлендж/ })).toBeVisible();
  350 |   });
  351 | 
  352 |   test('Register', async ({ page }) => {
  353 |     await page.goto(`${BASE}/register`);
  354 |     await expect(page.getByText('Создать аккаунт')).toBeVisible();
  355 |   });
  356 | 
  357 |   test('Login', async ({ page }) => {
  358 |     await page.goto(`${BASE}/login`);
  359 |     await expect(page.locator('input[name="identifier"]')).toBeVisible();
  360 |   });
  361 | });
  362 | 
```