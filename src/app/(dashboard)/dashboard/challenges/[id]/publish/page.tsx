'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Check, Zap, Crown, Star, Loader2 } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { PUBLISH_TARIFFS } from '@/modules/payments/tariffs';

const TARIFF_ICONS: Record<string, React.ReactNode> = {
  basic: <Zap size={24} />,
  pro: <Star size={24} />,
  premium: <Crown size={24} />,
};

const TARIFF_COLORS: Record<string, string> = {
  basic: '#71717a',
  pro: '#FF385C',
  premium: '#d97706',
};

export default function PublishPage() {
  const params = useParams<{ id: string }>();
  const [selected, setSelected] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    const tariff = PUBLISH_TARIFFS.find(t => t.id === selected);
    if (!tariff) return;

    setLoading(true);
    setError(null);

    try {
      if (tariff.price === 0) {
        const res = await fetch('/api/payments/confirm-mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId: params.id }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Ошибка публикации');
          return;
        }
        window.location.href = '/';
        return;
      }

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: params.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || 'Ошибка создания платежа');
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="publish-page">
        <header className="pub-header">
          <Link href="/dashboard" className="pub-back">
            <ChevronLeft size={18} /> Назад
          </Link>
          <h1>Публикация челленджа</h1>
          <p>Выберите тариф для публикации</p>
        </header>

        <div className="tariffs-grid">
          {PUBLISH_TARIFFS.map(tariff => (
            <button
              key={tariff.id}
              className={`tariff-card ${selected === tariff.id ? 'selected' : ''} ${tariff.recommended ? 'recommended' : ''}`}
              onClick={() => setSelected(tariff.id)}
            >
              {tariff.recommended && <span className="tariff-badge">Популярный</span>}
              <div className="tariff-icon" style={{ background: `${TARIFF_COLORS[tariff.id]}15`, color: TARIFF_COLORS[tariff.id] }}>
                {TARIFF_ICONS[tariff.id]}
              </div>
              <h3>{tariff.name}</h3>
              <div className="tariff-price">
                {tariff.price === 0 ? 'Бесплатно' : `${tariff.price.toLocaleString('ru-RU')} ₽`}
              </div>
              <ul className="tariff-features">
                {tariff.features.map((f, i) => (
                  <li key={i}><Check size={14} /> {f}</li>
                ))}
              </ul>
              {selected === tariff.id && <div className="tariff-check"><Check size={16} /></div>}
            </button>
          ))}
        </div>

        {error && <div className="pub-error">{error}</div>}

        <div className="pub-actions">
          <button className="pub-btn" onClick={handlePublish} disabled={loading || !selected}>
            {loading ? <Loader2 size={18} className="spin" /> : <>Опубликовать</>}
          </button>
        </div>

        <style jsx>{`
          .publish-page { max-width: 800px; margin: 0 auto; padding: 32px 20px 80px; }
          .pub-header { text-align: center; margin-bottom: 40px; }
          .pub-back {
            display: inline-flex; align-items: center; gap: 4px;
            font-size: 13px; font-weight: 700; color: #71717a;
            text-decoration: none; margin-bottom: 16px;
          }
          .pub-back:hover { color: #18181b; }
          .pub-header h1 { font-size: 28px; font-weight: 900; margin: 0 0 8px; color: #111; }
          .pub-header p { font-size: 14px; color: #71717a; margin: 0; }

          .tariffs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }

          .tariff-card {
            position: relative; display: flex; flex-direction: column; align-items: center;
            gap: 16px; padding: 24px 16px; border-radius: 16px;
            border: 2px solid #e4e4e7; background: white; cursor: pointer;
            transition: all 0.2s; text-align: center;
          }
          .tariff-card:hover { border-color: #a1a1aa; transform: translateY(-2px); }
          .tariff-card.selected { border-color: #FF385C; box-shadow: 0 0 0 3px rgba(255,56,92,0.1); }
          .tariff-card.recommended { border-color: #FF385C30; }

          .tariff-badge {
            position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
            background: #FF385C; color: white; padding: 3px 12px; border-radius: 99px;
            font-size: 10px; font-weight: 800; text-transform: uppercase;
          }

          .tariff-icon { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; }
          .tariff-card h3 { font-size: 18px; font-weight: 800; margin: 0; color: #111; }
          .tariff-price { font-size: 24px; font-weight: 900; color: #111; }

          .tariff-features { list-style: none; padding: 0; margin: 0; width: 100%; text-align: left; }
          .tariff-features li {
            display: flex; align-items: center; gap: 8px;
            padding: 6px 0; font-size: 13px; color: #3f3f46; font-weight: 600;
          }
          .tariff-features li :global(svg) { color: #16a34a; flex-shrink: 0; }

          .tariff-check {
            position: absolute; top: 12px; right: 12px;
            width: 24px; height: 24px; border-radius: 50%;
            background: #FF385C; color: white;
            display: grid; place-items: center;
          }

          .pub-error { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-bottom: 20px; text-align: center; }

          .pub-actions { text-align: center; }
          .pub-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 14px 40px; border-radius: 12px; border: none;
            background: #FF385C; color: white; font-size: 16px; font-weight: 800;
            cursor: pointer; transition: all 0.2s;
          }
          .pub-btn:hover:not(:disabled) { background: #E31C5F; transform: translateY(-1px); }
          .pub-btn:disabled { opacity: 0.5; cursor: default; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }

          @media (max-width: 700px) { .tariffs-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </PageShell>
  );
}
