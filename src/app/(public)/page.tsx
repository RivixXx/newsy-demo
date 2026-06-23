'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { AnnouncementPopup } from '@/shared/components/announcement-popup';
import { ChallengeModal, ModalChallenge } from '@/shared/components/challenge-modal';

// ─── Расширенный тип карточки ─────────────────────────────────────────────
interface CatalogChallenge {
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
}

const MOCK_CHALLENGES: CatalogChallenge[] = [
  {
    id: '1', title: 'Бизнес-инкубатор: Собрать MVP за 48 часов', organizer: 'Сколково',
    category: 'Технологии',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    participantsCount: 45, maxParticipants: 60, isJoined: false, badges: ['hot'], isRecommended: true,
    achievement: 'Стартап-пионер', reward: 'Бесплатный офис в Сколково на 1 мес.',
    location: 'Москва', endDate: '25 июля 2026',
    description: 'Создай рабочий прототип продукта за 48 часов в команде. Менторы Сколково помогут на всех этапах.',
    requirements: 'Участники от 18 лет. Команда 2-5 человек. Наличие ноутбука.',
    refundPolicy: 'Возврат взноса при отмене за 72 часа до старта. После — средства не возвращаются.',
  },
  {
    id: '2', title: 'Привлечь 1000 подписчиков в ТГ без бюджета', organizer: 'Marketing Pro',
    category: 'Обучение',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80',
    participantsCount: 320, maxParticipants: 500, isJoined: false, badges: [], isRecommended: true,
    achievement: 'Мастер роста', reward: 'Курс по SMM (₽15 000)',
    location: 'Онлайн', endDate: '10 августа 2026',
    description: 'За 30 дней вырасти с нуля до 1000 подписчиков используя только органику.',
    requirements: 'Собственный Telegram-канал. Базовые знания контент-маркетинга.',
    refundPolicy: 'Возврат возможен в течение первых 3 дней после регистрации.',
  },
  {
    id: '3', title: 'Пройти 5 IT-собеседований за неделю', organizer: 'HR Academy',
    category: 'Обучение',
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
    category: 'Технологии',
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
    category: 'Квесты',
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
    category: 'Квесты',
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
    category: 'Искусство',
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
    category: 'Обучение',
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
    category: 'Квесты',
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
    category: 'Обучение',
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
    category: 'Искусство',
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
    category: 'Обучение',
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
    category: 'Квесты',
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
    category: 'Квесты',
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
    category: 'Спорт',
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
    category: 'Спорт',
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
    category: 'Спорт',
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
    category: 'Спорт',
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
    category: 'Квесты',
    imageUrl: 'https://images.unsplash.com/photo-1519567281794-66f81156ba2a?auto=format&fit=crop&w=400&q=80',
    participantsCount: 15, maxParticipants: 30, isJoined: false, badges: [], isRecommended: false,
    achievement: 'Охотник за стикерами', reward: 'Сертификат ТЦ Триумф на ₽5 000',
    location: 'ТЦ Триумф, Москва', endDate: '28 июля 2026',
    description: 'Собери 10 скрытых стикеров, спрятанных на территории ТЦ Триумф. Квест для всей семьи.',
    requirements: 'Смартфон. Любой возраст.',
    refundPolicy: 'Бесплатное участие.',
  },
];

const CATEGORIES = ['Все подряд', 'Спорт', 'Обучение', 'Квесты', 'Искусство', 'Технологии'];
const CATEGORY_ICONS: Record<string, string> = {
  'Все подряд': '⚡',
  'Спорт': '🏅',
  'Обучение': '📚',
  'Квесты': '🗺️',
  'Искусство': '🎨',
  'Технологии': '💡',
};

function toModalChallenge(c: CatalogChallenge): ModalChallenge {
  return {
    id: c.id,
    title: c.title,
    organizer: c.organizer,
    category: c.category,
    imageUrl: c.imageUrl,
    participantsCount: c.participantsCount,
    maxParticipants: c.maxParticipants,
    endDate: c.endDate,
    location: c.location,
    achievement: c.achievement,
    reward: c.reward,
    description: c.description,
    requirements: c.requirements,
    refundPolicy: c.refundPolicy,
    stages: [
      { id: 's1', title: 'Регистрация', description: 'Подтвердите участие и ознакомьтесь с правилами.', type: 'ДЕЙСТВИЕ', status: 'pending' },
      { id: 's2', title: 'Выполнение задания', description: 'Выполните основное задание челенджа и загрузите подтверждение.', type: 'ФОТО', status: 'pending' },
      { id: 's3', title: 'Геолокация', description: 'Подтвердите своё местоположение на точке проведения.', type: 'ГЕО', status: 'pending' },
      { id: 's4', title: 'Финальный отчёт', description: 'Загрузите итоговый файл с результатами.', type: 'ФАЙЛ', status: 'pending' },
    ],
  };
}

// ─── Карточка ─────────────────────────────────────────────────────────────
function CatalogCard({ challenge, onOpen }: { challenge: CatalogChallenge; onOpen: (c: CatalogChallenge) => void }) {
  const [liked, setLiked] = useState(false);
  const availableSlots = challenge.maxParticipants - challenge.participantsCount;

  return (
    <div className="catalog-card" onClick={() => onOpen(challenge)}>
      <div className="card-image-box">
        <img src={challenge.imageUrl} alt={challenge.title} className="card-bg-img" />
        <span className="card-category-pill">{CATEGORY_ICONS[challenge.category] ?? '✦'} {challenge.category}</span>
        <button
          className={`card-heart ${liked ? 'liked' : ''}`}
          onClick={e => { e.stopPropagation(); setLiked(v => !v); }}
        >
          <Heart size={17} fill={liked ? '#FF385C' : 'none'} color={liked ? '#FF385C' : '#111'} />
        </button>
      </div>
      <div className="card-body">
        <h3 className="card-title">{challenge.title}</h3>
        <p className="card-organizer">{challenge.organizer}</p>
        <div className="card-tags">
          <span className="card-tag achievement" title="Достижение за выполнение">🏆 {challenge.achievement}</span>
          <span className="card-tag reward" title="Награда за выполнение">🎁 {challenge.reward}</span>
        </div>
        <div className="card-footer">
          <span className="card-slots">
            <span className={availableSlots <= 5 ? 'few' : ''}>{availableSlots}</span> мест из {challenge.maxParticipants}
          </span>
          <span className="card-date">до {challenge.endDate}</span>
        </div>
      </div>

      <style jsx>{`
        .catalog-card {
          width: 300px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.85);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(31,38,135,0.07);
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
          user-select: none;
          -webkit-user-drag: none;
        }
        .catalog-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(31,38,135,0.14);
        }
        .card-image-box {
          height: 180px;
          position: relative;
          overflow: hidden;
        }
        .card-bg-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .catalog-card:hover .card-bg-img { transform: scale(1.06); }
        .card-category-pill {
          position: absolute; bottom: 12px; left: 12px;
          background: rgba(255,255,255,0.92);
          padding: 4px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 700;
          backdrop-filter: blur(4px);
        }
        .card-heart {
          position: absolute; top: 12px; right: 12px;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.92);
          border: none; display: grid; place-items: center;
          cursor: pointer; z-index: 1;
          transition: transform 0.15s;
        }
        .card-heart:hover { transform: scale(1.15); }
        .card-body {
          padding: 16px; display: flex;
          flex-direction: column; gap: 10px;
        }
        .card-title {
          font-size: 15px; font-weight: 800;
          color: #111; margin: 0; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .card-organizer {
          font-size: 12px; color: #888; font-weight: 600; margin: 0;
        }
        .card-tags { display: flex; flex-direction: column; gap: 6px; }
        .card-tag {
          padding: 5px 10px; border-radius: 8px;
          font-size: 12px; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .card-tag.achievement { background: #fef3c7; color: #92400e; }
        .card-tag.reward { background: #dcfce7; color: #166534; }
        .card-footer {
          display: flex; justify-content: space-between;
          align-items: center; padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.06);
          font-size: 12px; color: #888;
        }
        .card-slots { font-weight: 700; }
        .card-slots .few { color: #ef4444; }
        .card-date { font-weight: 600; }
      `}</style>
    </div>
  );
}

// ─── Карусель с направлением ───────────────────────────────────────────────
function CarouselSection({
  title,
  challenges,
  onOpen,
  direction = 'right',
}: {
  title: string;
  challenges: CatalogChallenge[];
  onOpen: (c: CatalogChallenge) => void;
  direction?: 'left' | 'right';
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Медленный автоскролл с чередованием направления
  React.useEffect(() => {
    if (isDragging || isHovered) return;
    const STEP = 1; // пикселей за тик
    const INTERVAL = 30; // мс — очень плавно
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (direction === 'right') {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += STEP;
        }
      } else {
        if (el.scrollLeft <= 1) {
          el.scrollLeft = el.scrollWidth - el.clientWidth;
        } else {
          el.scrollLeft -= STEP;
        }
      }
    }, INTERVAL);
    return () => clearInterval(id);
  }, [isDragging, isHovered, direction]);

  const scrollBy = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 324 : -324, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft ?? 0));
    setScrollLeft(scrollRef.current?.scrollLeft ?? 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = scrollLeft - (e.pageX - (scrollRef.current.offsetLeft) - startX) * 2;
  };

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">{title}</h2>
      <div
        className="carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsDragging(false); }}
      >
        <button className="carousel-btn prev" onClick={() => scrollBy('left')}>
          <ChevronLeft size={20} color="#222" />
        </button>
        <div
          className={`carousel-track ${isDragging ? 'dragging' : ''}`}
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={onMouseMove}
        >
          {challenges.map((c, i) => (
            <CatalogCard key={`${c.id}-${i}`} challenge={c} onOpen={onOpen} />
          ))}
        </div>
        <button className="carousel-btn next" onClick={() => scrollBy('right')}>
          <ChevronRight size={20} color="#222" />
        </button>
      </div>

      <style jsx>{`
        .carousel-section { display: flex; flex-direction: column; gap: 20px; }
        .carousel-title { font-size: 22px; font-weight: 800; color: #111; margin: 0; }
        .carousel-wrapper { position: relative; display: flex; align-items: center; }
        .carousel-track {
          display: flex; gap: 20px;
          overflow-x: auto; overflow-y: visible;
          padding: 8px 4px 32px;
          scrollbar-width: none;
          cursor: grab;
        }
        .carousel-track.dragging { cursor: grabbing; }
        .carousel-track::-webkit-scrollbar { display: none; }
        .carousel-btn {
          position: absolute;
          width: 38px; height: 38px;
          background: white; border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-radius: 50%; display: grid; place-items: center;
          cursor: pointer; z-index: 10;
          transition: transform 0.2s, box-shadow 0.2s;
          flex-shrink: 0;
        }
        .carousel-btn:hover { transform: scale(1.08); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
        .carousel-btn.prev { left: -18px; }
        .carousel-btn.next { right: -18px; }
      `}</style>
    </section>
  );
}

// ─── Главный компонент ─────────────────────────────────────────────────────
export default function PublicHomePage() {
  const [activeCategory, setActiveCategory] = useState('Все подряд');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<CatalogChallenge | null>(null);
  const [location, setLocation] = useState('Определяем...');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    dateFrom: '',
    dateTo: '',
    onlyOnline: false,
    onlyFree: false,
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Неизвестно';
            setLocation(city);
          } catch {
            setLocation('Москва');
          }
        },
        () => {
          setLocation('Москва');
        },
        { timeout: 5000 }
      );
    } else {
      setLocation('Москва');
    }
  }, []);

  const filtered = MOCK_CHALLENGES.filter(c => {
    const matchCat = activeCategory === 'Все подряд' || c.category === activeCategory;
    const matchSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Сгруппировать по секциям для "Все подряд"
  const sections: { title: string; challenges: CatalogChallenge[]; direction: 'left' | 'right' }[] = [];

  if (activeCategory === 'Все подряд' && !searchQuery) {
    const recommended = MOCK_CHALLENGES.filter(c => c.isRecommended);
    const sport = MOCK_CHALLENGES.filter(c => c.category === 'Спорт');
    const quests = MOCK_CHALLENGES.filter(c => c.category === 'Квесты');
    const education = MOCK_CHALLENGES.filter(c => c.category === 'Обучение');
    const art = MOCK_CHALLENGES.filter(c => c.category === 'Искусство');
    const tech = MOCK_CHALLENGES.filter(c => c.category === 'Технологии');

    if (recommended.length) sections.push({ title: '⭐ Рекомендовано', challenges: recommended, direction: 'right' });
    if (sport.length) sections.push({ title: '🏅 Спорт', challenges: sport, direction: 'left' });
    if (quests.length) sections.push({ title: '🗺️ Квесты', challenges: quests, direction: 'right' });
    if (education.length) sections.push({ title: '📚 Обучение', challenges: education, direction: 'left' });
    if (art.length) sections.push({ title: '🎨 Искусство', challenges: art, direction: 'right' });
    if (tech.length) sections.push({ title: '💡 Технологии', challenges: tech, direction: 'left' });
  }

  return (
    <PageShell variant="public">
      {/* Попап-баннер */}
      <AnnouncementPopup />

      {/* Модальное окно ЧЕ */}
      {selectedChallenge && (
        <ChallengeModal
          challenge={toModalChallenge(selectedChallenge)}
          onClose={() => setSelectedChallenge(null)}
        />
      )}

      <main className="catalog-main">

        {/* Заголовок + переключатель */}
        <div className="page-header">
          <div className="header-top">
            <h1 className="page-title">
              Каталог <span className="title-accent">Активностей</span> ⚡
            </h1>
          </div>

          {/* Единая зона поиска и фильтров */}
          <div className="search-zone">
            <div className="search-box">
              <Search size={18} color="#aaa" />
              <input
                type="text"
                placeholder="Название, бренд или тема..."
                className="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
            <div className="search-right">
              <div className="location-hint">
                <MapPin size={15} color="#888" />
                <span>{location}</span>
              </div>
              <button className="filter-btn" onClick={() => setShowFilterPanel(!showFilterPanel)}>
                <SlidersHorizontal size={15} />
                Фильтры
              </button>
            </div>
          </div>

          {/* Категории */}
          <div className="categories-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>

          {/* Панель фильтров */}
          {showFilterPanel && (
            <div className="filter-panel">
              <div className="filter-row">
                <label className="filter-label">Цена</label>
                <div className="filter-range">
                  <input
                    type="number"
                    placeholder="От"
                    className="filter-input"
                    value={filters.priceRange[0] || ''}
                    onChange={e => setFilters(f => ({ ...f, priceRange: [Number(e.target.value) || 0, f.priceRange[1]] }))}
                  />
                  <span className="filter-dash">—</span>
                  <input
                    type="number"
                    placeholder="До"
                    className="filter-input"
                    value={filters.priceRange[1] || ''}
                    onChange={e => setFilters(f => ({ ...f, priceRange: [f.priceRange[0], Number(e.target.value) || 100000] }))}
                  />
                </div>
              </div>
              <div className="filter-row">
                <label className="filter-label">Дата проведения</label>
                <div className="filter-range">
                  <input
                    type="date"
                    className="filter-input"
                    value={filters.dateFrom}
                    onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  />
                  <span className="filter-dash">—</span>
                  <input
                    type="date"
                    className="filter-input"
                    value={filters.dateTo}
                    onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  />
                </div>
              </div>
              <div className="filter-row">
                <label className="filter-check">
                  <input
                    type="checkbox"
                    checked={filters.onlyOnline}
                    onChange={e => setFilters(f => ({ ...f, onlyOnline: e.target.checked }))}
                  />
                  Только онлайн
                </label>
                <label className="filter-check">
                  <input
                    type="checkbox"
                    checked={filters.onlyFree}
                    onChange={e => setFilters(f => ({ ...f, onlyFree: e.target.checked }))}
                  />
                  Только бесплатные
                </label>
              </div>
              <div className="filter-actions">
                <button className="filter-reset" onClick={() => setFilters({ priceRange: [0, 100000], dateFrom: '', dateTo: '', onlyOnline: false, onlyFree: false })}>
                  Сбросить
                </button>
                <button className="filter-apply" onClick={() => setShowFilterPanel(false)}>
                  Применить
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="catalog-content">
          {activeCategory === 'Все подряд' && !searchQuery ? (
            // Несколько секций с чередованием направления
            <div className="sections-list">
              {sections.map((sec, idx) => (
                <CarouselSection
                  key={sec.title}
                  title={sec.title}
                  challenges={sec.challenges}
                  onOpen={c => setSelectedChallenge(c)}
                  direction={idx % 2 === 0 ? 'right' : 'left'}
                />
              ))}
            </div>
          ) : (
            // Сетка по категории / поиск
            <>
              <p className="results-count">
                {filtered.length > 0
                  ? `Найдено: ${filtered.length} ${filtered.length === 1 ? 'челендж' : 'челенджей'}`
                  : 'Ничего не найдено'}
              </p>
              <div className="grid-layout">
                {filtered.map(c => (
                  <CatalogCard key={c.id} challenge={c} onOpen={ch => setSelectedChallenge(ch)} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .catalog-main {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px 40px 80px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* Header */
        .page-header {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          margin: 0;
          color: #111;
          letter-spacing: -1px;
        }

        .title-accent {
          color: #FF385C;
        }

        /* Search Zone */
        .search-zone {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 240px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 16px;
          padding: 12px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-box:focus-within {
          border-color: #FF385C;
          box-shadow: 0 0 0 3px rgba(255,56,92,0.1);
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          color: #111;
          background: transparent;
        }

        .search-input::placeholder { color: #aaa; }

        .search-clear {
          border: none;
          background: none;
          color: #aaa;
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
        }

        .search-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .location-hint {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #666;
          font-weight: 600;
          white-space: nowrap;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          background: white;
          font-size: 14px;
          font-weight: 700;
          color: #333;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }

        .filter-btn:hover {
          border-color: #FF385C;
          background: #fff5f7;
        }

        /* Categories */
        .categories-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }

        .categories-scroll::-webkit-scrollbar { display: none; }

        .cat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 99px;
          border: 1.5px solid #e5e7eb;
          background: white;
          font-size: 14px;
          font-weight: 700;
          color: #444;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .cat-pill:hover { border-color: #FF385C; color: #FF385C; }

        .cat-pill.active {
          background: #111;
          border-color: #111;
          color: white;
        }

        /* Filter Panel */
        .filter-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 700;
          color: #333;
          min-width: 120px;
        }

        .filter-range {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-input {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          outline: none;
          width: 140px;
          transition: border-color 0.2s;
        }

        .filter-input:focus {
          border-color: #FF385C;
        }

        .filter-dash {
          color: #aaa;
          font-weight: 600;
        }

        .filter-check {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
        }

        .filter-check input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #FF385C;
        }

        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 8px;
          border-top: 1px solid #f0f0f0;
        }

        .filter-reset {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: white;
          font-size: 14px;
          font-weight: 700;
          color: #666;
          cursor: pointer;
          transition: background 0.15s;
        }

        .filter-reset:hover {
          background: #f5f5f5;
        }

        .filter-apply {
          padding: 10px 24px;
          border-radius: 10px;
          border: none;
          background: #FF385C;
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: background 0.15s;
        }

        .filter-apply:hover {
          background: #E31C5F;
        }

        /* Content */
        .catalog-content {}

        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .results-count {
          font-size: 14px;
          color: #888;
          font-weight: 600;
          margin: 0 0 20px 0;
        }

        .grid-layout {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .catalog-main { padding: 20px 16px 60px; }
          .header-top { flex-direction: column; align-items: flex-start; }
          .page-tabs { align-self: stretch; }
          .search-zone { flex-direction: column; align-items: stretch; }
          .search-right { justify-content: space-between; }
        }
      `}</style>
    </PageShell>
  );
}
