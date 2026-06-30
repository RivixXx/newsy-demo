'use client';

import React from 'react';
import { CheckCircle2, Trophy, Users, Zap, Clock, ArrowUpRight } from 'lucide-react';

interface Activity {
  id: string;
  challengeId: string;
  challengeTitle: string;
  category: string;
  action: string;
  icon: string;
  points: number;
  date: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  onChallengeClick: (challengeId: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  trophy: <Trophy size={16} />,
  check: <CheckCircle2 size={16} />,
  join: <Users size={16} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  sport: '#16a34a', education: '#2563eb', quest: '#d97706', art: '#7c3aed', tech: '#ec4899', Другое: '#6b7280',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function ActivityFeed({ activities, onChallengeClick }: ActivityFeedProps) {
  return (
    <div className="feed-card">
      <div className="feed-header">
        <h3>Последняя активность</h3>
      </div>

      {activities.length === 0 ? (
        <div className="feed-empty">
          <Clock size={32} color="#ddd" />
          <p>Пока нет активности</p>
        </div>
      ) : (
        <div className="feed-list">
          {activities.map(a => (
            <div key={a.id} className="feed-item" onClick={() => onChallengeClick(a.challengeId)} style={{ cursor: 'pointer' }}>
              <div className="feed-icon" style={{ color: CATEGORY_COLORS[a.category] || '#6b7280' }}>
                {ICONS[a.icon] || <Zap size={16} />}
              </div>
              <div className="feed-content">
                <span className="feed-action">{a.action}</span>
                <span className="feed-meta">
                  <span className="feed-category" style={{ color: CATEGORY_COLORS[a.category] || '#6b7280' }}>{a.category}</span>
                  · {timeAgo(a.date)}
                </span>
              </div>
              <div className="feed-right">
                {a.points > 0 && <span className="feed-points">+{a.points}</span>}
                <ArrowUpRight size={14} color="#ccc" />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .feed-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #f0f0f0; }
        .feed-header { margin-bottom: 16px; }
        .feed-header h3 { font-size: 16px; font-weight: 800; margin: 0; color: #111; }
        .feed-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px; }
        .feed-empty p { font-size: 13px; color: #aaa; margin: 0; }
        .feed-list { display: flex; flex-direction: column; gap: 2px; }
        .feed-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          text-decoration: none; transition: background 0.15s;
        }
        .feed-item:hover { background: #f9f9f9; }
        .feed-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #f5f5f5; display: grid; place-items: center; flex-shrink: 0;
        }
        .feed-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .feed-action { font-size: 13px; font-weight: 600; color: #111; }
        .feed-meta { font-size: 11px; color: #aaa; display: flex; align-items: center; gap: 4px; }
        .feed-category { font-weight: 700; text-transform: capitalize; }
        .feed-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .feed-points { font-size: 13px; font-weight: 800; color: #FF385C; }
      `}</style>
    </div>
  );
}
