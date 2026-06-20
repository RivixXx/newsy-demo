'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Users, Trophy, Star, Zap } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { Challenge } from '@/modules/challenges/types';

// Используем моки с реальными картинками
const MOCK_CHALLENGES: Challenge[] = [
  // --- Бизнес / Tech / Обучение ---
  {
    id: '1',
    title: 'Бизнес-инкубатор: Собрать MVP за 48 часов',
    organizer: 'Сколково',
    category: 'Tech',
    pointsReward: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    participantsCount: 45,
    isJoined: false,
    badges: ['hot'],
    isRecommended: true,
  },
  {
    id: '2',
    title: 'Привлечь 1000 подписчиков в ТГ без бюджета',
    organizer: 'Marketing Pro',
    category: 'Education',
    pointsReward: 800,
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80',
    participantsCount: 320,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },
  {
    id: '3',
    title: 'Пройти 5 IT-собеседований за неделю',
    organizer: 'HR Academy',
    category: 'Education',
    pointsReward: 500,
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    participantsCount: 150,
    isJoined: false,
    badges: [],
    isRecommended: false,
  },
  {
    id: '4',
    title: 'Написать идеальный бизнес-план кофейни',
    organizer: 'Coffee Like',
    category: 'Tech',
    pointsReward: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
    participantsCount: 85,
    isJoined: false,
    badges: ['cooperative'],
    isRecommended: true,
  },

  // --- Развлечения / Игры / Искусство ---
  {
    id: '5',
    title: 'Марафон "Властелин Колец" (Режиссерская версия)',
    organizer: 'КиноПоиск',
    category: 'Quest',
    pointsReward: 300,
    imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80',
    participantsCount: 1200,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },
  {
    id: '6',
    title: 'Пройти Minecraft без урона',
    organizer: 'PlayStation RU',
    category: 'Tech',
    pointsReward: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=400&q=80',
    participantsCount: 890,
    isJoined: false,
    badges: [],
    isRecommended: false,
  },
  {
    id: '7',
    title: 'Создать арт-объект из мусора',
    organizer: 'Эко-Движение',
    category: 'Art',
    pointsReward: 700,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    participantsCount: 210,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },
  {
    id: '8',
    title: 'Выучить 100 слов на японском за неделю',
    organizer: 'LangMaster',
    category: 'Education',
    pointsReward: 400,
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80',
    participantsCount: 67,
    isJoined: false,
    badges: ['hot'],
    isRecommended: false,
  },

  // --- Контент / Творчество ---
  {
    id: '9',
    title: 'Провести мастер-класс для детей бесплатно',
    organizer: 'Добровольцы России',
    category: 'Quest',
    pointsReward: 900,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
    participantsCount: 78,
    isJoined: false,
    badges: ['cooperative'],
    isRecommended: true,
  },
  {
    id: '10',
    title: 'Запустить свой подкаст — первые 3 эпизода',
    organizer: 'Яндекс.Музыка',
    category: 'Education',
    pointsReward: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80',
    participantsCount: 95,
    isJoined: false,
    badges: ['hot'],
    isRecommended: false,
  },
  {
    id: '11',
    title: 'Сфотографировать 30 закатов за месяц',
    organizer: 'Nikon Russia',
    category: 'Art',
    pointsReward: 650,
    imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=400&q=80',
    participantsCount: 430,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },
  {
    id: '12',
    title: 'Читать по 30 минут каждый день месяц',
    organizer: 'Литрес',
    category: 'Education',
    pointsReward: 350,
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80',
    participantsCount: 512,
    isJoined: false,
    badges: [],
    isRecommended: false,
  },
  {
    id: '13',
    title: 'Готовить новое блюдо каждую неделю',
    organizer: 'Шеф маркет',
    category: 'Quest',
    pointsReward: 450,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80',
    participantsCount: 280,
    isJoined: false,
    badges: ['hot'],
    isRecommended: true,
  },

  // --- Экология / Волонтёрство ---

  {
    id: '14',
    title: 'Убрать мусор в ближайшем парке',
    organizer: 'ЭкоГород',
    category: 'Quest',
    pointsReward: 250,
    imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?auto=format&fit=crop&w=400&q=80',
    participantsCount: 560,
    isJoined: false,
    badges: [],
    isRecommended: false,
  },
  {
    id: '15',
    title: 'Раздать 10 порций еды бездомным',
    organizer: 'Ночлежка',
    category: 'Quest',
    pointsReward: 600,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80', 
    participantsCount: 140,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },
  {
    id: '16',
    title: 'Один день побыть волонтером в приюте',
    organizer: 'Приют "Верный друг"',
    category: 'Quest',
    pointsReward: 400,
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80', 
    participantsCount: 65,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },

  // --- Спорт ---
  {
    id: '17',
    title: 'Утренний забег на 5км с Nike',
    organizer: 'Nike Run Club',
    category: 'Sport',
    pointsReward: 300,
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=400&q=80', 
    participantsCount: 120,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },
  {
    id: '18',
    title: 'Сделать 100 отжиманий за подход',
    organizer: 'Iron Gym',
    category: 'Sport',
    pointsReward: 600,
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80', 
    participantsCount: 42,
    isJoined: false,
    badges: ['hot'],
    isRecommended: false,
  },
  {
    id: '19',
    title: 'Переплыть Волгу (Марафон)',
    organizer: 'Russian Swim',
    category: 'Sport',
    pointsReward: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80', 
    participantsCount: 15,
    isJoined: false,
    badges: ['cooperative'],
    isRecommended: true,
  },
  {
    id: '20',
    title: 'Месяц йоги каждый день на закате',
    organizer: 'Yoga Place',
    category: 'Sport',
    pointsReward: 800,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80', 
    participantsCount: 310,
    isJoined: false,
    badges: [],
    isRecommended: false,
  },
  {
    id: '21',
    title: 'Веломарафон по паркам Москвы',
    organizer: 'City Bikes',
    category: 'Sport',
    pointsReward: 350,
    imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=400&q=80', 
    participantsCount: 200,
    isJoined: false,
    badges: [],
    isRecommended: true,
  },
  {
    id: '22',
    title: 'Собрать 10 стикеров в торговом центре Триумф',
    organizer: 'ТЦ Триумф',
    category: 'Quest',
    pointsReward: 150,
    imageUrl: 'https://images.unsplash.com/photo-1519567281794-66f81156ba2a?auto=format&fit=crop&w=400&q=80',
    participantsCount: 15,
    isJoined: false,
    badges: [],
    isRecommended: false,
  }
];

// Карточка в стиле Figma с Glassmorphism
const FigmaCard = ({ challenge }: { challenge: Challenge }) => {
  return (
    <Link href={`/challenges/${challenge.id}`} className="figma-card-link">
      <div className="figma-card">
        <div className="image-box">
          <img src={challenge.imageUrl} alt={challenge.title} className="card-bg-img" />
          <span className="badge-new">Новое задание</span>
          <button className="heart-btn" onClick={(e) => { e.preventDefault(); /* prevent link navigation */ }}>
            <Heart size={20} color="#000" />
          </button>
        </div>
        <div className="card-info">
          <h3 className="card-title" title={challenge.title}>{challenge.title}</h3>
          <div className="tags-list">
            <span className="tag">Участников: {challenge.participantsCount}/10</span>
            <span className="tag">🎁 Награда: {challenge.pointsReward} баллов</span>
          </div>
          <div className="card-footer">
            <div className="author-info">
              <div className="author-avatar" />
              <span>{challenge.organizer}</span>
            </div>
            <span className="date-info">До 25 июля 2026</span>
          </div>
        </div>

        <style jsx>{`
          .figma-card-link {
            text-decoration: none;
            color: inherit;
            display: block;
            flex-shrink: 0;
            user-select: none;
            -webkit-user-drag: none;
          }

          .figma-card {
            width: 320px;
            display: flex;
            flex-direction: column;
            /* Glassmorphism Effect */
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
            transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            height: 100%;
          }

          .figma-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 40px rgba(31, 38, 135, 0.12);
            background: rgba(255, 255, 255, 0.8);
          }

          .image-box {
            height: 190px;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid rgba(255, 255, 255, 0.5);
          }

          .card-bg-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
          }

          .figma-card:hover .card-bg-img {
            transform: scale(1.05);
          }

          .badge-new {
            position: absolute;
            top: 16px;
            left: 16px;
            z-index: 1;
            color: #222;
            background: rgba(255,255,255,0.95);
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            backdrop-filter: blur(4px);
          }

          .heart-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255,255,255,0.95);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            cursor: pointer;
            z-index: 1;
            transition: transform 0.1s;
          }

          .heart-btn:hover {
            transform: scale(1.1);
          }

          .card-info {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px;
            flex-grow: 1;
          }

          .card-title {
            font-size: 18px;
            font-weight: 800;
            color: #222;
            margin: 0;
            line-height: 1.3;
            /* Обрезка слишком длинного текста */
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .tags-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .tag {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(0,0,0,0.05);
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 13px;
            color: #444;
            font-weight: 600;
          }

          .card-footer {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: auto; /* Прижимает футер к низу карточки */
            padding-top: 16px;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
          }

          .author-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: #444;
            font-weight: 600;
          }

          .author-avatar {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #ff385c, #ff8c00);
            border-radius: 50%;
          }

          .date-info {
            font-size: 12px;
            color: #777;
            font-weight: 500;
          }
        `}</style>
      </div>
    </Link>
  );
};

// Компонент-обертка для карусели
const CarouselSection = ({ title, challenges }: { title: string, challenges: Challenge[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Автоскролл
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isDragging && !isHovered) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          const { current } = scrollRef;
          const scrollAmount = 344; // Ширина карточки + gap (320 + 24)
          // Если дошли до конца, возвращаемся в начало
          if (current.scrollLeft + current.clientWidth >= current.scrollWidth - 10) {
            current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        }
      }, 3500); // Скролл каждые 3.5 секунды
    }
    return () => clearInterval(interval);
  }, [isDragging, isHovered]);

  // Mouse drag-to-scroll logic
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 344; // Ширина карточки + отступ
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="figma-section">
      <h2 className="section-title">{title}</h2>
      <div className="carousel-wrapper" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <button className="carousel-btn prev" onClick={() => scroll('left')}>
          <ChevronLeft size={20} color="#222" />
        </button>
        <div 
          className={`carousel ${isDragging ? 'dragging' : ''}`} 
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {challenges.map((c, i) => <FigmaCard key={`${c.id}-${i}`} challenge={c} />)}
        </div>
        <button className="carousel-btn next" onClick={() => scroll('right')}>
          <ChevronRight size={20} color="#222" />
        </button>
      </div>

      <style jsx>{`
        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #222;
          margin-bottom: 24px;
        }

        .carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .carousel {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding-bottom: 32px; /* Увеличен отступ снизу для тени от карточек */
          scrollbar-width: none; /* Firefox */
          scroll-snap-type: x mandatory;
          cursor: grab;
        }
        
        .carousel.dragging {
          cursor: grabbing;
          scroll-snap-type: none; /* Отключаем привязку во время драга */
        }

        .carousel::-webkit-scrollbar {
          display: none; /* Chrome */
        }

        .carousel > :global(div) {
          scroll-snap-align: start;
        }

        .carousel-btn {
          position: absolute;
          width: 40px;
          height: 40px;
          background: white;
          border: 1px solid #ebebeb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: transform 0.2s;
        }

        .carousel-btn:hover { transform: scale(1.05); }

        .carousel-btn.prev { left: -20px; }
        .carousel-btn.next { right: -20px; }
      `}</style>
    </section>
  );
};

export default function PublicHomePage() {
  return (
    <PageShell variant="public">
      <main className="hybrid-layout">
        
        {/* Восстановленная Hero-секция */}
        <section className="hero">
          <div className="hero-content">
            <div className="badge-new">НОВИНКА: КООПЕРАТИВНЫЕ КВЕСТЫ</div>
            <h1>Преврати свою жизнь в <span className="gradient-text">увлекательное приключение</span></h1>
            <p>NEWSY — это первая в России платформа челенджей, где ты растешь над собой, соревнуешься с друзьями и получаешь реальные награды от любимых брендов.</p>
            <div className="hero-actions">
              <Link href="/search" className="btn-primary">Начать приключение</Link>
              <Link href="/dashboard" className="btn-secondary">Как это работает?</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><Users size={16} /> <span>50к+ участников</span></div>
              <div className="stat"><Trophy size={16} /> <span>1.2к призов</span></div>
              <div className="stat"><Star size={16} /> <span>4.9 рейтинг</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card c1">
              <Zap size={24} className="icon" />
              <span>+500 баллов</span>
            </div>
            <div className="floating-card c2">
              <Users size={24} className="icon" />
              <span>Команда собрана!</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80" 
              alt="Спорт и активность" 
              className="hero-img"
            />
          </div>
        </section>

        {/* Восстановленные Баннеры */}
        <section className="ad-banner">
          <div className="ad-content">
            <div className="ad-label">Рекламная акция</div>
            <h3>Выиграй поездку на Алтай с <span className="brand-name">Yandex Travel</span></h3>
            <p>Выполни 5 этапов челенджа "Путь Исследователя" до конца месяца.</p>
            <button className="btn-white">Участвовать</button>
          </div>
          <div className="ad-image">
            <img src="https://images.unsplash.com/photo-1541004995602-b3e89b7877f3?auto=format&fit=crop&w=400&q=80" alt="Алтай" />
          </div>
        </section>

        {/* Карусели из Figma */}
        <CarouselSection 
          title="Рекомендовано платформой" 
          challenges={MOCK_CHALLENGES.filter(c => c.isRecommended)} 
        />
        
        <CarouselSection 
          title="Рядом с тобой" 
          challenges={MOCK_CHALLENGES.filter(c => !c.isRecommended)} 
        />

      </main>

      <style jsx>{`
        .hybrid-layout {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 64px;
        }

        /* Hero Styles (Restored) */
        .hero {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
          padding: 20px 0;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .badge-new {
          background: #fff0f3;
          color: #ff385c;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 800;
          width: fit-content;
        }

        .hero-content h1 {
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1.1;
          margin: 0;
          font-weight: 900;
          letter-spacing: -2px;
          color: #222;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ff385c, #ff8c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-content p {
          font-size: 20px;
          line-height: 1.6;
          color: #666;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .btn-primary {
          background: #FF385C;
          color: white;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 800;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .btn-secondary {
          background: #f7f7f7;
          color: #222;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 700;
          text-decoration: none;
        }

        .btn-primary:hover { transform: translateY(-2px); }

        .hero-stats {
          display: flex;
          gap: 24px;
          margin-top: 20px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #666;
        }

        .hero-visual {
          position: relative;
        }

        .hero-img {
          width: 100%;
          border-radius: 40px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.1);
        }

        .floating-card {
          position: absolute;
          background: white;
          padding: 16px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          z-index: 10;
        }

        .c1 { top: 10%; left: -20px; color: #ff385c; }
        .c2 { bottom: 10%; right: -20px; color: #00c853; }

        /* Ad Banner (Restored) */
        .ad-banner {
          background: linear-gradient(135deg, #111, #333);
          border-radius: 32px;
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          color: white;
          overflow: hidden;
        }

        .ad-label {
          background: rgba(255,255,255,0.1);
          padding: 4px 8px;
          font-size: 10px;
          text-transform: uppercase;
          width: fit-content;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .brand-name { color: #ff385c; }

        .btn-white {
          background: white;
          color: black;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 20px;
        }

        .ad-image img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 20px;
        }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding: 40px 0; }
          .hero-visual { order: -1; }
          .ad-banner { grid-template-columns: 1fr; }
        }
      `}</style>
    </PageShell>
  );
}
