'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, Star, Zap, Ticket, Shirt, BookOpen, Coffee, ChevronRight } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { useSession } from '@/shared/components/session-provider';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  imageUrl: string;
  available: boolean;
}

const REWARD_ICONS: Record<string, React.ReactNode> = {
  merchandise: <Shirt size={20} />,
  discount: <Ticket size={20} />,
  digital: <BookOpen size={20} />,
  experience: <Coffee size={20} />,
};

const REWARD_COLORS: Record<string, string> = {
  merchandise: '#FF385C',
  discount: '#f59e0b',
  digital: '#3b82f6',
  experience: '#16a34a',
};

const MOCK_REWARDS: Reward[] = [
  { id: '1', name: 'Футболка NEWSY', description: 'Официальная футболка платформы. Размеры S-XL.', pointsCost: 500, category: 'merchandise', imageUrl: '', available: true },
  { id: '2', name: 'Скидка 20% на партнёров', description: 'Скидочный код на товары партнёров платформы.', pointsCost: 300, category: 'discount', imageUrl: '', available: true },
  { id: '3', name: 'Премиум на 1 месяц', description: 'Бесплатный доступ к Профи-тарифу.', pointsCost: 800, category: 'digital', imageUrl: '', available: true },
  { id: '4', name: 'Мастер-класс от эксперта', description: 'Персональный мастер-класс по выбору.', pointsCost: 1200, category: 'experience', imageUrl: '', available: true },
  { id: '5', name: 'Стикерпак NEWSY', description: 'Набор стикеров для мессенджеров.', pointsCost: 100, category: 'digital', imageUrl: '', available: true },
  { id: '6', name: 'Брендированный кейс', description: 'Чехол для телефона с логотипом NEWSY.', pointsCost: 600, category: 'merchandise', imageUrl: '', available: false },
];

export default function RewardsPage() {
  const session = useSession();
  const [filter, setFilter] = useState<string>('all');
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/achievements')
        .then(r => r.json())
        .then(d => setUserPoints(d.totalPoints || 0))
        .catch(() => {});
    }
  }, [session]);

  const categories = ['all', 'merchandise', 'discount', 'digital', 'experience'];
  const categoryLabels: Record<string, string> = { all: 'Все', merchandise: 'Мерч', discount: 'Скидки', digital: 'Цифровые', experience: 'Впечатления' };

  const filtered = filter === 'all' ? MOCK_REWARDS : MOCK_REWARDS.filter(r => r.category === filter);

  return (
    <PageShell variant="public">
      <div className="rew-page">
        <header className="rew-header">
          <Gift size={40} color="#FF385C" />
          <h1>Награды</h1>
          <p>Обменивай баллы на реальные призы и привилегии</p>
        </header>

        {session && (
          <div className="rew-balance">
            <Zap size={18} color="#f59e0b" />
            <span>{userPoints} баллов</span>
          </div>
        )}

        <div className="rew-filters">
          {categories.map(c => (
            <button key={c} className={`rew-filter ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {categoryLabels[c]}
            </button>
          ))}
        </div>

        <div className="rew-grid">
          {filtered.map(reward => {
            const canAfford = userPoints >= reward.pointsCost;
            return (
              <div key={reward.id} className={`rew-card ${!reward.available ? 'unavailable' : ''}`}>
                <div className="rew-icon" style={{ background: `${REWARD_COLORS[reward.category]}12`, color: REWARD_COLORS[reward.category] }}>
                  {REWARD_ICONS[reward.category] || <Gift size={20} />}
                </div>
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
                <div className="rew-footer">
                  <span className="rew-cost">
                    <Zap size={12} /> {reward.pointsCost}
                  </span>
                  {session ? (
                    <button className={`rew-btn ${canAfford && reward.available ? '' : 'disabled'}`} disabled={!canAfford || !reward.available}>
                      {reward.available ? (canAfford ? 'Обменять' : 'Мало баллов') : 'Нет в наличии'}
                    </button>
                  ) : (
                    <Link href="/login" className="rew-btn">Войти</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!session && (
          <div className="rew-cta">
            <p>Войдите, чтобы обменивать баллы на награды</p>
            <Link href="/login" className="rew-cta-btn">Войти</Link>
          </div>
        )}

        <style jsx>{`
          .rew-page { max-width: 900px; margin: 0 auto; padding: 40px clamp(16px, 3vw, 40px) 80px; }
          .rew-header { text-align: center; margin-bottom: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .rew-header h1 { font-size: 32px; font-weight: 900; margin: 0; color: #111; }
          .rew-header p { font-size: 15px; color: #71717a; margin: 0; }
          .rew-balance { display: inline-flex; align-items: center; gap: 8px; background: #fffbeb; border: 1px solid #fde68a; padding: 10px 18px; border-radius: 12px; font-size: 15px; font-weight: 800; color: #92400e; margin-bottom: 24px; }
          .rew-filters { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; }
          .rew-filter { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 700; color: #666; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
          .rew-filter.active { background: #111; border-color: #111; color: white; }
          .rew-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
          .rew-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 10px; }
          .rew-card.unavailable { opacity: 0.5; }
          .rew-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; }
          .rew-card h3 { font-size: 15px; font-weight: 800; margin: 0; color: #111; }
          .rew-card p { font-size: 12px; color: #71717a; margin: 0; line-height: 1.5; }
          .rew-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 10px; border-top: 1px solid #f5f5f5; }
          .rew-cost { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 800; color: #d97706; }
          .rew-btn { padding: 8px 16px; border-radius: 8px; border: none; background: #FF385C; color: white; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none; transition: all 0.2s; }
          .rew-btn:hover:not(.disabled) { background: #E31C5F; }
          .rew-btn.disabled { background: #f3f4f6; color: #aaa; cursor: default; }
          .rew-cta { text-align: center; background: white; border-radius: 16px; padding: 32px; border: 1px solid #f0f0f0; margin-top: 32px; }
          .rew-cta p { font-size: 14px; color: #888; margin: 0 0 16px; }
          .rew-cta-btn { display: inline-block; padding: 12px 24px; border-radius: 12px; background: #FF385C; color: white; font-size: 14px; font-weight: 700; text-decoration: none; }
        `}</style>
      </div>
    </PageShell>
  );
}
