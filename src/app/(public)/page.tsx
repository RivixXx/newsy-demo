'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PUBLISH_TARIFFS } from '@/modules/payments/tariffs';
import { PageShell } from '@/shared/components/page-shell';

/* ─── HOOKS ─── */

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('rv--show'); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

function useAnimatedCounter(target: number) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const duration = 2000;
        const start = performance.now();
        const animate = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.unobserve(el);
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return [count, ref] as const;
}

/* ─── SHARED COMPONENTS ─── */

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`rv ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="pill">{children}</span>;
}

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, ref] = useAnimatedCounter(target);
  return <span ref={ref}>{count.toLocaleString('ru-RU')}{suffix}</span>;
}

/* ─── HERO: AMBIENT BG (CSS orbs) ─── */

function AmbientBg() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-orb ambient-orb--coral" />
      <div className="ambient-orb ambient-orb--lavender" />
      <div className="ambient-orb ambient-orb--amber" />
      <div className="ambient-grid" />
    </div>
  );
}

/* ─── HERO: LIVE ACTIVITY FEED (pure CSS) ─── */

const FEED_ITEMS = [
  { emoji: '🏃', user: 'Иван', action: 'завершил', target: 'Спортивный марафон' },
  { emoji: '📚', user: 'Анна', action: 'прошла 7 из 14 дней', target: 'Дизайн-интенсив' },
  { emoji: '🎨', user: 'Дмитрий', action: 'выложил работу в', target: 'Творческий конкурс' },
  { emoji: '🌍', user: 'Елена', action: 'получила награду', target: 'Эко-герой' },
];

function LiveFeed() {
  return (
    <div className="feed-panel">
      <div className="feed-header">
        <span className="feed-dot" />
        Прямо сейчас
      </div>
      <div className="feed-track" aria-live="polite" aria-label="Активность участников">
        {FEED_ITEMS.map((item, i) => (
          <div key={i} className="feed-card" style={{ ['--i' as string]: i } as React.CSSProperties}>
            <span className="feed-emoji">{item.emoji}</span>
            <div className="feed-body">
              <span className="feed-user">{item.user}</span>{' '}
              <span className="feed-action">{item.action}</span>{' '}
              <span className="feed-target">«{item.target}»</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── HERO: LIVE BADGE ─── */

function LiveBadge() {
  const [count, setCount] = useState(24);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 1400);
    const interval = setInterval(() => {
      setCount((c) => Math.max(8, Math.min(42, c + (Math.random() > 0.5 ? 1 : -1))));
    }, 5000);
    return () => { clearTimeout(t1); clearInterval(interval); };
  }, []);

  if (!show) return null;

  return (
    <div className="live-badge">
      <span className="live-dot" />
      <span>
        Сейчас <strong>{count}</strong>{' '}
        {count >= 11 && count <= 19 ? 'человек проходят' : count % 10 === 1 ? 'человек проходит' : 'человек проходят'}{' '}
        челлендж
      </span>
    </div>
  );
}

/* ─── HERO SECTION ─── */

function HeroSection() {
  return (
    <section className="hero">
      <AmbientBg />
      <div className="hero-inner">
        <div className="hero-text">
          <Reveal>
            <span className="hero-badge">Платформа челленджей</span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1>
              Превращай рутину<br />
              <span className="gradient-text">в игру</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="hero-desc">
              Создавай челленджи с геймификацией. Бренды, HR, НКО&nbsp;—
              запускайте интерактивные задания, а участники соревнуются
              и&nbsp;получают реальные награды.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="hero-actions">
              <Link href="/register" className="btn btn--primary btn--lg">
                <span>Создать челлендж</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/explore" className="btn btn--ghost btn--lg">
                Смотреть каталог
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <LiveBadge />
          </Reveal>

          <Reveal delay={0.48}>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num"><CountUp target={2500} suffix="+" /></span>
                <span className="hero-stat-label">челленджей</span>
              </div>
              <span className="hero-stat-dash" aria-hidden="true" />
              <div className="hero-stat">
                <span className="hero-stat-num"><CountUp target={48000} suffix="+" /></span>
                <span className="hero-stat-label">участников</span>
              </div>
              <span className="hero-stat-dash" aria-hidden="true" />
              <div className="hero-stat">
                <span className="hero-stat-num"><CountUp target={350} suffix="+" /></span>
                <span className="hero-stat-label">брендов</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="hero-visual">
          <Reveal delay={0.2}>
            <LiveFeed />
          </Reveal>
        </div>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <div className="scroll-mouse">
          <div className="scroll-dot" />
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ─── */

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: 'Конструктор заданий',
    desc: 'Многоэтапные квесты с фото, ответами и проверкой. Визуальный редактор — создайте за 15 минут без кода.',
    accent: 'coral',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Геймификация',
    desc: 'Очки, уровни, достижения, рейтинги и награды. Участники соревнуются — вы получаете вовлечённую аудиторию.',
    accent: 'lavender',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Партнёрства',
    desc: 'Совместные челленджи с брендами. Делитесь аудиторией, бюджетом и удваивайте охват.',
    accent: 'amber',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Аналитика',
    desc: 'Конверсия по этапам, активность, тепловые карты прохождения. Все метрики в реальном времени.',
    accent: 'coral',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Монетизация',
    desc: 'Установите взнос за участие. Комиссия от&nbsp;15%&nbsp;— деньги перечисляются после завершения.',
    accent: 'lavender',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: 'Мобильный опыт',
    desc: 'Полноценное приложение. Фото, геолокация, видео — всё с телефона, без ограничений.',
    accent: 'amber',
  },
] as const;

function FeaturesSection() {
  return (
    <section className="sec" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="container">
        <Reveal>
          <SectionLabel>Возможности</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="sec-title" style={{ marginBottom: 64 }}>
            Всё для создания<br /> интерактивных челленджей
          </h2>
        </Reveal>
        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feat-card feat-card--${f.accent}`}>
              <Reveal delay={i * 0.06}>
                <div className={`feat-icon feat-icon--${f.accent}`}>{f.icon}</div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */

const STEPS = [
  { num: '01', title: 'Создайте', desc: 'Конструктор без кода: этапы, задания, награды, правила. Всё за 15 минут.' },
  { num: '02', title: 'Запустите', desc: 'Опубликуйте в каталоге. Поделитесь ссылкой в соцсетях и Telegram.' },
  { num: '03', title: 'Анализируйте', desc: 'Прогресс, конверсия, вовлечённость — вся статистика в дашборде.' },
];

function StepsSection() {
  return (
    <section className="sec sec--dark" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div className="container">
        <Reveal>
          <SectionLabel>Как это работает</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="sec-title" style={{ marginBottom: 72 }}>
            Три шага<br /> до&nbsp;запуска
          </h2>
        </Reveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.num} className="step">
              <Reveal delay={i * 0.15}>
                <div className="step-visual">
                  <span className="step-circle">{s.num}</span>
                  {i < STEPS.length - 1 && <span className="step-line" aria-hidden="true" />}
                </div>
                <div className="step-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── STATS ─── */

const STATS_DATA = [
  { value: 2500, suffix: '+', label: 'Челленджей создано' },
  { value: 48000, suffix: '+', label: 'Участников' },
  { value: 92, suffix: '%', label: 'Средняя конверсия' },
  { value: 4.8, suffix: '/5', label: 'Рейтинг платформы', fixed: true },
];

function StatsSection() {
  return (
    <section className="sec" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div className="container">
        <div className="stats-grid">
          {STATS_DATA.map((s, i) => (
            <div key={i} className="stat-cell">
              <Reveal delay={i * 0.08}>
                <span className="stat-num">
                  {s.fixed ? `${s.value}${s.suffix}` : <CountUp target={s.value} suffix={s.suffix} />}
                </span>
                <span className="stat-label">{s.label}</span>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SHOWCASE ─── */

const SHOWCASE = [
  { emoji: '🏃', title: 'Спортивный марафон', desc: '30 дней бега и ЗОЖ. Ежедневные задания, трекинг, призы от партнёров.', gradient: 'linear-gradient(135deg, #FF6B6B, #FF385C)' },
  { emoji: '📚', title: 'Образовательный интенсив', desc: 'Новый навык за 14 дней. Проверка знаний, сертификаты, рейтинг.', gradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)' },
  { emoji: '🎨', title: 'Творческий конкурс', desc: 'Покажи талант. Жюри из экспертов, голосование аудитории, призы.', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  { emoji: '🌍', title: 'Экологическая акция', desc: 'Собери мусор, посади дерево. Благотворительность с геймификацией.', gradient: 'linear-gradient(135deg, #34D399, #059669)' },
];

function ShowcaseSection() {
  return (
    <section className="sec sec--gradient" style={{ paddingTop: 140, paddingBottom: 140 }}>
      <div className="container">
        <Reveal>
          <SectionLabel>Примеры</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="sec-title" style={{ marginBottom: 64 }}>
            Челленджи, которые<br /> вдохновляют
          </h2>
        </Reveal>
        <div className="show-grid">
          {SHOWCASE.map((c, i) => (
            <div key={i} className="show-card">
              <Reveal delay={i * 0.1}>
                <div className="show-visual" style={{ background: c.gradient }}>
                  <span className="show-emoji">{c.emoji}</span>
                </div>
                <div className="show-body">
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ─── */

function PricingSection() {
  return (
    <section className="sec" style={{ paddingTop: 140, paddingBottom: 140 }}>
      <div className="container">
        <Reveal>
          <SectionLabel>Тарифы</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="sec-title" style={{ marginBottom: 64 }}>
            Прозрачные цены<br /> для каждого
          </h2>
        </Reveal>
        <div className="price-grid">
          {PUBLISH_TARIFFS.map((t, i) => (
            <div key={t.id} className={`price-card ${t.recommended ? 'price-card--feat' : ''}`}>
              <Reveal delay={i * 0.1}>
                {t.recommended && <span className="price-badge">Популярный</span>}
                <h3 className="price-name">{t.name}</h3>
                <div className="price-amount">
                  {t.price === 0 ? (
                    <span className="price-free">Бесплатно</span>
                  ) : (
                    <>
                      <span className="price-num">{t.price.toLocaleString('ru-RU')}</span>
                      <span className="price-currency"> ₽<span className="price-period">/мес</span></span>
                    </>
                  )}
                </div>
                <ul className="price-feats">
                  {t.features.map((f, j) => (
                    <li key={j}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`btn ${t.recommended ? 'btn--primary' : 'btn--outline'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {t.price === 0 ? 'Начать бесплатно' : 'Выбрать тариф'}
                </Link>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

const FAQ = [
  { q: 'Что такое челлендж на ЧИ?', a: 'Челлендж — это серия интерактивных заданий на определённый срок. Спортивный марафон, образовательный интенсив, творческий конкурс — любая активность с геймификацией.' },
  { q: 'Сколько стоит создание?', a: 'Базовый тариф бесплатный — 1 челлендж, до 50 участников. Профессиональные тарифы от 2 990 ₽/мес.' },
  { q: 'Можно ли участвовать бесплатно?', a: 'Да! Большинство челленджей на ЧИ бесплатные. Платные используются организаторами для покрытия расходов на призы.' },
  { q: 'Как работает монетизация?', a: 'Организаторы устанавливают взнос за участие. Комиссия платформы — от 15%. Остаток перечисляется после завершения.' },
  { q: 'Какая аудитория у платформы?', a: 'Активная аудитория 18–35 лет, Россия и СНГ. 70% участников возвращаются к новым челленджам.' },
];

function FaqSection() {
  return (
    <section className="sec sec--dark" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <Reveal>
          <SectionLabel>FAQ</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="sec-title" style={{ marginBottom: 48 }}>
            Частые вопросы
          </h2>
        </Reveal>
        <div className="faq-list">
          {FAQ.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>{item.q}</summary>
              <div className="faq-body">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */

function CtaSection() {
  return (
    <section className="sec cta-sec" style={{ paddingTop: 140, paddingBottom: 140 }}>
      <div className="ambient ambient--cta" aria-hidden="true">
        <div className="ambient-orb ambient-orb--coral" />
        <div className="ambient-orb ambient-orb--lavender" />
      </div>
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <h2 className="cta-title">
            Готовы создать<br /> свой первый челлендж?
          </h2>
          <p className="cta-desc">
            Присоединяйтесь к тысячам организаторов и участников.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="/register" className="btn btn--primary btn--lg">
              <span>Начать бесплатно</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/explore" className="btn btn--ghost btn--lg">
              Смотреть каталог
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <PageShell variant="landing">
      <div className="lp">
        <HeroSection />
        <FeaturesSection />
        <StepsSection />
        <StatsSection />
        <ShowcaseSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </div>

      <style>{`

/* ═══════════ VARIABLES ═══════════ */
.lp {
  --bg: #07080C;
  --bg-alt: #0C0D12;
  --surface: #121318;
  --surface-hover: #181A22;
  --border: rgba(255,255,255,0.05);
  --border-hover: rgba(255,255,255,0.1);
  --brand: #FF385C;
  --brand-hover: #E31C5F;
  --brand-subtle: rgba(255,56,92,0.08);
  --lavender: #A78BFA;
  --lavender-subtle: rgba(167,139,250,0.08);
  --amber: #F59E0B;
  --amber-subtle: rgba(245,158,11,0.08);
  --radius: 20px;
  --radius-sm: 12px;
  --radius-xs: 10px;
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg);
  color: #fff;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ═══════════ REVEAL ═══════════ */
.rv {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
              transform 0.7s cubic-bezier(0.16,1,0.3,1);
}
.rv--show { opacity: 1; transform: translateY(0); }

/* ═══════════ PILL ═══════════ */
.pill {
  display: inline-flex;
  padding: 6px 16px;
  background: var(--brand-subtle);
  border: 1px solid rgba(255,56,92,0.12);
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: var(--font-sans, sans-serif);
}

/* ═══════════ BUTTONS ═══════════ */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: var(--radius-xs);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
  cursor: pointer;
  border: none;
  white-space: nowrap;
  font-family: inherit;
}
.btn--primary {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 0 0 0 rgba(255,56,92,0.3);
}
.btn--primary:hover {
  background: var(--brand-hover);
  box-shadow: 0 8px 32px rgba(255,56,92,0.25);
  transform: translateY(-2px);
}
.btn--ghost {
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.65);
  border: 1px solid var(--border);
}
.btn--ghost:hover {
  background: rgba(255,255,255,0.08);
  border-color: var(--border-hover);
  color: #fff;
}
.btn--outline {
  background: transparent;
  color: rgba(255,255,255,0.65);
  border: 1px solid var(--border);
}
.btn--outline:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.btn--lg { padding: 16px 32px; font-size: 16px; border-radius: 14px; }

/* ═══════════ AMBIENT BG ═══════════ */
.ambient {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}
.ambient-orb--coral {
  width: 550px; height: 550px;
  background: radial-gradient(circle, rgba(255,56,92,0.12), transparent 70%);
  top: -15%; left: -8%;
  animation: orbA 18s ease-in-out infinite alternate;
}
.ambient-orb--lavender {
  width: 450px; height: 450px;
  background: radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%);
  bottom: -12%; right: -8%;
  animation: orbB 22s ease-in-out infinite alternate;
}
.ambient-orb--amber {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%);
  top: 40%; left: 45%;
  animation: orbC 16s ease-in-out infinite alternate;
}
.ambient-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
  background-size: 64px 64px;
}

@keyframes orbA {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, 30px) scale(1.08); }
}
@keyframes orbB {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-40px, -20px) scale(1.12); }
}
@keyframes orbC {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(20px, -40px) scale(1.05); }
}

/* ═══════════ SECTION BASE ═══════════ */
.sec {
  position: relative;
}
.sec--dark { background: var(--bg-alt); }
.sec--gradient {
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-alt) 50%, var(--bg) 100%);
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
.sec-title {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: clamp(30px, 4vw, 52px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin: 0;
}

/* ═══════════ GRADIENT TEXT ═══════════ */
.gradient-text {
  background: linear-gradient(135deg, #FF385C, #FF6B8A, #A78BFA, #FF385C);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradShift 6s ease-in-out infinite;
}
@keyframes gradShift {
  0%, 100% { background-position: 0% 50%; }
  33% { background-position: 100% 50%; }
  66% { background-position: 50% 100%; }
}

/* ═══════════ HERO ═══════════ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: clamp(80px, 10vh, 120px) 24px 60px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

/* Left column */
.hero-text {
  max-width: 560px;
}
.hero-badge {
  display: inline-flex;
  padding: 7px 18px;
  background: var(--brand-subtle);
  border: 1px solid rgba(255,56,92,0.12);
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.hero-text h1 {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: clamp(40px, 6.5vw, 80px);
  font-weight: 900;
  line-height: 1.0;
  letter-spacing: -0.04em;
  margin: 0 0 20px;
}

.hero-desc {
  font-size: clamp(15px, 1.6vw, 18px);
  color: rgba(255,255,255,0.6);
  line-height: 1.65;
  margin: 0 0 32px;
}
.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

/* ─── Live badge ─── */
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 7px 16px;
  border-radius: 99px;
  background: rgba(16,185,129,0.06);
  border: 1px solid rgba(16,185,129,0.12);
  font-size: 13px;
  color: rgba(255,255,255,0.5);
}
.live-badge strong { color: rgba(255,255,255,0.8); font-weight: 700; }
.live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #10B981;
  animation: pulseDot 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
}

/* ─── Hero stats ─── */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid var(--border);
}
.hero-stat { text-align: left; }
.hero-stat-num {
  display: block;
  font-family: var(--font-display, sans-serif);
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.hero-stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  font-weight: 500;
  margin-top: 2px;
}
.hero-stat-dash {
  width: 16px;
  height: 2px;
  background: var(--border);
  flex-shrink: 0;
  border-radius: 1px;
}

/* ═══════════ LIVE FEED PANEL ═══════════ */
.hero-visual {
  display: flex;
  justify-content: center;
}
.feed-panel {
  width: 100%;
  max-width: 380px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  backdrop-filter: blur(12px);
}
.feed-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 20px;
  font-family: var(--font-sans, sans-serif);
}
.feed-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #10B981;
  animation: pulseDot 2s ease-in-out infinite;
}

.feed-track {
  position: relative;
  height: 170px;
  overflow: hidden;
}
.feed-card {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  opacity: 0;
  transform: translateY(16px);
  animation: feedCycle 12s infinite;
  animation-delay: calc(var(--i) * 4s);
}
.feed-emoji {
  font-size: 28px;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}
.feed-body {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255,255,255,0.7);
}
.feed-user { font-weight: 700; color: #fff; }
.feed-action { color: rgba(255,255,255,0.5); }
.feed-target { color: var(--brand); font-weight: 600; }

@keyframes feedCycle {
  0%, 4% { opacity: 0; transform: translateY(20px); }
  8%, 25% { opacity: 1; transform: translateY(0); }
  29%, 100% { opacity: 0; transform: translateY(-10px); }
}

/* ═══════════ SCROLL HINT ═══════════ */
.scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  opacity: 0.3;
  animation: hintPulse 3s ease-in-out infinite;
}
.scroll-mouse {
  width: 22px; height: 34px;
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 11px;
  display: flex;
  justify-content: center;
  padding-top: 7px;
}
.scroll-dot {
  width: 3px; height: 7px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  animation: scrollBounce 2s ease-in-out infinite;
}
@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(7px); opacity: 0.3; }
}
@keyframes hintPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

/* ═══════════ FEATURES ═══════════ */
.feat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.feat-card {
  padding: 44px 36px;
  background: var(--bg);
  transition: background 0.3s;
}
.feat-card:hover { background: var(--surface-hover); }

.feat-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: transform 0.3s, background 0.3s;
}
.feat-card:hover .feat-icon { transform: scale(1.06); }

.feat-icon--coral { background: var(--brand-subtle); color: var(--brand); }
.feat-icon--lavender { background: var(--lavender-subtle); color: var(--lavender); }
.feat-icon--amber { background: var(--amber-subtle); color: var(--amber); }

.feat-title {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: 19px;
  font-weight: 800;
  margin: 0 0 10px;
  color: #fff;
  letter-spacing: -0.02em;
}
.feat-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  line-height: 1.65;
  margin: 0;
}

/* ═══════════ STEPS ═══════════ */
.steps {
  display: flex;
  gap: 0;
  max-width: 820px;
  margin: 0 auto;
}
.step {
  flex: 1;
  text-align: center;
}
.step-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
  width: 100%;
}
.step-circle {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 800;
  color: var(--brand);
  font-variant-numeric: tabular-nums;
  position: relative;
  z-index: 1;
  transition: border-color 0.3s;
  font-family: var(--font-display, var(--font-sans, sans-serif));
}
.step:hover .step-circle { border-color: var(--brand); }
.step-line {
  height: 2px;
  background: linear-gradient(90deg, var(--brand) 0%, var(--border) 100%);
  flex: 1;
  width: calc(100% - 56px);
  position: relative;
  top: -28px;
  z-index: 0;
}
.step-body h3 {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 8px;
  color: #fff;
  letter-spacing: -0.02em;
}
.step-body p {
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  line-height: 1.6;
  margin: 0 auto;
  max-width: 260px;
}

/* ═══════════ STATS ═══════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.stat-cell {
  padding: 48px 24px;
  background: var(--bg);
  text-align: center;
  transition: background 0.3s;
}
.stat-cell:hover { background: var(--surface-hover); }
.stat-num {
  display: block;
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  margin-bottom: 6px;
}
.stat-label {
  display: block;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  font-weight: 500;
}

/* ═══════════ SHOWCASE ═══════════ */
.show-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.show-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.show-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  border-color: var(--border-hover);
}
.show-visual {
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.show-emoji {
  font-size: 60px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
}
.show-card:hover .show-emoji { transform: scale(1.15) rotate(-5deg); }
.show-body { padding: 28px 32px; }
.show-body h3 {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: 19px;
  font-weight: 800;
  margin: 0 0 8px;
  color: #fff;
  letter-spacing: -0.02em;
}
.show-body p {
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  line-height: 1.6;
  margin: 0;
}

/* ═══════════ PRICING ═══════════ */
.price-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}
.price-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 40px 32px;
  position: relative;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}
.price-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.2);
}
.price-card--feat {
  border-color: var(--brand);
  background: linear-gradient(180deg, rgba(255,56,92,0.04) 0%, var(--surface) 100%);
}
.price-card--feat:hover { border-color: var(--brand); }
.price-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--brand), #FF6B8A);
  color: #fff;
  padding: 5px 16px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.price-name {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 14px;
  color: #fff;
}
.price-amount { margin: 0 0 24px; min-height: 44px; display: flex; align-items: baseline; gap: 2px; }
.price-free {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: 40px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.03em;
  line-height: 1;
}
.price-num {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: 40px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.03em;
  line-height: 1;
}
.price-currency { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.5); }
.price-period { font-size: 12px; color: rgba(255,255,255,0.3); }
.price-feats {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.price-feats li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  line-height: 1.4;
}
.price-feats li svg { color: var(--brand); flex-shrink: 0; }

/* ═══════════ FAQ ═══════════ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.faq-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color 0.3s;
}
.faq-item:hover { border-color: var(--border-hover); }
.faq-item[open] { border-color: var(--border-hover); }
.faq-item summary {
  padding: 18px 22px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  transition: color 0.2s;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after {
  content: '+';
  font-size: 18px;
  color: rgba(255,255,255,0.25);
  transition: transform 0.3s, color 0.3s;
  flex-shrink: 0;
  line-height: 1;
}
.faq-item[open] summary::after {
  transform: rotate(45deg);
  color: var(--brand);
}
.faq-item summary:hover { color: var(--brand); }
.faq-body { padding: 0 22px 18px; }
.faq-body p {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  line-height: 1.7;
  margin: 0;
}

/* ═══════════ CTA ═══════════ */
.cta-sec { position: relative; overflow: hidden; }
.ambient--cta { z-index: 0; }
.cta-title {
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: clamp(32px, 4.5vw, 56px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 14px;
}
.cta-desc {
  font-size: 17px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 32px;
}

/* ═══════════ RESPONSIVE ═══════════ */

@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; gap: 40px; text-align: center; }
  .hero-text { max-width: 600px; margin: 0 auto; }
  .hero-actions { justify-content: center; }
  .hero-stats { justify-content: center; }
  .hero-stat { text-align: center; }
  .hero-visual { justify-content: center; }
  .feed-panel { margin: 0 auto; max-width: 360px; }

  .feat-grid { grid-template-columns: repeat(2, 1fr); }
  .price-grid { grid-template-columns: 1fr; max-width: 400px; }
  .steps { flex-direction: column; max-width: 400px; gap: 36px; }
  .step-visual { flex-direction: column; margin-bottom: 20px; }
  .step-line { display: none; }
  .step-body p { max-width: none; }
}

@media (max-width: 768px) {
  .hero-inner { gap: 32px; padding-bottom: 40px; }
  .hero-stats { gap: 20px; }
  .hero-stat-dash { width: 20px; }

  .feat-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .show-grid { grid-template-columns: 1fr; }
  .sec-title { margin-bottom: 40px; }
  .feed-panel { max-width: 100%; }
  .feed-track { height: 160px; }
  .scroll-hint { display: none; }
}

@media (max-width: 480px) {
  .btn { padding: 12px 20px; font-size: 14px; }
  .btn--lg { padding: 14px 24px; }
  .feat-card { padding: 32px 24px; }
  .stat-cell { padding: 36px 16px; }
  .show-body { padding: 20px; }
  .price-card { padding: 32px 24px; }
  .faq-item summary { padding: 14px 16px; font-size: 14px; }
  .faq-body { padding: 0 16px 14px; }
}

/* ═══════════ REDUCED MOTION ═══════════ */
@media (prefers-reduced-motion: reduce) {
  .rv { opacity: 1; transform: none; transition: none; }
  .gradient-text { animation: none; background: linear-gradient(135deg, #FF385C, #A78BFA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .ambient-orb { animation: none !important; }
  .feed-card { opacity: 1; transform: none; animation: none; }
  .live-dot, .feed-dot { animation: none; }
  .scroll-hint { display: none; }
  .btn--primary:hover, .show-card:hover, .price-card:hover { transform: none; }
  .show-card:hover .show-emoji { transform: none; }
  .step-circle { border-color: var(--border); }
}

`}</style>
    </PageShell>
  );
}
