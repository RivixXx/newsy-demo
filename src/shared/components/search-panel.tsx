'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Users } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MOCK_CHALLENGES, type CatalogChallenge } from '@/shared/data/challenges';
import { ChallengeModal, type ModalChallenge } from '@/shared/components/challenge-modal';

function toModalChallenge(c: CatalogChallenge): ModalChallenge {
  return {
    id: c.id, title: c.title, organizer: c.organizer, category: c.category,
    imageUrl: c.imageUrl, participantsCount: c.participantsCount,
    maxParticipants: c.maxParticipants, endDate: c.endDate, location: c.location,
    achievement: c.achievement, reward: c.reward, description: c.description,
    requirements: c.requirements, refundPolicy: c.refundPolicy,
    stages: [
      { id: 's1', title: 'Регистрация', description: 'Подтвердите участие и ознакомьтесь с правилами.', type: 'ДЕЙСТВИЕ', status: 'pending' },
      { id: 's2', title: 'Выполнение задания', description: 'Выполните основное задание челенджа и загрузите подтверждение.', type: 'ФОТО', status: 'pending' },
      { id: 's3', title: 'Геолокация', description: 'Подтвердите своё местоположение на точке проведения.', type: 'ГЕО', status: 'pending' },
      { id: 's4', title: 'Финальный отчёт', description: 'Загрузите итоговый файл с результатами.', type: 'ФАЙЛ', status: 'pending' },
    ],
  };
}

const CATEGORIES = [
  { id: 'all', label: 'Все категории' },
  { id: 'sport', label: 'Спорт' },
  { id: 'education', label: 'Обучение' },
  { id: 'quests', label: 'Квесты' },
  { id: 'art', label: 'Искусство' },
  { id: 'tech', label: 'Технологии' },
];

const QUICK_DATES = [
  { label: 'Сегодня', days: 0 },
  { label: 'Завтра', days: 1 },
  { label: 'Эти выходные', days: null },
  { label: 'На этой неделе', days: 7 },
  { label: 'В этом месяце', days: 30 },
];

export function SearchPanel() {
  const [barCategory, setBarCategory] = useState('all');
  const [barWhen, setBarWhen] = useState('');
  const [barWho, setBarWho] = useState('');

  const [showResults, setShowResults] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCategoryDrop, setShowCategoryDrop] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<CatalogChallenge | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCategoryDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (showResults) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showResults]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const fmt = (d: Date) => `${d.getDate()}.${d.getMonth()+1}`;
      setBarWhen(`${fmt(dateRange[0])} — ${fmt(dateRange[1])}`);
      setShowCalendar(false);
    } else if (dateRange[0]) {
      const fmt = (d: Date) => `${d.getDate()}.${d.getMonth()+1}`;
      setBarWhen(`${fmt(dateRange[0])} — ...`);
    }
  }, [dateRange]);

  const doSearch = () => {
    setShowResults(true);
    setShowCalendar(false);
    setShowCategoryDrop(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  const handleQuickDate = (days: number | null) => {
    const today = new Date();
    if (days === null) {
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (6 - today.getDay()));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      setDateRange([saturday, sunday]);
    } else {
      const start = new Date(today);
      start.setDate(today.getDate() + days);
      const end = new Date(start);
      end.setDate(start.getDate() + (days === 0 ? 0 : Math.min(days, 7)));
      setDateRange([start, end]);
    }
  };

  const results = MOCK_CHALLENGES.filter(c => {
    if (barCategory !== 'all') {
      const catMap: Record<string, string> = { sport: 'Спорт', education: 'Обучение', quests: 'Квесты', art: 'Искусство', tech: 'Технологии' };
      if (c.category !== catMap[barCategory]) return false;
    }
    if (barWho.trim()) {
      const q = barWho.toLowerCase();
      const match = c.title.toLowerCase().includes(q) || c.organizer.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <>
      {/* Search bar */}
      <div className="search-bar" onKeyDown={handleKeyDown}>
        {/* Category */}
        <div className="sb-seg" ref={catRef}>
          <button className="sb-btn" onClick={() => { setShowCategoryDrop(!showCategoryDrop); setShowCalendar(false); }}>
            <span className="sb-value">{CATEGORIES.find(c=>c.id===barCategory)?.label}</span>
          </button>
          {showCategoryDrop && (
            <div className="sb-drop">
              {CATEGORIES.map(c => (
                <button key={c.id} className={`sb-drop-item ${barCategory===c.id?'active':''}`}
                  onClick={() => { setBarCategory(c.id); setShowCategoryDrop(false); }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sb-divider" />

        {/* When */}
        <div className="sb-seg sb-when">
          <button className="sb-btn" onClick={() => { setShowCalendar(!showCalendar); setShowCategoryDrop(false); }}>
            <span className="sb-value">{barWhen || 'Когда'}</span>
          </button>
          {showCalendar && (
            <div className="sb-drop sb-drop-calendar">
              <div className="cal-quick">
                {QUICK_DATES.map(q => (
                  <button key={q.label} className="cal-quick-btn" onClick={() => handleQuickDate(q.days)}>
                    {q.label}
                  </button>
                ))}
              </div>
              <div className="cal-wrap">
                <DatePicker
                  selectsRange
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(update) => setDateRange(update as [Date | null, Date | null])}
                  inline
                  monthsShown={2}
                  minDate={new Date()}
                  calendarClassName="newsy-calendar"
                  dayClassName={() => 'cal-day'}
                />
              </div>
            </div>
          )}
        </div>

        <div className="sb-divider" />

        {/* Text search */}
        <div className="sb-seg">
          <div className="sb-search-input-wrap">
            <Search size={15} color="#888" />
            <input
              className="sb-search-input"
              type="text"
              placeholder="Найти челлендж по названию..."
              value={barWho}
              onChange={e => setBarWho(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {barWho && (
              <button className="sb-search-clear" onClick={() => setBarWho('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Search button */}
        <button className="sb-search" onClick={doSearch}>
          <Search size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Results modal */}
      {showResults && (
        <div className="modal-overlay" onClick={() => setShowResults(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="mh-left">
                <span className="mh-count">{results.length} челенджей</span>
                <span className="mh-filters">
                  {barCategory !== 'all' && <span className="mh-tag">{CATEGORIES.find(c=>c.id===barCategory)?.label}</span>}
                  {barWhen && <span className="mh-tag">{barWhen}</span>}
                  {barWho.trim() && <span className="mh-tag">"{barWho}"</span>}
                </span>
              </div>
              <button className="mh-close" onClick={() => setShowResults(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {results.length > 0 ? (
                <div className="results-grid">
                  {results.map(c => (
                    <button key={c.id} className="result-card" onClick={() => { setSelectedChallenge(c); setShowResults(false); }}>
                      <div className="rc-img">
                        <img src={c.imageUrl} alt={c.title} />
                      </div>
                      <div className="rc-body">
                        <div className="rc-top">
                          <span className="rc-org">{c.organizer}</span>
                          <h4 className="rc-title">{c.title}</h4>
                        </div>
                        <div className="rc-bottom">
                          <div className="rc-meta">
                            <span className="rc-tag">Достижение: {c.achievement}</span>
                            <span className="rc-tag">Награда: {c.reward}</span>
                          </div>
                          <div className="rc-foot">
                            <span><Users size={12} /> {c.maxParticipants - c.participantsCount} мест</span>
                            <span>до {c.endDate}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Search size={48} color="#ddd" />
                  <p>Ничего не найдено</p>
                  <span>Попробуйте изменить параметры поиска</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedChallenge && (
        <ChallengeModal
          challenge={toModalChallenge(selectedChallenge)}
          onClose={() => setSelectedChallenge(null)}
        />
      )}

      <style jsx>{`
        /* Search bar */
        .search-bar {
          display: flex; align-items: center; background: white;
          border-radius: 99px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb; height: 52px; padding: 4px;
          min-width: 600px; position: relative; z-index: 50;
        }
        .sb-seg { position: relative; flex: 1; }
        .sb-btn {
          width: 100%; padding: 0 20px; height: 44px;
          display: flex; flex-direction: column; justify-content: center;
          border: none; background: none; cursor: pointer;
          border-radius: 99px; text-align: left; transition: background 0.15s;
        }
        .sb-btn:hover { background: #f7f7f7; }
        .sb-label { font-size: 10px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
        .sb-value { font-size: 14px; font-weight: 600; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-divider { width: 1px; height: 24px; background: #e5e7eb; flex-shrink: 0; }
        .sb-search {
          width: 42px; height: 42px; border-radius: 50%;
          background: #FF385C; border: none; display: grid; place-items: center;
          flex-shrink: 0; margin-left: 4px; cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }
        .sb-search:hover { background: #E31C5F; transform: scale(1.05); }
        .sb-search:active { transform: scale(0.95); }

        /* Dropdowns */
        .sb-drop {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: white; border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border: 1px solid #f0f0f0; padding: 8px;
          animation: dropIn 0.15s ease; z-index: 100;
          min-width: 200px;
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .sb-drop-item {
          display: block; width: 100%; padding: 10px 14px;
          border: none; background: none; border-radius: 8px;
          font-size: 14px; font-weight: 500; color: #333;
          cursor: pointer; text-align: left; transition: background 0.1s;
        }
        .sb-drop-item:hover { background: #f5f5f5; }
        .sb-drop-item.active { background: #f0f0f0; font-weight: 700; color: #111; }

        /* Calendar dropdown */
        .sb-drop-calendar {
          width: 680px; left: 50%; transform: translateX(-50%);
          padding: 16px;
        }
        @keyframes dropIn { from { opacity: 0; transform: translateX(-50%) translateY(-4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .cal-quick { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .cal-quick-btn {
          padding: 8px 14px; border-radius: 99px;
          border: 1px solid #e5e7eb; background: white;
          font-size: 13px; font-weight: 600; color: #444;
          cursor: pointer; transition: all 0.15s;
        }
        .cal-quick-btn:hover { border-color: #111; color: #111; }
        .cal-wrap { display: flex; justify-content: center; }

        /* Who dropdown */
        .sb-drop-who { width: 280px; padding: 12px; }
        .sb-search-input-wrap {
          display: flex; align-items: center; gap: 8px;
          padding: 0 16px; height: 44px; width: 100%;
        }
        .sb-search-input {
          flex: 1; border: none; outline: none; font-size: 14px;
          color: #222; background: transparent; font-weight: 500;
        }
        .sb-search-input::placeholder { color: #888; font-weight: 400; }
        .sb-search-clear {
          width: 24px; height: 24px; border-radius: 50%;
          border: none; background: #f3f4f6; display: grid; place-items: center;
          cursor: pointer; color: #888; transition: background 0.15s;
        }
        .sb-search-clear:hover { background: #e5e7eb; color: #333; }
        .who-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 4px; border-bottom: 1px solid #f5f5f5;
        }
        .who-row:last-child { border-bottom: none; }
        .who-label { font-size: 14px; font-weight: 600; color: #333; }
        .who-cnt { display: flex; align-items: center; gap: 12px; }
        .wc-btn {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid #e5e7eb; background: white;
          font-size: 16px; font-weight: 600; color: #555;
          cursor: pointer; display: grid; place-items: center;
        }
        .wc-btn:hover:not(:disabled) { border-color: #111; color: #111; }
        .wc-btn:disabled { opacity: 0.3; }
        .wc-val { font-size: 14px; font-weight: 700; min-width: 36px; text-align: center; }

        .tog { position: relative; width: 40px; height: 22px; cursor: pointer; }
        .tog input { display: none; }
        .tog-s { position: absolute; inset: 0; background: #ddd; border-radius: 99px; transition: all 0.2s; }
        .tog-s::before { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .tog input:checked + .tog-s { background: #111; }
        .tog input:checked + .tog-s::before { transform: translateX(18px); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 80px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-panel {
          background: white; border-radius: 24px;
          width: 100%; max-width: 720px; max-height: calc(100vh - 120px);
          display: flex; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          animation: slideUp 0.25s ease; overflow: hidden;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
        }
        .mh-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .mh-count { font-size: 16px; font-weight: 800; color: #111; }
        .mh-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .mh-tag {
          padding: 4px 10px; border-radius: 99px;
          background: #f5f5f5; font-size: 12px; font-weight: 600; color: #666;
        }
        .mh-close {
          width: 36px; height: 36px; border-radius: 50%;
          border: none; background: #f5f5f5;
          display: grid; place-items: center; cursor: pointer;
          transition: background 0.15s;
        }
        .mh-close:hover { background: #eee; }

        .modal-body { padding: 20px; overflow-y: auto; flex: 1; }

        .results-grid { display: flex; flex-direction: column; gap: 12px; }
        .result-card {
          display: flex; background: #fafafa; border-radius: 16px;
          overflow: hidden; text-decoration: none; color: inherit;
          border: 1px solid #f0f0f0; transition: all 0.2s;
        }
        .result-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .rc-img { width: 180px; flex-shrink: 0; overflow: hidden; }
        .rc-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .rc-body { flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
        .rc-top { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
        .rc-org { font-size: 12px; color: #888; font-weight: 600; }
        .rc-title { font-size: 15px; font-weight: 800; color: #111; margin: 0; }
        .rc-bottom { display: flex; flex-direction: column; gap: 6px; }
        .rc-meta { display: flex; flex-direction: column; gap: 4px; }
        .rc-tag { font-size: 12px; color: #666; font-weight: 500; }
        .rc-foot { display: flex; justify-content: space-between; font-size: 12px; color: #888; font-weight: 600; }

        .empty { text-align: center; padding: 48px; }
        .empty p { font-size: 18px; font-weight: 800; color: #111; margin: 16px 0 4px; }
        .empty span { font-size: 14px; color: #888; }

        @media (max-width: 768px) {
          .search-bar { min-width: 100%; }
          .sb-when { display: none; }
          .sb-drop-calendar { width: calc(100vw - 40px); left: 50%; transform: translateX(-50%); }
          .modal-overlay { padding: 12px; padding-top: 60px; }
          .result-card { flex-direction: column; }
          .rc-img { width: 100%; height: 140px; }
        }
      `}</style>
    </>
  );
}
