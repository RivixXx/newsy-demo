'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import { MOCK_CHALLENGES, type CatalogChallenge } from '@/shared/data/challenges';
import Link from 'next/link';
import { Users, Trophy, ChevronRight, Gift } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  sport: 'Спорт',
  education: 'Обучение',
  quest: 'Квесты',
  art: 'Искусство',
  tech: 'Технологии',
};
const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);
const CATEGORIES = ['Все', ...CATEGORY_KEYS];

const CATEGORY_ICONS: Record<string, string> = {
  'Все': '⚡',
  sport: '🏃',
  education: '📚',
  quest: '🗺️',
  art: '🎨',
  tech: '⚙️',
};

function SearchCard({ challenge }: { challenge: CatalogChallenge }) {
  const availableSlots = challenge.maxParticipants - challenge.participantsCount;

  return (
    <Link href={`/challenges/${challenge.id}`} className="search-card-link">
      <div className="search-card">
        <div className="sc-img-wrap">
          <img src={challenge.imageUrl} alt={challenge.title} className="sc-img" />
          <span className="sc-category">{CATEGORY_LABELS[challenge.category] || challenge.category}</span>
        </div>
        <div className="sc-body">
          <div className="sc-top">
            <p className="sc-organizer">{challenge.organizer}</p>
            <h3 className="sc-title">{challenge.title}</h3>
          </div>
          <div className="sc-bottom">
            <div className="sc-tags">
              <span className="sc-tag achievement">🏆 {challenge.achievement}</span>
              <span className="sc-tag reward">🎁 {challenge.reward}</span>
            </div>
            <div className="sc-footer">
              <span className="sc-slots">
                <Users size={13} /> {availableSlots} мест
              </span>
              <span className="sc-date">до {challenge.endDate}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-card-link {
          text-decoration: none; color: inherit; display: block;
        }
        .search-card {
          display: flex; background: white; border-radius: 18px;
          overflow: hidden; border: 1px solid #f0f0f0;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          height: 160px;
        }
        .search-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1);
        }
        .sc-img-wrap {
          width: 200px; flex-shrink: 0; position: relative; overflow: hidden;
        }
        .sc-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .search-card:hover .sc-img { transform: scale(1.05); }
        .sc-category {
          position: absolute; top: 10px; left: 10px;
          background: rgba(255,255,255,0.92); padding: 3px 10px;
          border-radius: 99px; font-size: 11px; font-weight: 700;
          backdrop-filter: blur(4px);
        }
        .sc-body {
          flex: 1; padding: 16px; display: flex; flex-direction: column;
          justify-content: space-between; min-width: 0;
        }
        .sc-top { display: flex; flex-direction: column; gap: 4px; }
        .sc-organizer { font-size: 12px; color: #888; font-weight: 600; margin: 0; }
        .sc-title {
          font-size: 15px; font-weight: 800; color: #111; margin: 0;
          line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .sc-bottom { display: flex; flex-direction: column; gap: 8px; }
        .sc-tags { display: flex; flex-direction: column; gap: 4px; }
        .sc-tag {
          padding: 4px 8px; border-radius: 6px;
          font-size: 11px; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sc-tag.achievement { background: #fef3c7; color: #92400e; }
        .sc-tag.reward { background: #dcfce7; color: #166534; }
        .sc-footer {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; color: #888; font-weight: 600;
        }
        .sc-slots { display: flex; align-items: center; gap: 4px; }
        @media (max-width: 640px) {
          .search-card { flex-direction: column; height: auto; }
          .sc-img-wrap { width: 100%; height: 140px; }
        }
      `}</style>
    </Link>
  );
}

export const ChallengeFeed: React.FC<{ hideFilters?: boolean }> = ({ hideFilters = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChallenges = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return MOCK_CHALLENGES.filter((c) => {
      const matchCategory = selectedCategory === 'Все' || c.category === selectedCategory;
      if (!matchCategory) return false;
      if (!query) return true;
      // Поиск по всем полям
      return (
        c.title.toLowerCase().includes(query) ||
        c.organizer.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.achievement.toLowerCase().includes(query) ||
        c.reward.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="search-page">
      {!hideFilters && (
        <header className="search-header">
          <h1 className="search-title">
            Поиск <span className="highlight">челленджей</span>
            <Sparkles size={24} color="#ff8c00" />
          </h1>

          <div className="search-bar">
            <Search size={20} color="#aaa" />
            <input
              type="text"
              placeholder="Название, бренд, тема, достижение, награда..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>

          <div className="category-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {CATEGORY_ICONS[cat]} {cat === 'Все' ? cat : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </header>
      )}

      <div className="search-results">
        {searchQuery && (
          <p className="results-count">
            Найдено: {filteredChallenges.length} {filteredChallenges.length === 1 ? 'челлендж' : 'челенджей'}
          </p>
        )}

        {filteredChallenges.length > 0 ? (
          <div className="results-grid">
            {filteredChallenges.map((c) => (
              <SearchCard key={c.id} challenge={c} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p className="empty-title">Ничего не найдено</p>
            <p className="empty-desc">Попробуйте изменить запрос или выбрать другую категорию</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .search-page {
          max-width: 900px; margin: 0 auto; padding: 20px clamp(12px, 3vw, 24px);
        }
        .search-header {
          display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px;
        }
        .search-title {
          font-size: 28px; font-weight: 900; margin: 0;
          display: flex; align-items: center; gap: 10px; color: #111;
        }
        .highlight { color: #FF385C; }
        .search-bar {
          display: flex; align-items: center; gap: 10px;
          background: white; border: 1.5px solid #e5e7eb;
          border-radius: 14px; padding: 12px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-bar:focus-within {
          border-color: #FF385C;
          box-shadow: 0 0 0 3px rgba(255,56,92,0.1);
        }
        .search-input {
          flex: 1; border: none; outline: none; font-size: 15px;
          color: #111; background: transparent;
        }
        .search-input::placeholder { color: #aaa; }
        .search-clear {
          border: none; background: none; color: #aaa;
          cursor: pointer; font-size: 14px; padding: 4px;
        }
        .category-scroll {
          display: flex; gap: 8px; overflow-x: auto;
          padding-bottom: 4px; scrollbar-width: none;
        }
        .category-scroll::-webkit-scrollbar { display: none; }
        .cat-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 99px;
          border: 1.5px solid #e5e7eb; background: white;
          font-size: 13px; font-weight: 700; color: #444;
          cursor: pointer; white-space: nowrap;
          transition: all 0.2s; flex-shrink: 0;
        }
        .cat-pill:hover { border-color: #FF385C; color: #FF385C; }
        .cat-pill.active { background: #111; border-color: #111; color: white; }
        .search-results { display: flex; flex-direction: column; gap: 16px; }
        .results-count {
          font-size: 13px; color: #888; font-weight: 600; margin: 0;
        }
        .results-grid {
          display: flex; flex-direction: column; gap: 12px;
        }
        .empty-state {
          text-align: center; padding: 60px 20px;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title {
          font-size: 20px; font-weight: 800; color: #111; margin: 0 0 8px;
        }
        .empty-desc { font-size: 14px; color: #888; margin: 0; }
        @media (max-width: 640px) {
          .search-title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
};
