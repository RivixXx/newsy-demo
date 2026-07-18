'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Zap, Building2, Crown, ArrowLeft } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Стартер',
    icon: <Zap size={24} />,
    price: 990,
    period: 'мес',
    features: [
      '1 челлендж в месяц',
      'До 100 участников',
      'Базовая аналитика',
      'Email-поддержка',
    ],
    cta: 'Начать',
    featured: false,
  },
  {
    id: 'business',
    name: 'Бизнес',
    icon: <Building2 size={24} />,
    price: 4990,
    period: 'мес',
    features: [
      '10 челленджей в месяц',
      'До 1 000 участников',
      'Расширенная аналитика',
      'Приоритет в каталоге',
      'Приоритетная поддержка',
    ],
    cta: 'Выбрать',
    featured: true,
  },
  {
    id: 'corporate',
    name: 'Корпоратив',
    icon: <Crown size={24} />,
    price: 29000,
    period: 'мес',
    features: [
      'Безлимит челленджей',
      'Безлимит участников',
      'Полная аналитика + API',
      'Топ позиция в каталоге',
      'Персональный менеджер',
      'Интеграция с CRM',
    ],
    cta: 'Связаться',
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={18} /> На главную
      </Link>

      <header className="pricing-header">
        <h1>Тарифы для организаторов</h1>
        <p>Выберите подходящий план для создания и запуска челленджей</p>
      </header>

      <div className="plans-grid">
        {PLANS.map(plan => (
          <div key={plan.id} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
            {plan.featured && <div className="popular-badge">Популярный</div>}
            <div className="plan-icon">{plan.icon}</div>
            <h2 className="plan-name">{plan.name}</h2>
            <div className="plan-price">
              <span className="price-value">{plan.price.toLocaleString('ru-RU')} ₽</span>
              <span className="price-period">/{plan.period}</span>
            </div>
            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i}>
                  <Check size={16} color="#22c55e" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.id === 'corporate' ? '/login' : '/register'}
              className={`plan-cta ${plan.featured ? 'primary' : 'secondary'}`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <section className="pricing-faq">
        <h2>Частые вопросы</h2>
        <div className="faq-list">
          <details>
            <summary>Можно ли создать челлендж бесплатно?</summary>
            <p>Да! Бесплатных тарифов нет, но вы можете попробовать платформу с минимальным тарифом «Стартер» за 990 ₽/мес.</p>
          </details>
          <details>
            <summary>Что происходит после окончания подписки?</summary>
            <p>Ваши челленджи остаются доступными, но создание новых блокируется до продления подписки.</p>
          </details>
          <details>
            <summary>Можно ли сменить тариф?</summary>
            <p>Да, вы можете повысить или понизить тариф в любое время. Разница будет пересчитана пропорционально.</p>
          </details>
          <details>
            <summary>Есть ли возврат средств?</summary>
            <p>Возврат возможен в течение первых 14 дней после оплаты. Обратитесь в поддержку.</p>
          </details>
        </div>
      </section>

      <style jsx>{`
        .pricing-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px clamp(16px, 3vw, 40px) 80px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-decoration: none;
          margin-bottom: 32px;
        }
        .back-link:hover { color: #FF385C; }
        .pricing-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .pricing-header h1 {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }
        .pricing-header p {
          font-size: 17px;
          color: #666;
          margin: 0;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 64px;
        }
        .plan-card {
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 24px;
          padding: 32px 28px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .plan-card.featured {
          border-color: #FF385C;
          transform: scale(1.02);
        }
        .popular-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: #FF385C;
          color: white;
          padding: 6px 18px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 800;
        }
        .plan-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF385C;
          margin-bottom: 16px;
        }
        .plan-name {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 12px;
        }
        .plan-price {
          margin-bottom: 24px;
        }
        .price-value {
          font-size: 36px;
          font-weight: 900;
        }
        .price-period {
          font-size: 15px;
          color: #888;
        }
        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 28px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .plan-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #444;
        }
        .plan-cta {
          display: block;
          text-align: center;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .plan-cta.primary {
          background: #FF385C;
          color: white;
        }
        .plan-cta.primary:hover {
          background: #E31C5F;
        }
        .plan-cta.secondary {
          background: #f3f4f6;
          color: #111;
        }
        .plan-cta.secondary:hover {
          background: #e5e7eb;
        }
        .pricing-faq {
          max-width: 700px;
          margin: 0 auto;
        }
        .pricing-faq h2 {
          font-size: 24px;
          font-weight: 900;
          text-align: center;
          margin: 0 0 24px;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        details {
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          overflow: hidden;
        }
        summary {
          padding: 18px 20px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          list-style: none;
        }
        summary::-webkit-details-marker { display: none; }
        details p {
          padding: 0 20px 18px;
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }
        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto 64px;
          }
          .plan-card.featured {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
