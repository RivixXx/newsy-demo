'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PUBLISH_TARIFFS } from '@/modules/payments/tariffs';
import { PageShell } from '@/shared/components/page-shell';
import { ScrollHero } from '@/shared/components/scroll-hero';

/* ─── Scroll reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ─── Parallax hook ─── */
function useParallax(speed = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          const offset = (center - viewCenter) * speed;
          el.style.transform = `translateY(${offset}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return ref;
}

/* ─── Counter animation ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const dur = 2000;
        const animate = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.unobserve(el);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString('ru-RU')}{suffix}</span>;
}

/* ─── Hero SVG Visual ─── */
/* ─── Section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="lp-reveal" style={{ marginBottom: 20, textAlign: 'center' }}>
      <span className="lp-section-badge">{children}</span>
    </div>
  );
}

/* ─── Feature illustration SVGs ─── */
function FeatureIllustration({ type }: { type: 'construct' | 'gamify' | 'partner' | 'analytics' | 'monetize' | 'mobile' }) {
  const illustrations: Record<string, React.ReactNode> = {
    construct: (
      <svg viewBox="0 0 200 160" className="lp-feature-svg">
        <defs>
          <linearGradient id="fc1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF385C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF6B8A" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect x="30" y="20" width="140" height="120" rx="12" fill="url(#fc1)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <rect x="44" y="36" width="60" height="8" rx="4" fill="rgba(255,56,92,0.4)" />
        <rect x="44" y="52" width="112" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
        <rect x="44" y="64" width="90" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
        <rect x="44" y="84" width="48" height="40" rx="8" fill="rgba(255,56,92,0.12)" stroke="rgba(255,56,92,0.2)" strokeWidth="1" />
        <rect x="100" y="84" width="56" height="18" rx="6" fill="rgba(255,255,255,0.06)" />
        <rect x="100" y="108" width="56" height="16" rx="6" fill="rgba(255,255,255,0.04)" />
        <circle cx="68" cy="104" r="8" fill="rgba(255,56,92,0.3)" />
        <path d="M64 104 L68 108 L74 100" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
    gamify: (
      <svg viewBox="0 0 200 160" className="lp-feature-svg">
        <circle cx="100" cy="70" r="40" fill="none" stroke="rgba(255,56,92,0.2)" strokeWidth="8" />
        <circle cx="100" cy="70" r="40" fill="none" stroke="#FF385C" strokeWidth="8" strokeDasharray="180 252" strokeLinecap="round" className="lp-progress-ring" />
        <text x="100" y="75" textAnchor="middle" fill="white" fontSize="20" fontWeight="800" fontFamily="system-ui">72%</text>
        <rect x="40" y="124" width="120" height="8" rx="4" fill="rgba(255,255,255,0.06)" />
        <rect x="40" y="124" width="86" height="8" rx="4" fill="#FF385C" opacity="0.6" />
        <circle cx="148" cy="60" r="12" fill="rgba(255,56,92,0.15)" />
        <text x="148" y="64" textAnchor="middle" fill="#FF385C" fontSize="10" fontWeight="800" fontFamily="system-ui">+5</text>
      </svg>
    ),
    partner: (
      <svg viewBox="0 0 200 160" className="lp-feature-svg">
        <circle cx="72" cy="72" r="32" fill="rgba(255,56,92,0.1)" stroke="rgba(255,56,92,0.25)" strokeWidth="1.5" />
        <circle cx="128" cy="72" r="32" fill="rgba(255,107,138,0.1)" stroke="rgba(255,107,138,0.25)" strokeWidth="1.5" />
        <ellipse cx="100" cy="72" rx="18" ry="32" fill="rgba(255,56,92,0.12)" />
        <text x="72" y="77" textAnchor="middle" fill="#FF385C" fontSize="14" fontWeight="800" fontFamily="system-ui">A</text>
        <text x="128" y="77" textAnchor="middle" fill="#FF6B8A" fontSize="14" fontWeight="800" fontFamily="system-ui">B</text>
        <rect x="50" y="120" width="100" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
        <rect x="50" y="120" width="60" height="6" rx="3" fill="rgba(255,56,92,0.3)" />
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 200 160" className="lp-feature-svg">
        <rect x="30" y="100" width="24" height="40" rx="4" fill="rgba(255,56,92,0.2)" />
        <rect x="62" y="70" width="24" height="70" rx="4" fill="rgba(255,56,92,0.3)" />
        <rect x="94" y="40" width="24" height="100" rx="4" fill="rgba(255,56,92,0.5)" />
        <rect x="126" y="55" width="24" height="85" rx="4" fill="rgba(255,56,92,0.35)" />
        <rect x="158" y="30" width="24" height="110" rx="4" fill="#FF385C" opacity="0.7" />
        <line x1="30" y1="140" x2="182" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </svg>
    ),
    monetize: (
      <svg viewBox="0 0 200 160" className="lp-feature-svg">
        <circle cx="100" cy="72" r="44" fill="none" stroke="rgba(255,56,92,0.15)" strokeWidth="1" />
        <text x="100" y="82" textAnchor="middle" fill="white" fontSize="32" fontWeight="900" fontFamily="system-ui" opacity="0.9">₽</text>
        <circle cx="100" cy="72" r="44" fill="none" stroke="#FF385C" strokeWidth="2" strokeDasharray="80 276" strokeLinecap="round" className="lp-progress-ring" style={{ transformOrigin: '100px 72px' }} />
        <rect x="56" y="130" width="88" height="8" rx="4" fill="rgba(255,255,255,0.06)" />
        <rect x="56" y="130" width="62" height="8" rx="4" fill="#FF385C" opacity="0.4" />
        <text x="138" y="138" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="600" fontFamily="system-ui">70%</text>
      </svg>
    ),
    mobile: (
      <svg viewBox="0 0 200 160" className="lp-feature-svg">
        <rect x="68" y="10" width="64" height="120" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <rect x="74" y="22" width="52" height="96" rx="4" fill="rgba(255,56,92,0.08)" />
        <rect x="82" y="32" width="36" height="6" rx="3" fill="rgba(255,56,92,0.4)" />
        <rect x="82" y="44" width="28" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="82" y="54" width="36" height="28" rx="6" fill="rgba(255,56,92,0.15)" />
        <circle cx="100" cy="68" r="6" fill="rgba(255,56,92,0.4)" />
        <rect x="82" y="90" width="36" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
        <rect x="82" y="98" width="20" height="4" rx="2" fill="rgba(255,255,255,0.04)" />
        <circle cx="100" cy="134" r="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <rect x="90" y="14" width="20" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
      </svg>
    ),
  };
  return <>{illustrations[type]}</>;
}

/* ═══════════════════════════════════════ MAIN ═══════════════════════════════════════ */
export default function WelcomePage() {
  const featuresRef = useReveal();
  const howRef = useReveal();
  const statsRef = useReveal();
  const showcaseRef = useReveal();
  const pricingRef = useReveal();
  const faqRef = useReveal();
  const ctaRef = useReveal();
  const parallaxCards = useParallax(-0.08);

  return (
    <PageShell variant="public">
      <div className="lp">

        {/* ═══ HERO — 5-phase scroll-driven 3D experience ═══ */}
        <ScrollHero />

        {/* ═══ FEATURES ═══ */}
        <section className="lp-section" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Возможности</SectionLabel>
            <h2 className="lp-section-title" ref={featuresRef}>
              Всё для создания<br /> интерактивных челленджей
            </h2>
            <div className="lp-features-grid">
              {([
                { type: 'construct', num: '01', title: 'Конструктор заданий', desc: 'Многоэтапные квесты с загрузкой фото, ответами и проверкой. Создайте за 15 минут.' },
                { type: 'gamify', num: '02', title: 'Геймификация', desc: 'Очки, достижения, рейтинги. Участники соревнуются за первые места и реальные награды.' },
                { type: 'partner', num: '03', title: 'Партнёрства', desc: 'Запускайте совместные челленджи с другими брендами. Делитесь аудиторией и бюджетом.' },
                { type: 'analytics', num: '04', title: 'Аналитика', desc: 'Конверсия по этапам, активность участников. Всё в реальном времени.' },
                { type: 'monetize', num: '05', title: 'Монетизация', desc: 'Установите взнос за участие. Комиссия от 15% — деньги после завершения.' },
                { type: 'mobile', num: '06', title: 'Мобильный опыт', desc: 'Полноценное мобильное приложение. Участники проходят задания с телефона.' },
              ] as const).map((f) => (
                <div key={f.num} className="lp-feature-card lp-reveal">
                  <div className="lp-feature-illustration">
                    <FeatureIllustration type={f.type as any} />
                  </div>
                  <span className="lp-feature-num">{f.num}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="lp-section lp-section--dark" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Как это работает</SectionLabel>
            <h2 className="lp-section-title" ref={howRef}>Три шага до запуска</h2>
            <div className="lp-steps">
              {[
                { step: '01', title: 'Создайте', desc: 'Используйте конструктор: добавьте этапы, задания, награды и правила. Визуальный редактор без кода.' },
                { step: '02', title: 'Запустите', desc: 'Опубликуйте в каталоге, поделитесь ссылкой или отправьте через Telegram и соцсети.' },
                { step: '03', title: 'Анализируйте', desc: 'Отслеживайте прогресс, конверсию по этапам и общую статистику в дашборде.' },
              ].map((s, i) => (
                <div key={s.step} className="lp-step lp-reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="lp-step-visual">
                    <div className="lp-step-num">{s.step}</div>
                    <div className="lp-step-line" />
                  </div>
                  <div className="lp-step-content">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="lp-section" style={{ paddingTop: 140, paddingBottom: 140 }}>
          <div className="lp-container">
            <div className="lp-stats-row" ref={statsRef}>
              {[
                { value: 2500, suffix: '+', label: 'Челленджей' },
                { value: 48000, suffix: '+', label: 'Участников' },
                { value: 92, suffix: '%', label: 'Конверсия' },
                { value: 4.8, suffix: '/5', label: 'Рейтинг', isDecimal: true },
              ].map((s, i) => (
                <div key={i} className="lp-stat-block lp-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="lp-stat-big">
                    {s.isDecimal ? '4.8' : <Counter target={s.value} />}
                    {s.suffix}
                  </span>
                  <span className="lp-stat-small">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SHOWCASE ═══ */}
        <section className="lp-section lp-section--gradient" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Примеры</SectionLabel>
            <h2 className="lp-section-title" ref={showcaseRef}>Челленджи, которые вдохновляют</h2>
            <div className="lp-showcase" ref={parallaxCards}>
              {[
                { emoji: '🏃', title: 'Спортивный марафон', desc: '30 дней бега и ЗОЖ. Ежедневные задания, трекинг прогресса, призы от партнёров.', grad: 'linear-gradient(135deg, #FF6B6B, #FF385C)' },
                { emoji: '📚', title: 'Образовательный интенсив', desc: 'Новый навык за 14 дней. Проверка знаний, сертификаты, рейтинг участников.', grad: 'linear-gradient(135deg, #4ECDC4, #44B09E)' },
                { emoji: '🎨', title: 'Творческий конкурс', desc: 'Покажи талант. Жюри из экспертов, голосование аудитории, реальные призы.', grad: 'linear-gradient(135deg, #A78BFA, #7C3AED)' },
                { emoji: '🌍', title: 'Экологическая акция', desc: 'Собери мусор, посади дерево. Благотворительность с геймификацией.', grad: 'linear-gradient(135deg, #34D399, #059669)' },
              ].map((c, i) => (
                <div key={i} className="lp-showcase-card lp-reveal" style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="lp-showcase-visual" style={{ background: c.grad }}>
                    <span className="lp-showcase-emoji">{c.emoji}</span>
                  </div>
                  <div className="lp-showcase-info">
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section className="lp-section" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Тарифы</SectionLabel>
            <h2 className="lp-section-title" ref={pricingRef}>Прозрачные цены для каждого</h2>
            <div className="lp-pricing-grid">
              {PUBLISH_TARIFFS.map((t, i) => (
                <div key={t.id} className={`lp-price-card lp-reveal ${t.recommended ? 'lp-price-card--featured' : ''}`} style={{ animationDelay: `${i * 0.12}s` }}>
                  {t.recommended && <div className="lp-price-badge">Популярный</div>}
                  <h3>{t.name}</h3>
                  <div className="lp-price-amount">
                    {t.price === 0 ? 'Бесплатно' : (
                      <>
                        <span className="lp-price-num">{t.price.toLocaleString('ru-RU')}</span>
                        <span className="lp-price-currency"> ₽<span className="lp-price-period">/мес</span></span>
                      </>
                    )}
                  </div>
                  <ul className="lp-price-features">
                    {t.features.map((f, j) => (
                      <li key={j}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`lp-btn ${t.recommended ? 'lp-btn--primary' : 'lp-btn--outline'}`} style={{ width: '100%', justifyContent: 'center' }}>
                    {t.price === 0 ? 'Начать бесплатно' : 'Выбрать тариф'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="lp-section lp-section--dark" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container" style={{ maxWidth: 760 }}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="lp-section-title" ref={faqRef}>Частые вопросы</h2>
            <div className="lp-faq-list">
              {[
                { q: 'Что такое челлендж на NEWSY?', a: 'Челлендж — это интерактивное задание или серия заданий, которые участники выполняют за определённый срок. Спортивный марафон, образовательный интенсив, творческий конкурс — любая активность с геймификацией.' },
                { q: 'Сколько стоит создание?', a: 'Базовый тариф бесплатный — 1 челлендж, до 50 участников. Профессиональные тарифы от 2 990 ₽/мес с расширенными возможностями.' },
                { q: 'Можно ли участвовать бесплатно?', a: 'Да! Большинство челленджей на NEWSY бесплатные. Платные используются организаторами для покрытия расходов на призы и логистику.' },
                { q: 'Как работает монетизация?', a: 'Организаторы устанавливают взнос за участие. Комиссия от 15%. Остаток перечисляется после завершения челленджа.' },
              ].map((item, i) => (
                <details key={i} className="lp-faq-item lp-reveal" style={{ animationDelay: `${i * 0.08}s` }}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="lp-section" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container" style={{ textAlign: 'center' }}>
            <div ref={ctaRef} className="lp-reveal">
              <h2 className="lp-cta-title">Готовы создать свой первый челлендж?</h2>
              <p className="lp-cta-desc">Присоединяйтесь к тысячам организаторов и участников.</p>
              <div className="lp-hero-actions" style={{ justifyContent: 'center' }}>
                <Link href="/register" className="lp-btn lp-btn--primary lp-btn--lg">
                  <span>Начать бесплатно</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/register" className="lp-btn lp-btn--ghost lp-btn--lg">Начать бесплатно</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        /* ═══════════════ BASE ═══════════════ */
        .lp {
          --bg: #0a0a0a;
          --bg-elevated: #111111;
          --surface: #1a1a1a;
          --border: rgba(255,255,255,0.06);
          --text: #f5f5f5;
          --text-muted: #888888;
          --text-dim: #555555;
          --brand: #FF385C;
          --brand-glow: rgba(255,56,92,0.25);
          --radius: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }

        /* ═══════════════ REVEAL ═══════════════ */
        .lp-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .lp-reveal.revealed { opacity: 1; transform: translateY(0); }

        /* ═══════════════ BUTTONS ═══════════════ */
        .lp-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          cursor: pointer;
          border: none;
          white-space: nowrap;
        }
        .lp-btn--primary {
          background: var(--brand);
          color: white;
          box-shadow: 0 0 0 0 var(--brand-glow);
        }
        .lp-btn--primary:hover {
          background: #E31C5F;
          box-shadow: 0 8px 32px var(--brand-glow);
          transform: translateY(-2px);
        }
        .lp-btn--ghost {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .lp-btn--ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .lp-btn--outline {
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .lp-btn--outline:hover {
          border-color: var(--brand);
          color: var(--brand);
        }
        .lp-btn--lg {
          padding: 18px 40px;
          font-size: 16px;
          border-radius: 16px;
        }

        /* ═══════════════ SECTIONS ═══════════════ */
        .lp-section { position: relative; }
        .lp-section--dark { background: var(--bg-elevated); }
        .lp-section--gradient {
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg-elevated) 50%, var(--bg) 100%);
        }
        .lp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .lp-section-badge {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(255,56,92,0.08);
          border: 1px solid rgba(255,56,92,0.15);
          border-radius: 99px;
          font-size: 13px;
          font-weight: 700;
          color: var(--brand);
          letter-spacing: 0.02em;
        }
        .lp-section-title {
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin: 0 0 64px 0;
          color: white;
          text-align: center;
        }

        /* ═══════════════ FEATURES ═══════════════ */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .lp-feature-card {
          padding: 40px 32px;
          background: var(--bg);
          position: relative;
          transition: background 0.3s;
        }
        .lp-feature-card:hover { background: var(--surface); }
        .lp-feature-illustration {
          height: 120px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-feature-svg {
          width: 160px;
          height: 120px;
        }
        .lp-feature-num {
          display: block;
          font-size: 12px;
          font-weight: 800;
          color: var(--brand);
          letter-spacing: 0.08em;
          margin-bottom: 16px;
          font-variant-numeric: tabular-nums;
        }
        .lp-feature-card h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: white;
          letter-spacing: -0.02em;
        }
        .lp-feature-card p {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        /* ═══════════════ STEPS ═══════════════ */
        .lp-steps {
          display: flex;
          flex-direction: column;
          max-width: 700px;
          margin: 0 auto;
        }
        .lp-step {
          display: flex;
          gap: 32px;
          padding: 48px 0;
          border-bottom: 1px solid var(--border);
        }
        .lp-step:last-child { border-bottom: none; }
        .lp-step-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .lp-step-num {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: var(--brand);
          font-variant-numeric: tabular-nums;
        }
        .lp-step-line {
          width: 1px;
          flex: 1;
          background: var(--border);
          min-height: 40px;
        }
        .lp-step:last-child .lp-step-line { display: none; }
        .lp-step-content h3 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 12px 0;
          color: white;
          letter-spacing: -0.02em;
        }
        .lp-step-content p {
          font-size: 16px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        /* ═══════════════ STATS ═══════════════ */
        .lp-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          background: var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .lp-stat-block {
          padding: 48px 24px;
          background: var(--bg);
          text-align: center;
          transition: background 0.3s;
        }
        .lp-stat-block:hover { background: var(--surface); }
        .lp-stat-big {
          display: block;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 900;
          color: white;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
        }
        .lp-stat-small {
          display: block;
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 8px;
        }

        /* ═══════════════ SHOWCASE ═══════════════ */
        .lp-showcase {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .lp-showcase-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .lp-showcase-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.1);
        }
        .lp-showcase-visual {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-showcase-emoji {
          font-size: 64px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .lp-showcase-card:hover .lp-showcase-emoji {
          transform: scale(1.15) rotate(-5deg);
        }
        .lp-showcase-info { padding: 28px 32px; }
        .lp-showcase-info h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: white;
          letter-spacing: -0.02em;
        }
        .lp-showcase-info p {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        /* ═══════════════ PRICING ═══════════════ */
        .lp-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .lp-price-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 40px 32px;
          position: relative;
          transition: all 0.3s;
        }
        .lp-price-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-4px);
        }
        .lp-price-card--featured {
          border-color: var(--brand);
          background: linear-gradient(180deg, rgba(255,56,92,0.05) 0%, var(--surface) 100%);
        }
        .lp-price-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--brand);
          color: white;
          padding: 5px 18px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }
        .lp-price-card h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 16px 0;
          color: white;
        }
        .lp-price-amount {
          margin: 0 0 32px 0;
          min-height: 56px;
          display: flex;
          align-items: baseline;
          gap: 2px;
        }
        .lp-price-num {
          font-size: 48px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .lp-price-currency {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .lp-price-period {
          font-size: 14px;
          color: var(--text-dim);
        }
        .lp-price-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .lp-price-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--text-muted);
        }
        .lp-price-features li svg {
          color: var(--brand);
          flex-shrink: 0;
        }

        /* ═══════════════ FAQ ═══════════════ */
        .lp-faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lp-faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .lp-faq-item:hover,
        .lp-faq-item[open] { border-color: rgba(255,255,255,0.12); }
        .lp-faq-item summary {
          padding: 22px 28px;
          font-size: 16px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: color 0.2s;
        }
        .lp-faq-item summary::-webkit-details-marker { display: none; }
        .lp-faq-item summary::after {
          content: '+';
          font-size: 20px;
          color: var(--text-dim);
          transition: transform 0.3s;
          flex-shrink: 0;
        }
        .lp-faq-item[open] summary::after {
          transform: rotate(45deg);
          color: var(--brand);
        }
        .lp-faq-item summary:hover { color: var(--brand); }
        .lp-faq-item p {
          padding: 0 28px 22px;
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0;
        }

        /* ═══════════════ CTA ═══════════════ */
        .lp-cta-title {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin: 0 0 20px 0;
          color: white;
        }
        .lp-cta-desc {
          font-size: 18px;
          color: var(--text-muted);
          margin: 0 0 40px 0;
        }

        /* ═══════════════ RESPONSIVE ═══════════════ */
        @media (max-width: 1024px) {
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
        }
        @media (max-width: 768px) {
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-feature-illustration { height: 100px; }
          .lp-step { flex-direction: column; gap: 20px; padding: 32px 0; }
          .lp-step-visual { flex-direction: row; }
          .lp-step-line { width: 40px; height: 1px; min-height: unset; }
          .lp-stats-row { grid-template-columns: repeat(2, 1fr); }
          .lp-showcase { grid-template-columns: 1fr; }
          .lp-section-title { margin-bottom: 48px; }
        }
        @media (max-width: 480px) {
          .lp-btn { padding: 14px 24px; font-size: 14px; }
          .lp-btn--lg { padding: 16px 28px; }
          .lp-feature-card { padding: 32px 24px; }
        }

        /* ═══════════════ REDUCED MOTION ═══════════════ */
        @media (prefers-reduced-motion: reduce) {
          .lp-reveal { opacity: 1; transform: none; transition: none; }
          .lp-float-slow, .lp-float-med, .lp-float-fast { animation: none; }
          .lp-progress-ring { animation: none; stroke-dashoffset: 72; }
          .lp-btn--primary:hover,
          .lp-showcase-card:hover,
          .lp-price-card:hover { transform: none; }
        }
      `}</style>
    </PageShell>
  );
}
