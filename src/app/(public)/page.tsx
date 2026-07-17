'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Users, BarChart3, Trophy, MapPin, Sparkles } from 'lucide-react';
import { PUBLISH_TARIFFS } from '@/modules/payments/tariffs';
import { PageShell } from '@/shared/components/page-shell';

export default function LandingPage() {
  return (
    <PageShell variant="public">
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <Sparkles size={14} /> Платформа для организаторов и участников
          </div>
          <h1 className="hero-title">
            Создавай и запускай<br />
            <span className="gradient-text">марафоны, конкурсы, квесты</span><br />
            за 15 минут
          </h1>
          <p className="hero-sub">
            NEWSY — место, где бренды, НКО и HR создают интерактивные челленджи,
            а участники выполняют задания, соревнуются и получают награды.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn-primary">
              Создать челлендж <ArrowRight size={18} />
            </Link>
            <Link href="/explore" className="btn-secondary">
              Участвовать
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="mock-card mc-1">
            <div className="mc-img" />
            <div className="mc-body">
              <div className="mc-title" />
              <div className="mc-sub" />
            </div>
          </div>
          <div className="mock-card mc-2">
            <div className="mc-img" />
            <div className="mc-body">
              <div className="mc-title" />
              <div className="mc-sub" />
            </div>
          </div>
        </div>
      </section>

      {/* ДЛЯ КОГО */}
      <section className="audience">
        <h2 className="section-title">Для кого NEWSY?</h2>
        <div className="audience-grid">
          <div className="audience-card">
            <div className="ac-icon" style={{ background: 'linear-gradient(135deg, #FF385C, #ff6b8a)' }}>
              <Zap size={28} color="white" />
            </div>
            <h3>Для организаторов</h3>
            <p>Бренды, НКО, HR — создавайте челленджи для вовлечения аудитории, найма сотрудников или благотворительных акций.</p>
            <ul>
              <li>Конструктор за 15 минут</li>
              <li>Аналитика участников</li>
              <li>Монетизация и тарифы</li>
            </ul>
          </div>
          <div className="audience-card">
            <div className="ac-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
              <Users size={28} color="white" />
            </div>
            <h3>Для участников</h3>
            <p>Находите интересные челленджи, выполняйте задания, получайте достижения и соревнуйтесь с другими.</p>
            <ul>
              <li>Бесплатные и платные ЧИ</li>
              <li>Достижения и награды</li>
              <li>Чат с другими участниками</li>
            </ul>
          </div>
        </div>
      </section>

      {/* КАК РАБОТАЕТ */}
      <section className="how-it-works">
        <h2 className="section-title">Как работает NEWSY?</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Создайте</h3>
            <p>Используйте конструктор для создания челленджей с этапами, наградами и правилами.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Запустите</h3>
            <p>Опубликуйте челлендж, пригласите участников через соцсети или Telegram.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Анализируйте</h3>
            <p>Отслеживайте прогресс участников, конверсию по этапам и общую статистику.</p>
          </div>
        </div>
      </section>

      {/* ПРИМЕРЫ */}
      <section className="examples">
        <h2 className="section-title">Примеры челленджей</h2>
        <div className="examples-grid">
          <div className="example-card">
            <div className="ec-icon">🏃</div>
            <h3>Спортивный марафон</h3>
            <p>30-дневный марафон с ежедневными заданиями по бегу и ЗОЖ.</p>
          </div>
          <div className="example-card">
            <div className="ec-icon">📚</div>
            <h3>Образовательный интенсив</h3>
            <p>Изучите новый навык за 2 недели с проверкой знаний.</p>
          </div>
          <div className="example-card">
            <div className="ec-icon">🎨</div>
            <h3>Творческий конкурс</h3>
            <p>Покажите свои таланты и выиграйте призы от спонсоров.</p>
          </div>
          <div className="example-card">
            <div className="ec-icon">🌍</div>
            <h3>Экологическая акция</h3>
            <p>Участвуйте в благотворительных акциях и получайте достижения.</p>
          </div>
        </div>
      </section>

      {/* ТАРИФЫ */}
      <section className="pricing">
        <h2 className="section-title">Тарифы для организаторов</h2>
        <div className="pricing-grid">
          {PUBLISH_TARIFFS.map((tariff, i) => (
            <div key={tariff.id} className={`price-card ${tariff.recommended ? 'featured' : ''}`}>
              {tariff.recommended && <div className="popular">Популярный</div>}
              <h3>{tariff.name}</h3>
              <div className="price">
                {tariff.price === 0 ? 'Бесплатно' : `${tariff.price.toLocaleString('ru-RU')} ₽`}
                {tariff.price > 0 && <span>/мес</span>}
              </div>
              <ul>
                {tariff.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
              <Link href="/register" className={tariff.recommended ? 'btn-primary-sm' : 'btn-outline'}>
                {tariff.price === 0 ? 'Начать' : 'Выбрать'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <h2 className="section-title">Частые вопросы</h2>
        <div className="faq-list">
          <details>
            <summary>Что такое челлендж на NEWSY?</summary>
            <p>Челлендж — это интерактивное задание или серия заданий, которые участники выполняют за определённый срок. Это может быть спортивный марафон, образовательный интенсив, творческий конкурс или экологическая акция.</p>
          </details>
          <details>
            <summary>Сколько стоит создание челленджа?</summary>
            <p>Базовый тариф бесплатный — вы можете создать 1 челлендж с участием до 50 человек. Профессиональные тарифы начинаются от 2 990 ₽/мес.</p>
          </details>
          <details>
            <summary>Можно ли участвовать бесплатно?</summary>
            <p>Да! Многие челленджи на NEWSY бесплатные. Платные челленджи используются организаторами для покрытия расходов на призы и логистику.</p>
          </details>
          <details>
            <summary>Как работает монетизация?</summary>
            <p>Организаторы могут установить взнос за участие. NEWSY удерживает комиссию (по умолчанию 15%) и перечисляет остаток организатору после завершения челленджа.</p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <h2>Готовы создать свой первый челлендж?</h2>
        <p>Присоединяйтесь к тысячам организаторов и участников на NEWSY.</p>
        <div className="cta-actions">
          <Link href="/register" className="btn-primary">
            Начать бесплатно <ArrowRight size={18} />
          </Link>
          <Link href="/explore" className="btn-secondary">
            Смотреть каталог
          </Link>
        </div>
      </section>

      <style jsx>{`
        .landing { font-family: system-ui, -apple-system, sans-serif; }

        /* HERO */
        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 40px 60px;
          gap: 60px;
        }
        .hero-inner { flex: 1; max-width: 580px; }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(255,56,92,0.08);
          border: 1px solid rgba(255,56,92,0.15);
          border-radius: 99px;
          font-size: 13px;
          font-weight: 700;
          color: #FF385C;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin: 0 0 20px 0;
          color: #111;
        }
        .gradient-text {
          background: linear-gradient(135deg, #FF385C, #ff6b8a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 17px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }
        .hero-actions { display: flex; gap: 12px; margin-bottom: 40px; }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: #FF385C;
          color: white;
          border-radius: 14px;
          font-weight: 800;
          font-size: 15px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #E31C5F; }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: white;
          color: #111;
          border: 2px solid #e5e5e5;
          border-radius: 14px;
          font-weight: 800;
          font-size: 15px;
          text-decoration: none;
          transition: border-color 0.2s;
        }
        .btn-secondary:hover { border-color: #FF385C; color: #FF385C; }
        .hero-stats { display: flex; gap: 40px; }
        .stat strong { display: block; font-size: 24px; font-weight: 900; color: #111; }
        .stat span { font-size: 13px; color: #888; font-weight: 600; }

        .hero-visual {
          flex: 1;
          max-width: 480px;
          position: relative;
          height: 400px;
        }
        .mock-card {
          position: absolute;
          width: 260px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .mc-1 { top: 0; right: 0; transform: rotate(3deg); }
        .mc-2 { bottom: 0; left: 0; transform: rotate(-2deg); }
        .mc-img { height: 120px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
        .mc-body { padding: 16px; }
        .mc-title { height: 16px; background: #f3f4f6; border-radius: 4px; margin-bottom: 8px; width: 80%; }
        .mc-sub { height: 12px; background: #f3f4f6; border-radius: 4px; width: 60%; }

        /* SECTIONS COMMON */
        .section-title {
          text-align: center;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 900;
          margin: 0 0 48px 0;
          letter-spacing: -0.02em;
        }

        /* AUDIENCE */
        .audience {
          max-width: 1000px;
          margin: 0 auto;
          padding: 80px 40px;
        }
        .audience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .audience-card {
          padding: 36px;
          background: white;
          border-radius: 24px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
        }
        .ac-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .audience-card h3 { font-size: 22px; font-weight: 800; margin: 0 0 12px 0; }
        .audience-card p { font-size: 15px; color: #666; line-height: 1.6; margin: 0 0 16px 0; }
        .audience-card ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .audience-card li { font-size: 14px; color: #555; padding-left: 20px; position: relative; }
        .audience-card li::before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-weight: 700; }

        /* HOW IT WORKS */
        .how-it-works {
          background: #faf9f7;
          padding: 80px 40px;
        }
        .steps-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .step {
          flex: 1;
          text-align: center;
          padding: 32px 24px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        .step-num {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #FF385C;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          margin: 0 auto 16px;
        }
        .step h3 { font-size: 18px; font-weight: 800; margin: 0 0 8px 0; }
        .step p { font-size: 14px; color: #666; line-height: 1.5; margin: 0; }
        .step-arrow { font-size: 24px; color: #ccc; font-weight: 300; }

        /* EXAMPLES */
        .examples {
          max-width: 1000px;
          margin: 0 auto;
          padding: 80px 40px;
        }
        .examples-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .example-card {
          padding: 24px;
          background: white;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
          text-align: center;
        }
        .ec-icon { font-size: 36px; margin-bottom: 12px; }
        .example-card h3 { font-size: 16px; font-weight: 800; margin: 0 0 8px 0; }
        .example-card p { font-size: 13px; color: #666; line-height: 1.5; margin: 0; }

        /* PRICING */
        .pricing {
          background: #faf9f7;
          padding: 80px 40px;
        }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; margin: 0 auto; }
        .price-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          border: 2px solid #f0f0f0;
          position: relative;
        }
        .price-card.featured { border-color: #FF385C; }
        .popular {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #FF385C;
          color: white;
          padding: 4px 16px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 800;
        }
        .price-card h3 { font-size: 20px; font-weight: 800; margin: 0 0 8px 0; }
        .price { font-size: 32px; font-weight: 900; margin: 0 0 20px 0; }
        .price span { font-size: 14px; font-weight: 600; color: #888; }
        .price-card ul { list-style: none; padding: 0; margin: 0 0 24px 0; display: flex; flex-direction: column; gap: 10px; }
        .price-card li { font-size: 14px; color: #555; padding-left: 24px; position: relative; }
        .price-card li::before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-weight: 700; }
        .btn-outline {
          display: block;
          text-align: center;
          padding: 12px 24px;
          border: 2px solid #e5e5e5;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          color: #111;
          text-decoration: none;
          transition: border-color 0.2s;
        }
        .btn-outline:hover { border-color: #FF385C; color: #FF385C; }
        .btn-primary-sm {
          display: block;
          text-align: center;
          padding: 12px 24px;
          background: #FF385C;
          color: white;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          text-decoration: none;
        }

        /* FAQ */
        .faq { max-width: 700px; margin: 0 auto; padding: 80px 40px; }
        .faq-list { display: flex; flex-direction: column; gap: 12px; }
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
        details p { padding: 0 20px 18px; font-size: 14px; color: #666; line-height: 1.6; margin: 0; }

        /* CTA */
        .final-cta {
          text-align: center;
          padding: 80px 40px;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          color: white;
        }
        .final-cta h2 { font-size: clamp(28px, 3vw, 40px); font-weight: 900; margin: 0 0 12px 0; }
        .final-cta p { font-size: 16px; color: rgba(255,255,255,0.6); margin: 0 0 32px 0; }
        .cta-actions { display: flex; gap: 12px; justify-content: center; }
        .cta-actions .btn-secondary { border-color: rgba(255,255,255,0.2); color: white; background: transparent; }
        .cta-actions .btn-secondary:hover { border-color: white; }

        /* Responsive */
          .hero { flex-direction: column; padding: 40px 20px; text-align: center; }
          .hero-actions { justify-content: center; }
          .hero-stats { justify-content: center; }
          .hero-visual { display: none; }
          .audience-grid { grid-template-columns: 1fr; }
          .steps-grid { flex-direction: column; }
          .step-arrow { transform: rotate(90deg); }
          .examples-grid { grid-template-columns: 1fr 1fr; }
          .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
          .footer-inner { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>
    </div>
    </PageShell>
  );
}
