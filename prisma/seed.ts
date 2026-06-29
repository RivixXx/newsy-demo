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

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL,
});

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

  const existingOrganizer = await prisma.organizer.findFirst({ where: { name: 'NEWSY' } });
  if (existingOrganizer && admin) {
    await prisma.organizerMember.upsert({
      where: { organizerId_userId: { organizerId: existingOrganizer.id, userId: admin.id } },
      update: {},
      create: {
        organizerId: existingOrganizer.id,
        userId: admin.id,
        roleInOrganizer: 'admin',
        status: 'ACTIVE',
      },
    });
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

  const subscriptionPlans = [
    {
      key: 'user_basic',
      name: 'Базовый',
      description: 'Бесплатный доступ к платформе',
      price: 0,
      interval: 'MONTHLY' as const,
      features: ['Участие в челленджах', 'Базовая аналитика', 'До 3 активных челленджей'],
      sortOrder: 0,
    },
    {
      key: 'user_pro',
      name: 'Профи',
      description: 'Расширенный доступ для активных участников',
      price: 299,
      interval: 'MONTHLY' as const,
      features: ['Безлимит челленджей', 'Расширенная аналитика', 'Приоритет в выдаче', 'Бейдж Профи', 'Эксклюзивные челленджи'],
      sortOrder: 1,
    },
    {
      key: 'organizer_basic',
      name: 'Организатор',
      description: 'Для бизнеса — создание и продвижение челленджей',
      price: 4990,
      interval: 'MONTHLY' as const,
      features: ['Создание челленджей', 'До 500 участников', 'Брендирование', 'Аналитика охватов', 'Поддержка'],
      sortOrder: 2,
    },
  ];

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { key: plan.key },
      update: { price: plan.price },
      create: {
        ...plan,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  console.log('Subscription plans seeded');

  // =============================================
  // STARTER CHALLENGE: "Гайд по платформе NEWSY"
  // =============================================
  const organizer = await prisma.organizer.findFirst({ where: { name: 'NEWSY' } });
  if (organizer) {
    const existingChallenge = await prisma.challenge.findUnique({ where: { id: 'ch-guide-001' } });
    if (!existingChallenge) {
      await prisma.challenge.create({
        data: {
          id: 'ch-guide-001',
          organizerId: organizer.id,
          status: 'DRAFT',
          title: 'Гайд по платформе NEWSY: Первые шаги',
          description: 'Познакомься с платформой NEWSY! Пройди 5 простых этапов, чтобы узнать все функции: загрузка файлов, профиль, навигация, поиск и достижения. Идеально для первого знакомства.',
          category: 'education',
          isCooperative: false,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          entryFee: 0,
          publishPrice: 0,
          steps: {
            create: [
              {
                title: 'Заполни профиль',
                description: 'Зайди в настройки профиля и заполни имя, фамилию. Загрузи аватар.',
                order: 0,
                type: 'action',
                rewardPoints: 10,
              },
              {
                title: 'Сфотографируй экран приветствия',
                description: 'Сделай скриншот главной страницы и загрузи его как подтверждение.',
                order: 1,
                type: 'photo',
                rewardPoints: 20,
              },
              {
                title: 'Найди челлендж через поиск',
                description: 'В поиске найди любой челлендж по ключевому слову. Выбери правильный ответ.',
                order: 2,
                type: 'question',
                config: {
                  options: ['Гайд по платформе NEWSY', 'Забег на 5 км', 'Что-то другое'],
                  correctIndex: 0,
                },
                rewardPoints: 15,
              },
              {
                title: 'Добавь челлендж в избранное',
                description: 'Нажми на любой челлендж и добавь его в избранное. Это поможет тебе не потерять интересные задания.',
                order: 3,
                type: 'action',
                rewardPoints: 15,
              },
              {
                title: 'Посмотри свои достижения',
                description: 'Перейди в раздел достижений и проверь, какие баллы ты уже заработал.',
                order: 4,
                type: 'action',
                rewardPoints: 20,
              },
            ],
          },
          media: {
            create: {
              type: 'IMAGE',
              url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
              sortOrder: 0,
              altText: 'Обложка гайда по платформе',
            },
          },
        },
      });
      console.log('Starter challenge created: ch-guide-001 (DRAFT)');
    }
  }
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
