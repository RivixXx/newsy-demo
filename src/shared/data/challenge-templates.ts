export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  format: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  steps: {
    type: string;
    title: string;
    description: string;
  }[];
  achievement: string;
  reward: string;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'sport-marathon',
    name: '🏃 Спортивный марафон',
    description: '30-дневный марафон с ежедневными заданиями по бегу и ЗОЖ.',
    category: 'Sport',
    format: 'ONLINE',
    steps: [
      { type: 'Action', title: 'Разминка', description: '10 минут утренней зарядки' },
      { type: 'Photo', title: 'Фото-отчёт', description: 'Загрузите фото тренировки' },
      { type: 'Action', title: 'Пробежка', description: 'Пробегите минимум 3 км' },
      { type: 'Question', title: 'Тест', description: 'Ответьте на вопрос о ЗОЖ' },
    ],
    achievement: 'Спортивный герой',
    reward: 'Сертификат на спортивный инвентарь',
  },
  {
    id: 'education-intensive',
    name: '📚 Образовательный интенсив',
    description: 'Изучите новый навык за 2 недели с проверкой знаний.',
    category: 'Education',
    format: 'ONLINE',
    steps: [
      { type: 'Action', title: 'Введение', description: 'Изучите вводный материал' },
      { type: 'Question', title: 'Тест 1', description: 'Проверьте знания по первому модулю' },
      { type: 'Action', title: 'Практика', description: 'Выполните практическое задание' },
      { type: 'Photo', title: 'Результат', description: 'Сфотографируйте результат' },
    ],
    achievement: 'Знаток',
    reward: 'Сертификат о прохождении курса',
  },
  {
    id: 'creative-contest',
    name: '🎨 Творческий конкурс',
    description: 'Покажите свои таланты и выиграйте призы от спонсоров.',
    category: 'Art',
    format: 'OFFLINE',
    steps: [
      { type: 'Action', title: 'Регистрация', description: 'Заполните анкету участника' },
      { type: 'Photo', title: 'Работа', description: 'Загрузите фото вашей работы' },
      { type: 'Action', title: 'Описание', description: 'Расскажите о вашей работе' },
    ],
    achievement: 'Талант',
    reward: 'Приз от спонсора',
  },
  {
    id: 'eco-action',
    name: '🌍 Экологическая акция',
    description: 'Участвуйте в благотворительных акциях и получайте достижения.',
    category: 'Quest',
    format: 'OFFLINE',
    steps: [
      { type: 'Action', title: 'Сбор', description: 'Соберите мусор в ближайшем парке' },
      { type: 'Photo', title: 'Фото до', description: 'Сфотографируйте место до уборки' },
      { type: 'Photo', title: 'Фото после', description: 'Сфотографируйте место после уборки' },
      { type: 'Location', title: 'Геолокация', description: 'Подтвердите местоположение' },
    ],
    achievement: 'Защитник природы',
    reward: 'Благодарственное письмо',
  },
  {
    id: 'hr-onboarding',
    name: '💼 HR-онбординг',
    description: 'Помогите новым сотрудникам адаптироваться в компании.',
    category: 'Education',
    format: 'HYBRID',
    steps: [
      { type: 'Action', title: 'Знакомство', description: 'Заполните анкету нового сотрудника' },
      { type: 'Question', title: 'Тест', description: 'Проверьте знания о компании' },
      { type: 'Photo', title: 'Фото', description: 'Сфотографируйтесь с коллегой' },
      { type: 'Action', title: 'Задание', description: 'Выполните первое рабочее задание' },
    ],
    achievement: 'Новый сотрудник',
    reward: 'Приветственный набор',
  },
];
