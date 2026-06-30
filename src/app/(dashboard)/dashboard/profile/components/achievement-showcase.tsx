'use client';

import React from 'react';
import { Award, Trophy, Zap, Target, Users, Heart, Star, Crown, Shield, Flame } from 'lucide-react';

interface AchievementShowcaseProps {
  count: number;
}

const BADGE_CONFIGS = [
  { key: 'first_step', icon: <Zap size={18} />, name: 'Первый шаг', desc: 'Заверши первый челлендж', color: '#3b82f6', bg: '#eff6ff', unlocked: false },
  { key: 'marathon', icon: <Flame size={18} />, name: 'Марафонец', desc: '10 челленджей', color: '#f59e0b', bg: '#fffbeb', unlocked: false },
  { key: 'social', icon: <Users size={18} />, name: 'Социальная бабочка', desc: 'Пригласи 5 друзей', color: '#8b5cf6', bg: '#f5f3ff', unlocked: false },
  { key: 'collector', icon: <Target size={18} />, name: 'Коллекционер', desc: '1000 баллов', color: '#10b981', bg: '#ecfdf5', unlocked: false },
  { key: 'champion', icon: <Trophy size={18} />, name: 'Чемпион', desc: '1 место в челлендже', color: '#f59e0b', bg: '#fffbeb', unlocked: false },
  { key: 'mentor', icon: <Heart size={18} />, name: 'Наставник', desc: '3 мастер-класса', color: '#ec4899', bg: '#fdf2f8', unlocked: false },
];

export function AchievementShowcase({ count }: AchievementShowcaseProps) {
  const badges = BADGE_CONFIGS.map((b, i) => ({
    ...b,
    unlocked: i < count,
  }));

  return (
    <div className="achievements-card">
      <div className="achievements-header">
        <h3>Достижения</h3>
        <span className="achievements-count">{count} / {BADGE_CONFIGS.length}</span>
      </div>

      <div className="badges-grid">
        {badges.map(b => (
          <div
            key={b.key}
            className={`badge-item ${b.unlocked ? 'unlocked' : 'locked'}`}
            style={{ '--badge-color': b.color, '--badge-bg': b.bg } as React.CSSProperties}
          >
            <div className="badge-icon">
              {b.unlocked ? b.icon : <Award size={18} />}
            </div>
            <span className="badge-name">{b.name}</span>
            <span className="badge-desc">{b.desc}</span>
            {b.unlocked && <div className="badge-glow" />}
          </div>
        ))}
      </div>

      <style>{`
        .achievements-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #f0f0f0; }
        .achievements-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .achievements-header h3 { font-size: 16px; font-weight: 800; margin: 0; color: #111; }
        .achievements-count { font-size: 13px; font-weight: 700; color: #FF385C; }
        .badges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .badge-item {
          position: relative; display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 16px 8px; border-radius: 14px;
          border: 1.5px solid #f0f0f0; transition: all 0.25s;
          text-align: center; overflow: hidden;
        }
        .badge-item.locked { opacity: 0.45; filter: grayscale(0.8); }
        .badge-item.unlocked {
          border-color: var(--badge-color); background: var(--badge-bg);
          cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .badge-item.unlocked:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .badge-icon {
          width: 40px; height: 40px; border-radius: 12px;
          display: grid; place-items: center; position: relative; z-index: 1;
          color: var(--badge-color); background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .badge-item.locked .badge-icon { color: #ccc; }
        .badge-name { font-size: 11px; font-weight: 700; color: #111; z-index: 1; }
        .badge-desc { font-size: 10px; color: #aaa; z-index: 1; }
        .badge-glow {
          position: absolute; inset: -20px; z-index: 0;
          background: radial-gradient(circle, var(--badge-bg), transparent 70%);
          opacity: 0.5; pointer-events: none;
          animation: glowPulse 3s ease-in-out infinite;
        }
        @keyframes glowPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        @media (max-width: 640px) { .badges-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
