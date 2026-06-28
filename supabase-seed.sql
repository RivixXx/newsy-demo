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
