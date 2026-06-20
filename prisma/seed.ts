import { PrismaClient } from '@prisma/client';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const ITERATIONS = 210_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${ITERATIONS}:${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Seed permissions
  await prisma.permission.createMany({
    data: [
      { key: 'challenge.create', name: 'Создание челленджей', createdAt: now, updatedAt: now },
      { key: 'challenge.update', name: 'Редактирование челленджей', createdAt: now, updatedAt: now },
      { key: 'challenge.publish', name: 'Публикация челленджей', createdAt: now, updatedAt: now },
      { key: 'challenge.delete', name: 'Удаление челленджей', createdAt: now, updatedAt: now },
      { key: 'user.read', name: 'Просмотр пользователей', createdAt: now, updatedAt: now },
      { key: 'user.write', name: 'Изменение пользователей', createdAt: now, updatedAt: now },
      { key: 'admin.access', name: 'Доступ в админку', createdAt: now, updatedAt: now },
    ],
    skipDuplicates: true,
  });

  // Seed roles
  await prisma.role.createMany({
    data: [
      { key: 'admin', name: 'Администратор', description: 'Полный доступ к системе', createdAt: now, updatedAt: now },
      { key: 'user', name: 'Пользователь', description: 'Базовый доступ', createdAt: now, updatedAt: now },
      { key: 'organizer', name: 'Организатор', description: 'Создание и управление челленджами', createdAt: now, updatedAt: now },
    ],
    skipDuplicates: true,
  });

  // Link admin role to all permissions
  const allPermissions = await prisma.permission.findMany();
  const adminRole = await prisma.role.findUnique({ where: { key: 'admin' } });

  if (adminRole) {
    for (const perm of allPermissions) {
      await prisma.permissionRole.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: perm.id },
      });
    }
  }

  // Seed default organizer
  const existingOrganizers = await prisma.organizer.count();
  if (existingOrganizers === 0) {
    await prisma.organizer.create({
      data: {
        type: 'BRAND',
        name: 'NEWSY',
        legalName: 'ООО "Ньюси"',
        description: 'Официальный организатор платформы',
        status: 'ACTIVE',
      },
    });
  }

  // Seed default admin user
  const admin = await prisma.user.findFirst({ where: { email: 'admin@newsy.ru' } });
  if (!admin) {
    await prisma.user.create({
      data: {
        email: 'admin@newsy.ru',
        passwordHash: hashPassword('Newsy123!'),
        firstName: 'Админ',
        lastName: 'NEWSY',
        status: 'ACTIVE',
        roles: {
          create: {
            role: { connect: { key: 'admin' } },
          },
        },
      },
    });
    console.log('Admin created: admin@newsy.ru / Newsy123!');
  }

  // Seed default user
  const user = await prisma.user.findFirst({ where: { email: 'user@newsy.ru' } });
  if (!user) {
    await prisma.user.create({
      data: {
        email: 'user@newsy.ru',
        passwordHash: hashPassword('Newsy123!'),
        firstName: 'Пользователь',
        lastName: 'NEWSY',
        status: 'ACTIVE',
        roles: {
          create: {
            role: { connect: { key: 'user' } },
          },
        },
      },
    });
    console.log('User created: user@newsy.ru / Newsy123!');
  }

  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
