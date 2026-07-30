'use client';

import React from 'react';
import { Crown, Flame, MapPin, Calendar } from 'lucide-react';

interface LevelInfo {
  level: number;
  name: string;
  xp: number;
  color: string;
  xpInLevel: number;
  xpNeeded: number;
  progress: number;
}

interface ProfileHeroProps {
  name: string;
  email: string;
  level: LevelInfo;
  points: number;
  streak: number;
  isOrganizer: boolean;
  gender?: string | null;
  birthDate?: string | null;
  avatarUrl?: string;
}

export function ProfileHero({ name, email, level, points, streak, isOrganizer, gender, birthDate, avatarUrl }: ProfileHeroProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const genderLabel = gender === 'male' ? 'Мужчина' : gender === 'female' ? 'Женщина' : null;
  let age: number | null = null;
  if (birthDate) {
    const bd = new Date(birthDate);
    const today = new Date();
    age = today.getFullYear() - bd.getFullYear();
  }

  return (
    <div className="ph-card">
      {/* Header with gradient */}
      <div className="ph-header">
        <div className="ph-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="ph-avatar-img" />
          ) : (
            <span className="ph-avatar-text">{initials}</span>
          )}
          <div className="ph-level-badge">
            <Crown size={12} />
            <span>{level.level}</span>
          </div>
        </div>

        <div className="ph-info">
          <h1 className="ph-name">{name}</h1>
          <p className="ph-email">{email}</p>
          <div className="ph-meta">
            {genderLabel && <span>{genderLabel}</span>}
            {age && <span>{age} лет</span>}
            {isOrganizer && <span className="ph-org-badge">Организатор</span>}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="ph-stats">
        <div className="ph-stat">
          <span className="ph-stat-val">{points}</span>
          <span className="ph-stat-label">Очков</span>
        </div>
        <div className="ph-stat-divider" />
        <div className="ph-stat">
          <span className="ph-stat-val">{streak}</span>
          <span className="ph-stat-label">Серия дней</span>
        </div>
        <div className="ph-stat-divider" />
        <div className="ph-stat">
          <span className="ph-stat-val">{level.name}</span>
          <span className="ph-stat-label">Уровень</span>
        </div>
        <div className="ph-stat-divider" />
        <div className="ph-stat">
          <span className="ph-stat-val">{level.xp}/{level.xpNeeded}</span>
          <span className="ph-stat-label">XP</span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="ph-xp">
        <div className="ph-xp-track">
          <div className="ph-xp-fill" style={{ width: `${level.progress}%` }} />
        </div>
        <span className="ph-xp-label">{level.progress}% до следующего уровня</span>
      </div>

      <style>{`
        .ph-card {
          background: var(--card, #fff);
          border: 1px solid var(--border, #e5e5e5);
          border-radius: var(--radius, 0);
          overflow: hidden;
        }
        .ph-header {
          display: flex; align-items: center; gap: 20px;
          padding: 28px 28px 0;
        }
        .ph-avatar {
          position: relative; width: 80px; height: 80px;
          border-radius: 50%; background: var(--primary, #e76f51);
          display: grid; place-items: center; flex-shrink: 0;
          box-shadow: 0 4px 16px oklch(0.525 0.223 3.958 / 0.25);
        }
        .ph-avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .ph-avatar-text {
          font-size: 28px; font-weight: 900; color: var(--primary-foreground, #fff);
          letter-spacing: -0.02em;
        }
        .ph-level-badge {
          position: absolute; bottom: -4px; right: -4px;
          display: flex; align-items: center; gap: 3px;
          padding: 3px 8px; border-radius: 99px;
          background: var(--primary, #e76f51); color: var(--primary-foreground, #fff);
          font-size: 11px; font-weight: 800;
          box-shadow: 0 2px 8px oklch(0.525 0.223 3.958 / 0.3);
          border: 2px solid var(--card, #fff);
        }
        .ph-info { flex: 1; min-width: 0; }
        .ph-name {
          font-size: 22px; font-weight: 800; margin: 0;
          color: var(--foreground, #1c1917); letter-spacing: -0.02em;
        }
        .ph-email { font-size: 14px; color: var(--muted-foreground, #78716c); margin: 2px 0 0; }
        .ph-meta { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
        .ph-meta span { font-size: 12px; color: var(--muted-foreground, #78716c); font-weight: 600; }
        .ph-org-badge {
          padding: 2px 10px; border-radius: 99px;
          background: oklch(0.897 0.196 126.665 / 0.15);
          color: oklch(0.453 0.124 130.933) !important;
          font-weight: 700 !important;
        }

        .ph-stats {
          display: flex; align-items: center; gap: 0;
          padding: 20px 28px; margin-top: 20px;
          border-top: 1px solid var(--border, #e5e5e5);
        }
        .ph-stat { flex: 1; text-align: center; }
        .ph-stat-val {
          display: block; font-size: 18px; font-weight: 800;
          color: var(--foreground, #1c1917);
        }
        .ph-stat-label { display: block; font-size: 11px; color: var(--muted-foreground, #78716c); font-weight: 600; margin-top: 2px; }
        .ph-stat-divider { width: 1px; height: 32px; background: var(--border, #e5e5e5); }

        .ph-xp { padding: 0 28px 24px; }
        .ph-xp-track {
          height: 6px; border-radius: 99px;
          background: var(--muted, #f5f5f4);
          overflow: hidden;
        }
        .ph-xp-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--chart-1, #a3e635), var(--chart-3, #65a30d));
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ph-xp-label {
          display: block; text-align: right; margin-top: 6px;
          font-size: 11px; color: var(--muted-foreground, #78716c); font-weight: 600;
        }

        @media (max-width: 640px) {
          .ph-header { flex-direction: column; text-align: center; padding: 24px 20px 0; }
          .ph-meta { justify-content: center; }
          .ph-stats { padding: 16px 20px; flex-wrap: wrap; gap: 12px; }
          .ph-stat-divider { display: none; }
          .ph-stat { flex: 0 0 calc(50% - 6px); }
          .ph-xp { padding: 0 20px 20px; }
        }
      `}</style>
    </div>
  );
}
