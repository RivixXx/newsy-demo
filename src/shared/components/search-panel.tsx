'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Все', icon: '⚡' },
  { id: 'sport', label: 'Спорт', icon: '🏃' },
  { id: 'education', label: 'Обучение', icon: '📚' },
  { id: 'quests', label: 'Квесты', icon: '🗺️' },
  { id: 'art', label: 'Искусство', icon: '🎨' },
  { id: 'tech', label: 'Технологии', icon: '⚙️' },
];

const LOCATIONS = [
  { id: 'anywhere', label: 'Везде', icon: '🌍' },
  { id: 'online', label: 'Онлайн', icon: '🌐' },
  { id: 'moscow', label: 'Москва', icon: '📍' },
  { id: 'spb', label: 'СПб', icon: '📍' },
];

const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

interface SearchFilters {
  category: string;
  location: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  participants: number;
}

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'where' | 'when' | 'who'>('where');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    location: 'anywhere',
    dateFrom: null,
    dateTo: null,
    participants: 0,
  });

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingEnd, setSelectingEnd] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectingEnd(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDateClick = (day: number) => {
    const clicked = new Date(currentYear, currentMonth, day);
    const today = new Date(); today.setHours(0,0,0,0);
    if (clicked < today) return;

    if (!selectingEnd) {
      setFilters(f => ({ ...f, dateFrom: clicked, dateTo: null }));
      setSelectingEnd(true);
    } else {
      if (clicked >= (filters.dateFrom || clicked)) {
        setFilters(f => ({ ...f, dateTo: clicked }));
        setSelectingEnd(false);
      } else {
        setFilters(f => ({ ...f, dateFrom: clicked, dateTo: null }));
      }
    }
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
    setSelectingEnd(false);
  };

  const formatWhen = () => {
    if (filters.dateFrom && filters.dateTo) {
      return `${filters.dateFrom.getDate()} ${MONTHS_RU[filters.dateFrom.getMonth()]} — ${filters.dateTo.getDate()} ${MONTHS_RU[filters.dateTo.getMonth()]}`;
    }
    if (filters.dateFrom) return `${filters.dateFrom.getDate()} ${MONTHS_RU[filters.dateFrom.getMonth()]}`;
    return 'Когда';
  };

  const formatWhere = () => {
    const cat = CATEGORIES.find(c => c.id === filters.category);
    const loc = LOCATIONS.find(l => l.id === filters.location);
    if (filters.category !== 'all') return cat?.label || 'Куда';
    if (filters.location !== 'anywhere') return loc?.label || 'Куда';
    return 'Куда';
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentYear, currentMonth);
    const first = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date(); today.setHours(0,0,0,0);
    const cells = [];

    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= days; d++) {
      const date = new Date(currentYear, currentMonth, d);
      date.setHours(0,0,0,0);
      const past = date < today;
      const isFrom = filters.dateFrom?.getTime() === date.getTime();
      const isTo = filters.dateTo?.getTime() === date.getTime();
      const inRange = filters.dateFrom && filters.dateTo && date > filters.dateFrom && date < filters.dateTo;

      cells.push(
        <button key={d} disabled={past}
          className={`cd ${past ? 'past' : ''} ${isFrom || isTo ? 'sel' : ''} ${inRange ? 'range' : ''}`}
          onClick={() => handleDateClick(d)}
        >{d}</button>
      );
    }
    return cells;
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const prevMonth = () => {
    if (currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth()) return;
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  return (
    <div className="sp" ref={panelRef}>
      {/* Collapsed bar */}
      <button className="bar" onClick={() => setIsOpen(!isOpen)}>
        <div className="bar-seg" onClick={e => { e.stopPropagation(); setActiveTab('where'); setIsOpen(true); }}>
          <span className="bar-lbl">{formatWhere()}</span>
        </div>
        <div className="bar-div" />
        <div className="bar-seg" onClick={e => { e.stopPropagation(); setActiveTab('when'); setIsOpen(true); }}>
          <span className="bar-lbl">{formatWhen()}</span>
        </div>
        <div className="bar-div" />
        <div className="bar-seg" onClick={e => { e.stopPropagation(); setActiveTab('who'); setIsOpen(true); }}>
          <span className="bar-lbl">{filters.participants ? `${filters.participants} мест` : 'Любое'}</span>
        </div>
        <div className="bar-go" onClick={e => { e.stopPropagation(); handleSearch(); }}>
          <Search size={14} color="white" strokeWidth={3} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="dd">
          {/* Tabs */}
          <div className="dd-tabs">
            {(['where', 'when', 'who'] as const).map(t => (
              <button key={t} className={`dd-tab ${activeTab === t ? 'act' : ''}`}
                onClick={() => setActiveTab(t)}>
                {t === 'where' ? 'Куда' : t === 'when' ? 'Когда' : 'Места'}
              </button>
            ))}
          </div>

          {/* WHERE */}
          {activeTab === 'where' && (
            <div className="dd-body">
              <div className="dd-section">
                <span className="dd-sec-title">Категория</span>
                <div className="pill-row">
                  {CATEGORIES.map(c => (
                    <button key={c.id}
                      className={`pill ${filters.category === c.id ? 'act' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, category: c.id }))}>
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="dd-section">
                <span className="dd-sec-title">Локация</span>
                <div className="pill-row">
                  {LOCATIONS.map(l => (
                    <button key={l.id}
                      className={`pill ${filters.location === l.id ? 'act' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, location: l.id }))}>
                      <span>{l.icon}</span> {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WHEN */}
          {activeTab === 'when' && (
            <div className="dd-body">
              <div className="cal-wrap">
                <div className="cal-head">
                  <button className="cal-nav" onClick={prevMonth}><ChevronLeft size={16} /></button>
                  <span className="cal-title">{MONTHS_RU[currentMonth]} {currentYear}</span>
                  <button className="cal-nav" onClick={nextMonth}><ChevronRight size={16} /></button>
                </div>
                <div className="cal-grid">
                  {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d} className="cal-dn">{d}</div>)}
                  {renderCalendar()}
                </div>
              </div>
            </div>
          )}

          {/* WHO */}
          {activeTab === 'who' && (
            <div className="dd-body">
              <div className="who-row">
                <div>
                  <span className="who-title">Мест</span>
                  <span className="who-desc">Макс. участников</span>
                </div>
                <div className="cnt">
                  <button className="cnt-b" onClick={() => setFilters(f => ({ ...f, participants: Math.max(0, f.participants - 5) }))} disabled={filters.participants <= 0}>−</button>
                  <span className="cnt-v">{filters.participants || '∞'}</span>
                  <button className="cnt-b" onClick={() => setFilters(f => ({ ...f, participants: f.participants + 5 }))}>+</button>
                </div>
              </div>
              <div className="who-row">
                <div>
                  <span className="who-title">Только бесплатные</span>
                  <span className="who-desc">Без взноса</span>
                </div>
                <label className="tog"><input type="checkbox" /><span className="tog-s" /></label>
              </div>
              <div className="who-row">
                <div>
                  <span className="who-title">С наградой</span>
                  <span className="who-desc">Реальные призы</span>
                </div>
                <label className="tog"><input type="checkbox" /><span className="tog-s" /></label>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="dd-foot">
            <button className="dd-reset" onClick={() => setFilters({ category: 'all', location: 'anywhere', dateFrom: null, dateTo: null, participants: 0 })}>Сбросить</button>
            <button className="dd-search" onClick={handleSearch}><Search size={14} /> Показать</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .sp { position: relative; z-index: 100; }

        /* Bar */
        .bar {
          display: flex; align-items: center; background: white;
          border-radius: 99px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #ebebeb; height: 48px; padding: 4px;
          cursor: pointer; transition: box-shadow 0.2s;
        }
        .bar:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .bar-seg {
          padding: 0 16px; height: 100%; display: flex; align-items: center;
          border-radius: 99px; transition: background 0.15s;
        }
        .bar-seg:hover { background: #f5f5f5; }
        .bar-lbl { font-size: 14px; font-weight: 600; color: #222; white-space: nowrap; }
        .bar-div { width: 1px; height: 20px; background: #e5e7eb; flex-shrink: 0; }
        .bar-go {
          width: 36px; height: 36px; border-radius: 50%;
          background: #FF385C; display: grid; place-items: center;
          flex-shrink: 0; margin-left: 4px; transition: background 0.15s;
        }
        .bar-go:hover { background: #E31C5F; }

        /* Dropdown */
        .dd {
          position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
          background: white; border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          border: 1px solid #f0f0f0; width: 420px;
          animation: ddIn 0.2s ease; overflow: hidden;
        }
        @keyframes ddIn { from { opacity: 0; transform: translateX(-50%) translateY(-6px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        .dd-tabs {
          display: flex; border-bottom: 1px solid #f0f0f0; padding: 0 8px;
        }
        .dd-tab {
          padding: 12px 16px; border: none; background: none;
          font-size: 13px; font-weight: 700; color: #888;
          cursor: pointer; border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .dd-tab.act { color: #111; border-bottom-color: #111; }
        .dd-tab:hover { color: #555; }

        .dd-body { padding: 16px; }
        .dd-section { margin-bottom: 16px; }
        .dd-section:last-child { margin-bottom: 0; }
        .dd-sec-title { font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px; }

        .pill-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .pill {
          display: flex; align-items: center; gap: 4px;
          padding: 8px 14px; border-radius: 99px;
          border: 1.5px solid #e5e7eb; background: white;
          font-size: 13px; font-weight: 600; color: #444;
          cursor: pointer; transition: all 0.15s;
        }
        .pill:hover { border-color: #aaa; }
        .pill.act { border-color: #111; background: #111; color: white; }

        /* Calendar */
        .cal-wrap {}
        .cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .cal-nav {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid #e5e7eb; background: white;
          display: grid; place-items: center; cursor: pointer; font-size: 14px;
        }
        .cal-nav:hover { background: #f5f5f5; }
        .cal-title { font-size: 14px; font-weight: 800; color: #111; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .cal-dn { text-align: center; font-size: 11px; font-weight: 700; color: #aaa; padding: 4px 0; }
        .cd {
          aspect-ratio: 1; display: grid; place-items: center;
          border-radius: 50%; border: none; background: none;
          font-size: 13px; font-weight: 600; color: #222;
          cursor: pointer; transition: all 0.1s;
        }
        .cd:hover:not(.past) { background: #f0f0f0; }
        .cd.past { color: #ccc; cursor: default; }
        .cd.sel { background: #111; color: white; }
        .cd.range { background: #f5f5f5; border-radius: 0; }

        /* Who */
        .who-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid #f5f5f5;
        }
        .who-row:last-child { border-bottom: none; }
        .who-title { font-size: 14px; font-weight: 700; color: #222; display: block; }
        .who-desc { font-size: 12px; color: #aaa; }
        .cnt { display: flex; align-items: center; gap: 12px; }
        .cnt-b {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid #e5e7eb; background: white;
          font-size: 16px; font-weight: 600; color: #555;
          cursor: pointer; display: grid; place-items: center;
        }
        .cnt-b:hover:not(:disabled) { border-color: #111; color: #111; }
        .cnt-b:disabled { opacity: 0.3; }
        .cnt-v { font-size: 14px; font-weight: 700; min-width: 40px; text-align: center; }

        .tog { position: relative; width: 40px; height: 22px; cursor: pointer; }
        .tog input { display: none; }
        .tog-s {
          position: absolute; inset: 0; background: #e5e7eb;
          border-radius: 99px; transition: all 0.2s;
        }
        .tog-s::before {
          content: ''; position: absolute; top: 2px; left: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: white; transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .tog input:checked + .tog-s { background: #22c55e; }
        .tog input:checked + .tog-s::before { transform: translateX(18px); }

        /* Footer */
        .dd-foot {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-top: 1px solid #f0f0f0;
        }
        .dd-reset {
          background: none; border: none; font-size: 13px;
          font-weight: 700; color: #222; text-decoration: underline; cursor: pointer;
        }
        .dd-search {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 99px;
          background: #FF385C; color: white; border: none;
          font-size: 13px; font-weight: 800; cursor: pointer;
          transition: background 0.15s;
        }
        .dd-search:hover { background: #E31C5F; }

        @media (max-width: 600px) {
          .bar { height: 44px; }
          .bar-seg { padding: 0 12px; }
          .bar-lbl { font-size: 13px; }
          .dd { width: calc(100vw - 32px); left: 16px; right: 16px; transform: none; }
          @keyframes ddIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        }
      `}</style>
    </div>
  );
}
