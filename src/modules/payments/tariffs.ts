export interface PublishTariff {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

export const PUBLISH_TARIFFS: PublishTariff[] = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 0,
    features: [
      'Публикация в каталоге',
      'До 50 участников',
      'Базовая аналитика',
    ],
  },
  {
    id: 'pro',
    name: 'Профи',
    price: 2990,
    features: [
      'Выделение в каталоге',
      'До 500 участников',
      'Расширенная аналитика',
      'Приоритет в выдаче',
      'Бейдж партнёра',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 9900,
    features: [
      'Топ позиция в каталоге',
      'Безлимит участников',
      'Полная аналитика',
      'Брендирование страницы',
      'Продвижение в соцсетях',
      'Персональный менеджер',
    ],
  },
];
