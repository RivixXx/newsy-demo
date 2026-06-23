'use client';

import React, { useState } from 'react';
import { PageShell } from '@/shared/components/page-shell';
import {
  Trophy, Gift, Target, CheckCircle2, Clock,
  ChevronRight, Share2, Star, Flame, Medal
} from 'lucide-react';
import Link from 'next/link';

// ─── Моки активных и прошедших ЧЕ ─────────────────────────────────────────
const ACTIVE_CHALLENGES = [
  {
    id: '17', title: 'Утренний забег на 5км с Nike', category: 'Спорт',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=300&q=80',
    endDate: '27 июля 2026', stagesTotal: 4, stagesDone: 2, status: 'active' as const,
  },
  {
    id: '8', title: 'Выучить 100 слов на японском за неделю', category: 'Обучение',
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=300&q=80',
    endDate: '29 июля 2026', stagesTotal: 4, stagesDone: 1, status: 'active' as const,
  },
  {
    id: '13', title: 'Готовить новое блюдо каждую неделю', category: 'Квесты',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=300&q=80',
    endDate: '15 сентября 2026', stagesTotal: 4, stagesDone: 3, status: 'active' as const,
  },
];

const ACHIEVEMENTS = [
  { id: '1', icon: '🚀', title: 'Первый старт', desc: 'Завершил первый челендж', isEarned: true },
  { id: '2', icon: '🦋', title: 'Социальная бабочка', desc: 'Поделился 5 челенджами', isEarned: true },
  { id: '3', icon: '🦉', title: 'Полуночник', desc: 'Выполнил задание после полуночи', isEarned: true },
  { id: '4', icon: '🏆', title: 'Топ-100', desc: 'Вошёл в топ участников', isEarned: true },
  { id: '5', icon: '🏃', title: 'Марафонец', desc: 'Завершить 50 этапов', isEarned: false, progress: 32, total: 50 },
  { id: '6', icon: '🗺️', title: 'Исследователь', desc: 'Посетить 10 локаций', isEarned: false, progress: 4, total: 10 },
  { id: '7', icon: '🤝', title: 'Командный игрок', desc: 'Вступить в кооперативный ЧЕ', isEarned: false, progress: 0, total: 1 },
  { id: '8', icon: '☀️', title: 'Ранняя пташка', desc: 'Завершить ЧЕ до 8 утра', isEarned: false, progress: 0, total: 1 },
];

const REWARDS = [
  { id: 'r1', icon: '👟', title: 'Кроссовки Nike Air Max', from: 'Nike Run Club', expiry: '31 авг. 2026', used: false },
  { id: 'r2', icon: '📚', title: 'Подписка Литрес 3 мес.', from: 'Литрес', expiry: '30 сент. 2026', used: false },
  { id: 'r3', icon: '☕', title: 'Кофе в подарок', from: 'Coffee Like', expiry: '15 июл. 2026', used: true },
];

const HISTORY = [
  {
    id: 'h1', title: 'Веломарафон по паркам Москвы',
    imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=300&q=80',
    category: 'Спорт', completedAt: '10 июня 2026', result: 'completed' as const,
    achievement: 'Велохроникёр',
  },
  {
    id: 'h2', title: 'Читать по 30 минут каждый день',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=300&q=80',
    category: 'Обучение', completedAt: '1 июня 2026', result: 'completed' as const,
    achievement: 'Книжный червь',
  },
  {
    id: 'h3', title: 'Убрать мусор в ближайшем парке',
    imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?auto=format&fit=crop&w=300&q=80',
    category: 'Квесты', completedAt: '20 мая 2026', result: 'failed' as const,
    achievement: null,
  },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<'active' | 'achievements' | 'rewards' | 'history'>('active');

  const earnedCount = ACHIEVEMENTS.filter(a => a.isEarned).length;
  const completedCount = HISTORY.filter(h => h.result === 'completed').length;

  return (
    <PageShell>
      <div className="profile-wrap">

        {/* Шапка профиля */}
        <div className="profile-header">
          <div className="avatar-block">
            <div className="avatar-ring">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                alt="Avatar"
                className="avatar-img"
              />
              <div className="level-badge">Ур. 12</div>
            </div>
            <div className="user-info">
              <h1 className="user-name">Alex Rivera</h1>
              <p className="user-rank">
                <Star size={14} /> Элитный исследователь
              </p>
            </div>
            <button className="share-btn" title="Поделиться профилем">
              <Share2 size={18} />
            </button>
          </div>

          {/* Быстрые метрики */}
          <div className="quick-stats">
            <div className="qs-item">
              <span className="qs-val">{ACTIVE_CHALLENGES.length}</span>
              <span className="qs-label">Активных</span>
            </div>
            <div className="qs-div" />
            <div className="qs-item">
              <span className="qs-val">{completedCount}</span>
              <span className="qs-label">Завершено</span>
            </div>
            <div className="qs-div" />
            <div className="qs-item">
              <span className="qs-val">{earnedCount}</span>
              <span className="qs-label">Достижений</span>
            </div>
            <div className="qs-div" />
            <div className="qs-item">
              <span className="qs-val">{REWARDS.filter(r => !r.used).length}</span>
              <span className="qs-label">Наград</span>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="profile-nav">
          {([
            { key: 'active', label: 'Активные ЧЕ', icon: <Flame size={15} /> },
            { key: 'achievements', label: 'Достижения', icon: <Trophy size={15} /> },
            { key: 'rewards', label: 'Награды', icon: <Gift size={15} /> },
            { key: 'history', label: 'История ЧЕ', icon: <Clock size={15} /> },
          ] as const).map(item => (
            <button
              key={item.key}
              className={`pnav-btn ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* ─── Активные ЧЕ ─────────────────────── */}
        {tab === 'active' && (
          <div className="tab-section">
            {ACTIVE_CHALLENGES.map(ch => {
              const progress = (ch.stagesDone / ch.stagesTotal) * 100;
              return (
                <div key={ch.id} className="active-card">
                  <img src={ch.imageUrl} alt={ch.title} className="active-card-img" />
                  <div className="active-card-body">
                    <div className="active-card-top">
                      <span className="active-category">{ch.category}</span>
                      <span className="active-status">
                        <Clock size={13} /> До {ch.endDate}
                      </span>
                    </div>
                    <h3 className="active-title">{ch.title}</h3>
                    <div className="progress-wrap">
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="progress-label">{ch.stagesDone} / {ch.stagesTotal} этапов</span>
                    </div>
                    <button className="active-btn">
                      Продолжить <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
            {ACTIVE_CHALLENGES.length === 0 && (
              <div className="empty-state">
                <Target size={48} color="#ccc" />
                <p>Нет активных челенджей</p>
                <Link href="/" className="empty-link">Перейти в каталог →</Link>
              </div>
            )}
          </div>
        )}

        {/* ─── Достижения ─────────────────────────── */}
        {tab === 'achievements' && (
          <div className="tab-section">
            <div className="achievements-grid">
              {ACHIEVEMENTS.map(ach => (
                <div key={ach.id} className={`ach-card ${ach.isEarned ? 'earned' : 'locked'}`}>
                  <div className="ach-icon">{ach.icon}</div>
                  <div className="ach-title">{ach.title}</div>
                  <div className="ach-desc">{ach.desc}</div>
                  {ach.isEarned ? (
                    <CheckCircle2 size={16} className="ach-check" />
                  ) : (
                    'progress' in ach && ach.progress !== undefined && (
                      <div className="ach-progress">
                        <div className="ach-prog-track">
                          <div className="ach-prog-fill" style={{ width: `${(ach.progress / ach.total!) * 100}%` }} />
                        </div>
                        <span>{ach.progress}/{ach.total}</span>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Награды ─────────────────────────────── */}
        {tab === 'rewards' && (
          <div className="tab-section">
            {REWARDS.map(r => (
              <div key={r.id} className={`reward-item ${r.used ? 'used' : ''}`}>
                <div className="reward-icon-big">{r.icon}</div>
                <div className="reward-info">
                  <span className="reward-title">{r.title}</span>
                  <span className="reward-from">от {r.from}</span>
                  <span className="reward-expiry">
                    <Clock size={12} /> Действует до {r.expiry}
                  </span>
                </div>
                <button className={`reward-use-btn ${r.used ? 'disabled' : ''}`} disabled={r.used}>
                  {r.used ? 'Использована' : 'Использовать'}
                </button>
              </div>
            ))}
            {REWARDS.length === 0 && (
              <div className="empty-state">
                <Gift size={48} color="#ccc" />
                <p>Пока нет наград</p>
                <p className="empty-sub">Выполняй челенджи — получай реальные призы</p>
              </div>
            )}
          </div>
        )}

        {/* ─── История ЧЕ ──────────────────────────── */}
        {tab === 'history' && (
          <div className="tab-section">
            {HISTORY.map(h => (
              <div key={h.id} className="history-item">
                <img src={h.imageUrl} alt={h.title} className="history-img" />
                <div className="history-body">
                  <span className="history-category">{h.category}</span>
                  <span className="history-title">{h.title}</span>
                  <span className="history-date">{h.completedAt}</span>
                  {h.achievement && (
                    <span className="history-achievement">
                      <Medal size={13} /> {h.achievement}
                    </span>
                  )}
                </div>
                <div className={`history-result ${h.result}`}>
                  {h.result === 'completed' ? (
                    <><CheckCircle2 size={16} /> Завершён</>
                  ) : (
                    <><Clock size={16} /> Не завершён</>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style jsx>{`
        .profile-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 24px 20px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Header */
        .profile-header {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .avatar-block {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .avatar-ring {
          width: 72px; height: 72px;
          position: relative; flex-shrink: 0;
        }

        .avatar-img {
          width: 100%; height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #FF385C;
        }

        .level-badge {
          position: absolute; bottom: -4px; left: 50%;
          transform: translateX(-50%);
          background: #111; color: white;
          padding: 2px 8px; border-radius: 99px;
          font-size: 10px; font-weight: 800;
          white-space: nowrap;
          border: 2px solid white;
        }

        .user-info { flex: 1; }

        .user-name {
          font-size: 22px; font-weight: 900;
          margin: 0; color: #111;
        }

        .user-rank {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; color: #888; font-weight: 600; margin: 4px 0 0;
        }

        .share-btn {
          width: 40px; height: 40px; border-radius: 12px;
          border: 1px solid #e5e7eb; background: transparent;
          color: #444; display: grid; place-items: center;
          cursor: pointer; transition: background 0.2s;
        }

        .share-btn:hover { background: #f5f5f5; }

        .quick-stats {
          display: flex; align-items: center;
          background: #f8f8f8; border-radius: 16px; padding: 14px;
        }

        .qs-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .qs-val { font-size: 20px; font-weight: 900; color: #111; }
        .qs-label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
        .qs-div { width: 1px; height: 28px; background: #e5e7eb; }

        /* Nav */
        .profile-nav {
          display: flex; gap: 6px;
          overflow-x: auto; scrollbar-width: none;
          padding-bottom: 2px;
        }
        .profile-nav::-webkit-scrollbar { display: none; }

        .pnav-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 12px;
          border: 1.5px solid #e5e7eb; background: white;
          font-size: 13px; font-weight: 700; color: #666;
          cursor: pointer; white-space: nowrap;
          transition: all 0.2s; flex-shrink: 0;
        }

        .pnav-btn.active {
          background: #111; border-color: #111; color: white;
        }

        .pnav-btn:not(.active):hover {
          border-color: #FF385C; color: #FF385C;
        }

        /* Tab content */
        .tab-section {
          display: flex; flex-direction: column; gap: 14px;
        }

        /* Active challenges */
        .active-card {
          display: flex; gap: 0;
          background: white; border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
        }

        .active-card-img {
          width: 110px; object-fit: cover; flex-shrink: 0;
        }

        .active-card-body {
          flex: 1; padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
        }

        .active-card-top {
          display: flex; justify-content: space-between; align-items: center;
        }

        .active-category {
          font-size: 11px; font-weight: 800; color: #FF385C;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        .active-status {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #888; font-weight: 600;
        }

        .active-title {
          font-size: 15px; font-weight: 800; color: #111;
          margin: 0; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .progress-wrap { display: flex; flex-direction: column; gap: 5px; }

        .progress-track {
          height: 6px; background: #f0f0f0; border-radius: 99px; overflow: hidden;
        }

        .progress-bar {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #FF385C, #ff8c00);
          transition: width 0.5s ease;
        }

        .progress-label { font-size: 11px; color: #888; font-weight: 600; }

        .active-btn {
          display: flex; align-items: center; gap: 4px;
          background: #FF385C; color: white;
          border: none; padding: 9px 16px;
          border-radius: 10px; font-size: 13px; font-weight: 800;
          cursor: pointer; align-self: flex-start;
          transition: background 0.2s, transform 0.1s;
        }

        .active-btn:hover { background: #E31C5F; transform: translateY(-1px); }

        /* Achievements */
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 14px;
        }

        .ach-card {
          background: white; border-radius: 18px; padding: 18px 14px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          border: 1.5px solid #f0f0f0;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }

        .ach-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

        .ach-card.locked { opacity: 0.55; filter: grayscale(0.6); }

        .ach-icon { font-size: 32px; }

        .ach-title { font-size: 13px; font-weight: 800; color: #111; }
        .ach-desc { font-size: 11px; color: #888; line-height: 1.4; }

        .ach-check { color: #22c55e; position: absolute; top: 10px; right: 10px; }

        .ach-progress {
          width: 100%; display: flex; flex-direction: column; gap: 4px; align-items: center;
        }

        .ach-prog-track {
          width: 100%; height: 4px; background: #f0f0f0; border-radius: 99px; overflow: hidden;
        }

        .ach-prog-fill {
          height: 100%; background: #FF385C; border-radius: 99px;
        }

        .ach-progress span { font-size: 10px; color: #aaa; font-weight: 700; }

        /* Rewards */
        .reward-item {
          display: flex; align-items: center; gap: 14px;
          background: white; border-radius: 18px; padding: 16px 18px;
          border: 1.5px solid #f0f0f0;
          transition: box-shadow 0.2s;
        }

        .reward-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .reward-item.used { opacity: 0.5; }

        .reward-icon-big {
          font-size: 36px; flex-shrink: 0;
          width: 56px; height: 56px;
          background: #f8f8f8; border-radius: 16px;
          display: grid; place-items: center;
        }

        .reward-info {
          flex: 1; display: flex; flex-direction: column; gap: 3px;
        }

        .reward-title { font-size: 15px; font-weight: 800; color: #111; }
        .reward-from { font-size: 12px; color: #888; font-weight: 600; }

        .reward-expiry {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #aaa; font-weight: 600;
        }

        .reward-use-btn {
          padding: 10px 16px; border-radius: 12px;
          border: none; background: #FF385C; color: white;
          font-size: 13px; font-weight: 800;
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .reward-use-btn:hover:not(.disabled) { background: #E31C5F; }
        .reward-use-btn.disabled { background: #e5e7eb; color: #aaa; cursor: default; }

        /* History */
        .history-item {
          display: flex; align-items: center; gap: 14px;
          background: white; border-radius: 18px;
          overflow: hidden; border: 1.5px solid #f0f0f0;
        }

        .history-img {
          width: 80px; height: 80px; object-fit: cover; flex-shrink: 0;
        }

        .history-body {
          flex: 1; display: flex; flex-direction: column; gap: 4px;
          padding: 10px 0;
        }

        .history-category {
          font-size: 10px; font-weight: 800; color: #FF385C;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        .history-title { font-size: 14px; font-weight: 800; color: #111; }
        .history-date { font-size: 12px; color: #aaa; font-weight: 600; }

        .history-achievement {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 700;
          color: #92400e; background: #fef3c7;
          padding: 3px 8px; border-radius: 99px; width: fit-content;
        }

        .history-result {
          display: flex; align-items: center; gap: 5px;
          padding: 0 16px; font-size: 12px; font-weight: 800;
          white-space: nowrap; flex-shrink: 0;
        }

        .history-result.completed { color: #22c55e; }
        .history-result.failed { color: #aaa; }

        /* Empty */
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 60px 20px; text-align: center; color: #aaa;
        }

        .empty-state p { font-size: 16px; font-weight: 700; margin: 0; }
        .empty-sub { font-size: 13px !important; font-weight: 500 !important; }

        .empty-link {
          color: #FF385C; font-weight: 800; text-decoration: none;
          font-size: 15px;
        }

        @media (max-width: 600px) {
          .quick-stats { gap: 0; }
          .achievements-grid { grid-template-columns: repeat(3, 1fr); }
          .active-card-img { width: 80px; }
        }
      `}</style>
    </PageShell>
  );
}
