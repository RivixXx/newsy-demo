'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { PageShell } from '@/shared/components/page-shell';

/* ─── Seeded random for particles ─── */
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/* ─── Floating Particles ─── */
function HeroParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 3 + 1) * 100,
      y: seededRandom(i * 3 + 2) * 100,
      size: 1.5 + seededRandom(i * 3 + 3) * 3,
      delay: seededRandom(i * 3 + 4) * 8,
      duration: 6 + seededRandom(i * 3 + 5) * 10,
      opacity: 0.08 + seededRandom(i * 3 + 6) * 0.2,
    }));
  }, []);

  return (
    <div className="wh-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="wh-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated Counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('ru-RU');
            if (progress < 1) requestAnimationFrame(animate);
            else el.textContent = target.toLocaleString('ru-RU');
          };
          requestAnimationFrame(animate);
          obs.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Main Welcome Hero ─── */
export default function WelcomePage() {
  return (
    <PageShell variant="public">
      <div className="wh">
        {/* ═══════ HERO SECTION ═══════ */}
        <section className="wh-hero">
          <HeroParticles />
          <div className="wh-hero-glow" />
          <div className="wh-hero-glow wh-hero-glow--2" />

          <div className="wh-hero-content">
            {/* Badge */}
            <div className="wh-badge">
              <span className="wh-badge-dot" />
              Платформа челленджей для бизнеса и каждого
            </div>

            {/* Heading */}
            <h1 className="wh-title">
              Превращай рутину<br />
              <span className="wh-title-accent">в увлекательную игру</span>
            </h1>

            {/* Subheading */}
            <p className="wh-subtitle">
              Создавай интерактивные челленджи с геймификацией. Бренды, HR, блогеры
              — запускайте задания, а участники соревнуются и получают реальные награды.
            </p>

            {/* CTA buttons */}
            <div className="wh-actions">
              <Link href="/register" className="wh-btn wh-btn--primary">
                <span>Начать бесплатно</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/explore" className="wh-btn wh-btn--ghost">
                Смотреть каталог
              </Link>
            </div>

            {/* Trust line */}
            <p className="wh-trust">
              Уже <strong>48 000+</strong> участников и <strong>2 500+</strong> челленджей
            </p>
          </div>

          {/* Stats bar */}
          <div className="wh-stats">
            {[
              { value: 2500, suffix: '+', label: 'Челленджей' },
              { value: 48000, suffix: '+', label: 'Участников' },
              { value: 350, suffix: '+', label: 'Брендов' },
              { value: 48000, suffix: '+', label: 'Наград выдано' },
            ].map((s, i) => (
              <div key={i} className="wh-stat-item">
                <span className="wh-stat-val">
                  <Counter target={s.value} />
                  {s.suffix}
                </span>
                <span className="wh-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section className="wh-section">
          <div className="wh-container">
            <h2 className="wh-section-title">Как это работает</h2>
            <div className="wh-steps">
              {[
                { step: '01', title: 'Создайте', desc: 'Используйте конструктор: добавьте этапы, задания и награды без единой строчки кода.', icon: '🎯' },
                { step: '02', title: 'Запустите', desc: 'Опубликуйте в каталоге, поделитесь ссылкой через Telegram или соцсети.', icon: '🚀' },
                { step: '03', title: 'Побеждайте', desc: 'Участники соревнуются, выполняют задания и получают реальные призы.', icon: '🏆' },
              ].map((s) => (
                <div key={s.step} className="wh-step">
                  <div className="wh-step-icon">{s.icon}</div>
                  <div className="wh-step-num">{s.step}</div>
                  <h3 className="wh-step-title">{s.title}</h3>
                  <p className="wh-step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CATEGORIES ═══════ */}
        <section className="wh-section wh-section--alt">
          <div className="wh-container">
            <h2 className="wh-section-title">Категории челленджей</h2>
            <div className="wh-categories">
              {[
                { emoji: '🏃', name: 'Спорт и фитнес', count: '1200+' },
                { emoji: '📚', name: 'Образование', count: '890+' },
                { emoji: '🎨', name: 'Творчество', count: '650+' },
                { emoji: '🌍', name: 'Экология', count: '420+' },
                { emoji: '💼', name: 'Бизнес', count: '780+' },
                { emoji: '🎮', name: 'Развлечения', count: '540+' },
              ].map((c) => (
                <div key={c.name} className="wh-category">
                  <span className="wh-category-emoji">{c.emoji}</span>
                  <span className="wh-category-name">{c.name}</span>
                  <span className="wh-category-count">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="wh-section wh-cta-section">
          <div className="wh-container wh-cta-container">
            <div className="wh-cta-glow" />
            <h2 className="wh-cta-title">
              Готовы создать<br />свой первый челлендж?
            </h2>
            <p className="wh-cta-desc">
              Регистрация бесплатная. Создайте интерактивное задание за 15 минут
              и привлечь тысячи участников.
            </p>
            <Link href="/register" className="wh-btn wh-btn--primary wh-btn--lg">
              <span>Зарегистрироваться бесплатно</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        .wh {
          background: #0a0a0a;
          color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* ═══════ HERO ═══════ */
        .wh-hero {
          position: relative;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 120px 24px 60px;
        }

        .wh-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .wh-particle {
          position: absolute;
          background: rgba(255, 56, 92, 0.5);
          border-radius: 50%;
          animation: whFloat linear infinite;
          will-change: transform;
        }
        @keyframes whFloat {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-35px) translateX(8px); }
          100% { transform: translateY(0) translateX(0); }
        }

        .wh-hero-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(255, 56, 92, 0.12) 0%, transparent 70%);
          filter: blur(60px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: whPulseGlow 8s ease-in-out infinite;
          z-index: 0;
        }
        .wh-hero-glow--2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%);
          animation-delay: -4s;
          animation-duration: 10s;
        }
        @keyframes whPulseGlow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }

        .wh-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 780px;
          animation: whFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes whFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Badge */
        .wh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(255, 56, 92, 0.06);
          border: 1px solid rgba(255, 56, 92, 0.15);
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          color: #FF385C;
          margin-bottom: 32px;
          letter-spacing: 0.01em;
        }
        .wh-badge-dot {
          width: 6px;
          height: 6px;
          background: #FF385C;
          border-radius: 50%;
          animation: whDotPulse 2s ease-in-out infinite;
        }
        @keyframes whDotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Title */
        .wh-title {
          font-size: clamp(44px, 7vw, 84px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin: 0 0 28px;
          color: white;
        }
        .wh-title-accent {
          background: linear-gradient(135deg, #FF385C 0%, #FF6B8A 40%, #FFA0B4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Subtitle */
        .wh-subtitle {
          font-size: clamp(16px, 2vw, 20px);
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.65;
          max-width: 580px;
          margin: 0 auto 40px;
        }

        /* Buttons */
        .wh-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .wh-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          border: none;
          white-space: nowrap;
        }
        .wh-btn--primary {
          background: #FF385C;
          color: white;
          box-shadow: 0 0 0 0 rgba(255, 56, 92, 0.3);
          animation: whCtaPulse 3s ease-in-out infinite;
        }
        .wh-btn--primary:hover {
          background: #E31C5F;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255, 56, 92, 0.35);
        }
        .wh-btn--ghost {
          background: rgba(255, 255, 255, 0.04);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .wh-btn--ghost:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .wh-btn--lg {
          padding: 20px 44px;
          font-size: 17px;
          border-radius: 16px;
        }
        @keyframes whCtaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 56, 92, 0.3); }
          50% { box-shadow: 0 0 0 10px rgba(255, 56, 92, 0); }
        }

        /* Trust */
        .wh-trust {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.35);
          margin: 0;
        }
        .wh-trust strong {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 700;
        }

        /* Stats bar */
        .wh-stats {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 2px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
          margin-top: 64px;
          animation: whFadeIn 1s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .wh-stat-item {
          flex: 1;
          padding: 28px 24px;
          text-align: center;
          transition: background 0.2s;
        }
        .wh-stat-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .wh-stat-val {
          display: block;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 900;
          color: white;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .wh-stat-label {
          display: block;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.35);
          font-weight: 500;
          margin-top: 6px;
        }

        /* ═══════ SECTIONS ═══════ */
        .wh-section {
          position: relative;
          padding: 120px 24px;
        }
        .wh-section--alt {
          background: rgba(255, 255, 255, 0.015);
        }
        .wh-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .wh-section-title {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          text-align: center;
          margin: 0 0 72px;
          color: white;
        }

        /* Steps */
        .wh-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .wh-step {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 48px 36px;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .wh-step:hover {
          border-color: rgba(255, 56, 92, 0.2);
          background: rgba(255, 56, 92, 0.03);
          transform: translateY(-4px);
        }
        .wh-step-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .wh-step-num {
          font-size: 13px;
          font-weight: 800;
          color: #FF385C;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          font-variant-numeric: tabular-nums;
        }
        .wh-step-title {
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }
        .wh-step-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.6;
          margin: 0;
        }

        /* Categories */
        .wh-categories {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .wh-category {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          transition: all 0.25s;
          cursor: pointer;
        }
        .wh-category:hover {
          border-color: rgba(255, 56, 92, 0.2);
          background: rgba(255, 56, 92, 0.04);
          transform: translateX(4px);
        }
        .wh-category-emoji {
          font-size: 28px;
        }
        .wh-category-name {
          font-size: 16px;
          font-weight: 700;
          color: white;
          flex: 1;
        }
        .wh-category-count {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.3);
        }

        /* Final CTA */
        .wh-cta-section {
          text-align: center;
          padding: 160px 24px;
        }
        .wh-cta-container {
          position: relative;
        }
        .wh-cta-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 56, 92, 0.1) 0%, transparent 70%);
          filter: blur(80px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .wh-cta-title {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin: 0 0 24px;
          color: white;
          position: relative;
        }
        .wh-cta-desc {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.45);
          max-width: 520px;
          margin: 0 auto 48px;
          line-height: 1.6;
          position: relative;
        }

        /* ═══════ RESPONSIVE ═══════ */
        @media (max-width: 1024px) {
          .wh-steps {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }
          .wh-categories {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .wh-hero {
            padding: 100px 16px 40px;
            min-height: auto;
          }
          .wh-stats {
            flex-direction: column;
            gap: 0;
          }
          .wh-stat-item {
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
          }
          .wh-stat-item:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          }
          .wh-stat-val { font-size: 22px; }
          .wh-stat-label { margin-top: 0; }
          .wh-categories {
            grid-template-columns: 1fr;
          }
          .wh-section {
            padding: 80px 16px;
          }
          .wh-cta-section {
            padding: 100px 16px;
          }
        }

        @media (max-width: 480px) {
          .wh-btn {
            padding: 14px 24px;
            font-size: 14px;
          }
          .wh-btn--lg {
            padding: 18px 32px;
            font-size: 16px;
            width: 100%;
            justify-content: center;
          }
          .wh-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .wh-actions .wh-btn {
            justify-content: center;
          }
        }

        /* ═══════ REDUCED MOTION ═══════ */
        @media (prefers-reduced-motion: reduce) {
          .wh-particle { animation: none; }
          .wh-btn--primary { animation: none; }
          .wh-hero-content { animation: none; opacity: 1; transform: none; }
          .wh-stats { animation: none; opacity: 1; transform: none; }
          .wh-hero-glow { animation: none; }
          .wh-step:hover { transform: none; }
          .wh-category:hover { transform: none; }
        }
      `}</style>
    </PageShell>
  );
}
