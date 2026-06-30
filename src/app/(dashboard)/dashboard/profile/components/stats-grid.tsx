'use client';

import React, { useEffect, useState } from 'react';
import { Flame, CheckCircle2, Trophy, Zap, Target, Users } from 'lucide-react';

interface StatsGridProps {
  activeChallenges: number;
  completedChallenges: number;
  achievements: number;
  points: number;
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayed(value);
          clearInterval(interval);
        } else {
          setDisplayed(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return <span>{displayed}</span>;
}

export function StatsGrid({ activeChallenges, completedChallenges, achievements, points }: StatsGridProps) {
  const stats = [
    { icon: <Flame size={20} />, value: activeChallenges, label: 'Активных', color: '#f59e0b', bg: '#fff7ed' },
    { icon: <CheckCircle2 size={20} />, value: completedChallenges, label: 'Завершено', color: '#16a34a', bg: '#f0fdf4' },
    { icon: <Trophy size={20} />, value: achievements, label: 'Достижений', color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: <Zap size={20} />, value: points, label: 'Баллов', color: '#FF385C', bg: '#fff5f7' },
  ];

  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={s.label} className="stat-card" style={{ '--stat-color': s.color, '--stat-bg': s.bg } as React.CSSProperties}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-val"><AnimatedNumber value={s.value} delay={i * 100} /></div>
          <div className="stat-lbl">{s.label}</div>
        </div>
      ))}
      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .stat-card {
          background: var(--stat-bg); border-radius: 20px; padding: 20px;
          border: 1px solid transparent; display: flex; flex-direction: column;
          gap: 8px; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: var(--stat-color); }
        .stat-icon { width: 40px; height: 40px; border-radius: 12px; background: white; color: var(--stat-color); display: grid; place-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .stat-val { font-size: 28px; font-weight: 900; color: #111; line-height: 1; }
        .stat-lbl { font-size: 12px; color: #888; font-weight: 600; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .stats-grid { gap: 10px; } .stat-card { padding: 16px; } .stat-val { font-size: 22px; } }
      `}</style>
    </div>
  );
}
