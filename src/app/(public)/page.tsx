'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { IconRun, IconSchool, IconRoute, IconPalette, IconCpu, IconBolt } from '@tabler/icons-react';
import { PageShell } from '@/shared/components/page-shell';
import { AnnouncementPopup } from '@/shared/components/announcement-popup';
import { ChallengeModal, ModalChallenge } from '@/shared/components/challenge-modal';
import { MOCK_CHALLENGES, type CatalogChallenge } from '@/shared/data/challenges';
import { useChallenges } from '@/shared/hooks/use-challenges';

const CATEGORIES = ['Все подряд', 'Спорт', 'Обучение', 'Квесты', 'Искусство', 'Технологии'];
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Все подряд': <IconBolt size={16} />,
  'Спорт': <IconRun size={16} />,
  'Обучение': <IconSchool size={16} />,
  'Квесты': <IconRoute size={16} />,
  'Искусство': <IconPalette size={16} />,
  'Технологии': <IconCpu size={16} />,
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
function CatalogCard({ challenge, onOpen, isAdmin }: { challenge: CatalogChallenge; onOpen: (c: CatalogChallenge) => void; isAdmin?: boolean }) {
  const [liked, setLiked] = useState(false);
  const availableSlots = challenge.maxParticipants - challenge.participantsCount;
  const isDemo = challenge.isDemo || (!challenge.description && !challenge.location);

  return (
    <div className="catalog-card" onClick={() => onOpen(challenge)}>
      <div className="card-image-box">
        <img src={challenge.imageUrl} alt={challenge.title} className="card-bg-img" />
        <span className="card-category-pill">{CATEGORY_ICONS[challenge.category] ?? '✦'} {challenge.category}</span>
        {isAdmin && isDemo && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white', padding: '4px 10px', borderRadius: 99,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>ДЕМО</span>
        )}
        <button
          className={`card-heart ${liked ? 'liked' : ''}`}
          onClick={e => { e.stopPropagation(); setLiked(v => !v); }}
        >
          <Heart size={17} fill={liked ? '#FF385C' : 'none'} color={liked ? '#FF385C' : '#111'} />
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
          <div className="card-footer">
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
  isAdmin,
}: {
  title: string;
  challenges: CatalogChallenge[];
  onOpen: (c: CatalogChallenge) => void;
  direction?: 'left' | 'right';
  isAdmin?: boolean;
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
            <CatalogCard key={`${c.id}-${i}`} challenge={c} onOpen={onOpen} isAdmin={isAdmin} />
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
  const { challenges, loading, isAdmin } = useChallenges();
  const [activeCategory, setActiveCategory] = useState('Все подряд');
  const [selectedChallenge, setSelectedChallenge] = useState<CatalogChallenge | null>(null);

  const filtered = challenges.filter(c => {
    const matchCat = activeCategory === 'Все подряд' || c.category === activeCategory;
    return matchCat;
  });

  // Сгруппировать по секциям для "Все подряд"
  const sections: { title: string; challenges: CatalogChallenge[]; direction: 'left' | 'right' }[] = [];

  if (activeCategory === 'Все подряд') {
    const recommended = challenges.filter(c => c.isRecommended);
    const sport = challenges.filter(c => c.category === 'Спорт');
    const quests = challenges.filter(c => c.category === 'Квесты');
    const education = challenges.filter(c => c.category === 'Обучение');
    const art = challenges.filter(c => c.category === 'Искусство');
    const tech = challenges.filter(c => c.category === 'Технологии');

    if (recommended.length) sections.push({ title: 'Рекомендовано', challenges: recommended, direction: 'right' });
    if (sport.length) sections.push({ title: 'Спорт', challenges: sport, direction: 'left' });
    if (quests.length) sections.push({ title: 'Квесты', challenges: quests, direction: 'right' });
    if (education.length) sections.push({ title: 'Обучение', challenges: education, direction: 'left' });
    if (art.length) sections.push({ title: 'Искусство', challenges: art, direction: 'right' });
    if (tech.length) sections.push({ title: 'Технологии', challenges: tech, direction: 'left' });
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

        {/* Контент */}
        <div className="catalog-content">
          {challenges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Челленджи пока не добавлены</h3>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Скоро здесь появятся интересные активности</p>
            </div>
          ) : activeCategory === 'Все подряд' ? (
            // Несколько секций с чередованием направления
            <div className="sections-list">
              {sections.map((sec, idx) => (
                <CarouselSection
                  key={sec.title}
                  title={sec.title}
                  challenges={sec.challenges}
                  onOpen={c => setSelectedChallenge(c)}
                  direction={idx % 2 === 0 ? 'right' : 'left'}
                  isAdmin={isAdmin}
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
                  <CatalogCard key={c.id} challenge={c} onOpen={ch => setSelectedChallenge(ch)} isAdmin={isAdmin} />
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
          .page-title { font-size: 26px; }
          .search-zone { flex-direction: column; align-items: stretch; }
          .search-right { justify-content: space-between; }
          .card-image-box { height: 150px; }
        }

        @media (max-width: 640px) {
          .catalog-main { padding: 16px 12px 60px; gap: 28px; }
          .page-title { font-size: 22px; letter-spacing: -0.5px; }
          .search-box { min-width: 0; }
          .search-input { font-size: 14px; }
          .filter-panel { padding: 16px; gap: 12px; }
          .filter-row { flex-direction: column; align-items: stretch; }
          .filter-label { min-width: 0; }
          .filter-input { width: 100%; }
          .filter-actions { flex-direction: column; }
          .filter-reset, .filter-apply { width: 100%; text-align: center; }
          .grid-layout { gap: 14px; }
          .cat-pill { padding: 8px 14px; font-size: 13px; }
          .carousel-title { font-size: 18px; }
        }

        @media (max-width: 480px) {
          .page-title { font-size: 20px; }
          .categories-scroll { gap: 8px; }
          .cat-pill { padding: 7px 12px; font-size: 12px; }
        }
      `}</style>
    </PageShell>
  );
}
