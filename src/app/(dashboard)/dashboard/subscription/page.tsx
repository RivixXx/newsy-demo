'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Check, Crown, Zap, Star, Loader2, X } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { useSession } from '@/shared/components/session-provider';

interface Plan {
  id: string;
  key: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
  sortOrder: number;
}

interface Subscription {
  id: string;
  status: string;
  plan: Plan;
  currentPeriodEnd: string;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  user_basic: <Zap size={24} />,
  user_pro: <Star size={24} />,
  organizer_basic: <Crown size={24} />,
};

const PLAN_COLORS: Record<string, string> = {
  user_basic: '#71717a',
  user_pro: '#FF385C',
  organizer_basic: '#d97706',
};

export default function SubscriptionPage() {
  const session = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'plans' | 'current'>('plans');

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions/plans').then(r => r.json()),
      fetch('/api/subscriptions').then(r => r.json()),
    ])
      .then(([plansData, subData]) => {
        setPlans(plansData.plans || []);
        setSubscription(subData.subscription || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planKey: string) => {
    setPurchasing(planKey);
    setError(null);

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || 'Ошибка создания подписки');
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError('Ошибка сети');
    } finally {
      setPurchasing(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    setPurchasing('cancel');
    setError(null);

    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Ошибка отмены');
        return;
      }
      setSubscription(null);
      setSelectedTab('plans');
    } catch {
      setError('Ошибка сети');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="sub-page">
          <div className="sub-loading"><Loader2 size={32} className="spin" /><p>Загрузка...</p></div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="sub-page">
        <header className="sub-header">
          <Link href="/dashboard" className="sub-back"><ChevronLeft size={18} /> Назад</Link>
          <h1>Подписка</h1>
          <p>Выберите тариф для расширенного доступа</p>
        </header>

        <div className="sub-tabs">
          <button className={`sub-tab ${selectedTab === 'plans' ? 'active' : ''}`} onClick={() => setSelectedTab('plans')}>
            Тарифы
          </button>
          {subscription && (
            <button className={`sub-tab ${selectedTab === 'current' ? 'active' : ''}`} onClick={() => setSelectedTab('current')}>
              Текущая подписка
            </button>
          )}
        </div>

        {error && <div className="sub-error">{error}</div>}

        {selectedTab === 'plans' && (
          <div className="plans-grid">
            {plans.map(plan => {
              const isActive = subscription?.plan.key === plan.key;
              const isCurrent = isActive && subscription?.status === 'ACTIVE';
              return (
                <div key={plan.id} className={`plan-card ${isActive ? 'active' : ''} ${plan.key === 'user_pro' ? 'recommended' : ''}`}>
                  {plan.key === 'user_pro' && <span className="plan-badge">Популярный</span>}
                  <div className="plan-icon" style={{ background: `${PLAN_COLORS[plan.key]}15`, color: PLAN_COLORS[plan.key] }}>
                    {PLAN_ICONS[plan.key] || <Zap size={24} />}
                  </div>
                  <h3>{plan.name}</h3>
                  <p className="plan-desc">{plan.description}</p>
                  <div className="plan-price">
                    {plan.price === 0 ? 'Бесплатно' : `${plan.price.toLocaleString('ru-RU')} ₽/мес`}
                  </div>
                  <ul className="plan-features">
                    {(plan.features as string[]).map((f, i) => (
                      <li key={i}><Check size={14} /> {f}</li>
                    ))}
                  </ul>
                  <button
                    className={`plan-btn ${isCurrent ? 'current' : ''}`}
                    onClick={() => !isCurrent && handleSubscribe(plan.key)}
                    disabled={isCurrent || purchasing === plan.key}
                  >
                    {isCurrent ? 'Текущий' : purchasing === plan.key ? <Loader2 size={16} className="spin" /> : 'Подписаться'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedTab === 'current' && subscription && (
          <div className="current-sub">
            <div className="current-card">
              <div className="current-icon" style={{ background: `${PLAN_COLORS[subscription.plan.key]}15`, color: PLAN_COLORS[subscription.plan.key] }}>
                {PLAN_ICONS[subscription.plan.key] || <Zap size={24} />}
              </div>
              <div className="current-info">
                <h3>{subscription.plan.name}</h3>
                <p>Активна до {new Date(subscription.currentPeriodEnd).toLocaleDateString('ru-RU')}</p>
              </div>
              <button className="cancel-btn" onClick={handleCancel} disabled={purchasing === 'cancel'}>
                {purchasing === 'cancel' ? <Loader2 size={16} className="spin" /> : <X size={16} />}
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          .sub-page { max-width: 800px; margin: 0 auto; padding: 32px 20px 80px; }
          .sub-header { text-align: center; margin-bottom: 32px; }
          .sub-back { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: #71717a; text-decoration: none; margin-bottom: 16px; }
          .sub-back:hover { color: #18181b; }
          .sub-header h1 { font-size: 28px; font-weight: 900; margin: 0 0 8px; color: #111; }
          .sub-header p { font-size: 14px; color: #71717a; margin: 0; }
          .sub-tabs { display: flex; gap: 6px; margin-bottom: 24px; justify-content: center; }
          .sub-tab { padding: 10px 20px; border-radius: 12px; border: 1.5px solid #e5e7eb; background: white; font-size: 14px; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; }
          .sub-tab.active { background: #111; border-color: #111; color: white; }
          .sub-error { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-bottom: 20px; text-align: center; }
          .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .plan-card { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px 16px; border-radius: 16px; border: 2px solid #e4e4e7; background: white; text-align: center; }
          .plan-card.active { border-color: #22c55e; }
          .plan-card.recommended { border-color: #FF385C30; }
          .plan-badge { position: absolute; top: -10px; background: #FF385C; color: white; padding: 3px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
          .plan-icon { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; }
          .plan-card h3 { font-size: 18px; font-weight: 800; margin: 0; color: #111; }
          .plan-desc { font-size: 12px; color: #71717a; margin: 0; }
          .plan-price { font-size: 22px; font-weight: 900; color: #111; }
          .plan-features { list-style: none; padding: 0; margin: 0; width: 100%; text-align: left; }
          .plan-features li { display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 12px; color: #3f3f46; font-weight: 600; }
          .plan-features li :global(svg) { color: #16a34a; flex-shrink: 0; }
          .plan-btn { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #FF385C; color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: auto; }
          .plan-btn:hover:not(:disabled) { background: #E31C5F; }
          .plan-btn:disabled { opacity: 0.5; cursor: default; }
          .plan-btn.current { background: #f0fdf4; color: #16a34a; cursor: default; }
          .current-sub { max-width: 500px; margin: 0 auto; }
          .current-card { display: flex; align-items: center; gap: 16px; background: white; border-radius: 16px; padding: 20px; border: 1.5px solid #f0f0f0; }
          .current-icon { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; }
          .current-info { flex: 1; }
          .current-info h3 { font-size: 18px; font-weight: 800; margin: 0; color: #111; }
          .current-info p { font-size: 13px; color: #71717a; margin: 4px 0 0; }
          .cancel-btn { width: 40px; height: 40px; border-radius: 10px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; display: grid; place-items: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
          .cancel-btn:hover:not(:disabled) { background: #fee2e2; }
          .cancel-btn:disabled { opacity: 0.5; }
          .sub-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 20px; color: #71717a; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 700px) { .plans-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </PageShell>
  );
}
