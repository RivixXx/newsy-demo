export interface CatalogChallenge {
  id: string;
  title: string;
  organizer: string;
  category: string;
  imageUrl: string;
  participantsCount: number;
  maxParticipants: number;
  isJoined: boolean;
  badges: string[];
  isRecommended: boolean;
  achievement: string;
  reward: string;
  location: string;
  endDate: string;
  description: string;
  requirements: string;
  refundPolicy: string;
  isDemo?: boolean;
}

export const MOCK_CHALLENGES: CatalogChallenge[] = [
  {
    id: '1', title: 'Бизнес-инкубатор: Собрать MVP за 48 часов', organizer: 'Сколково',
    category: 'tech',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    participantsCount: 45, maxParticipants: 60, isJoined: false, badges: ['hot'], isRecommended: true,
    achievement: 'Стартап-пионер', reward: 'Бесплатный офис в Сколково на 1 мес.',
    location: 'Москва', endDate: '25 июля 2026',
    description: 'Создай рабочий прототип продукта за 48 часов в команде. Менторы Сколково помогут на всех этапах.',
    requirements: 'Участники от 18 лет. Команда 2-5 человек. Наличие ноутбука.',
    refundPolicy: 'Возврат взноса при отмене за 72 часа до старта. После — средства не возвращаются.',
    isDemo: true,
  },
  {
    id: '2', title: 'Привлечь 1000 подписчиков в ТГ без бюджета', organizer: 'Marketing Pro',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80',
    participantsCount: 320, maxParticipants: 500, isJoined: false, badges: [], isRecommended: true,
    achievement: 'Мастер роста', reward: 'Курс по SMM (₽15 000)',
    location: 'Онлайн', endDate: '10 августа 2026',
    description: 'За 30 дней вырасти с нуля до 1000 подписчиков используя только органику.',
    requirements: 'Собственный Telegram-канал. Базовые знания контент-маркетинга.',
    refundPolicy: 'Возврат возможен в течение первых 3 дней после регистрации.',
    isDemo: true,
  },
  {
    id: '3', title: 'Пройти 5 IT-собеседований за неделю', organizer: 'HR Academy',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    participantsCount: 150, maxParticipants: 200, isJoined: false, badges: [], isRecommended: false,
    achievement: 'Железный кандидат', reward: 'Сертификат HR Academy',
    location: 'Москва / Онлайн', endDate: '5 августа 2026',
    description: 'Пройди минимум 5 реальных собеседований в IT-компании за 7 дней и получи экспертную обратную связь.',
    requirements: 'Резюме на hh.ru. Опыт в IT от 6 месяцев.',
    refundPolicy: 'Возврат взноса при отмене за 48 часов. Дисквалификация при нечестном прохождении.',
  },
  {
    id: '4', title: 'Написать идеальный бизнес-план кофейни', organizer: 'Coffee Like',
    category: 'tech',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
    participantsCount: 85, maxParticipants: 100, isJoined: false, badges: ['cooperative'], isRecommended: true,
    achievement: 'Бизнес-визионер', reward: 'Франшиза Coffee Like на 3 месяца',
    location: 'Онлайн', endDate: '1 августа 2026',
    description: 'Разработай полноценный бизнес-план кофейни с финансовой моделью. Лучшие работы рассмотрят для реализации.',
    requirements: 'Участники от 16 лет. Базовые знания Excel.',
    refundPolicy: 'Без возврата взноса после старта. Награда выдаётся автору лучшего плана.',
  },
  {
    id: '5', title: 'Марафон «Властелин Колец» (Режиссёрская версия)', organizer: 'КиноПоиск',
    category: 'quest',
    imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80',
    participantsCount: 1200, maxParticipants: 2000, isJoined: false, badges: [], isRecommended: true,
    achievement: 'Хранитель Кольца', reward: 'Годовая подписка КиноПоиск HD',
    location: 'Онлайн', endDate: '20 июля 2026',
    description: 'Посмотри все три части «Властелина Колец» в режиссёрской версии за один день и ответь на 20 вопросов викторины.',
    requirements: 'Аккаунт КиноПоиск. Стабильный интернет.',
    refundPolicy: 'Бесплатное участие. Ограничений по возврату нет.',
  },
  {
    id: '6', title: 'Пройти Minecraft без урона', organizer: 'PlayStation RU',
    category: 'quest',
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=400&q=80',
    participantsCount: 890, maxParticipants: 1000, isJoined: false, badges: [], isRecommended: false,
    achievement: 'Легенда Minecraft', reward: 'PS5 Digital Edition',
    location: 'Онлайн', endDate: '31 июля 2026',
    description: 'Завершить игру в Minecraft от спауна до финального босса без единого урона. Запись геймплея обязательна.',
    requirements: 'Лицензионный Minecraft Java. Запись экрана.',
    refundPolicy: 'Бесплатное участие. Дисквалификация за читы.',
  },
  {
    id: '7', title: 'Создать арт-объект из мусора', organizer: 'Эко-Движение',
    category: 'art',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    participantsCount: 210, maxParticipants: 300, isJoined: false, badges: [], isRecommended: true,
    achievement: 'Эко-художник', reward: 'Выставка в галерее Москвы',
    location: 'По всей России', endDate: '15 августа 2026',
    description: 'Создай арт-объект исключительно из переработанных или найденных материалов. Фото/видео обязательны.',
    requirements: 'Любой возраст. Материалы: только вторичное сырьё.',
    refundPolicy: 'Бесплатное участие.',
  },
  {
    id: '8', title: 'Выучить 100 слов на японском за неделю', organizer: 'LangMaster',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80',
    participantsCount: 67, maxParticipants: 200, isJoined: false, badges: ['hot'], isRecommended: false,
    achievement: 'Полиглот', reward: 'Курс японского языка (₽12 000)',
    location: 'Онлайн', endDate: '29 июля 2026',
    description: 'За 7 дней выучи 100 базовых японских слов. Итоговый тест — 80% правильных ответов.',
    requirements: 'Смартфон с приложением LangMaster. 30 мин/день.',
    refundPolicy: 'Возврат взноса при отмене за 24 часа.',
  },
  {
    id: '9', title: 'Провести мастер-класс для детей бесплатно', organizer: 'Добровольцы России',
    category: 'quest',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
    participantsCount: 78, maxParticipants: 150, isJoined: false, badges: ['cooperative'], isRecommended: true,
    achievement: 'Наставник', reward: 'Сертификат волонтёра РФ',
    location: 'Ваш город', endDate: '10 августа 2026',
    description: 'Проведи бесплатный мастер-класс для детей 6-14 лет на любую тему. Минимум 10 участников.',
    requirements: 'Любой специалист с опытом от 1 года. Организация места проведения.',
    refundPolicy: 'Бесплатное участие.',
  },
  {
    id: '10', title: 'Запустить свой подкаст — первые 3 эпизода', organizer: 'Яндекс.Музыка',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80',
    participantsCount: 95, maxParticipants: 200, isJoined: false, badges: ['hot'], isRecommended: false,
    achievement: 'Голос эпохи', reward: 'Промо на Яндекс.Музыке (100к слушателей)',
    location: 'Онлайн', endDate: '5 сентября 2026',
    description: 'Запусти подкаст с нуля: запись, монтаж, публикация трёх эпизодов минимум по 20 минут.',
    requirements: 'Микрофон. Тема подкаста. Любая платформа размещения.',
    refundPolicy: 'Возврат при отмене за 5 дней.',
  },
  {
    id: '11', title: 'Сфотографировать 30 закатов за месяц', organizer: 'Nikon Russia',
    category: 'art',
    imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=400&q=80',
    participantsCount: 430, maxParticipants: 600, isJoined: false, badges: [], isRecommended: true,
    achievement: 'Охотник за светом', reward: 'Фотоаппарат Nikon Z30',
    location: 'Весь мир', endDate: '31 августа 2026',
    description: 'Снимай закат каждый день в течение месяца. Все фото публикуются в общей галерее.',
    requirements: 'Любой фотоаппарат или смартфон. EXIF-данные обязательны.',
    refundPolicy: 'Бесплатное участие.',
  },
  {
    id: '12', title: 'Читать по 30 минут каждый день месяц', organizer: 'Литрес',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80',
    participantsCount: 512, maxParticipants: 1000, isJoined: false, badges: [], isRecommended: false,
    achievement: 'Книжный червь', reward: 'Подписка Литрес на 6 месяцев',
    location: 'Онлайн', endDate: '31 июля 2026',
    description: 'Читай каждый день по 30+ минут. Ежедневный отчёт в чате. Дни без отчёта не засчитываются.',
    requirements: 'Любая платформа для чтения. Ежедневные отчёты.',
    refundPolicy: 'Бесплатное участие.',
  },
  {
    id: '13', title: 'Готовить новое блюдо каждую неделю', organizer: 'Шеф маркет',
    category: 'quest',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80',
    participantsCount: 280, maxParticipants: 400, isJoined: false, badges: ['hot'], isRecommended: true,
    achievement: 'Шеф-исследователь', reward: 'Набор продуктов Шеф маркет на ₽10 000',
    location: 'Дома', endDate: '15 сентября 2026',
    description: 'Каждую неделю готовь новое блюдо из кухни мира. Фото результата обязательно. 4 недели = 4 блюда.',
    requirements: 'Кухня. Базовые навыки готовки. Смартфон для фото.',
    refundPolicy: 'Возврат при отмене за 7 дней.',
  },
  {
    id: '14', title: 'Убрать мусор в ближайшем парке', organizer: 'ЭкоГород',
    category: 'quest',
    imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?auto=format&fit=crop&w=400&q=80',
    participantsCount: 560, maxParticipants: 1000, isJoined: false, badges: [], isRecommended: false,
    achievement: 'Страж природы', reward: 'Скидка 30% в спортивных магазинах-партнёрах',
    location: 'Ваш город', endDate: '1 августа 2026',
    description: 'Соберите мусор в любом парке. Минимум 5 кг. Фото до и после обязательны.',
    requirements: 'Перчатки. Мешки для мусора. Геолокация.',
    refundPolicy: 'Бесплатное участие.',
  },
  {
    id: '17', title: 'Утренний забег на 5км с Nike', organizer: 'Nike Run Club',
    category: 'sport',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=400&q=80',
    participantsCount: 120, maxParticipants: 200, isJoined: false, badges: [], isRecommended: true,
    achievement: 'Утренний бегун', reward: 'Кроссовки Nike Air Max (на выбор)',
    location: 'Парк Горького, Москва', endDate: '27 июля 2026',
    description: 'Пробеги 5 км вместе с Nike Run Club. Старт в 7:00. Темп свободный.',
    requirements: 'Любой уровень подготовки. Спортивная одежда. Приложение Nike Run.',
    refundPolicy: 'Возврат при отмене за 3 дня. После — средства не возвращаются.',
  },
  {
    id: '18', title: 'Сделать 100 отжиманий за подход', organizer: 'Iron Gym',
    category: 'sport',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    participantsCount: 42, maxParticipants: 100, isJoined: false, badges: ['hot'], isRecommended: false,
    achievement: 'Железная воля', reward: 'Годовой абонемент Iron Gym',
    location: 'Онлайн (видеозапись)', endDate: '10 августа 2026',
    description: 'Сделай 100 отжиманий за один подход без остановок. Обязательна видеозапись от начала до конца.',
    requirements: 'Видеозапись. 18+. Мат под руки.',
    refundPolicy: 'Дисквалификация без возврата при монтаже видео.',
  },
  {
    id: '19', title: 'Переплыть Волгу (марафон)', organizer: 'Russian Swim',
    category: 'sport',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80',
    participantsCount: 15, maxParticipants: 50, isJoined: false, badges: ['cooperative'], isRecommended: true,
    achievement: 'Покоритель Волги', reward: 'Экипировка Arena на ₽25 000',
    location: 'Волгоград', endDate: '3 августа 2026',
    description: 'Групповой заплыв через Волгу. Сопровождение катером. Медицинский контроль.',
    requirements: 'Подтверждённое умение плавать на 2 км+. Медсправка.',
    refundPolicy: 'Возврат при отмене за 7 дней. Медотвод — полный возврат.',
  },
  {
    id: '20', title: 'Месяц йоги каждый день на закате', organizer: 'Yoga Place',
    category: 'sport',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
    participantsCount: 310, maxParticipants: 500, isJoined: false, badges: [], isRecommended: false,
    achievement: 'Дух заката', reward: 'Коврик Manduka PRO + 3 мес. Yoga Place',
    location: 'Онлайн / Уличные площадки', endDate: '31 августа 2026',
    description: 'Каждый день в течение месяца практикуй йогу на закате. Фото с геометкой.',
    requirements: 'Коврик. Смартфон. Любой уровень йоги.',
    refundPolicy: 'Возврат при отмене за 10 дней.',
  },
  {
    id: '22', title: 'Собрать 10 стикеров в ТЦ Триумф', organizer: 'ТЦ Триумф',
    category: 'quest',
    imageUrl: 'https://images.unsplash.com/photo-1519567281794-66f81156ba2a?auto=format&fit=crop&w=400&q=80',
    participantsCount: 15, maxParticipants: 30, isJoined: false, badges: [], isRecommended: false,
    achievement: 'Охотник за стикерами', reward: 'Сертификат ТЦ Триумф на ₽5 000',
    location: 'ТЦ Триумф, Москва', endDate: '28 июля 2026',
    description: 'Собери 10 скрытых стикеров, спрятанных на территории ТЦ Триумф. Квест для всей семьи.',
    requirements: 'Смартфон. Любой возраст.',
    refundPolicy: 'Бесплатное участие.',
  },
];

export function getChallengeById(id: string): CatalogChallenge | undefined {
  return MOCK_CHALLENGES.find(c => c.id === id);
}

export async function getChallengeFromDb(id: string): Promise<CatalogChallenge | null> {
  try {
    const { prisma } = await import('@/lib/db');
    const challenge = await prisma.challenge.findUnique({
      where: { id, deletedAt: null },
      include: {
        organizer: { select: { name: true } },
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { select: { title: true, description: true, type: true, rewardPoints: true, config: true, order: true }, orderBy: { order: 'asc' } },
        _count: { select: { participations: true } },
      },
    });

    if (!challenge) return null;

    const CATEGORIES: Record<string, string> = {
      sport: 'Спорт', education: 'Обучение', quest: 'Квесты', art: 'Искусство', tech: 'Технологии',
    };

    return {
      id: challenge.id,
      title: challenge.title,
      organizer: challenge.organizer.name,
      category: challenge.category || 'Другое',
      imageUrl: challenge.media[0]?.url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
      participantsCount: challenge._count.participations,
      maxParticipants: 100,
      isJoined: false,
      badges: challenge.status === 'PUBLISHED' ? [] : ['draft'],
      isRecommended: false,
      achievement: challenge.steps[0]?.rewardPoints ? `${challenge.steps[0].rewardPoints} баллов` : 'Участие',
      reward: 'Награда',
      location: 'Онлайн',
      endDate: challenge.endDate ? new Date(challenge.endDate).toLocaleDateString('ru-RU') : 'Бессрочно',
      description: challenge.description || '',
      requirements: '',
      refundPolicy: '',
      isDemo: false,
    };
  } catch {
    return null;
  }
}
