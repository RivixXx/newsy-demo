# ✅ Ревью выполненных задач (Фазы 0–2) — Замечания и дополнения

> Дата ревью: 14 июля 2026 г.

---

## Общий вердикт

Фазы 0–2 выполнены **очень качественно**. Все ключевые задачи реализованы. Ниже — конкретные проблемы, которые нашёл при проверке кода.

---

## 🔴 Баги (нужно исправить)

### Баг 1: Неправильное имя поля при создании `OrganizerMember`

**Файл:** [actions.ts:195](file:///d:/WEB/Work/NF/src/modules/identity/actions.ts#L191-L197)

```typescript
await prisma.organizerMember.create({
  data: {
    organizerId: organizer.id,
    userId: user.id,
    role: 'OWNER',       // ❌ Поле называется `roleInOrganizer`, не `role`!
  },
});
```

**В Prisma-схеме** ([schema.prisma:270](file:///d:/WEB/Work/NF/prisma/schema.prisma#L266-L279)):
```prisma
model OrganizerMember {
  roleInOrganizer    OrganizerMemberRole   @default(MEMBER)  // ← вот правильное имя
}
```

**Исправление:**
```typescript
await prisma.organizerMember.create({
  data: {
    organizerId: organizer.id,
    userId: user.id,
    roleInOrganizer: 'OWNER',  // ✅
  },
});
```

> [!CAUTION]
> Этот баг приведёт к runtime-ошибке при регистрации организатора. Prisma бросит `Unknown field 'role'`.

---

### Баг 2: Некорректный маппинг `AccountType` → `OrganizerType`

**Файл:** [actions.ts:185](file:///d:/WEB/Work/NF/src/modules/identity/actions.ts#L182-L189)

```typescript
const organizer = await prisma.organizer.create({
  data: {
    name: organizerName,
    type: (accountType as any) || 'BRAND',  // ❌ accountType = 'IP' | 'OOO' | 'SELF_EMPLOYED'
    inn,                                     //    но OrganizerType = BRAND | INFLUENCER | NGO | GOVERNMENT | OTHER
    status: 'ACTIVE',
  },
});
```

`AccountType` и `OrganizerType` — это **разные enum'ы**:
- `AccountType`: `INDIVIDUAL`, `IP`, `OOO`, `AO`, `SELF_EMPLOYED`
- `OrganizerType`: `BRAND`, `INFLUENCER`, `NGO`, `GOVERNMENT`, `OTHER`

Если организатор зарегистрирован как `OOO`, Prisma получит `type: 'OOO'` — а такого значения в `OrganizerType` нет → **runtime ошибка**.

**Исправление:** нужен маппинг:
```typescript
function accountTypeToOrganizerType(accountType: string): string {
  switch (accountType) {
    case 'IP':
    case 'SELF_EMPLOYED':
      return 'BRAND';          // или 'OTHER'
    case 'OOO':
    case 'AO':
      return 'BRAND';
    default:
      return 'OTHER';
  }
}
```

Или добавить отдельный вопрос при регистрации: «Тип организации: Бренд / Блогер / НКО / Гос. структура».

---

## 🟠 Замечания средней важности

### 3. Login redirect ведёт на `/` → бесконечный цикл

**Файлы:**
- [actions.ts:53](file:///d:/WEB/Work/NF/src/modules/identity/actions.ts#L53) — `redirect('/')`
- [middleware.ts:78-79](file:///d:/WEB/Work/NF/src/middleware.ts#L78-L79) — `if (isLoggedIn && pathname === '/') → redirect('/explore')`

После успешного входа:
1. `loginAction` → `redirect('/')` 
2. Middleware ловит → `redirect('/explore')`

Это **два** редиректа вместо одного. Работает, но увеличивает TTFB и теряет `?next=` параметр.

**Рекомендация:** в `loginAction` сразу делать `redirect('/explore')`, или лучше — редиректить на `?next=` если он передавался при логине.

---

### 4. Фейковая статистика на лендинге

**Файл:** [page.tsx:33-46](file:///d:/WEB/Work/NF/src/app/(public)/page.tsx#L33-L46)

```tsx
<strong>50k+</strong> участников
<strong>1.2k</strong> челленджей  
<strong>4.9</strong> рейтинг
```

Это hardcoded числа, которые не соответствуют реальности (на старте — 0 пользователей). Варианты:

- **Вариант A** (быстро): Убрать блок `hero-stats` до достижения реальных цифр
- **Вариант B** (правильно): Сделать Server Component, подтянуть реальные данные из БД (`User.count()`, `Challenge.count()`)
- **Вариант C** (компромисс): Показывать только после достижения порога (например, `count > 100`)

---

### 5. Organizer при регистрации создаётся **без транзакции**

**Файл:** [actions.ts:176-208](file:///d:/WEB/Work/NF/src/modules/identity/actions.ts#L176-L208)

Сейчас:
1. `prisma.user.create(...)` → user создан
2. `prisma.organizer.create(...)` → organizer создан
3. `prisma.organizerMember.create(...)` → может упасть ← **user и organizer уже в БД**
4. `prisma.userRole.create(...)` → может упасть ← **orphan organizer**

Если любой шаг после user.create упадёт → пользователь есть, но организатор неполноценный.

**Рекомендация:** обернуть в `prisma.$transaction()`:
```typescript
const { user, organizer } = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData as any });
  // ...organizer + member + role...
  return { user, organizer };
});
```

---

### 6. Тарифы на лендинге не из `tariffs.ts`

Лендинг [page.tsx:148-185](file:///d:/WEB/Work/NF/src/app/(public)/page.tsx#L148-L185) использует hardcoded тарифы (Бесплатно / 2990 ₽ / 9900 ₽), а [tariffs.ts](file:///d:/WEB/Work/NF/src/modules/payments/tariffs.ts) содержит `PUBLISH_TARIFFS` с ценами 0 / 2990 / 9900. Числа совпадают, но при изменении тарифов придётся менять в **двух** местах.

**Рекомендация:** импортировать `PUBLISH_TARIFFS` в лендинг и рендерить динамически.

---

## 🟡 Мелкие улучшения

### 7. SEO для лендинга

Лендинг — `'use client'`. Для SEO лучше сделать максимально SSR/static:
- Лендинг не имеет `<title>` и `metadata` экспорта
- Рекомендация: добавить `export const metadata` или вынести статический контент в Server Component

### 8. `/forgot-password` → ссылка с формы логина?

Проверить: есть ли на странице логина ссылка «Забыли пароль?» → `/forgot-password`. Если нет — пользователь не найдёт эту функцию.

### 9. Password reset — нет валидации длины нового пароля

В [auth-service.impl.ts:111](file:///d:/WEB/Work/NF/src/modules/identity/services/auth-service.impl.ts#L111) новый пароль хешируется без проверки длины. Валидация на фронте может быть обойдена. Добавить серверную проверку:
```typescript
if (payload.newPassword.length < 8) {
  throw new Error('Пароль должен быть не менее 8 символов.');
}
```

### 10. `Organizer.status` = `ACTIVE` сразу при создании

При регистрации организатор получает `status: 'ACTIVE'` ([actions.ts:187](file:///d:/WEB/Work/NF/src/modules/identity/actions.ts#L187)). Для модерации лучше `PENDING` → admin переводит в `ACTIVE`.

### 11. `getUpstashLimiter()` в rate-limit.ts создаёт лимитер, но он не используется

В [rate-limit.ts:22-46](file:///d:/WEB/Work/NF/src/lib/rate-limit.ts#L22-L46) функция `getUpstashLimiter()` создаёт лимитер с `slidingWindow(100, '10 s')`, но фактические вызовы идут через `getLimiter()` на строке 70, который создаёт **отдельные** лимитеры с правильными параметрами. `getUpstashLimiter()` — мёртвый код.

---

## 📊 Итоговый статус задач

| Задача | Статус | Замечания |
|--------|--------|-----------|
| 0.1 isCooperative | ✅ | — |
| 0.2 Баллы/очки | ✅ | — |
| 0.3 Unsplash | ✅ | Все ссылки заменены |
| 0.4 Three.js | ✅ | Оставлен, lazy-загрузка |
| 1.1 Сброс пароля | ✅ | Добавить валидацию длины пароля (п.9) |
| 1.2 Upstash Redis | ✅ | Убрать мёртвый код `getUpstashLimiter()` (п.11) |
| 1.3 Mock ЮKassa | ✅ | — |
| 2.1 Лендинг | ✅ | Фейковая статистика (п.4), SEO (п.7) |
| 2.2 Выбор роли | ✅ | **2 бага** (п.1, п.2), без транзакции (п.5) |
| 2.3 Конструктор | ⚠️ | Частично — drag-drop и оплата на потом |
| 2.4 Дашборд орг. | ✅ | — |
| 2.5 Профиль орг. | ✅ | — |

---

## 🔜 Следующие шаги

Исходя из текущего состояния, рекомендую порядок:

1. **Исправить 2 бага** (п.1, п.2) — 30 минут, критично
2. **Обернуть в транзакцию** (п.5) — 30 минут
3. **Далее — Фаза 3**, начать с **реферальной системы** (она почти готова: схема + сервис + страница)
