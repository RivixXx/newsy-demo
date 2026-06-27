'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X, MapPin, Users, Trophy, Gift } from 'lucide-react';
import { MOCK_CHALLENGES, type CatalogChallenge } from '@/shared/data/challenges';
import Link from 'next/link';

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

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

export function SearchPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'where' | 'when' | 'who'>('where');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all', location: 'anywhere', dateFrom: null, dateTo: null, participants: 0,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false); setSelectingEnd(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleDateClick = (day: number) => {
    const clicked = new Date(currentYear, currentMonth, day);
    const today = new Date(); today.setHours(0,0,0,0);
    if (clicked < today) return;
    if (!selectingEnd) {
      setFilters(f => ({ ...f, dateFrom: clicked, dateTo: null }));
      setSelectingEnd(true);
    } else {
      if (clicked >= (filters.dateFrom || clicked)) {
        setFilters(f => ({ ...f, dateTo: clicked })); setSelectingEnd(false);
      } else {
        setFilters(f => ({ ...f, dateFrom: clicked, dateTo: null }));
      }
    }
  };

  const doSearch = () => { setShowResults(true); };
  const resetSearch = () => { setFilters({ category: 'all', location: 'anywhere', dateFrom: null, dateTo: null, participants: 0 }); setShowResults(false); };

  const results = MOCK_CHALLENGES.filter(c => {
    if (filters.category !== 'all') {
      const catMap: Record<string, string> = { sport: 'Спорт', education: 'Обучение', quests: 'Квесты', art: 'Искусство', tech: 'Технологии' };
      if (c.category !== catMap[filters.category]) return false;
    }
    if (filters.location === 'online' && c.location !== 'Онлайн' && !c.location.includes('Онлайн')) return false;
    if (filters.location === 'moscow' && !c.location.includes('Москва')) return false;
    if (filters.location === 'spb' && !c.location.includes('Петербург')) return false;
    if (filters.participants > 0 && c.maxParticipants > filters.participants) return false;
    return true;
  });

  const renderCalendar = () => {
    const days = getDaysInMonth(currentYear, currentMonth);
    const first = getFirstDay(currentYear, currentMonth);
    const today = new Date(); today.setHours(0,0,0,0);
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const date = new Date(currentYear, currentMonth, d); date.setHours(0,0,0,0);
      const past = date < today;
      const isFrom = filters.dateFrom?.getTime() === date.getTime();
      const isTo = filters.dateTo?.getTime() === date.getTime();
      const inRange = filters.dateFrom && filters.dateTo && date > filters.dateFrom && date < filters.dateTo;
      cells.push(
        <button key={d} disabled={past} className={`cd ${past?'past':''} ${isFrom||isTo?'sel':''} ${inRange?'range':''}`}
          onClick={() => handleDateClick(d)}>{d}</button>
      );
    }
    return cells;
  };

  const nextMonth = () => { if (currentMonth===11){setCurrentMonth(0);setCurrentYear(y=>y+1);}else setCurrentMonth(m=>m+1); };
  const prevMonth = () => { if(currentYear===new Date().getFullYear()&&currentMonth===new Date().getMonth())return; if(currentMonth===0){setCurrentMonth(11);setCurrentYear(y=>y-1);}else setCurrentMonth(m=>m-1); };

  return (
    <div className="sp" ref={panelRef}>
      {/* Compact bar */}
      <button className="bar" onClick={() => { setIsOpen(true); setShowResults(false); }}>
        <div className="bar-seg" onClick={e=>{e.stopPropagation();setActiveTab('where');}}>
          <span className="bar-lbl">Куда</span>
        </div>
        <div className="bar-div" />
        <div className="bar-seg" onClick={e=>{e.stopPropagation();setActiveTab('when');}}>
          <span className="bar-lbl">Когда</span>
        </div>
        <div className="bar-div" />
        <div className="bar-seg" onClick={e=>{e.stopPropagation();setActiveTab('who');}}>
          <span className="bar-lbl">Места</span>
        </div>
        <div className="bar-go" onClick={e=>{e.stopPropagation();setIsOpen(true);setShowResults(false);}}>
          <Search size={14} color="white" strokeWidth={3} />
        </div>
      </button>

      {/* Full modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => { setIsOpen(false); setSelectingEnd(false); }}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-head">
              <div className="mh-tabs">
                {(['where','when','who'] as const).map(t => (
                  <button key={t} className={`mh-tab ${activeTab===t?'act':''}`} onClick={() => { setActiveTab(t); setShowResults(false); }}>
                    {t==='where'?'Куда':t==='when'?'Когда':'Места'}
                  </button>
                ))}
              </div>
              <button className="mh-close" onClick={() => { setIsOpen(false); setSelectingEnd(false); }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {!showResults ? (
              <div className="modal-body">
                {/* WHERE */}
                {activeTab === 'where' && (
                  <div className="mb-section">
                    <span className="mb-title">Категория</span>
                    <div className="pill-row">
                      {CATEGORIES.map(c => (
                        <button key={c.id} className={`pill ${filters.category===c.id?'act':''}`}
                          onClick={() => setFilters(f=>({...f,category:c.id}))}>
                          {c.icon} {c.label}
                        </button>
                      ))}
                    </div>
                    <span className="mb-title" style={{marginTop:16}}>Локация</span>
                    <div className="pill-row">
                      {LOCATIONS.map(l => (
                        <button key={l.id} className={`pill ${filters.location===l.id?'act':''}`}
                          onClick={() => setFilters(f=>({...f,location:l.id}))}>
                          {l.icon} {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* WHEN */}
                {activeTab === 'when' && (
                  <div className="mb-section">
                    <div className="cal-head">
                      <button className="cal-nav" onClick={prevMonth}><ChevronLeft size={16}/></button>
                      <span className="cal-title">{MONTHS_RU[currentMonth]} {currentYear}</span>
                      <button className="cal-nav" onClick={nextMonth}><ChevronRight size={16}/></button>
                    </div>
                    <div className="cal-grid">
                      {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=><div key={d} className="cal-dn">{d}</div>)}
                      {renderCalendar()}
                    </div>
                  </div>
                )}

                {/* WHO */}
                {activeTab === 'who' && (
                  <div className="mb-section">
                    <div className="who-row">
                      <div><span className="who-title">Мест</span><span className="who-desc">Макс. участников</span></div>
                      <div className="cnt">
                        <button className="cnt-b" onClick={()=>setFilters(f=>({...f,participants:Math.max(0,f.participants-5)}))} disabled={filters.participants<=0}>−</button>
                        <span className="cnt-v">{filters.participants||'∞'}</span>
                        <button className="cnt-b" onClick={()=>setFilters(f=>({...f,participants:f.participants+5}))}>+</button>
                      </div>
                    </div>
                    <div className="who-row">
                      <div><span className="who-title">Бесплатные</span><span className="who-desc">Без взноса</span></div>
                      <label className="tog"><input type="checkbox"/><span className="tog-s"/></label>
                    </div>
                    <div className="who-row">
                      <div><span className="who-title">С наградой</span><span className="who-desc">Реальные призы</span></div>
                      <label className="tog"><input type="checkbox"/><span className="tog-s"/></label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Results */
              <div className="modal-results">
                <div className="res-head">
                  <span className="res-count">Найдено: {results.length} челенджей</span>
                  <button className="res-reset" onClick={resetSearch}>Изменить фильтры</button>
                </div>
                <div className="res-grid">
                  {results.length > 0 ? results.map(c => {
                    const free = c.maxParticipants - c.participantsCount;
                    return (
                      <Link key={c.id} href={`/challenges/${c.id}`} className="res-card" onClick={() => setIsOpen(false)}>
                        <div className="rc-img">
                          <img src={c.imageUrl} alt={c.title}/>
                          <span className="rc-cat">{c.category}</span>
                        </div>
                        <div className="rc-body">
                          <div className="rc-top">
                            <span className="rc-org">{c.organizer}</span>
                            <h4 className="rc-title">{c.title}</h4>
                          </div>
                          <div className="rc-bottom">
                            <div className="rc-tags">
                              <span className="rc-tag ach">🏆 {c.achievement}</span>
                              <span className="rc-tag rew">🎁 {c.reward}</span>
                            </div>
                            <div className="rc-foot">
                              <span className="rc-slot"><Users size={12}/> {free} мест</span>
                              <span className="rc-date">до {c.endDate}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  }) : (
                    <div className="res-empty">
                      <span style={{fontSize:40}}>🔍</span>
                      <p>Ничего не найдено</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            {!showResults && (
              <div className="modal-foot">
                <button className="mf-reset" onClick={resetSearch}>Сбросить</button>
                <button className="mf-search" onClick={doSearch}>
                  <Search size={14}/> Показать ({results.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .sp { position: relative; z-index: 100; }

        .bar {
          display: flex; align-items: center; background: white;
          border-radius: 99px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #ebebeb; height: 48px; padding: 4px;
          cursor: pointer; transition: box-shadow 0.2s;
          min-width: 520px;
        }
        .bar:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .bar-seg { flex: 1; padding: 0 20px; height: 100%; display: flex; align-items: center; border-radius: 99px; }
        .bar-seg:hover { background: #f5f5f5; }
        .bar-lbl { font-size: 14px; font-weight: 600; color: #222; }
        .bar-div { width: 1px; height: 20px; background: #e5e7eb; flex-shrink: 0; }
        .bar-go {
          width: 36px; height: 36px; border-radius: 50%;
          background: #FF385C; display: grid; place-items: center;
          flex-shrink: 0; margin-left: 4px;
        }
        .bar-go:hover { background: #E31C5F; }

        /* Modal overlay */
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
          width: 100%; max-width: 680px; max-height: calc(100vh - 120px);
          display: flex; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          animation: slideUp 0.25s ease;
          overflow: hidden;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        /* Header */
        .modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid #f0f0f0;
        }
        .mh-tabs { display: flex; gap: 4px; }
        .mh-tab {
          padding: 8px 16px; border-radius: 99px; border: none;
          background: #f5f5f5; font-size: 13px; font-weight: 700;
          color: #666; cursor: pointer; transition: all 0.15s;
        }
        .mh-tab.act { background: #111; color: white; }
        .mh-tab:hover:not(.act) { background: #eee; }
        .mh-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: none; background: #f5f5f5;
          display: grid; place-items: center; cursor: pointer;
        }
        .mh-close:hover { background: #eee; }

        /* Body */
        .modal-body { padding: 20px; overflow-y: auto; flex: 1; }
        .mb-section {}
        .mb-title { font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 10px; }
        .pill-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .pill {
          display: flex; align-items: center; gap: 4px;
          padding: 10px 16px; border-radius: 99px;
          border: 1.5px solid #e5e7eb; background: white;
          font-size: 14px; font-weight: 600; color: #444;
          cursor: pointer; transition: all 0.15s;
        }
        .pill:hover { border-color: #aaa; }
        .pill.act { border-color: #111; background: #111; color: white; }

        /* Calendar */
        .cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .cal-nav { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e5e7eb; background: white; display: grid; place-items: center; cursor: pointer; }
        .cal-nav:hover { background: #f5f5f5; }
        .cal-title { font-size: 15px; font-weight: 800; color: #111; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .cal-dn { text-align: center; font-size: 12px; font-weight: 700; color: #aaa; padding: 6px 0; }
        .cd {
          aspect-ratio: 1; display: grid; place-items: center;
          border-radius: 50%; border: none; background: none;
          font-size: 14px; font-weight: 600; color: #222;
          cursor: pointer; transition: all 0.1s;
        }
        .cd:hover:not(.past) { background: #f0f0f0; }
        .cd.past { color: #ccc; cursor: default; }
        .cd.sel { background: #111; color: white; }
        .cd.range { background: #f5f5f5; border-radius: 0; }

        /* Who */
        .who-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
        .who-row:last-child { border-bottom: none; }
        .who-title { font-size: 15px; font-weight: 700; color: #222; display: block; }
        .who-desc { font-size: 12px; color: #aaa; }
        .cnt { display: flex; align-items: center; gap: 12px; }
        .cnt-b { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e5e7eb; background: white; font-size: 16px; font-weight: 600; color: #555; cursor: pointer; display: grid; place-items: center; }
        .cnt-b:hover:not(:disabled) { border-color: #111; color: #111; }
        .cnt-b:disabled { opacity: 0.3; }
        .cnt-v { font-size: 15px; font-weight: 700; min-width: 40px; text-align: center; }

        .tog { position: relative; width: 44px; height: 24px; cursor: pointer; }
        .tog input { display: none; }
        .tog-s { position: absolute; inset: 0; background: #e5e7eb; border-radius: 99px; transition: all 0.2s; }
        .tog-s::before { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .tog input:checked + .tog-s { background: #22c55e; }
        .tog input:checked + .tog-s::before { transform: translateX(20px); }

        /* Footer */
        .modal-foot { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid #f0f0f0; }
        .mf-reset { background: none; border: none; font-size: 14px; font-weight: 700; color: #222; text-decoration: underline; cursor: pointer; }
        .mf-search { display: flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 99px; background: #FF385C; color: white; border: none; font-size: 14px; font-weight: 800; cursor: pointer; }
        .mf-search:hover { background: #E31C5F; }

        /* Results */
        .modal-results { padding: 16px; overflow-y: auto; flex: 1; }
        .res-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .res-count { font-size: 14px; font-weight: 700; color: #111; }
        .res-reset { background: none; border: none; font-size: 13px; font-weight: 700; color: #FF385C; cursor: pointer; text-decoration: underline; }
        .res-grid { display: flex; flex-direction: column; gap: 10px; }

        .res-card {
          display: flex; background: #fafafa; border-radius: 16px;
          overflow: hidden; text-decoration: none; color: inherit;
          border: 1px solid #f0f0f0; transition: all 0.2s;
          height: 120px;
        }
        .res-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .rc-img { width: 160px; flex-shrink: 0; position: relative; overflow: hidden; }
        .rc-img img { width: 100%; height: 100%; object-fit: cover; }
        .rc-cat { position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
        .rc-body { flex: 1; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
        .rc-top { display: flex; flex-direction: column; gap: 2px; }
        .rc-org { font-size: 11px; color: #888; font-weight: 600; }
        .rc-title { font-size: 14px; font-weight: 800; color: #111; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rc-bottom { display: flex; flex-direction: column; gap: 4px; }
        .rc-tags { display: flex; gap: 4px; }
        .rc-tag { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        .rc-tag.ach { background: #fef3c7; color: #92400e; }
        .rc-tag.rew { background: #dcfce7; color: #166534; }
        .rc-foot { display: flex; justify-content: space-between; font-size: 11px; color: #888; font-weight: 600; }
        .rc-slot { display: flex; align-items: center; gap: 3px; }

        .res-empty { text-align: center; padding: 40px; }
        .res-empty p { font-size: 16px; font-weight: 700; color: #888; margin: 8px 0 0; }

        @media (max-width: 600px) {
          .modal-overlay { padding-top: 40px; padding: 40px 12px 12px; }
          .modal-panel { max-height: calc(100vh - 52px); }
          .bar { height: 44px; }
          .bar-seg { padding: 0 12px; }
          .bar-lbl { font-size: 13px; }
          .res-card { flex-direction: column; height: auto; }
          .rc-img { width: 100%; height: 120px; }
        }
      `}</style>
    </div>
  );
}
