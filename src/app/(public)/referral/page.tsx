'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Copy, Check, Gift, Zap, Star, ChevronRight } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { useSession } from '@/shared/components/session-provider';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
}

export default function ReferralPage() {
  const session = useSession();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, activeReferrals: 0, totalEarned: 0 });

  const referralCode = session?.user?.id ? `NEWSY-${session.user.id.slice(0, 8).toUpperCase()}` : '';
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://chillenge-russia.ru'}/register?ref=${referralCode}`;

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/referral/stats')
        .then(r => r.json())
        .then(d => setStats(d))
        .catch(() => {});
    }
  }, [session]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell variant="public">
      <div className="ref-page">
        <header className="ref-header">
          <Users size={40} color="#FF385C" />
          <h1>Реферальная программа</h1>
          <p>Приглашай друзей и зарабатывай баллы за каждого нового участника</p>
        </header>

        {!session ? (
          <div className="ref-cta">
            <h2>Войдите, чтобы получить свою реферальную ссылку</h2>
            <p>После входа вы сможете приглашать друзей и получать награды</p>
            <Link href="/login" className="ref-btn">Войти</Link>
          </div>
        ) : (
          <>
            <div className="ref-link-card">
              <h3>Ваша реферальная ссылка</h3>
              <div className="ref-link-row">
                <code className="ref-link">{referralLink}</code>
                <button className="ref-copy" onClick={handleCopy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="ref-hint">Скопируйте и отправьте друзьям</p>
            </div>

            <div className="ref-stats">
              <div className="ref-stat">
                <div className="ref-stat-icon"><Users size={20} /></div>
                <div className="ref-stat-val">{stats.totalReferrals}</div>
                <div className="ref-stat-lbl">Всего приглашено</div>
              </div>
              <div className="ref-stat">
                <div className="ref-stat-icon" style={{background:'#16a34a15', color:'#16a34a'}}><Star size={20} /></div>
                <div className="ref-stat-val">{stats.activeReferrals}</div>
                <div className="ref-stat-lbl">Активных</div>
              </div>
              <div className="ref-stat">
                <div className="ref-stat-icon" style={{background:'#d9770615', color:'#d97706'}}><Zap size={20} /></div>
                <div className="ref-stat-val">{stats.totalEarned}</div>
                <div className="ref-stat-lbl">Баллов заработано</div>
              </div>
            </div>

            <section className="ref-how">
              <h2>Как это работает</h2>
              <div className="ref-steps">
                <div className="ref-step">
                  <div className="ref-step-num">1</div>
                  <h3>Скопируйте ссылку</h3>
                  <p>Нажмите кнопку копирования выше</p>
                </div>
                <div className="ref-step">
                  <div className="ref-step-num">2</div>
                  <h3>Отправьте другу</h3>
                  <p>Поделитесь ссылкой в мессенджерах или соцсетях</p>
                </div>
                <div className="ref-step">
                  <div className="ref-step-num">3</div>
                  <h3>Получите баллы</h3>
                  <p>За каждого приглашённого друга — 100 баллов</p>
                </div>
              </div>
            </section>

            <section className="ref-benefits">
              <h2>Преимущества</h2>
              <div className="ref-benefits-grid">
                <div className="ref-benefit">
                  <Gift size={20} color="#FF385C" />
                  <span>100 баллов за приглашение</span>
                </div>
                <div className="ref-benefit">
                  <Zap size={20} color="#f59e0b" />
                  <span>Бонус за активного друга</span>
                </div>
                <div className="ref-benefit">
                  <Star size={20} color="#8b5cf6" />
                  <span>Обменивай баллы на призы</span>
                </div>
              </div>
            </section>
          </>
        )}

        <style jsx>{`
          .ref-page { max-width: 700px; margin: 0 auto; padding: 40px clamp(16px, 3vw, 40px) 80px; }
          .ref-header { text-align: center; margin-bottom: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .ref-header h1 { font-size: 32px; font-weight: 900; margin: 0; color: #111; }
          .ref-header p { font-size: 15px; color: #71717a; margin: 0; }
          .ref-cta { text-align: center; background: white; border-radius: 20px; padding: 48px 32px; border: 1px solid #f0f0f0; }
          .ref-cta h2 { font-size: 20px; font-weight: 800; margin: 0 0 8px; color: #111; }
          .ref-cta p { font-size: 14px; color: #888; margin: 0 0 20px; }
          .ref-btn { display: inline-block; padding: 14px 28px; border-radius: 12px; background: #FF385C; color: white; font-size: 15px; font-weight: 800; text-decoration: none; }
          .ref-link-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #f0f0f0; margin-bottom: 24px; }
          .ref-link-card h3 { font-size: 14px; font-weight: 700; margin: 0 0 12px; color: #888; }
          .ref-link-row { display: flex; gap: 8px; align-items: center; }
          .ref-link { flex: 1; padding: 12px 14px; background: #f9fafb; border-radius: 10px; font-size: 13px; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; }
          .ref-copy { width: 42px; height: 42px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: white; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; color: #71717a; transition: all 0.2s; }
          .ref-copy:hover { border-color: #FF385C; color: #FF385C; }
          .ref-hint { font-size: 12px; color: #aaa; margin: 8px 0 0; }
          .ref-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 32px; }
          .ref-stat { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
          .ref-stat-icon { width: 40px; height: 40px; border-radius: 12px; background: #FF385C15; color: #FF385C; display: grid; place-items: center; }
          .ref-stat-val { font-size: 24px; font-weight: 900; color: #111; }
          .ref-stat-lbl { font-size: 12px; color: #888; font-weight: 600; }
          .ref-how { margin-bottom: 32px; }
          .ref-how h2 { font-size: 20px; font-weight: 800; margin: 0 0 16px; color: #111; }
          .ref-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .ref-step { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; text-align: center; }
          .ref-step-num { width: 36px; height: 36px; border-radius: 50%; background: #FF385C; color: white; display: grid; place-items: center; font-size: 16px; font-weight: 900; margin: 0 auto 12px; }
          .ref-step h3 { font-size: 14px; font-weight: 800; margin: 0 0 6px; color: #111; }
          .ref-step p { font-size: 12px; color: #888; margin: 0; }
          .ref-benefits { margin-bottom: 32px; }
          .ref-benefits h2 { font-size: 20px; font-weight: 800; margin: 0 0 16px; color: #111; }
          .ref-benefits-grid { display: flex; flex-direction: column; gap: 10px; }
          .ref-benefit { display: flex; align-items: center; gap: 12px; background: white; border-radius: 12px; padding: 14px 18px; border: 1px solid #f0f0f0; }
          .ref-benefit span { font-size: 14px; font-weight: 700; color: #3f3f46; }
          @media (max-width: 600px) { .ref-steps { grid-template-columns: 1fr; } .ref-stats { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </PageShell>
  );
}
