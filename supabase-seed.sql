-- Seed: Permissions
INSERT INTO "Permission" ("id", "key", "name", "createdAt", "updatedAt") VALUES
('p1', 'challenge.create', 'Создание челленджей', NOW(), NOW()),
('p2', 'challenge.update', 'Редактирование челленджей', NOW(), NOW()),
('p3', 'challenge.publish', 'Публикация челленджей', NOW(), NOW()),
('p4', 'challenge.delete', 'Удаление челленджей', NOW(), NOW()),
('p5', 'user.read', 'Просмотр пользователей', NOW(), NOW()),
('p6', 'user.write', 'Изменение пользователей', NOW(), NOW()),
('p7', 'admin.access', 'Доступ в админку', NOW(), NOW())
ON CONFLICT ("key") DO NOTHING;

-- Seed: Roles
INSERT INTO "Role" ("id", "key", "name", "description", "createdAt", "updatedAt") VALUES
('r1', 'admin', 'Администратор', 'Полный доступ к системе', NOW(), NOW()),
('r2', 'user', 'Пользователь', 'Базовый доступ', NOW(), NOW()),
('r3', 'organizer', 'Организатор', 'Создание и управление челленджами', NOW(), NOW())
ON CONFLICT ("key") DO NOTHING;

-- Seed: Admin role permissions
INSERT INTO "PermissionRole" ("id", "roleId", "permissionId", "createdAt")
SELECT 'pr' || p."id", 'r1', p."id", NOW()
FROM "Permission" p
WHERE NOT EXISTS (SELECT 1 FROM "PermissionRole" WHERE "roleId" = 'r1' AND "permissionId" = p."id");

-- Seed: Organizer
INSERT INTO "Organizer" ("id", "type", "name", "legalName", "description", "status", "createdAt", "updatedAt") VALUES
('org1', 'BRAND', 'NEWSY', 'ООО "Ньюси"', 'Официальный организатор платформы', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed: Admin user (password: Newsy123!)
INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName", "status", "createdAt", "updatedAt") VALUES
('u1', 'admin@newsy.ru', '210000:539975231995cd8f69cd332420bd4f1f:80338692748c673e6161d6ab4793b93bfa9ddb0813bd0ff62fdfd00cff02ac31be36f390f4212352e3c7dc22b40229b4b6152ed31228eac0f8796c52f3cffb54', 'Админ', 'NEWSY', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Seed: Regular user
INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName", "status", "createdAt", "updatedAt") VALUES
('u2', 'user@newsy.ru', '210000:539975231995cd8f69cd332420bd4f1f:80338692748c673e6161d6ab4793b93bfa9ddb0813bd0ff62fdfd00cff02ac31be36f390f4212352e3c7dc22b40229b4b6152ed31228eac0f8796c52f3cffb54', 'Пользователь', 'NEWSY', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Seed: User roles
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt") VALUES
('ur1', 'u1', 'r1', NOW()),
('ur2', 'u2', 'r2', NOW())
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- Seed: Admin as organizer member
INSERT INTO "OrganizerMember" ("id", "organizerId", "userId", "roleInOrganizer", "status", "createdAt", "updatedAt") VALUES
('om1', 'org1', 'u1', 'admin', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("organizerId", "userId") DO NOTHING;

-- =============================================
-- STARTER CHALLENGE: "Гайд по платформе NEWSY"
-- =============================================
INSERT INTO "Challenge" ("id", "organizerId", "status", "title", "description", "category", "isCooperative", "startDate", "endDate", "entryFee", "publishPrice", "createdAt", "updatedAt") VALUES
('ch-guide-001', 'org1', 'DRAFT', 'Гайд по платформе NEWSY: Первые шаги',
 'Познакомься с платформой NEWSY! Пройди 5 простых этапов, чтобы узнать все функции: загрузка файлов, профиль, навигация, поиск и достижения. Идеально для первого знакомства.',
 'education', false, NOW(), NOW() + interval '30 days', 0, 0, NOW(), NOW());

-- Steps
INSERT INTO "Step" ("id", "challengeId", "title", "description", "order", "type", "config", "rewardPoints", "createdAt", "updatedAt") VALUES
('st-001', 'ch-guide-001', 'Заполни профиль', 'Зайди в настройки профиля и заполни имя, фамилию. Загрузи аватар.', 0, 'action', NULL, 10, NOW(), NOW()),
('st-002', 'ch-guide-001', 'Сфотографируй экран приветствия', 'Сделай скриншот главной страницы и загрузи его как подтверждение.', 1, 'photo', NULL, 20, NOW(), NOW()),
('st-003', 'ch-guide-001', 'Найди челлендж через поиск', 'В поиске найди любой челлендж по ключевому слову. Напиши его название.', 2, 'question', '{"options": ["Гайд по платформе NEWSY", "Забег на 5 км", "Что-то другое"], "correctIndex": 0}', 15, NOW(), NOW()),
('st-004', 'ch-guide-001', 'Добавь челлендж в избранное', 'Нажми на любой челлендж и добавь его в избранное. Это поможет тебе не потерять интересные задания.', 3, 'action', NULL, 15, NOW(), NOW()),
('st-005', 'ch-guide-001', 'Посмотри свои достижения', 'Перейди в раздел достижений и проверь, какие баллы ты уже заработал.', 4, 'action', NULL, 20, NOW(), NOW());

-- Cover image
INSERT INTO "ChallengeMedia" ("id", "challengeId", "type", "url", "sortOrder", "altText", "createdAt", "updatedAt") VALUES
('cm-001', 'ch-guide-001', 'IMAGE', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 0, 'Обложка гайда по платформе', NOW(), NOW());
