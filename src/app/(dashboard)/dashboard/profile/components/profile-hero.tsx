'use client';

import React from 'react';
import { Crown, Flame } from 'lucide-react';
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
  avatarUrl?: string;
}

export function ProfileHero({ name, email, level, points, streak, isOrganizer, gender, birthDate, avatarUrl }: ProfileHeroProps) {
  const circumference = 2 * Math.PI * 28;
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
      <div className="hero-layout">
        {/* Left: 3D avatar */}
        <div className="hero-3d-section">
          <div className="hero-3d-wrapper">
            <Avatar3D gender={gender ?? null} className="hero-3d" />
          </div>
          <div className="level-badge-3d" style={{ background: level.color }}>
            Ур. {level.level}
          </div>
        </div>

        {/* Right: info */}
        <div className="hero-info-section">
          <div className="hero-info-top">
            <div className="photo-avatar">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`}
                alt={name}
              />
              <div className="photo-level" style={{ background: level.color }}>{level.level}</div>
            </div>
            <div className="hero-text">
              <div className="name-row">
                <h1 className="hero-name">{name}</h1>
                {isOrganizer && <span className="org-badge"><Crown size={12} /> Организатор</span>}
              </div>
              <p className="hero-email">{email}</p>
            </div>
          </div>

          <div className="hero-details">
            <div className="detail-row">
              <span className="detail-label">Уровень</span>
              <span className="detail-value" style={{ color: level.color }}>{level.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Опы</span>
              <span className="detail-value">{level.xpInLevel} / {level.xpNeeded} XP</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Баллы</span>
              <span className="detail-value">{points}</span>
            </div>
          </div>

          <div className="hero-tags">
            {genderLabel && <span className="tag">{genderLabel}</span>}
            {age && <span className="tag">{age} лет</span>}
            {streak > 0 && (
              <span className="tag tag-streak">
                <Flame size={12} /> {streak} дн.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XP bar */}
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
        .hero-layout { display: flex; min-height: 280px; }

        /* Left: 3D */
        .hero-3d-section {
          flex: 0 0 38%; position: relative;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
          overflow: hidden;
        }
        .hero-3d-wrapper { width: 100%; height: 280px; position: relative; margin-top: 20px; }
        .hero-3d { width: 100% !important; height: 100% !important; }
        .level-badge-3d {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          padding: 6px 18px; border-radius: 20px;
          color: white; font-size: 13px; font-weight: 800;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 2;
        }

        /* Right: info */
        .hero-info-section {
          flex: 1; padding: 28px 32px; display: flex; flex-direction: column; gap: 16px;
        }
        .hero-info-top { display: flex; align-items: center; gap: 16px; }
        .photo-avatar {
          position: relative; width: 56px; height: 56px; flex-shrink: 0;
        }
        .photo-avatar img {
          width: 56px; height: 56px; border-radius: 50%; object-fit: cover;
          border: 3px solid white; box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .photo-level {
          position: absolute; bottom: -2px; right: -2px;
          width: 22px; height: 22px; border-radius: 50%;
          color: white; font-size: 10px; font-weight: 900;
          display: grid; place-items: center;
          border: 2px solid white;
        }
        .hero-text { flex: 1; min-width: 0; }
        .name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hero-name { font-size: 22px; font-weight: 900; margin: 0; color: #111; line-height: 1.2; }
        .org-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 8px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white; font-size: 11px; font-weight: 700;
        }
        .hero-email { font-size: 13px; color: #888; margin: 4px 0 0; }

        .hero-details { display: flex; flex-direction: column; gap: 6px; }
        .detail-row { display: flex; justify-content: space-between; font-size: 13px; }
        .detail-label { color: #aaa; font-weight: 600; }
        .detail-value { color: #111; font-weight: 700; }

        .hero-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 12px; border-radius: 8px;
          background: #f5f5f5; font-size: 12px; font-weight: 600; color: #555;
        }
        .tag-streak { background: #fff7ed; color: #d97706; }

        /* XP bar */
        .xp-bar-wrap { padding: 0 32px 24px; }
        .xp-bar { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
        .xp-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
        .xp-labels { display: flex; justify-content: space-between; font-size: 10px; color: #aaa; font-weight: 600; margin-top: 6px; }

        @media (max-width: 768px) {
          .hero-layout { flex-direction: column; }
          .hero-3d-section { flex: none; height: 220px; }
          .hero-info-section { padding: 20px; }
        }
        @media (max-width: 480px) {
          .hero-3d-wrapper { height: 180px; }
          .hero-name { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
