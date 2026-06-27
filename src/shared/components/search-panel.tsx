'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Все категории', icon: '⚡' },
  { id: 'sport', label: 'Спорт', icon: '🏃' },
  { id: 'education', label: 'Обучение', icon: '📚' },
  { id: 'quests', label: 'Квесты', icon: '🗺️' },
  { id: 'art', label: 'Искусство', icon: '🎨' },
  { id: 'tech', label: 'Технологии', icon: '⚙️' },
];

const LOCATIONS = [
  { id: 'online', label: 'Онлайн', icon: '🌐' },
  { id: 'moscow', label: 'Москва', icon: '📍' },
  { id: 'spb', label: 'Санкт-Петербург', icon: '📍' },
  { id: 'anywhere', label: 'Любая локация', icon: '🌍' },
];

const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface SearchFilters {
  category: string;
  location: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  flexibleMonths: string[];
  flexibleDuration: string;
  participants: number;
}

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
  compact?: boolean;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function SearchPanel({ onSearch, compact = false }: SearchPanelProps) {
  const [activeTab, setActiveTab] = useState<'where' | 'when' | 'who'>('where');
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    location: 'anywhere',
    dateFrom: null,
    dateTo: null,
    flexibleMonths: [],
    flexibleDuration: 'week',
    participants: 0,
  });

  const [dateMode, setDateMode] = useState<'exact' | 'flexible'>('exact');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingEnd, setSelectingEnd] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (day: number) => {
    const clicked = new Date(currentYear, currentMonth, day);
    if (dateMode === 'exact') {
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
    }
  };

  const toggleFlexibleMonth = (month: string) => {
    setFilters(f => ({
      ...f,
      flexibleMonths: f.flexibleMonths.includes(month)
        ? f.flexibleMonths.filter(m => m !== month)
        : [...f.flexibleMonths, month],
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const formatWhenLabel = () => {
    if (dateMode === 'flexible') {
      if (filters.flexibleMonths.length === 0) return 'Когда?';
      const monthNames = filters.flexibleMonths.map(m => {
        const idx = parseInt(m);
        return MONTHS_RU[idx].substring(0, 3) + '.';
      });
      const duration = filters.flexibleDuration === 'weekend' ? 'Выходные'
        : filters.flexibleDuration === 'week' ? 'Неделя'
        : 'Месяц';
      return `${duration}, ${monthNames.join(', ')}`;
    }
    if (filters.dateFrom && filters.dateTo) {
      return `${filters.dateFrom.getDate()} ${MONTHS_RU[filters.dateFrom.getMonth()].substring(0, 3)} — ${filters.dateTo.getDate()} ${MONTHS_RU[filters.dateTo.getMonth()].substring(0, 3)}`;
    }
    if (filters.dateFrom) {
      return `${filters.dateFrom.getDate()} ${MONTHS_RU[filters.dateFrom.getMonth()].substring(0, 3)} — Выбор даты`;
    }
    return 'Когда?';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      date.setHours(0, 0, 0, 0);
      const isPast = date < today;
      const isFrom = filters.dateFrom && date.getTime() === filters.dateFrom.getTime();
      const isTo = filters.dateTo && date.getTime() === filters.dateTo.getTime();
      const isInRange = filters.dateFrom && filters.dateTo &&
        date > filters.dateFrom && date < filters.dateTo;
      const isHoveredRange = selectingEnd && filters.dateFrom && !filters.dateTo && date > filters.dateFrom;

      days.push(
        <button
          key={d}
          className={`cal-day ${isPast ? 'past' : ''} ${isFrom ? 'from' : ''} ${isTo ? 'to' : ''} ${isInRange ? 'in-range' : ''} ${isHoveredRange ? 'hover-range' : ''}`}
          onClick={() => !isPast && handleDateClick(d)}
          disabled={isPast}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const prevMonth = () => {
    const now = new Date();
    if (currentYear === now.getFullYear() && currentMonth === now.getMonth()) return;
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  return (
    <div className="search-panel-wrapper" ref={panelRef}>
      {/* Collapsed bar */}
      <div className="search-bar-collapsed" onClick={() => setIsOpen(!isOpen)}>
        <div className="bar-section" onClick={(e) => { e.stopPropagation(); setActiveTab('where'); setIsOpen(true); }}>
          <span className="bar-label">Что искать</span>
          <span className="bar-value">
            {filters.category === 'all' ? 'Все категории' : CATEGORIES.find(c => c.id === filters.category)?.label}
          </span>
        </div>
        <div className="bar-divider" />
        <div className="bar-section" onClick={(e) => { e.stopPropagation(); setActiveTab('when'); setIsOpen(true); }}>
          <span className="bar-label">Когда</span>
          <span className="bar-value">{formatWhenLabel()}</span>
        </div>
        <div className="bar-divider" />
        <div className="bar-section" onClick={(e) => { e.stopPropagation(); setActiveTab('who'); setIsOpen(true); }}>
          <span className="bar-label">Сколько мест</span>
          <span className="bar-value">{filters.participants > 0 ? `${filters.participants} мест` : 'Не важно'}</span>
        </div>
        <button className="search-btn" onClick={(e) => { e.stopPropagation(); handleSearch(); }}>
          <Search size={18} /> Поиск
        </button>
      </div>

      {/* Expanded panel */}
      {isOpen && (
        <div className="search-panel-expanded">
          {/* Tabs */}
          <div className="panel-tabs">
            {[
              { key: 'where', label: 'Где', sub: filters.category === 'all' ? 'Все категории' : CATEGORIES.find(c => c.id === filters.category)?.label },
              { key: 'when', label: 'Когда', sub: formatWhenLabel() },
              { key: 'who', label: 'Кто', sub: filters.participants > 0 ? `${filters.participants} мест` : 'Не важно' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`panel-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                <span className="ptab-label">{tab.label}</span>
                <span className="ptab-value">{tab.sub}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="panel-content">
            {/* WHERE TAB */}
            {activeTab === 'where' && (
              <div className="tab-section">
                <div className="section-columns">
                  <div className="section-col">
                    <h4 className="section-heading">Категория</h4>
                    <div className="option-grid">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          className={`option-card ${filters.category === cat.id ? 'selected' : ''}`}
                          onClick={() => setFilters(f => ({ ...f, category: cat.id }))}
                        >
                          <span className="opt-icon">{cat.icon}</span>
                          <span className="opt-label">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="section-col">
                    <h4 className="section-heading">Локация</h4>
                    <div className="option-grid">
                      {LOCATIONS.map(loc => (
                        <button
                          key={loc.id}
                          className={`option-card ${filters.location === loc.id ? 'selected' : ''}`}
                          onClick={() => setFilters(f => ({ ...f, location: loc.id }))}
                        >
                          <span className="opt-icon">{loc.icon}</span>
                          <span className="opt-label">{loc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WHEN TAB */}
            {activeTab === 'when' && (
              <div className="tab-section">
                <div className="date-mode-toggle">
                  <button className={`mode-btn ${dateMode === 'exact' ? 'active' : ''}`} onClick={() => setDateMode('exact')}>Точные даты</button>
                  <button className={`mode-btn ${dateMode === 'flexible' ? 'active' : ''}`} onClick={() => setDateMode('flexible')}>Гибко</button>
                </div>

                {dateMode === 'exact' ? (
                  <div className="calendar-section">
                    <div className="cal-header">
                      <button className="cal-nav" onClick={prevMonth}><ChevronLeft size={18} /></button>
                      <span className="cal-month">{MONTHS_RU[currentMonth]} {currentYear}</span>
                      <button className="cal-nav" onClick={nextMonth}><ChevronRight size={18} /></button>
                    </div>
                    <div className="cal-grid">
                      {DAYS_RU.map(d => <div key={d} className="cal-dayname">{d}</div>)}
                      {renderCalendar()}
                    </div>
                    <div className="cal-hint">
                      <span>Точная дата</span>
                      <span>± 1 день</span>
                      <span>± 2 дня</span>
                      <span>± 3 дня</span>
                      <span>± 7 дней</span>
                    </div>
                  </div>
                ) : (
                  <div className="flexible-section">
                    <p className="flex-question">На какой срок ищете челлендж?</p>
                    <div className="duration-pills">
                      {[
                        { id: 'weekend', label: 'Выходные' },
                        { id: 'week', label: 'Неделя' },
                        { id: 'month', label: 'Месяц' },
                      ].map(d => (
                        <button
                          key={d.id}
                          className={`dur-pill ${filters.flexibleDuration === d.id ? 'active' : ''}`}
                          onClick={() => setFilters(f => ({ ...f, flexibleDuration: d.id }))}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <p className="flex-question">Когда?</p>
                    <div className="month-scroll">
                      {[6, 7, 8, 9, 10, 11].map(m => (
                        <button
                          key={m}
                          className={`month-card ${filters.flexibleMonths.includes(String(m)) ? 'selected' : ''}`}
                          onClick={() => toggleFlexibleMonth(String(m))}
                        >
                          <Calendar size={20} />
                          <span>{MONTHS_RU[m]}</span>
                          <span className="month-year">{currentYear}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WHO TAB */}
            {activeTab === 'who' && (
              <div className="tab-section">
                <div className="participants-section">
                  <div className="part-row">
                    <div className="part-info">
                      <span className="part-title">Мест</span>
                      <span className="part-desc">Максимум участников в челлендже</span>
                    </div>
                    <div className="part-counter">
                      <button
                        className="cnt-btn"
                        onClick={() => setFilters(f => ({ ...f, participants: Math.max(0, f.participants - 10) }))}
                        disabled={filters.participants <= 0}
                      >−</button>
                      <span className="cnt-value">{filters.participants || 'Не важно'}</span>
                      <button
                        className="cnt-btn"
                        onClick={() => setFilters(f => ({ ...f, participants: f.participants + 10 }))}
                      >+</button>
                    </div>
                  </div>
                  <div className="part-row">
                    <div className="part-info">
                      <span className="part-title">Бесплатные</span>
                      <span className="part-desc">Только челленджи без взноса</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  <div className="part-row">
                    <div className="part-info">
                      <span className="part-title">С наградой</span>
                      <span className="part-desc">Только с реальными призами</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="panel-footer">
            <button className="footer-reset" onClick={() => setFilters({ category: 'all', location: 'anywhere', dateFrom: null, dateTo: null, flexibleMonths: [], flexibleDuration: 'week', participants: 0 })}>
              Сбросить
            </button>
            <button className="footer-search" onClick={handleSearch}>
              <Search size={16} /> Показать результаты
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .search-panel-wrapper {
          position: relative; width: 100%; max-width: 850px;
          margin: 0 auto; z-index: 100;
        }
        .search-bar-collapsed {
          display: flex; align-items: center; background: white;
          border-radius: 99px; box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          border: 1px solid #e5e7eb; overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .search-bar-collapsed:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.16);
        }
        .bar-section {
          flex: 1; padding: 14px 24px; cursor: pointer;
          display: flex; flex-direction: column; gap: 2px;
          transition: background 0.15s;
        }
        .bar-section:hover { background: #f5f5f5; }
        .bar-label {
          font-size: 11px; font-weight: 800; color: #111;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .bar-value {
          font-size: 14px; color: #666; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .bar-divider { width: 1px; height: 32px; background: #e5e7eb; flex-shrink: 0; }
        .search-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 28px; margin: 6px;
          background: linear-gradient(135deg, #FF385C, #E31C5F);
          color: white; border: none; border-radius: 99px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap; flex-shrink: 0;
        }
        .search-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 16px rgba(255,56,92,0.4);
        }

        /* Expanded Panel */
        .search-panel-expanded {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: white; border-radius: 24px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.18);
          border: 1px solid #e5e7eb; overflow: hidden;
          animation: panelSlide 0.25s ease;
        }
        @keyframes panelSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Tabs */
        .panel-tabs {
          display: flex; border-bottom: 1px solid #f0f0f0;
          padding: 0 24px;
        }
        .panel-tab {
          padding: 16px 20px; border: none; background: none;
          cursor: pointer; display: flex; flex-direction: column;
          gap: 2px; border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .panel-tab.active {
          border-bottom-color: #111;
        }
        .ptab-label {
          font-size: 12px; font-weight: 800; color: #111;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .ptab-value {
          font-size: 14px; color: #666; font-weight: 500;
        }

        /* Content */
        .panel-content { padding: 24px; min-height: 300px; }
        .tab-section { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* WHERE */
        .section-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .section-heading {
          font-size: 14px; font-weight: 800; color: #111;
          margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.03em;
        }
        .option-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .option-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border-radius: 14px;
          border: 1.5px solid #e5e7eb; background: white;
          cursor: pointer; transition: all 0.15s;
        }
        .option-card:hover { border-color: #aaa; }
        .option-card.selected { border-color: #111; background: #f8f8f8; }
        .opt-icon { font-size: 22px; }
        .opt-label { font-size: 14px; font-weight: 600; color: #333; }

        /* WHEN - Calendar */
        .date-mode-toggle {
          display: flex; gap: 4px; background: #f0f0f0;
          border-radius: 10px; padding: 4px; margin-bottom: 24px;
          width: fit-content;
        }
        .mode-btn {
          padding: 10px 24px; border: none; border-radius: 8px;
          background: transparent; font-size: 14px; font-weight: 700;
          color: #666; cursor: pointer; transition: all 0.2s;
        }
        .mode-btn.active { background: white; color: #111; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        .calendar-section { display: flex; flex-direction: column; gap: 16px; }
        .cal-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .cal-nav {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e5e7eb; background: white;
          display: grid; place-items: center; cursor: pointer;
          transition: all 0.15s;
        }
        .cal-nav:hover { background: #f5f5f5; }
        .cal-month { font-size: 16px; font-weight: 800; color: #111; }
        .cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
        }
        .cal-dayname {
          text-align: center; font-size: 12px; font-weight: 700;
          color: #888; padding: 8px 0;
        }
        .cal-day {
          aspect-ratio: 1; display: grid; place-items: center;
          border-radius: 50%; border: none; background: none;
          font-size: 14px; font-weight: 600; color: #111;
          cursor: pointer; transition: all 0.15s;
        }
        .cal-day:hover:not(.past):not(.empty) { background: #f0f0f0; }
        .cal-day.past { color: #ccc; cursor: default; }
        .cal-day.empty { cursor: default; }
        .cal-day.from { background: #111; color: white; }
        .cal-day.to { background: #111; color: white; }
        .cal-day.in-range { background: #f0f0f0; border-radius: 0; }
        .cal-day.hover-range { background: #f8f8f8; border-radius: 0; }
        .cal-hint {
          display: flex; gap: 12px; padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }
        .cal-hint span {
          padding: 8px 14px; border-radius: 99px;
          border: 1px solid #e5e7eb; font-size: 13px;
          font-weight: 600; color: #555; cursor: pointer;
          transition: all 0.15s;
        }
        .cal-hint span:first-child { border-color: #111; color: #111; }
        .cal-hint span:hover { border-color: #aaa; }

        /* WHEN - Flexible */
        .flexible-section { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .flex-question {
          font-size: 18px; font-weight: 800; color: #111; margin: 0;
        }
        .duration-pills { display: flex; gap: 8px; }
        .dur-pill {
          padding: 12px 28px; border-radius: 99px;
          border: 1.5px solid #e5e7eb; background: white;
          font-size: 14px; font-weight: 700; color: #333;
          cursor: pointer; transition: all 0.15s;
        }
        .dur-pill:hover { border-color: #aaa; }
        .dur-pill.active { border-color: #111; background: #111; color: white; }
        .month-scroll {
          display: flex; gap: 12px; overflow-x: auto;
          padding-bottom: 8px; scrollbar-width: none;
        }
        .month-scroll::-webkit-scrollbar { display: none; }
        .month-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 20px 24px; border-radius: 16px;
          border: 1.5px solid #e5e7eb; background: white;
          cursor: pointer; transition: all 0.2s; min-width: 100px;
        }
        .month-card:hover { border-color: #aaa; }
        .month-card.selected { border-color: #111; background: #111; color: white; }
        .month-card span { font-size: 14px; font-weight: 700; }
        .month-year { font-size: 12px; color: #888; }
        .month-card.selected .month-year { color: rgba(255,255,255,0.7); }

        /* WHO */
        .participants-section { display: flex; flex-direction: column; gap: 0; }
        .part-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 0; border-bottom: 1px solid #f0f0f0;
        }
        .part-row:last-child { border-bottom: none; }
        .part-info { display: flex; flex-direction: column; gap: 4px; }
        .part-title { font-size: 16px; font-weight: 700; color: #111; }
        .part-desc { font-size: 13px; color: #888; }
        .part-counter {
          display: flex; align-items: center; gap: 16px;
        }
        .cnt-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1.5px solid #e5e7eb; background: white;
          font-size: 18px; font-weight: 600; color: #555;
          cursor: pointer; display: grid; place-items: center;
          transition: all 0.15s;
        }
        .cnt-btn:hover:not(:disabled) { border-color: #111; color: #111; }
        .cnt-btn:disabled { opacity: 0.3; cursor: default; }
        .cnt-value { font-size: 16px; font-weight: 700; min-width: 60px; text-align: center; }

        /* Toggle */
        .toggle { position: relative; width: 48px; height: 28px; cursor: pointer; }
        .toggle input { display: none; }
        .toggle-slider {
          position: absolute; inset: 0; background: #e5e7eb;
          border-radius: 99px; transition: all 0.2s;
        }
        .toggle-slider::before {
          content: ''; position: absolute; top: 3px; left: 3px;
          width: 22px; height: 22px; border-radius: 50%;
          background: white; transition: transform 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .toggle input:checked + .toggle-slider { background: #22c55e; }
        .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

        /* Footer */
        .panel-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px; border-top: 1px solid #f0f0f0;
        }
        .footer-reset {
          background: none; border: none; font-size: 14px;
          font-weight: 700; color: #111; text-decoration: underline;
          cursor: pointer;
        }
        .footer-search {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 99px;
          background: linear-gradient(135deg, #FF385C, #E31C5F);
          color: white; border: none; font-size: 15px;
          font-weight: 800; cursor: pointer;
          transition: transform 0.15s;
        }
        .footer-search:hover { transform: scale(1.03); }

        @media (max-width: 768px) {
          .bar-section { padding: 12px 16px; }
          .bar-value { font-size: 12px; }
          .search-btn { padding: 12px 20px; font-size: 14px; margin: 4px; }
          .panel-content { padding: 16px; }
          .section-columns { grid-template-columns: 1fr; gap: 24px; }
          .option-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .search-bar-collapsed { flex-direction: column; border-radius: 20px; }
          .bar-section { width: 100%; padding: 14px 20px; }
          .bar-divider { width: 100%; height: 1px; }
          .search-btn { width: calc(100% - 12px); justify-content: center; margin: 6px; }
          .panel-tabs { overflow-x: auto; }
          .panel-tab { padding: 12px 14px; min-width: 80px; }
          .cal-grid { gap: 2px; }
          .cal-day { font-size: 12px; }
          .month-scroll { gap: 8px; }
          .month-card { min-width: 80px; padding: 16px; }
        }
      `}</style>
    </div>
  );
}
