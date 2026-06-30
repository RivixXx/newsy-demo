'use client';

import React from 'react';
import { Zap, Crown, Flame } from 'lucide-react';
import dynamic from 'next/dynamic';

const Avatar3D = dynamic(() => import('./avatar3d').then(m => m.Avatar3D), { ssr: false });

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
}

export function ProfileHero({ name, email, level, points, streak, isOrganizer, gender, birthDate }: ProfileHeroProps) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (level.progress / 100) * circumference;

  const genderLabel = gender === 'male' ? 'Мужчина' : gender === 'female' ? 'Женщина' : null;
  let age: number | null = null;
  if (birthDate) {
    const bd = new Date(birthDate);
    const today = new Date();
    age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  }

  return (
    <div className="hero-card">
      <div className="hero-top">
        <div className="avatar-section">
          <div className="xp-ring">
            <svg width="110" height="110" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={level.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="avatar-inner">
              <Avatar3D gender={gender ?? null} className="avatar-3d" />
              <div className="level-badge" style={{ background: level.color }}>
                {level.level}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-info">
          <div className="name-row">
            <h1 className="hero-name">{name}</h1>
            {isOrganizer && <span className="org-badge"><Crown size={12} /> Организатор</span>}
          </div>
          <p className="hero-email">{email}</p>
          <div className="level-info">
            <span className="level-name" style={{ color: level.color }}>{level.name}</span>
            <span className="level-sep">·</span>
            <span className="level-xp">{level.xpInLevel} / {level.xpNeeded} XP</span>
          </div>
          {(genderLabel || age) && (
            <div className="user-meta">
              {genderLabel && <span className="meta-tag">{genderLabel}</span>}
              {age && <span className="meta-tag">{age} лет</span>}
            </div>
          )}
        </div>

        {streak > 0 && (
          <div className="streak-badge">
            <Flame size={18} />
            <span className="streak-count">{streak}</span>
            <span className="streak-label">дней подряд</span>
          </div>
        )}
      </div>

      <div className="xp-bar-wrap">
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${level.progress}%`, background: level.color }} />
        </div>
        <div className="xp-labels">
          <span>Ур. {level.level}</span>
          <span>{Math.round(level.progress)}%</span>
          <span>Ур. {level.level + 1}</span>
        </div>
      </div>

      <style>{`
        .hero-card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .hero-top { display: flex; align-items: center; gap: 24px; padding: 32px 32px 24px; }
        .avatar-section { flex-shrink: 0; }
        .xp-ring { position: relative; width: 110px; height: 110px; }
        .xp-ring svg { position: absolute; inset: 0; }
        .avatar-inner { position: absolute; inset: 4px; display: flex; align-items: center; justify-content: center; border-radius: 50%; overflow: hidden; background: #f8f8f8; }
        .avatar-3d { width: 100% !important; height: 100% !important; }
        .avatar-img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
        .level-badge {
          position: absolute; bottom: -2px; right: -2px;
          width: 28px; height: 28px; border-radius: 50%;
          color: white; font-size: 12px; font-weight: 900;
          display: grid; place-items: center;
          border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .hero-info { flex: 1; min-width: 0; }
        .name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hero-name { font-size: 24px; font-weight: 900; margin: 0; color: #111; }
        .org-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 8px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white; font-size: 11px; font-weight: 700;
        }
        .hero-email { font-size: 13px; color: #888; margin: 4px 0 0; }
        .level-info { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .level-name { font-size: 14px; font-weight: 800; }
        .level-sep { color: #ddd; }
        .level-xp { font-size: 12px; color: #aaa; font-weight: 600; }
        .user-meta { display: flex; gap: 8px; margin-top: 8px; }
        .meta-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 8px;
          background: #f5f5f5; font-size: 12px; font-weight: 600; color: #555;
        }
        .streak-badge {
          display: flex; flex-direction: column; align-items: center;
          padding: 12px 16px; border-radius: 16px;
          background: linear-gradient(135deg, #fff7ed, #fef3c7);
          border: 1px solid #fde68a; flex-shrink: 0;
        }
        .streak-badge svg { color: #f59e0b; }
        .streak-count { font-size: 24px; font-weight: 900; color: #92400e; line-height: 1; }
        .streak-label { font-size: 10px; color: #b45309; font-weight: 600; white-space: nowrap; }
        .xp-bar-wrap { padding: 0 32px 24px; }
        .xp-bar { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
        .xp-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
        .xp-labels { display: flex; justify-content: space-between; font-size: 10px; color: #aaa; font-weight: 600; margin-top: 6px; }
        @media (max-width: 640px) {
          .hero-top { flex-direction: column; text-align: center; padding: 24px 20px 16px; }
          .name-row { justify-content: center; }
          .level-info { justify-content: center; }
          .xp-bar-wrap { padding: 0 20px 20px; }
        }
      `}</style>
    </div>
  );
}
