'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Check, Zap, Crown, Star } from 'lucide-react';
import { Spinner } from '@/shared/components/spinner';
import { PUBLISH_TARIFFS } from '@/modules/payments/tariffs';
import { useToast } from '@/shared/components/toast';

const TARIFF_ICONS: Record<string, React.ReactNode> = {
  basic: <Zap size={28} />,
  pro: <Star size={28} />,
  premium: <Crown size={28} />,
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
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handlePublish = async () => {
    const tariff = PUBLISH_TARIFFS.find(t => t.id === selected);
    if (!tariff) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ challengeId: params.id, tariffId: tariff.id }),
      });
      const response = await res.json();
      const data = response.data;
      if (!res.ok || !response.success || !data?.checkoutUrl) {
        setError(response.error || 'Ошибка создания платежа');
        return;
      }
      if (data.isFree) {
        setSubmitted(true);
        toast('success', 'Челлендж отправлен на модерацию!');
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError('Ошибка сети');
      toast('error', 'Ошибка сети при отправке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pub-root">
      <div className="pub-bg" />

      <div className="pub-content">
        {submitted ? (
          <div className="submitted-card">
            <div className="submitted-icon">
              <Check size={48} color="#16a34a" />
            </div>
            <h2>Челлендж отправлен на модерацию</h2>
            <p>Администратор проверит ваш челлендж и одобрит его для публикации. Обычно это занимает до 24 часов.</p>
            <Link href="/dashboard" className="pub-btn" style={{ textDecoration: 'none' }}>
              Вернуться в кабинет
            </Link>
          </div>
        ) : (
          <>
            <header className="pub-header">
              <Link href="/dashboard" className="pub-back">
                <ChevronLeft size={18} /> Назад
              </Link>
              <h1>Публикация челленджа</h1>
              <p>Выберите тариф для публикации</p>
            </header>

            <div className="tariffs-grid">
              {PUBLISH_TARIFFS.map((tariff, i) => (
                <button
                  key={tariff.id}
                  className={`tariff-card ${selected === tariff.id ? 'selected' : ''} ${tariff.recommended ? 'recommended' : ''}`}
                  onClick={() => setSelected(tariff.id)}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Shine overlay */}
                  <div className="tariff-shine" />

                  {tariff.recommended && <span className="tariff-badge">Популярный</span>}
                  <div className="tariff-icon" style={{ background: `${TARIFF_COLORS[tariff.id]}20`, color: TARIFF_COLORS[tariff.id] }}>
                    {TARIFF_ICONS[tariff.id]}
                  </div>
                  <h3>{tariff.name}</h3>
                  <div className="tariff-price">
                    {tariff.price === 0 ? 'Бесплатно' : <>{tariff.price.toLocaleString('ru-RU')} <span className="tariff-currency">₽</span></>}
                  </div>
                  <ul className="tariff-features">
                    {tariff.features.map((f, j) => (
                      <li key={j}><Check size={14} /> {f}</li>
                    ))}
                  </ul>
                  {selected === tariff.id && <div className="tariff-check"><Check size={16} /></div>}
                </button>
              ))}
            </div>

            {error && <div className="pub-error">{error}</div>}

            <div className="pub-actions">
              <button className="pub-btn" onClick={handlePublish} disabled={loading || !selected}>
                {loading ? <Spinner size={18} /> : <>Отправить на модерацию</>}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
  .pub-root {
    min-height: 100vh; display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  }

  /* Blurred background */
  .pub-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: url('/auth-bg.jpg') center / cover no-repeat;
    filter: blur(20px) brightness(0.55) saturate(1.2);
    transform: scale(1.05);
  }
  .pub-bg::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(10,10,18,0.4);
  }

  .pub-content {
    position: relative; z-index: 1;
    flex: 1; display: flex; flex-direction: column; align-items: center;
    padding: 40px clamp(16px, 3vw, 40px);
  }

  /* Header */
  .pub-header { text-align: center; margin-bottom: 40px; }
  .pub-back {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.5);
    text-decoration: none; margin-bottom: 16px; padding: 8px 16px;
    border-radius: 10px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    transition: all 0.2s;
  }
  .pub-back:hover { background: rgba(255,255,255,0.12); color: white; }
  .pub-header h1 { font-size: clamp(24px, 4vw, 32px); font-weight: 900; margin: 0 0 8px; color: white; letter-spacing: -0.02em; }
  .pub-header p { font-size: 15px; color: rgba(255,255,255,0.45); margin: 0; }

  /* Tariffs grid */
  .tariffs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; max-width: 900px; width: 100%; }

  /* Tariff card — glassmorphism */
  .tariff-card {
    position: relative; display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding: 32px 24px; border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: center; overflow: hidden;
    box-shadow:
      0 8px 32px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.08);
    animation: cardFloat 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes cardFloat {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: none; }
  }
  .tariff-card:hover {
    border-color: rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.1);
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 20px 60px rgba(0,0,0,0.3),
      0 0 40px rgba(255,255,255,0.05),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .tariff-card.selected {
    border-color: rgba(255,56,92,0.5);
    background: rgba(255,56,92,0.08);
    box-shadow:
      0 20px 60px rgba(0,0,0,0.3),
      0 0 40px rgba(255,56,92,0.15),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .tariff-card.selected:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow:
      0 24px 70px rgba(0,0,0,0.35),
      0 0 50px rgba(255,56,92,0.2),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }

  /* Shine effect on hover */
  .tariff-shine {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,0.06) 45%,
      rgba(255,255,255,0.12) 50%,
      rgba(255,255,255,0.06) 55%,
      transparent 60%
    );
    background-size: 250% 100%;
    background-position: 200% 0;
    transition: background-position 0.8s ease;
    opacity: 0;
  }
  .tariff-card:hover .tariff-shine {
    opacity: 1;
    background-position: -200% 0;
  }

  .tariff-badge {
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #FF385C, #E31C5F);
    color: white; padding: 5px 16px; border-radius: 0 0 12px 12px;
    font-size: 11px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.04em;
    box-shadow: 0 4px 16px rgba(255,56,92,0.3);
  }

  .tariff-icon {
    width: 60px; height: 60px; border-radius: 16px;
    display: grid; place-items: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .tariff-card:hover .tariff-icon { transform: scale(1.1) rotate(-5deg); }
  .tariff-card h3 { font-size: 18px; font-weight: 800; margin: 0; color: white; }
  .tariff-price { font-size: 28px; font-weight: 900; color: white; letter-spacing: -0.02em; }
  .tariff-currency { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.5); }

  .tariff-features { list-style: none; padding: 0; margin: 0; width: 100%; text-align: left; }
  .tariff-features li {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 0; font-size: 13px; color: rgba(255,255,255,0.65); font-weight: 600;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .tariff-features li:last-child { border-bottom: none; }
  .tariff-features li :global(svg) { color: #4ade80; flex-shrink: 0; }

  .tariff-check {
    position: absolute; top: 14px; right: 14px;
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #FF385C, #E31C5F);
    color: white; display: grid; place-items: center;
    box-shadow: 0 4px 12px rgba(255,56,92,0.4);
    animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

  /* Submitted card */
  .submitted-card {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    padding: 60px 40px; max-width: 480px; width: 100%;
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px; text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: cardFloat 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .submitted-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.2);
    display: grid; place-items: center;
  }
  .submitted-card h2 { font-size: 22px; font-weight: 900; margin: 0; color: white; }
  .submitted-card p { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; max-width: 360px; line-height: 1.6; }

  /* Error */
  .pub-error {
    background: rgba(255,56,92,0.1); border: 1px solid rgba(255,56,92,0.2);
    color: #ff6b8a; padding: 12px 20px; border-radius: 12px;
    font-size: 13px; font-weight: 700; margin-bottom: 20px; text-align: center;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  }

  /* Button */
  .pub-actions { text-align: center; }
  .pub-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 16px 44px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #FF385C, #E31C5F);
    color: white; font-size: 16px; font-weight: 800;
    cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 20px rgba(255,56,92,0.3);
  }
  .pub-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(255,56,92,0.4);
  }
  .pub-btn:active:not(:disabled) { transform: translateY(0); }
  .pub-btn:disabled { opacity: 0.5; cursor: default; }

  /* Responsive */
  @media (max-width: 700px) {
    .tariffs-grid { grid-template-columns: 1fr; max-width: 400px; }
    .pub-content { padding: 24px 16px; }
  }
`;
