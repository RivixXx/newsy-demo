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

  const permissionData = [
    { key: 'challenge.create', name: 'Создание челленджей' },
    { key: 'challenge.update', name: 'Редактирование челленджей' },
    { key: 'challenge.publish', name: 'Публикация челленджей' },
    { key: 'challenge.delete', name: 'Удаление челленджей' },
    { key: 'user.read', name: 'Просмотр пользователей' },
    { key: 'user.write', name: 'Изменение пользователей' },
    { key: 'admin.access', name: 'Доступ в админку' },
  ];

  for (const p of permissionData) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name },
      create: { key: p.key, name: p.name, createdAt: now, updatedAt: now },
    });
  }

  const roleData = [
    { key: 'admin', name: 'Администратор', description: 'Полный доступ к системе' },
    { key: 'user', name: 'Пользователь', description: 'Базовый доступ' },
    { key: 'organizer', name: 'Организатор', description: 'Создание и управление челленджами' },
  ];

  for (const r of roleData) {
    await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description },
      create: { key: r.key, name: r.name, description: r.description, createdAt: now, updatedAt: now },
    });
  }

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
