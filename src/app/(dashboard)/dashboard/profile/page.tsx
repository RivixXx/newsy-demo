'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageShell } from '@/shared/components/page-shell';
import { ProfileTour } from '@/shared/components/profile-tour';
import {
  Trophy, Gift, Target, CheckCircle2, Clock,
  ChevronRight, Share2, Star, Flame, Medal,
  Settings, Bell, Shield, CreditCard, LogOut,
  TrendingUp, Zap, MapPin, Calendar, Users,
  ArrowUpRight, Eye, Heart, BarChart3, Sparkles,
  Camera, Edit3, Copy, ExternalLink, ChevronDown
} from 'lucide-react';
import {
  IconRocket, IconButterfly, IconMoon, IconTrophy,
  IconRun, IconWorld, IconHeartHandshake, IconSun, IconSchool
} from '@tabler/icons-react';
import Link from 'next/link';
import { logoutAction } from '@/modules/identity/actions';

const ACTIVE_CHALLENGES = [
  {
    id: '17', title: 'Утренний забег на 5км с Nike', category: 'Спорт',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=300&q=80',
    endDate: '27 июля 2026', stagesTotal: 4, stagesDone: 2, reward: 'Кроссовки Nike Air Max',
  },
  {
    id: '8', title: 'Выучить 100 слов на японском за неделю', category: 'Обучение',
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=300&q=80',
    endDate: '29 июля 2026', stagesTotal: 4, stagesDone: 1, reward: 'Курс японского',
  },
  {
    id: '13', title: 'Готовить новое блюдо каждую неделю', category: 'Квесты',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=300&q=80',
    endDate: '15 сентября 2026', stagesTotal: 4, stagesDone: 3, reward: 'Набор продуктов',
  },
];

const ACHIEVEMENTS = [
  { id: '1', icon: <IconRocket size={24} />, title: 'Первый старт', desc: 'Завершил первый челендж', earned: true, points: 50 },
  { id: '2', icon: <IconButterfly size={24} />, title: 'Социальная бабочка', desc: 'Поделился 5 челенджами', earned: true, points: 100 },
  { id: '3', icon: <IconMoon size={24} />, title: 'Полуночник', desc: 'Выполнил задание после полуночи', earned: true, points: 75 },
  { id: '4', icon: <IconTrophy size={24} />, title: 'Топ-100', desc: 'Вошёл в топ участников', earned: true, points: 200 },
  { id: '5', icon: <IconRun size={24} />, title: 'Марафонец', desc: 'Завершить 50 этапов', earned: false, progress: 32, total: 50, points: 500 },
  { id: '6', icon: <IconWorld size={24} />, title: 'Исследователь', desc: 'Посетить 10 локаций', earned: false, progress: 4, total: 10, points: 300 },
  { id: '7', icon: <IconHeartHandshake size={24} />, title: 'Командный игрок', desc: 'Вступить в кооперативный ЧЕ', earned: false, progress: 0, total: 1, points: 150 },
  { id: '8', icon: <IconSun size={24} />, title: 'Ранняя пташка', desc: 'Завершить ЧЕ до 8 утра', earned: false, progress: 0, total: 1, points: 100 },
];

const REWARDS = [
  { id: 'r1', icon: <IconRun size={28} />, title: 'Кроссовки Nike Air Max', from: 'Nike Run Club', expiry: '31 авг. 2026', used: false, code: 'NIKE-MAX-2026' },
  { id: 'r2', icon: <IconSchool size={28} />, title: 'Подписка Литрес 3 мес.', from: 'Литрес', expiry: '30 сент. 2026', used: false, code: 'LITRES-3M' },
  { id: 'r3', icon: <IconSun size={28} />, title: 'Кофе в подарок', from: 'Coffee Like', expiry: '15 июл. 2026', used: true, code: 'COFFEE-GIFT' },
];

const HISTORY = [
  { id: 'h1', title: 'Веломарафон по паркам Москвы', category: 'Спорт', date: '10 июня 2026', result: 'completed' as const, achievement: 'Велохроникёр', points: 200 },
  { id: 'h2', title: 'Читать по 30 минут каждый день', category: 'Обучение', date: '1 июня 2026', result: 'completed' as const, achievement: 'Книжный червь', points: 150 },
  { id: 'h3', title: 'Убрать мусор в парке', category: 'Квесты', date: '20 мая 2026', result: 'failed' as const, achievement: null, points: 0 },
];

const ACTIVITY_LOG = [
  { id: 'a1', text: 'Завершил этап "Пробежка 5км"', time: '2 часа назад', icon: <IconRun size={16} />, color: '#22c55e' },
  { id: 'a2', text: 'Получил достижение "Полуночник"', time: 'Вчера', icon: <IconMoon size={16} />, color: '#f59e0b' },
  { id: 'a3', text: 'Использовал награду "Кофе в подарок"', time: '3 дня назад', icon: <IconSun size={16} />, color: '#8b5cf6' },
  { id: 'a4', text: 'Вступил в челендж "Йога на закате"', time: '5 дней назад', icon: <IconRun size={16} />, color: '#FF385C' },
  { id: 'a5', text: 'Поделился челенджем с друзьями', time: '1 неделю назад', icon: <IconWorld size={16} />, color: '#3b82f6' },
];

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);

  return <>{display}</>;
}

function ProgressRing({ percent, size = 56, stroke = 4 }: { percent: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#ring-gradient)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF385C" />
          <stop offset="100%" stopColor="#ff8c00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StatCard({ icon, label, value, trend, color }: {
  icon: React.ReactNode; label: string; value: number; trend?: string; color: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="stat-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: 20, padding: '20px',
        border: '1px solid #f0f0f0',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}15`, color,
          display: 'grid', placeItems: 'center',
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 2 }}>
            <ArrowUpRight size={12} /> {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#111', lineHeight: 1 }}>
        <AnimatedNumber value={value} />
      </div>
      <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState<'overview' | 'active' | 'achievements' | 'rewards' | 'history' | 'settings'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const earnedCount = ACHIEVEMENTS.filter(a => a.earned).length;
  const completedCount = HISTORY.filter(h => h.result === 'completed').length;
  const totalPoints = ACHIEVEMENTS.filter(a => a.earned).reduce((s, a) => s + a.points, 0);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <PageShell>
      <ProfileTour />
      <div className="profile-page">

        {/* Hero Banner */}
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <div className="hero-left">
              <div className="avatar-container">
                <ProgressRing percent={75} size={96} stroke={4} />
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4"
                  alt="Avatar" className="avatar-img"
                />
                <button className="avatar-edit" title="Изменить фото" data-tour="avatar-edit">
                  <Camera size={14} />
                </button>
                <div className="level-pill">Ур. 12</div>
              </div>
              <div className="hero-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 className="hero-name">Alex Rivera</h1>
                  <button className="edit-name-btn" data-tour="edit-name"><Edit3 size={14} /></button>
                </div>
                <p className="hero-rank">
                  <Sparkles size={14} /> Элитный исследователь
                </p>
                <div className="hero-meta">
                  <span><MapPin size={13} /> Москва</span>
                  <span><Calendar size={13} /> С нами с янв. 2025</span>
                  <span><Users size={13} /> 12 друзей</span>
                </div>
              </div>
            </div>
            <div className="hero-actions">
              <button className="hero-btn hero-btn--primary" data-tour="hero-share">
                <Share2 size={15} /> Поделиться
              </button>
              <button className="hero-btn hero-btn--ghost" data-tour="hero-public">
                <ExternalLink size={15} /> Публичный профиль
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-grid">
          <StatCard icon={<Flame size={20} />} label="Активных" value={ACTIVE_CHALLENGES.length} trend="+2 за месяц" color="#FF385C" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Завершено" value={completedCount} trend="+1 за месяц" color="#22c55e" />
          <StatCard icon={<Trophy size={20} />} label="Достижений" value={earnedCount} color="#f59e0b" />
          <StatCard icon={<Zap size={20} />} label="Баллов" value={totalPoints} trend="+350" color="#8b5cf6" />
        </div>

        {/* Tabs */}
        <div className="tabs-bar" data-tour="tabs-bar">
          {([
            { key: 'overview', label: 'Обзор', icon: <BarChart3 size={15} /> },
            { key: 'active', label: 'Активные', icon: <Flame size={15} /> },
            { key: 'achievements', label: 'Достижения', icon: <Trophy size={15} /> },
            { key: 'rewards', label: 'Награды', icon: <Gift size={15} /> },
            { key: 'history', label: 'История', icon: <Clock size={15} /> },
            { key: 'settings', label: 'Настройки', icon: <Settings size={15} /> },
          ] as const).map(item => (
            <button
              key={item.key}
              className={`tab-btn ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              {item.icon} <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─────────────────────────── */}
        {tab === 'overview' && (
          <div className="tab-content fade-in">
            <div className="overview-grid">
              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title"><TrendingUp size={18} /> Последняя активность</h3>
                  <button className="card-link" onClick={() => setTab('history')}>Все →</button>
                </div>
                <div className="activity-list">
                  {ACTIVITY_LOG.map(a => (
                    <div key={a.id} className="activity-item">
                      <div className="activity-icon" style={{ background: `${a.color}18`, color: a.color }}>{a.icon}</div>
                      <div className="activity-body">
                        <span className="activity-text">{a.text}</span>
                        <span className="activity-time">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Achievements */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title"><Trophy size={18} /> Достижения</h3>
                  <button className="card-link" onClick={() => setTab('achievements')}>Все →</button>
                </div>
                <div className="ach-preview-grid">
                  {ACHIEVEMENTS.filter(a => a.earned).slice(0, 4).map(a => (
                    <div key={a.id} className="ach-mini">
                      <span className="ach-mini-icon">{a.icon}</span>
                      <span className="ach-mini-title">{a.title}</span>
                    </div>
                  ))}
                </div>
                <div className="ach-progress-bar-wrap">
                  <div className="ach-progress-header">
                    <span>{earnedCount} из {ACHIEVEMENTS.length}</span>
                    <span>{Math.round((earnedCount / ACHIEVEMENTS.length) * 100)}%</span>
                  </div>
                  <div className="ach-progress-track">
                    <div className="ach-progress-fill" style={{ width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Challenges Mini */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Flame size={18} /> Активные челенджи</h3>
                <button className="card-link" onClick={() => setTab('active')}>Все →</button>
              </div>
              <div className="active-mini-grid">
                {ACTIVE_CHALLENGES.map(ch => {
                  const pct = (ch.stagesDone / ch.stagesTotal) * 100;
                  return (
                    <div key={ch.id} className="active-mini-card">
                      <img src={ch.imageUrl} alt={ch.title} className="active-mini-img" />
                      <div className="active-mini-body">
                        <span className="active-mini-cat">{ch.category}</span>
                        <h4 className="active-mini-title">{ch.title}</h4>
                        <div className="active-mini-progress">
                          <div className="amp-track">
                            <div className="amp-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="amp-label">{ch.stagesDone}/{ch.stagesTotal}</span>
                        </div>
                      </div>
                      <button className="active-mini-go"><ChevronRight size={16} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── ACTIVE ─────────────────────────── */}
        {tab === 'active' && (
          <div className="tab-content fade-in">
            {ACTIVE_CHALLENGES.map((ch, i) => {
              const pct = (ch.stagesDone / ch.stagesTotal) * 100;
              return (
                <div key={ch.id} className="active-full-card" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="afc-img-wrap">
                    <img src={ch.imageUrl} alt={ch.title} className="afc-img" />
                    <div className="afc-badge">{ch.category}</div>
                  </div>
                  <div className="afc-body">
                    <div className="afc-top">
                      <div>
                        <h3 className="afc-title">{ch.title}</h3>
                        <p className="afc-reward"><Gift size={13} /> {ch.reward}</p>
                      </div>
                      <div className="afc-deadline">
                        <Clock size={13} /> До {ch.endDate}
                      </div>
                    </div>
                    <div className="afc-progress">
                      <div className="afc-prog-header">
                        <span>Прогресс</span>
                        <span className="afc-prog-pct">{Math.round(pct)}%</span>
                      </div>
                      <div className="afc-prog-track">
                        <div className="afc-prog-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="afc-steps">
                        {Array.from({ length: ch.stagesTotal }).map((_, si) => (
                          <div key={si} className={`afc-step ${si < ch.stagesDone ? 'done' : si === ch.stagesDone ? 'current' : ''}`}>
                            {si < ch.stagesDone ? <CheckCircle2 size={14} /> : <span>{si + 1}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="afc-continue">
                      Продолжить <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── ACHIEVEMENTS ────────────────────── */}
        {tab === 'achievements' && (
          <div className="tab-content fade-in">
            <div className="ach-grid">
              {ACHIEVEMENTS.map((a, i) => (
                <div
                  key={a.id}
                  className={`ach-card ${a.earned ? 'earned' : 'locked'}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {a.earned && <div className="ach-glow" />}
                  <div className="ach-icon-wrap">
                    <span className="ach-icon">{a.icon}</span>
                  </div>
                  <h4 className="ach-title">{a.title}</h4>
                  <p className="ach-desc">{a.desc}</p>
                  <div className="ach-points">+{a.points} баллов</div>
                  {!a.earned && a.progress !== undefined && (
                    <div className="ach-prog">
                      <div className="ach-prog-track">
                        <div className="ach-prog-fill" style={{ width: `${(a.progress / a.total!) * 100}%` }} />
                      </div>
                      <span className="ach-prog-label">{a.progress}/{a.total}</span>
                    </div>
                  )}
                  {a.earned && (
                    <div className="ach-earned-badge">
                      <CheckCircle2 size={12} /> Получено
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── REWARDS ─────────────────────────── */}
        {tab === 'rewards' && (
          <div className="tab-content fade-in">
            {REWARDS.map((r, i) => (
              <div
                key={r.id}
                className={`reward-card ${r.used ? 'used' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="rc-icon">{r.icon}</div>
                <div className="rc-body">
                  <h4 className="rc-title">{r.title}</h4>
                  <span className="rc-from">от {r.from}</span>
                  <span className="rc-expiry"><Clock size={12} /> До {r.expiry}</span>
                </div>
                <div className="rc-actions">
                  {r.used ? (
                    <span className="rc-used">Использована</span>
                  ) : (
                    <>
                      <button className="rc-code-btn" onClick={() => copyCode(r.code)}>
                        {copiedCode === r.code ? <><CheckCircle2 size={14} /> Скопировано</> : <><Copy size={14} /> {r.code}</>}
                      </button>
                      <button className="rc-use-btn">Использовать</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── HISTORY ──────────────────────────── */}
        {tab === 'history' && (
          <div className="tab-content fade-in">
            {HISTORY.map((h, i) => (
              <div key={h.id} className="history-row" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`hr-indicator ${h.result}`} />
                <div className="hr-body">
                  <span className="hr-cat">{h.category}</span>
                  <h4 className="hr-title">{h.title}</h4>
                  <span className="hr-date">{h.date}</span>
                  {h.achievement && (
                    <span className="hr-ach"><Medal size={12} /> {h.achievement} · +{h.points} баллов</span>
                  )}
                </div>
                <div className={`hr-status ${h.result}`}>
                  {h.result === 'completed' ? <><CheckCircle2 size={16} /> Завершён</> : <><Clock size={16} /> Не завершён</>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── SETTINGS ─────────────────────────── */}
        {tab === 'settings' && (
          <div className="tab-content fade-in">
            <div className="settings-grid">
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#FF385C18', color: '#FF385C' }}><Bell size={20} /></div>
                <div className="sc-body">
                  <h4>Уведомления</h4>
                  <p>Управление push и email уведомлениями</p>
                </div>
                <ChevronRight size={18} color="#ccc" />
              </div>
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#3b82f618', color: '#3b82f6' }}><Shield size={20} /></div>
                <div className="sc-body">
                  <h4>Безопасность</h4>
                  <p>Пароль, двухфакторная аутентификация</p>
                </div>
                <ChevronRight size={18} color="#ccc" />
              </div>
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#8b5cf618', color: '#8b5cf6' }}><CreditCard size={20} /></div>
                <div className="sc-body">
                  <h4>Оплата</h4>
                  <p>Способы оплаты и история транзакций</p>
                </div>
                <ChevronRight size={18} color="#ccc" />
              </div>
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#f59e0b18', color: '#f59e0b' }}><Eye size={20} /></div>
                <div className="sc-body">
                  <h4>Приватность</h4>
                  <p>Видимость профиля и данных</p>
                </div>
                <ChevronRight size={18} color="#ccc" />
              </div>
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#22c55e18', color: '#22c55e' }}><Heart size={20} /></div>
                <div className="sc-body">
                  <h4>Избранное</h4>
                  <p>Сохранённые челенджи</p>
                </div>
                <ChevronRight size={18} color="#ccc" />
              </div>
            </div>
            <div className="settings-danger">
              <form action={logoutAction}>
                <button type="submit" className="danger-btn">
                  <LogOut size={16} /> Выйти из аккаунта
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .profile-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px clamp(12px, 3vw, 24px) 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Hero */
        .hero {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          position: relative;
        }
        .hero-bg {
          height: 100px;
          background: linear-gradient(135deg, #fff5f7 0%, #ffe8ed 40%, #fff0f3 70%, #fef2f4 100%);
          position: relative;
        }
        .hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FF385C' fill-opacity='0.04'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-content {
          padding: 0 28px 24px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          position: relative;
        }
        .hero-left {
          display: flex;
          align-items: flex-end;
          gap: 20px;
          margin-top: -32px;
        }
        .avatar-container {
          position: relative;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .avatar-edit {
          position: absolute;
          bottom: 4px;
          right: -4px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FF385C;
          color: white;
          border: 2px solid white;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .avatar-edit:hover { transform: scale(1.1); }
        .level-pill {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          background: #111;
          color: white;
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
          border: 2px solid white;
        }
        .hero-info { padding-bottom: 4px; }
        .hero-name {
          font-size: 24px;
          font-weight: 900;
          margin: 0;
          color: #111;
        }
        .edit-name-btn {
          background: none;
          border: none;
          color: #bbb;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
        }
        .edit-name-btn:hover { color: #FF385C; background: #fff0f3; }
        .hero-rank {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #FF385C;
          font-weight: 700;
          margin: 4px 0 0;
        }
        .hero-meta {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }
        .hero-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #999;
          font-weight: 500;
        }
        .hero-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          padding-bottom: 4px;
        }
        .hero-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .hero-btn--primary {
          background: #FF385C;
          color: white;
          border: none;
        }
        .hero-btn--primary:hover { background: #E31C5F; transform: translateY(-1px); }
        .hero-btn--ghost {
          background: transparent;
          color: #444;
          border: 1.5px solid #e5e7eb;
        }
        .hero-btn--ghost:hover { border-color: #FF385C; color: #FF385C; }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        /* Tabs */
        .tabs-bar {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 4px 0;
        }
        .tabs-bar::-webkit-scrollbar { display: none; }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          background: white;
          font-size: 13px;
          font-weight: 700;
          color: #666;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .tab-btn.active {
          background: #111;
          border-color: #111;
          color: white;
        }
        .tab-btn:not(.active):hover {
          border-color: #FF385C;
          color: #FF385C;
        }

        /* Tab Content */
        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .fade-in {
          animation: fadeSlideUp 0.35s ease both;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Cards */
        .card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          border: 1px solid #f0f0f0;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 800;
          color: #111;
          margin: 0;
        }
        .card-link {
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 700;
          color: #FF385C;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .card-link:hover { opacity: 0.7; }

        /* Overview Grid */
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Activity */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f8f8f8;
          transition: background 0.15s;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .activity-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .activity-text { font-size: 13px; font-weight: 600; color: #333; }
        .activity-time { font-size: 11px; color: #aaa; }

        /* Achievement Preview */
        .ach-preview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .ach-mini {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          background: #fafafa;
          border-radius: 12px;
          transition: transform 0.2s;
        }
        .ach-mini:hover { transform: translateY(-2px); }
        .ach-mini-icon { font-size: 24px; }
        .ach-mini-title { font-size: 10px; font-weight: 700; color: #666; text-align: center; line-height: 1.2; }
        .ach-progress-bar-wrap { display: flex; flex-direction: column; gap: 6px; }
        .ach-progress-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #888; }
        .ach-progress-track { height: 6px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
        .ach-progress-fill { height: 100%; background: linear-gradient(90deg, #FF385C, #ff8c00); border-radius: 99px; transition: width 0.8s ease; }

        /* Active Mini */
        .active-mini-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .active-mini-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px;
          background: #fafafa;
          border-radius: 14px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .active-mini-card:hover { background: #f5f5f5; transform: translateX(4px); }
        .active-mini-img {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .active-mini-body { flex: 1; min-width: 0; }
        .active-mini-cat { font-size: 10px; font-weight: 800; color: #FF385C; text-transform: uppercase; letter-spacing: 0.06em; }
        .active-mini-title { font-size: 13px; font-weight: 700; color: #111; margin: 2px 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .active-mini-progress { display: flex; align-items: center; gap: 8px; }
        .amp-track { flex: 1; height: 4px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
        .amp-fill { height: 100%; background: linear-gradient(90deg, #FF385C, #ff8c00); border-radius: 99px; transition: width 0.6s ease; }
        .amp-label { font-size: 11px; font-weight: 700; color: #888; white-space: nowrap; }
        .active-mini-go {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: white;
          color: #888;
          display: grid;
          place-items: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .active-mini-go:hover { background: #FF385C; color: white; }

        /* Active Full Card */
        .active-full-card {
          display: flex;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
          animation: fadeSlideUp 0.35s ease both;
        }
        .afc-img-wrap {
          width: 220px;
          position: relative;
          flex-shrink: 0;
        }
        .afc-img { width: 100%; height: 100%; object-fit: cover; }
        .afc-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255,255,255,0.92);
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          backdrop-filter: blur(4px);
        }
        .afc-body {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .afc-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .afc-title { font-size: 17px; font-weight: 800; color: #111; margin: 0; }
        .afc-reward { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #22c55e; font-weight: 600; margin: 4px 0 0; }
        .afc-deadline { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #888; font-weight: 600; white-space: nowrap; }
        .afc-progress { display: flex; flex-direction: column; gap: 8px; }
        .afc-prog-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #888; }
        .afc-prog-pct { color: #FF385C; }
        .afc-prog-track { height: 6px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
        .afc-prog-fill { height: 100%; background: linear-gradient(90deg, #FF385C, #ff8c00); border-radius: 99px; transition: width 0.8s ease; }
        .afc-steps { display: flex; gap: 8px; }
        .afc-step {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 800;
          border: 2px solid #e5e7eb;
          color: #aaa;
          transition: all 0.3s;
        }
        .afc-step.done { border-color: #22c55e; background: #22c55e; color: white; }
        .afc-step.current { border-color: #FF385C; color: #FF385C; }
        .afc-continue {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          align-self: flex-start;
          padding: 10px 20px;
          border-radius: 12px;
          background: #FF385C;
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .afc-continue:hover { background: #E31C5F; transform: translateY(-1px); }

        /* Achievements Full */
        .ach-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }
        .ach-card {
          background: white;
          border-radius: 18px;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          border: 1.5px solid #f0f0f0;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
          animation: fadeSlideUp 0.35s ease both;
        }
        .ach-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .ach-card.locked { opacity: 0.5; filter: grayscale(0.5); }
        .ach-card.locked:hover { opacity: 0.7; filter: grayscale(0.3); }
        .ach-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(255,56,92,0.15), transparent 70%);
          border-radius: 50%;
        }
        .ach-icon-wrap {
          width: 52px;
          height: 52px;
          background: #fafafa;
          border-radius: 16px;
          display: grid;
          place-items: center;
        }
        .ach-icon { font-size: 26px; }
        .ach-title { font-size: 14px; font-weight: 800; color: #111; margin: 0; }
        .ach-desc { font-size: 11px; color: #888; line-height: 1.4; margin: 0; }
        .ach-points { font-size: 11px; font-weight: 800; color: #FF385C; }
        .ach-prog { width: 100%; display: flex; flex-direction: column; gap: 4px; }
        .ach-prog-track { width: 100%; height: 4px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
        .ach-prog-fill { height: 100%; background: linear-gradient(90deg, #FF385C, #ff8c00); border-radius: 99px; transition: width 0.8s ease; }
        .ach-prog-label { font-size: 10px; color: #aaa; font-weight: 700; text-align: center; }
        .ach-earned-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #22c55e;
          background: #f0fdf4;
          padding: 4px 10px;
          border-radius: 99px;
        }

        /* Rewards */
        .reward-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          border-radius: 18px;
          padding: 18px 20px;
          border: 1.5px solid #f0f0f0;
          transition: all 0.25s;
          animation: fadeSlideUp 0.35s ease both;
        }
        .reward-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .reward-card.used { opacity: 0.5; }
        .rc-icon {
          font-size: 32px;
          width: 52px;
          height: 52px;
          background: #fafafa;
          border-radius: 14px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .rc-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .rc-title { font-size: 15px; font-weight: 800; color: #111; margin: 0; }
        .rc-from { font-size: 12px; color: #888; font-weight: 600; }
        .rc-expiry { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #aaa; font-weight: 600; }
        .rc-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .rc-code-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          background: white;
          font-size: 12px;
          font-weight: 700;
          color: #555;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.2s;
        }
        .rc-code-btn:hover { border-color: #FF385C; color: #FF385C; }
        .rc-use-btn {
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          background: #FF385C;
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rc-use-btn:hover { background: #E31C5F; }
        .rc-used { font-size: 12px; font-weight: 700; color: #aaa; }

        /* History */
        .history-row {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          border-radius: 16px;
          padding: 16px 20px;
          border: 1.5px solid #f0f0f0;
          transition: all 0.2s;
          animation: fadeSlideUp 0.35s ease both;
        }
        .history-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .hr-indicator {
          width: 4px;
          height: 40px;
          border-radius: 99px;
          flex-shrink: 0;
        }
        .hr-indicator.completed { background: #22c55e; }
        .hr-indicator.failed { background: #e5e7eb; }
        .hr-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .hr-cat { font-size: 10px; font-weight: 800; color: #FF385C; text-transform: uppercase; letter-spacing: 0.06em; }
        .hr-title { font-size: 14px; font-weight: 700; color: #111; margin: 0; }
        .hr-date { font-size: 12px; color: #aaa; }
        .hr-ach { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #92400e; background: #fef3c7; padding: 3px 8px; border-radius: 99px; width: fit-content; margin-top: 2px; }
        .hr-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hr-status.completed { color: #22c55e; }
        .hr-status.failed { color: #aaa; }

        /* Settings */
        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .settings-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          border-radius: 16px;
          padding: 18px 20px;
          border: 1.5px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .settings-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateX(4px); }
        .sc-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .sc-body { flex: 1; }
        .sc-body h4 { font-size: 14px; font-weight: 700; color: #111; margin: 0; }
        .sc-body p { font-size: 12px; color: #888; margin: 2px 0 0; }
        .settings-danger {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }
        .danger-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1.5px solid #fecaca;
          background: #fef2f2;
          color: #dc2626;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .danger-btn:hover { background: #fee2e2; border-color: #f87171; }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-content { flex-direction: column; align-items: stretch; padding: 0 20px 20px; }
          .hero-actions { justify-content: stretch; }
          .hero-btn { flex: 1; justify-content: center; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .overview-grid { grid-template-columns: 1fr; }
          .ach-preview-grid { grid-template-columns: repeat(2, 1fr); }
          .afc-img-wrap { width: 140px; }
          .ach-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .profile-page { padding: 0 12px 60px; gap: 16px; }
          .hero-bg { height: 90px; }
          .hero-left { gap: 14px; }
          .avatar-img { width: 64px; height: 64px; }
          .avatar-edit { width: 24px; height: 24px; }
          .level-pill { font-size: 9px; padding: 1px 8px; }
          .hero-name { font-size: 20px; }
          .hero-meta { flex-wrap: wrap; gap: 8px; }
          .hero-actions { flex-direction: column; }
          .tab-label { display: none; }
          .tab-btn { padding: 10px 14px; }
          .active-full-card { flex-direction: column; }
          .afc-img-wrap { width: 100%; height: 160px; }
          .ach-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .ach-card { padding: 14px 10px; }
          .ach-icon { font-size: 22px; }
          .reward-card { flex-direction: column; text-align: center; gap: 12px; }
          .rc-actions { flex-direction: column; width: 100%; }
          .rc-code-btn, .rc-use-btn { width: 100%; justify-content: center; }
          .history-row { flex-direction: column; align-items: stretch; }
          .hr-indicator { width: 100%; height: 3px; }
          .hr-status { justify-content: center; padding-top: 8px; border-top: 1px solid #f0f0f0; }
          .settings-card { padding: 14px 16px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .hero-meta { display: none; }
        }
      `}</style>
    </PageShell>
  );
}
