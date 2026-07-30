'use client';

import React, { useRef, useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, MapPin } from 'lucide-react';
import { IconRun, IconSchool, IconRoute, IconPalette, IconCpu, IconBolt } from '@tabler/icons-react';
import { PageShell } from '@/shared/components/page-shell';
import { PageSpinner } from '@/shared/components/spinner';
import { AnnouncementPopup } from '@/shared/components/announcement-popup';
import { CountdownTimer } from '@/shared/components/countdown-timer';
import { useRegion } from '@/shared/components/region-provider';
import { type ModalChallenge } from '@/shared/components/challenge-modal';
import { type CatalogChallenge } from '@/shared/data/challenges';
import { useChallenges } from '@/shared/hooks/use-challenges';
import { useFavorites } from '@/shared/hooks/use-favorites';
import { MapTooltip } from '@/shared/components/map-tooltip';

const ChallengeModal = lazy(() => import('@/shared/components/challenge-modal').then(m => ({ default: m.ChallengeModal })));

const CATEGORY_LABELS: Record<string, string> = {
  sport: 'Спорт',
  education: 'Обучение',
  quest: 'Квесты',
  art: 'Искусство',
  tech: 'Технологии',
};
const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);
const CATEGORIES_ALL = ['Все подряд', ...CATEGORY_KEYS];
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Все подряд': <IconBolt size={16} aria-hidden="true" />,
  sport: <IconRun size={16} aria-hidden="true" />,
  education: <IconSchool size={16} aria-hidden="true" />,
  quest: <IconRoute size={16} aria-hidden="true" />,
  art: <IconPalette size={16} aria-hidden="true" />,
  tech: <IconCpu size={16} aria-hidden="true" />,
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
    startDate: c.startDate,
    location: c.location,
    latitude: c.latitude,
    longitude: c.longitude,
    achievement: c.achievement,
    reward: c.reward,
    description: c.description,
    requirements: c.requirements,
    refundPolicy: c.refundPolicy,
    isJoined: false,
    stages: [],
  };
}

// ─── Карточка ─────────────────────────────────────────────────────────────
function CatalogCard({ challenge, onOpen, isFav, onToggleFav }: {
  challenge: CatalogChallenge;
  onOpen: (c: CatalogChallenge) => void;
  isFav: boolean;
  onToggleFav: (id: string) => void;
}) {
  const [animating, setAnimating] = useState(false);
  const availableSlots = challenge.maxParticipants - challenge.participantsCount;
  const isNew = challenge.badges?.includes('new');

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    onToggleFav(challenge.id);
    setTimeout(() => setAnimating(false), 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(challenge);
    }
  };

  return (
    <div
      className="catalog-card"
      onClick={() => onOpen(challenge)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Открыть челлендж: ${challenge.title}`}
    >
      <div className="card-image-box">
        <img src={challenge.imageUrl} alt={challenge.title} className="card-bg-img" loading="lazy" />
        <span className="card-category-pill">{CATEGORY_ICONS[challenge.category] ?? '✦'} {CATEGORY_LABELS[challenge.category] || challenge.category}</span>
        {isNew && (
          <span className="card-new-badge">Новый</span>
        )}
        <button
          className={`card-heart ${isFav ? 'liked' : ''} ${animating ? 'animating' : ''}`}
          onClick={handleFavClick}
          aria-label={isFav ? `Убрать из избранного: ${challenge.title}` : `Добавить в избранное: ${challenge.title}`}
          aria-pressed={isFav}
        >
          <Heart size={17} fill={isFav ? '#FF385C' : 'none'} color={isFav ? '#FF385C' : '#111'} aria-hidden="true" />
          {animating && <span className="heart-particles" aria-hidden="true">{'✨'.repeat(5)}</span>}
        </button>
      </div>
      <div className="card-body">
        <div className="card-top">
          <h3 className="card-title">{challenge.title}</h3>
          <p className="card-organizer">{challenge.organizer}</p>
        </div>
        <div className="card-bottom">
          <div className="card-tags">
            <span className="card-tag achievement" title="Достижение за выполнение">🏆 {challenge.achievement}</span>
            <span className="card-tag reward" title="Награда за выполнение">🎁 {challenge.reward}</span>
          </div>
          <div className="card-location">
            <MapTooltip
              address={challenge.location}
              latitude={challenge.latitude}
              longitude={challenge.longitude}
            />
          </div>
          <div className="card-footer">
            {/* Compact countdown before start */}
            {challenge.startDate && new Date(challenge.startDate) > new Date() && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <CountdownTimer targetDate={challenge.startDate} compact />
              </div>
            )}
            <span className="card-slots">
              <span className={availableSlots <= 5 ? 'few' : ''}>{availableSlots}</span> мест из {challenge.maxParticipants}
            </span>
            <span className="card-date">до {challenge.endDate}</span>
          </div>
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
          outline: none;
        }
        .catalog-card:hover, .catalog-card:focus-visible {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(31,38,135,0.14);
        }
        .catalog-card:focus-visible {
          outline: 3px solid #FF385C;
          outline-offset: 2px;
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
        .card-new-badge {
          position: absolute; top: 12px; left: 12px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white; padding: 4px 10px; border-radius: 99px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .card-heart {
          position: absolute; top: 12px; right: 12px;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.92);
          border: none; display: grid; place-items: center;
          cursor: pointer; z-index: 1;
          transition: transform 0.15s, background 0.2s;
        }
        .card-heart:hover { transform: scale(1.15); }
        .card-heart:focus-visible { outline: 3px solid #FF385C; outline-offset: 2px; }
        .card-heart.liked { background: rgba(255,56,92,0.1); }
        .card-heart.animating { animation: heartBounce 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .heart-particles {
          position: absolute; top: -8px; right: -8px;
          font-size: 14px; pointer-events: none;
          animation: particleBurst 0.5s ease-out forwards;
        }
        @keyframes heartBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        @keyframes particleBurst {
          0% { opacity: 1; transform: scale(0.5); }
          100% { opacity: 0; transform: scale(1.5) translateY(-12px); }
        }
        .card-body {
          padding: 16px; display: flex;
          flex-direction: column; gap: 10px;
          height: 180px;
        }
        .card-top {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-height: 0;
        }
        .card-bottom {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
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
        .card-location {
          display: flex; align-items: center;
          min-height: 20px;
          margin: 0;
        }
        .card-footer {
          display: flex; flex-wrap: wrap; justify-content: space-between;
          align-items: center; padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.06);
          font-size: 12px; color: #888;
          gap: 6px;
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
  isFavFn,
  onToggleFav,
}: {
  title: string;
  challenges: CatalogChallenge[];
  onOpen: (c: CatalogChallenge) => void;
  direction?: 'left' | 'right';
  isFavFn: (id: string) => boolean;
  onToggleFav: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Медленный автоскролл с чередованием направления
  React.useEffect(() => {
    if (isDragging || isHovered) return;
    const STEP = 1;
    const INTERVAL = 30;
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
    <section className="carousel-section" aria-label={title}>
      <h2 className="carousel-title">{title}</h2>
      <div
        className="carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsDragging(false); }}
      >
        <button className="carousel-btn prev" onClick={() => scrollBy('left')} aria-label={`Прокрутить ${title} влево`}>
          <ChevronLeft size={20} color="#222" aria-hidden="true" />
        </button>
        <div
          className={`carousel-track ${isDragging ? 'dragging' : ''}`}
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={onMouseMove}
          role="region"
          aria-label={`Список челленджей: ${title}`}
        >
          {challenges.map((c, i) => (
            <CatalogCard key={`${c.id}-${i}`} challenge={c} onOpen={onOpen} isFav={isFavFn(c.id)} onToggleFav={onToggleFav} />
          ))}
        </div>
        <button className="carousel-btn next" onClick={() => scrollBy('right')} aria-label={`Прокрутить ${title} вправо`}>
          <ChevronRight size={20} color="#222" aria-hidden="true" />
        </button>
      </div>

      <style jsx>{`
        .carousel-section { display: flex; flex-direction: column; gap: 20px; width: 100%; }
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
        .carousel-btn:focus-visible { outline: 3px solid #FF385C; outline-offset: 2px; }
        .carousel-btn.prev { left: -18px; }
        .carousel-btn.next { right: -18px; }
      `}</style>
    </section>
  );
}

// ─── Главный компонент ─────────────────────────────────────────────────────
export default function ExplorePage() {
  const { challenges, loading, isAdmin } = useChallenges();
  const { region } = useRegion();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeCategory, setActiveCategory] = useState('Все подряд');
  const [selectedChallenge, setSelectedChallenge] = useState<CatalogChallenge | null>(null);

  // Закрытие модалки по Escape
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedChallenge(null);
  }, []);

  useEffect(() => {
    if (selectedChallenge) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [selectedChallenge, handleEscape]);

  const regionFiltered = useMemo(() => {
    if (!region) return challenges;
    const matched = challenges.filter(c => !c.region || c.region === region);
    return matched.length > 0 ? matched : challenges;
  }, [challenges, region]);

  const filtered = regionFiltered.filter(c => {
    return activeCategory === 'Все подряд' || c.category === activeCategory;
  });

  const sections: { title: string; challenges: CatalogChallenge[]; direction: 'left' | 'right' }[] = [];

  if (activeCategory === 'Все подряд') {
    const recommended = regionFiltered.filter(c => c.isRecommended);
    if (recommended.length) sections.push({ title: 'Рекомендовано', challenges: recommended, direction: 'right' });
    CATEGORY_KEYS.forEach((key, i) => {
      const group = regionFiltered.filter(c => c.category === key);
      if (group.length) sections.push({ title: CATEGORY_LABELS[key], challenges: group, direction: i % 2 === 0 ? 'left' : 'right' });
    });
  }

  if (loading) {
    return (
      <PageShell variant="public">
        <PageSpinner text="Загружаем челленджи..." />
      </PageShell>
    );
  }

  return (
    <PageShell variant="public">
      <AnnouncementPopup />

      {selectedChallenge && (
        <Suspense fallback={null}>
          <ChallengeModal
            challenge={toModalChallenge(selectedChallenge)}
            onClose={() => setSelectedChallenge(null)}
          />
        </Suspense>
      )}

      <main className="catalog-main" id="main-content">
        {/* Skip link target */}

        <h1 className="page-title">Найди свой челлендж</h1>

        {/* Категории */}
        <nav aria-label="Фильтр по категориям">
          <div className="categories-scroll" role="tablist">
            {CATEGORIES_ALL.map(cat => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                role="tab"
                aria-selected={activeCategory === cat}
                id={`cat-${cat}`}
              >
                {CATEGORY_ICONS[cat]} {cat === 'Все подряд' ? cat : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </nav>

        {/* Контент */}
        <div className="catalog-content">
          {challenges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">🎯</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Челленджи пока не добавлены</h2>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Скоро здесь появятся интересные активности</p>
            </div>
          ) : activeCategory === 'Все подряд' ? (
            <div className="sections-list">
              {sections.map((sec, idx) => (
                <CarouselSection
                  key={sec.title}
                  title={sec.title}
                  challenges={sec.challenges}
                  onOpen={c => setSelectedChallenge(c)}
                  direction={idx % 2 === 0 ? 'right' : 'left'}
                  isFavFn={isFavorite}
                  onToggleFav={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <>
              <p className="results-count" aria-live="polite">
                {filtered.length > 0
                  ? `Найдено: ${filtered.length} ${filtered.length === 1 ? 'челлендж' : 'челленджей'}`
                  : 'Ничего не найдено'}
              </p>
              <div className="grid-layout" role="list">
                {filtered.map(c => (
                  <div key={c.id} role="listitem">
                    <CatalogCard challenge={c} onOpen={ch => setSelectedChallenge(ch)} isFav={isFavorite(c.id)} onToggleFav={toggleFavorite} />
                  </div>
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

        .page-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          margin: 0;
          color: #111;
          letter-spacing: -1px;
          text-align: center;
        }

        /* Categories */
        .categories-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
          justify-content: center;
          flex-wrap: wrap;
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
          outline: none;
        }
        .cat-pill:hover { border-color: #FF385C; color: #FF385C; }
        .cat-pill:focus-visible { outline: 3px solid #FF385C; outline-offset: 2px; }
        .cat-pill.active {
          background: #111;
          border-color: #111;
          color: white;
        }

        /* Content */
        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 48px;
          align-items: center;
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
          .card-image-box { height: 150px; }
        }

        @media (max-width: 640px) {
          .catalog-main { padding: 16px 12px 60px; gap: 28px; }
          .grid-layout { gap: 14px; }
          .cat-pill { padding: 8px 14px; font-size: 13px; }
        }

        @media (max-width: 480px) {
          .categories-scroll { gap: 8px; }
          .cat-pill { padding: 7px 12px; font-size: 12px; }
        }
      `}</style>
    </PageShell>
  );
}
