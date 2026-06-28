'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, Zap, Shield, Target, Flame, ChevronRight, Lock } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { useSession } from '@/shared/components/session-provider';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string | null;
  badgeUrl: string | null;
  pointsRequired: number | null;
  earned: boolean;
  earnedAt?: string;
}

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  first_step: <Zap size={24} />,
  marathon: <Flame size={24} />,
  social: <Star size={24} />,
  collector: <Trophy size={24} />,
  mentor: <Shield size={24} />,
  champion: <Target size={24} />,
};

const ACHIEVEMENT_COLORS: Record<string, string> = {
  first_step: '#FF385C',
  marathon: '#f59e0b',
  social: '#8b5cf6',
  collector: '#3b82f6',
  mentor: '#16a34a',
  champion: '#ec4899',
};

export default function AchievementsPage() {
  const session = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/achievements')
      .then(r => r.json())
      .then(d => { setAchievements(d.achievements || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);

  return (
    <PageShell variant="public">
      <div className="ach-page">
        <header className="ach-header">
          <Trophy size={40} color="#FF385C" />
          <h1>Достижения</h1>
          <p>Выполняй челленджи, собирай значки и повышай свой рейтинг</p>
        </header>

        {session && earned.length > 0 && (
          <div className="ach-stat">
            <span>{earned.length} из {achievements.length}</span>
            <div className="ach-bar">
              <div className="ach-fill" style={{ width: `${(earned.length / achievements.length) * 100}%` }} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="ach-loading">Загрузка...</div>
        ) : (
          <>
            {earned.length > 0 && (
              <section className="ach-section">
                <h2>Полученные ({earned.length})</h2>
                <div className="ach-grid">
                  {earned.map(a => (
                    <div key={a.id} className="ach-card earned">
                      <div className="ach-icon" style={{ background: `${ACHIEVEMENT_COLORS[a.key] || '#888'}15`, color: ACHIEVEMENT_COLORS[a.key] || '#888' }}>
                        {ACHIEVEMENT_ICONS[a.key] || <Trophy size={24} />}
                      </div>
                      <h3>{a.name}</h3>
                      <p>{a.description}</p>
                      {a.pointsRequired && <span className="ach-pts">+{a.pointsRequired} баллов</span>}
                      {a.earnedAt && <span className="ach-date">{new Date(a.earnedAt).toLocaleDateString('ru-RU')}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="ach-section">
              <h2>Ещё не получены ({locked.length})</h2>
              <div className="ach-grid">
                {locked.map(a => (
                  <div key={a.id} className="ach-card locked">
                    <div className="ach-icon locked-icon">
                      <Lock size={24} />
                    </div>
                    <h3>{a.name}</h3>
                    <p>{a.description}</p>
                    {a.pointsRequired && <span className="ach-pts">Нужно {a.pointsRequired} баллов</span>}
                  </div>
                ))}
              </div>
            </section>

            {!session && (
              <div className="ach-cta">
                <p>Войдите, чтобы видеть свои достижения</p>
                <Link href="/login" className="ach-btn">Войти</Link>
              </div>
            )}
          </>
        )}

        <style jsx>{`
          .ach-page { max-width: 900px; margin: 0 auto; padding: 40px clamp(16px, 3vw, 40px) 80px; }
          .ach-header { text-align: center; margin-bottom: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .ach-header h1 { font-size: 32px; font-weight: 900; margin: 0; color: #111; }
          .ach-header p { font-size: 15px; color: #71717a; margin: 0; }
          .ach-stat { background: white; border-radius: 16px; padding: 16px 20px; border: 1px solid #f0f0f0; margin-bottom: 32px; }
          .ach-stat span { font-size: 13px; font-weight: 700; color: #888; margin-bottom: 8px; display: block; }
          .ach-bar { height: 8px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
          .ach-fill { height: 100%; background: linear-gradient(90deg, #FF385C, #f59e0b); border-radius: 99px; transition: width 0.5s ease; }
          .ach-section { margin-bottom: 32px; }
          .ach-section h2 { font-size: 18px; font-weight: 800; margin: 0 0 16px; color: #111; }
          .ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
          .ach-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
          .ach-card.earned { border-color: #FF385C30; }
          .ach-card.locked { opacity: 0.5; }
          .ach-icon { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; }
          .locked-icon { background: #f3f4f6; color: #aaa; }
          .ach-card h3 { font-size: 15px; font-weight: 800; margin: 0; color: #111; }
          .ach-card p { font-size: 12px; color: #71717a; margin: 0; line-height: 1.5; }
          .ach-pts { font-size: 12px; font-weight: 700; color: #d97706; background: #fffbeb; padding: 3px 10px; border-radius: 99px; }
          .ach-date { font-size: 11px; color: #aaa; }
          .ach-loading { text-align: center; padding: 60px; color: #aaa; }
          .ach-cta { text-align: center; background: white; border-radius: 16px; padding: 32px; border: 1px solid #f0f0f0; }
          .ach-cta p { font-size: 14px; color: #888; margin: 0 0 16px; }
          .ach-btn { display: inline-block; padding: 12px 24px; border-radius: 12px; background: #FF385C; color: white; font-size: 14px; font-weight: 700; text-decoration: none; }
        `}</style>
      </div>
    </PageShell>
  );
}
