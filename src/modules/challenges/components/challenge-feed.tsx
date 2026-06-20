'use client';

import React, { useState } from 'react';
import { Search, Filter, Sparkles, MapPin, Grid, List } from 'lucide-react';
import { Challenge, ChallengeCategory } from '../types';
import { ChallengeCard } from './challenge-card';

const CATEGORIES: ChallengeCategory[] = ['Sport', 'Education', 'Quest', 'Art', 'Tech'];

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Утренний забег на 5км',
    organizer: 'Nike Run Club',
    category: 'Sport',
    pointsReward: 150,
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    participantsCount: 1240,
    isJoined: true,
    progress: 65,
    badges: ['cooperative'],
  },
  {
    id: '2',
    title: 'Изучаем React Hooks',
    organizer: 'Meta Open Source',
    category: 'Tech',
    pointsReward: 300,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    participantsCount: 850,
    isJoined: false,
    badges: ['hot'],
  },
  {
    id: '3',
    title: 'Квест по экологии',
    organizer: 'Green Earth',
    category: 'Quest',
    pointsReward: 500,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    participantsCount: 3200,
    isJoined: true,
    progress: 20,
  },
  {
    id: '4',
    title: 'Выставка цифрового искусства',
    organizer: 'Adobe Art',
    category: 'Art',
    pointsReward: 200,
    imageUrl: 'https://images.unsplash.com/photo-1547891319-184a7783c0c6?auto=format&fit=crop&w=800&q=80',
    participantsCount: 450,
    isJoined: false,
  },
  {
    id: '5',
    title: 'Йога на закате',
    organizer: 'Yoga Studio',
    category: 'Sport',
    pointsReward: 100,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    participantsCount: 2100,
    isJoined: false,
  },
  {
    id: '6',
    title: 'Фото-тур: Старый город',
    organizer: 'Photo Academy',
    category: 'Quest',
    pointsReward: 400,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    participantsCount: 115,
    isJoined: false,
  }
];

export const ChallengeFeed: React.FC<{ hideFilters?: boolean }> = ({ hideFilters = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const filteredChallenges = MOCK_CHALLENGES.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="challenge-feed-container">
      {!hideFilters && (
        <header className="feed-header">
          <div className="header-top">
            <h1 className="feed-title">
              Каталог <span className="highlight">Активностей</span>
              <Sparkles className="sparkle-icon" size={24} />
            </h1>
            <div className="view-toggle">
              <button className={viewType === 'grid' ? 'active' : ''} onClick={() => setViewType('grid')}><Grid size={18}/></button>
              <button className={viewType === 'list' ? 'active' : ''} onClick={() => setViewType('list')}><List size={18}/></button>
              <button className="map-btn"><MapPin size={18}/> Карта</button>
            </div>
          </div>

          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Название, бренд или тема..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="filter-button">
              <Filter size={20} /> Фильтры
            </button>
          </div>

          <div className="category-scroll">
            <button 
              className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              Все подряд
            </button>
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'Sport' ? '🏃 Спорт' : cat === 'Education' ? '📚 Обучение' : cat === 'Quest' ? '🗺️ Квесты' : cat === 'Art' ? '🎨 Искусство' : '⚙️ Техно'}
              </button>
            ))}
          </div>
        </header>
      )}

      <div className={`challenges-grid ${viewType}`}>
        {filteredChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="empty-state">
          <p>Ничего не нашлось. Попробуйте изменить фильтры!</p>
        </div>
      )}

      <style jsx>{`
        .challenge-feed-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .feed-header {
          margin-bottom: 32px;
          padding: 0 16px;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .feed-title {
          font-size: 32px;
          font-weight: 900;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .highlight { color: #ff385c; }
        .sparkle-icon { color: #ff8c00; }

        .view-toggle {
          display: flex;
          background: var(--bg-accent);
          padding: 4px;
          border-radius: 12px;
          gap: 4px;
        }

        .view-toggle button {
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-muted);
        }

        .view-toggle button.active {
          background: white;
          color: var(--text);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .map-btn {
          border-left: 1px solid var(--line) !important;
          border-radius: 0 !important;
          margin-left: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
        }

        .search-bar {
          position: relative;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          flex: 1;
          padding: 16px 16px 16px 48px;
          border-radius: 20px;
          border: 1px solid var(--line);
          background: var(--surface);
          font-size: 16px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus { border-color: #ff385c; box-shadow: 0 0 0 4px rgba(255,56,92,0.1); }

        .filter-button {
          background: var(--surface);
          border: 1px solid var(--line);
          padding: 0 24px;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }

        .category-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }

        .category-scroll::-webkit-scrollbar { display: none; }

        .category-pill {
          white-space: nowrap;
          padding: 10px 24px;
          border-radius: 99px;
          border: 1px solid var(--line);
          background: var(--surface);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-pill.active {
          background: var(--text);
          color: white;
          border-color: var(--text);
        }

        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          padding: 0 16px;
        }

        .challenges-grid.list {
          grid-template-columns: 1fr;
        }

        .empty-state {
          text-align: center;
          padding: 80px;
          color: var(--text-muted);
          font-size: 18px;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .feed-title { font-size: 24px; }
          .search-bar { flex-direction: column; }
          .filter-button { padding: 14px; justify-content: center; }
        }
      `}</style>
    </div>
  );
};
