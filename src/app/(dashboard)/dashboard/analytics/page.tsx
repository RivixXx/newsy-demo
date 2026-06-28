'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, Users, Trophy, DollarSign, BarChart3, Activity, Zap } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { useSession } from '@/shared/components/session-provider';

interface AnalyticsData {
  totalChallenges: number;
  publishedChallenges: number;
  totalParticipants: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentChallenges: { id: string; title: string; participants: number; status: string }[];
  categoryBreakdown: { category: string; count: number }[];
}

export default function AnalyticsPage() {
  const session = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <PageShell>
        <div className="analytics-page">
          <div className="analytics-loading">Загрузка аналитики...</div>
        </div>
      </PageShell>
    );
  }

  const stats = [
    { label: 'Челенджей', value: data?.totalChallenges || 0, icon: <Trophy size={20} />, color: '#FF385C' },
    { label: 'Опубликовано', value: data?.publishedChallenges || 0, icon: <Activity size={20} />, color: '#16a34a' },
    { label: 'Участников', value: data?.totalParticipants || 0, icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Выручка', value: `${(data?.totalRevenue || 0).toLocaleString('ru-RU')} ₽`, icon: <DollarSign size={20} />, color: '#d97706' },
  ];

  return (
    <PageShell>
      <div className="analytics-page">
        <header className="analytics-header">
          <Link href="/dashboard" className="analytics-back"><ChevronLeft size={18} /> Назад</Link>
          <h1>Аналитика</h1>
          <p>Статистика ваших челленджей и доходов</p>
        </header>

        <div className="period-tabs">
          {(['week', 'month', 'year'] as const).map(p => (
            <button key={p} className={`period-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3><BarChart3 size={18} /> По категориям</h3>
            <div className="category-list">
              {(data?.categoryBreakdown || []).map((cat, i) => (
                <div key={i} className="category-row">
                  <span className="category-name">{cat.category || 'Без категории'}</span>
                  <span className="category-count">{cat.count}</span>
                </div>
              ))}
              {(!data?.categoryBreakdown || data.categoryBreakdown.length === 0) && (
                <p className="empty-text">Нет данных</p>
              )}
            </div>
          </div>

          <div className="analytics-card">
            <h3><Zap size={18} /> Последние челенджи</h3>
            <div className="challenges-list">
              {(data?.recentChallenges || []).map((ch, i) => (
                <Link key={i} href={`/challenges/${ch.id}`} className="challenge-row">
                  <span className="challenge-title">{ch.title}</span>
                  <span className="challenge-meta">{ch.participants} уч. · {ch.status}</span>
                </Link>
              ))}
              {(!data?.recentChallenges || data.recentChallenges.length === 0) && (
                <p className="empty-text">Нет данных</p>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .analytics-page { max-width: 1000px; margin: 0 auto; padding: 32px 20px 80px; }
          .analytics-header { margin-bottom: 32px; }
          .analytics-back { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: #71717a; text-decoration: none; margin-bottom: 16px; }
          .analytics-back:hover { color: #18181b; }
          .analytics-header h1 { font-size: 28px; font-weight: 900; margin: 0 0 8px; color: #111; }
          .analytics-header p { font-size: 14px; color: #71717a; margin: 0; }
          .period-tabs { display: flex; gap: 6px; margin-bottom: 24px; }
          .period-tab { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; }
          .period-tab.active { background: #111; border-color: #111; color: white; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
          .stat-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 8px; }
          .stat-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; }
          .stat-value { font-size: 24px; font-weight: 900; color: #111; }
          .stat-label { font-size: 12px; color: #888; font-weight: 600; }
          .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .analytics-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; }
          .analytics-card h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 800; margin: 0 0 16px; color: #111; }
          .category-list, .challenges-list { display: flex; flex-direction: column; gap: 8px; }
          .category-row { display: flex; justify-content: space-between; padding: 10px; background: #f9fafb; border-radius: 10px; }
          .category-name { font-size: 13px; font-weight: 600; color: #3f3f46; }
          .category-count { font-size: 13px; font-weight: 800; color: #111; }
          .challenge-row { display: flex; justify-content: space-between; padding: 10px; background: #f9fafb; border-radius: 10px; text-decoration: none; transition: background 0.15s; }
          .challenge-row:hover { background: #f3f4f6; }
          .challenge-title { font-size: 13px; font-weight: 600; color: #111; }
          .challenge-meta { font-size: 12px; color: #888; font-weight: 600; }
          .empty-text { font-size: 13px; color: #aaa; text-align: center; padding: 20px; }
          .analytics-loading { text-align: center; padding: 80px; color: #71717a; font-size: 16px; }
          @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .analytics-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </PageShell>
  );
}
