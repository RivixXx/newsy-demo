import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRESET_ACHIEVEMENTS = [
  { key: 'first_step', name: 'Первый шаг', description: 'Завершил первый этап челленджа', icon: '👣' },
  { key: 'photo_master', name: 'Мастер фото', description: 'Загрузил более 10 фото в челленджах', icon: '📸' },
  { key: 'explorer', name: 'Исследователь', description: 'Участвовал в 5 разных челленджах', icon: '🧭' },
  { key: 'speed_demon', name: 'Демон скорости', description: 'Завершил челлендж быстрее всех', icon: '⚡' },
  { key: 'social_butterfly', name: 'Социальная бабочка', description: 'Поделился челленджем с 10 друзьями', icon: '🦋' },
  { key: 'streak_master', name: 'Мастер серии', description: '7 дней подряд выполняет задания', icon: '🔥' },
  { key: 'team_player', name: 'Командный игрок', description: 'Завершил кооперативный челлендж', icon: '🤝' },
  { key: 'creative_soul', name: 'Творческая душа', description: 'Выиграл челлендж в категории Искусство', icon: '🎨' },
  { key: 'tech_wizard', name: 'Техно-волшебник', description: 'Выиграл челлендж в категории Технологии', icon: '🧙' },
  { key: 'athlete', name: 'Атлет', description: 'Завершил 3 спортивных челленджа', icon: '🏋️' },
  { key: 'scholar', name: 'Учёный', description: 'Завершил 3 образовательных челленджа', icon: '🎓' },
  { key: 'quest_hunter', name: 'Охотник за квестами', description: 'Завершил 5 квестов', icon: '🗺️' },
  { key: 'perfectionist', name: 'Перфекционист', description: 'Получил максимальный балл во всех этапах', icon: '💎' },
  { key: 'early_bird', name: 'Ранняя пташка', description: 'Записался в челлендж в первый день', icon: '🐦' },
  { key: 'night_owl', name: 'Ночная сова', description: 'Выполнил задание после полуночи', icon: '🦉' },
];

async function main() {
  for (const a of PRESET_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: {},
      create: {
        key: a.key,
        name: a.name,
        description: a.description,
        icon: a.icon,
        isCustom: false,
        isApproved: true,
      },
    });
  }
  console.log(`Seeded ${PRESET_ACHIEVEMENTS.length} achievements`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
