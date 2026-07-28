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
        name: 'ЧИ',
        legalName: 'ООО "ЧИ"',
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
        lastName: 'ЧИ',
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

  const existingOrganizer = await prisma.organizer.findFirst({ where: { name: 'ЧИ' } });
  if (existingOrganizer && admin) {
    await prisma.organizerMember.upsert({
      where: { organizerId_userId: { organizerId: existingOrganizer.id, userId: admin.id } },
      update: {},
      create: {
        organizerId: existingOrganizer.id,
        userId: admin.id,
        roleInOrganizer: 'ADMIN',
        status: 'ACTIVE',
      },
    });
  }

  const regularUser = await prisma.user.findFirst({ where: { email: 'user@newsy.ru' } });
  if (existingOrganizer && regularUser) {
    await prisma.organizerMember.upsert({
      where: { organizerId_userId: { organizerId: existingOrganizer.id, userId: regularUser.id } },
      update: {},
      create: {
        organizerId: existingOrganizer.id,
        userId: regularUser.id,
        roleInOrganizer: 'MEMBER',
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
        lastName: 'ЧИ',
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
      key: 'organizer_starter',
      name: 'Стартер',
      description: 'Для начинающих организаторов',
      price: 990,
      interval: 'MONTHLY' as const,
      features: ['1 челлендж в месяц', 'До 100 участников', 'Базовая аналитика', 'Email-поддержка'],
      sortOrder: 2,
    },
    {
      key: 'organizer_business',
      name: 'Бизнес',
      description: 'Для активных организаторов',
      price: 4990,
      interval: 'MONTHLY' as const,
      features: ['10 челленджей в месяц', 'До 1000 участников', 'Расширенная аналитика', 'Приоритет в каталоге', 'Приоритетная поддержка'],
      sortOrder: 3,
    },
    {
      key: 'organizer_corporate',
      name: 'Корпоратив',
      description: 'Для крупных компаний',
      price: 29000,
      interval: 'MONTHLY' as const,
      features: ['Безлимит челленджей', 'Безлимит участников', 'Полная аналитика + API', 'Топ позиция', 'Персональный менеджер', 'Интеграция с CRM'],
      sortOrder: 4,
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
  // STARTER CHALLENGE: "Гайд по платформе ЧИ"
  // =============================================
  const organizer = await prisma.organizer.findFirst({ where: { name: 'ЧИ' } });
  if (organizer) {
    const existingChallenge = await prisma.challenge.findUnique({ where: { id: 'ch-guide-001' } });
    if (!existingChallenge) {
      await prisma.challenge.create({
        data: {
          id: 'ch-guide-001',
          organizerId: organizer.id,
          status: 'DRAFT',
          title: 'Гайд по платформе ЧИ: Первые шаги',
          description: 'Познакомься с платформой ЧИ! Пройди 5 простых этапов, чтобы узнать все функции: загрузка файлов, профиль, навигация, поиск и достижения. Идеально для первого знакомства.',
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
                  options: ['Гайд по платформе ЧИ', 'Забег на 5 км', 'Что-то другое'],
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

  // =============================================
  // BASE ACHIEVEMENTS
  // =============================================
  const achievements = [
    { key: 'first_step', name: 'Первый шаг', description: 'Завершите первый этап любого челленджа', icon: '👣', category: 'progress' },
    { key: 'first_challenge', name: 'Новичок', description: 'Завершите свой первый челлендж', icon: '🎯', category: 'progress' },
    { key: 'ten_challenges', name: 'Ветеран', description: 'Завершите 10 челленджей', icon: '🏅', category: 'progress' },
    { key: 'speed_runner', name: 'Спидраннер', description: 'Завершите челлендж менее чем за 24 часа', icon: '⚡', category: 'special' },
    { key: 'social_butterfly', name: 'Социальная бабочка', description: 'Пригласите 5 друзей через реферальную ссылку', icon: '🦋', category: 'social' },
    { key: 'collector', name: 'Коллекционер', description: 'Наберите 10 различных достижений', icon: '💎', category: 'special' },
    { key: 'marathoner', name: 'Марафонец', description: 'Участвуйте в 5 спортивных челленджах', icon: '🏃', category: 'sport' },
    { key: 'scholar', name: 'Учёный', description: 'Завершите 5 образовательных челленджей', icon: '📚', category: 'education' },
    { key: 'artist', name: 'Творец', description: 'Завершите 3 творческих конкурса', icon: '🎨', category: 'art' },
    { key: 'eco_warrior', name: 'Эко-воин', description: 'Участвуйте в 3 экологических акциях', icon: '🌍', category: 'eco' },
    { key: 'team_player', name: 'Командный игрок', description: 'Вступите в команду и завершите челлендж', icon: '🤝', category: 'social' },
    { key: 'streak_7', name: 'Неделя без перерыва', description: 'Выполняйте задания 7 дней подряд', icon: '🔥', category: 'streak' },
    { key: 'streak_30', name: 'Месяц дисциплины', description: 'Выполняйте задания 30 дней подряд', icon: '💪', category: 'streak' },
    { key: 'reviewer', name: 'Критик', description: 'Оставьте отзыв о 5 челленджах', icon: '✍️', category: 'social' },
    { key: 'photographer', name: 'Фотограф', description: 'Загрузите 50 фотографий в челленджи', icon: '📷', category: 'special' },
    { key: 'top_10', name: 'Топ-10', description: 'Войдите в топ-10 любого рейтинга', icon: '🏆', category: 'special' },
    { key: 'early_bird', name: 'Ранняя пташка', description: 'Запишитесь на челлендж в первый день', icon: '🐦', category: 'special' },
    { key: 'organizer', name: 'Организатор', description: 'Создайте свой первый челлендж', icon: '🎪', category: 'organizer' },
    { key: 'brand_partner', name: 'Партнёр бренда', description: 'Верифицируйтесь как организатор', icon: '✅', category: 'organizer' },
    { key: 'viral', name: 'Вирусный', description: 'Ваш челлендж наберет 100 участников', icon: '📈', category: 'organizer' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: {
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
      },
    });
  }

  console.log('Achievements seeded:', achievements.length);
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
