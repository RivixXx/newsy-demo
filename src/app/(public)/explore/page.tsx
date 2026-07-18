'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_CHALLENGES } from '@/shared/data/challenges';
import type { CatalogChallenge } from '@/shared/data/challenges';

const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'sport', label: 'Спорт' },
  { id: 'education', label: 'Образование' },
  { id: 'quest', label: 'Квесты' },
  { id: 'art', label: 'Творчество' },
  { id: 'tech', label: 'Технологии' },
];

const REGIONS = ['Все регионы', 'Москва', 'Волгоград', 'Онлайн'];

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('Все регионы');
  const [page, setPage] = useState(1);
  const perPage = 9;

  const filtered = useMemo(() => {
    return MOCK_CHALLENGES.filter((c) => {
      if (category !== 'all' && c.category !== category) return false;
      if (region !== 'Все регионы' && c.region !== region) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, region, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCategory = (id: string) => { setCategory(id); setPage(1); };
  const handleRegion = (r: string) => { setRegion(r); setPage(1); };

  return (
    <div style={s.page}>
      <Link href="/" style={s.back}><ChevronLeft size={16} /> На главную</Link>

      <header style={s.header}>
        <h1 style={s.h1}>Найди свой челлендж</h1>
        <p style={s.sub}>Спортивные марафоны, образовательные интенсивы, творческие конкурсы и квесты</p>
      </header>

      <div style={s.searchRow}>
        <div style={s.searchWrap}>
          <Search size={18} style={{ color: '#aaa', position: 'absolute', left: 14 }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Поиск по названию..."
            style={s.searchInput}
          />
        </div>
        <div style={s.filterRow}>
          <SlidersHorizontal size={16} style={{ color: '#888' }} />
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => handleRegion(r)}
              style={{ ...s.pill, ...(region === r ? s.pillActive : {}) }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={s.catRow}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategory(c.id)}
            style={{ ...s.catBtn, ...(category === c.id ? s.catBtnActive : {}) }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {paged.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 16, color: '#888', margin: 0 }}>Ничего не найдено</p>
        </div>
      ) : (
        <div style={s.grid}>
          {paged.map((c) => (
            <Link key={c.id} href={`/challenges/${c.id}`} style={s.card}>
              <div style={s.cardImg}>
                <img src={c.imageUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {c.badges.includes('hot') && <span style={s.badgeHot}>HOT</span>}
              </div>
              <div style={s.cardBody}>
                <div style={s.cardCat}>{c.category}</div>
                <h3 style={s.cardTitle}>{c.title}</h3>
                <div style={s.cardMeta}>
                  <span>{c.organizer}</span>
                  <span>{c.participantsCount}/{c.maxParticipants} участников</span>
                </div>
                <div style={s.cardFooter}>
                  <span style={s.cardReward}>{c.reward}</span>
                  <button style={s.favBtn} onClick={(e) => { e.preventDefault(); }}>
                    <Heart size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={s.pageBtn}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={s.pageBtn}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 960, margin: '0 auto', padding: '40px clamp(16px, 3vw, 40px) 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#666', textDecoration: 'none', marginBottom: 24 },
  header: { textAlign: 'center', marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 900, margin: '0 0 8px' },
  sub: { fontSize: 15, color: '#888', margin: 0 },
  searchRow: { marginBottom: 16 },
  searchWrap: { position: 'relative', marginBottom: 12 },
  searchInput: { width: '100%', padding: '14px 14px 14px 44px', border: '2px solid #e5e5e5', borderRadius: 14, fontSize: 15, outline: 'none', background: 'white', boxSizing: 'border-box' as const },
  filterRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
  pill: { padding: '6px 14px', borderRadius: 20, border: '1.5px solid #e5e5e5', background: 'white', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer' },
  pillActive: { borderColor: '#FF385C', color: '#FF385C', background: '#FF385C10' },
  catRow: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const },
  catBtn: { padding: '8px 18px', borderRadius: 10, border: 'none', background: '#f3f4f6', fontSize: 14, fontWeight: 600, color: '#555', cursor: 'pointer' },
  catBtnActive: { background: '#FF385C', color: 'white' },
  empty: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, border: '1px solid #f0f0f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.2s' },
  cardImg: { height: 180, background: '#f5f5f5', position: 'relative' as const, overflow: 'hidden' },
  badgeHot: { position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: '#FF385C', color: 'white', borderRadius: 8, fontSize: 11, fontWeight: 800 },
  cardBody: { padding: 16 },
  cardCat: { fontSize: 12, fontWeight: 700, color: '#FF385C', textTransform: 'uppercase' as const, marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3 },
  cardMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 12 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardReward: { fontSize: 13, fontWeight: 600, color: '#555' },
  favBtn: { width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e5e5e5', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#aaa' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 },
  pageBtn: { width: 40, height: 40, borderRadius: 10, border: '1.5px solid #e5e5e5', background: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#555' },
};
