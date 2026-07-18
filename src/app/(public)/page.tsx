'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PUBLISH_TARIFFS } from '@/modules/payments/tariffs';
import { PageShell } from '@/shared/components/page-shell';

/* ─── Three.js hero scene ─── */
function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const particles: { x: number; y: number; z: number; r: number; vx: number; vy: number; vz: number; hue: number }[] = [];

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      w = canvas.width = rect.width * 2;
      h = canvas.height = rect.height * 2;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    // Create floating geometric shapes
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w - w / 2,
        y: Math.random() * h - h / 2,
        z: Math.random() * 400 + 100,
        r: Math.random() * 30 + 8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.5,
        hue: Math.random() * 30 + 350, // warm corals
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 40;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 40;
    };
    window.addEventListener('mousemove', handleMouse);

    let time = 0;
    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, w, h);

      // Sort by z for depth
      particles.sort((a, b) => a.z - b.z);

      for (const p of particles) {
        // Animate
        p.x += p.vx + Math.sin(time + p.vz) * 0.2;
        p.y += p.vy + Math.cos(time * 0.7 + p.vx) * 0.15;
        p.z += p.vz;

        // Wrap around
        if (p.z < 10) p.z = 500;
        if (p.z > 500) p.z = 10;
        if (p.x < -w / 2) p.x = w / 2;
        if (p.x > w / 2) p.x = -w / 2;
        if (p.y < -h / 2) p.y = h / 2;
        if (p.y > h / 2) p.y = -h / 2;

        // Perspective projection
        const scale = 300 / p.z;
        const px = w / 2 + (p.x + mouseX) * scale;
        const py = h / 2 + (p.y + mouseY) * scale;
        const pr = p.r * scale;

        if (px < -50 || px > w + 50 || py < -50 || py > h + 50) continue;

        // Draw shape
        ctx.save();
        ctx.globalAlpha = Math.min(0.6, scale * 0.8);

        const hue = (p.hue + time * 20) % 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 55%, 1)`;
        ctx.strokeStyle = `hsla(${hue}, 70%, 65%, 0.5)`;
        ctx.lineWidth = 1;

        // Draw different shapes
        const sides = Math.floor(p.r) % 3 + 3; // 3-5 sides
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2 + time;
          const x = px + Math.cos(angle) * pr;
          const y = py + Math.sin(angle) * pr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Draw connecting lines between nearby particles
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const scaleA = 300 / a.z;
          const scaleB = 300 / b.z;
          const ax = w / 2 + (a.x + mouseX) * scaleA;
          const ay = h / 2 + (a.y + mouseY) * scaleA;
          const bx = w / 2 + (b.x + mouseX) * scaleB;
          const by = h / 2 + (b.y + mouseY) * scaleB;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist < 120) {
            ctx.globalAlpha = (1 - dist / 120) * 0.15;
            ctx.strokeStyle = 'rgba(255, 120, 140, 1)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

/* ─── Parallax hook ─── */
function useParallax(speed = 0.3) {
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
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
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
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
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

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('ru-RU')}{suffix}
    </span>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="lp-reveal" style={{ marginBottom: 20 }}>
      <span style={{
        display: 'inline-block',
        padding: '6px 16px',
        background: 'rgba(255, 56, 92, 0.08)',
        border: '1px solid rgba(255, 56, 92, 0.15)',
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 700,
        color: '#FF385C',
        letterSpacing: '0.02em',
      }}>
        {children}
      </span>
    </div>
  );
}

/* ─── Main landing page ─── */
export default function LandingPage() {
  const heroRef = useReveal();
  const featuresRef = useReveal();
  const howRef = useReveal();
  const statsRef = useReveal();
  const showcaseRef = useReveal();
  const pricingRef = useReveal();
  const faqRef = useReveal();
  const ctaRef = useReveal();

  const parallaxBg = useParallax(0.15);
  const parallaxCards = useParallax(-0.1);

  return (
    <PageShell variant="public">
      <div className="lp">
        {/* ═══════════ HERO ═══════════ */}
        <section className="lp-hero">
          <div className="lp-hero-bg" ref={parallaxBg}>
            <HeroScene />
            <div className="lp-hero-glow" />
          </div>
          <div className="lp-hero-content lp-reveal" ref={heroRef}>
            <div className="lp-badge">Интерактивная платформа</div>
            <h1>
              Превращай рутину<br />
              <span className="lp-gradient">в игру</span>
            </h1>
            <p>
              Создавай челленджи с геймификацией. Бренды, HR, НКО — запускайте
              интерактивные задания, а участники соревнуются и получают реальные награды.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/register" className="lp-btn lp-btn--primary">
                <span>Создать челлендж</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/explore" className="lp-btn lp-btn--ghost">
                Смотреть каталог
              </Link>
            </div>
            <div className="lp-hero-stats">
              <div className="lp-stat">
                <span className="lp-stat-num"><AnimatedCounter target={2500} suffix="+" /></span>
                <span className="lp-stat-label">Челленджей создано</span>
              </div>
              <div className="lp-stat-divider" />
              <div className="lp-stat">
                <span className="lp-stat-num"><AnimatedCounter target={48000} suffix="+" /></span>
                <span className="lp-stat-label">Участников</span>
              </div>
              <div className="lp-stat-divider" />
              <div className="lp-stat">
                <span className="lp-stat-num"><AnimatedCounter target={350} suffix="+" /></span>
                <span className="lp-stat-label">Брендов</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURES ═══════════ */}
        <section className="lp-section" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Возможности</SectionLabel>
            <h2 className="lp-section-title" ref={featuresRef}>
              Всё для создания<br /> интерактивных челленджей
            </h2>
            <div className="lp-features-grid">
              {[
                { num: '01', title: 'Конструктор заданий', desc: 'Многоэтапные квесты с загрузкой фото, ответами и проверкой. Создайте за 15 минут.' },
                { num: '02', title: 'Геймификация', desc: 'Очки, достижения, рейтинги. Участники соревнуются за первые места и реальные награды.' },
                { num: '03', title: 'Партнёрства', desc: 'Запускайте совместные челленджи с другими брендами. Делитесь аудиторией и бюджетом.' },
                { num: '04', title: 'Аналитика', desc: 'Конверсия по этапам, активность участников,heatmap прохождения. Всё в реальном времени.' },
                { num: '05', title: 'Монетизация', desc: 'Установите взнос за участие. Комиссия от 15% — деньги перечисляются после завершения.' },
                { num: '06', title: 'Мобильный опыт', desc: 'Полноценное мобильное приложение. Участники проходят задания с телефона без ограничений.' },
              ].map((f) => (
                <div key={f.num} className="lp-feature-card lp-reveal">
                  <span className="lp-feature-num">{f.num}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="lp-section lp-section--dark" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Как это работает</SectionLabel>
            <h2 className="lp-section-title" ref={howRef}>
              Три шага до запуска
            </h2>
            <div className="lp-steps">
              {[
                { step: '01', title: 'Создайте', desc: 'Используйте конструктор: добавьте этапы, задания, награды и правила. Визуальный редактор без кода.', accent: 'from creation' },
                { step: '02', title: 'Запустите', desc: 'Опубликуйте в каталоге, поделитесь ссылкой или отправьте через Telegram и соцсети.', accent: 'via distribution' },
                { step: '03', title: 'Анализируйте', desc: 'Отслеживайте прогресс, конверсию по этапам и общую статистику в дашборде.', accent: 'with analytics' },
              ].map((s, i) => (
                <div key={s.step} className="lp-step lp-reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="lp-step-visual">
                    <div className="lp-step-num">{s.step}</div>
                    <div className="lp-step-line" />
                  </div>
                  <div className="lp-step-content">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <span className="lp-step-accent">{s.accent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ STATS ═══════════ */}
        <section className="lp-section" style={{ paddingTop: 140, paddingBottom: 140 }}>
          <div className="lp-container">
            <div className="lp-stats-row" ref={statsRef}>
              {[
                { value: 2500, suffix: '+', label: 'Челленджей' },
                { value: 48000, suffix: '+', label: 'Участников' },
                { value: 92, suffix: '%', label: 'Конверсия' },
                { value: 4.8, suffix: '/ 5', label: 'Рейтинг', decimals: 1 },
              ].map((s, i) => (
                <div key={i} className="lp-stat-block lp-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="lp-stat-big">
                    {s.decimals
                      ? s.value.toFixed(s.decimals)
                      : <AnimatedCounter target={s.value} />
                    }
                    {s.suffix}
                  </span>
                  <span className="lp-stat-small">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ SHOWCASE ═══════════ */}
        <section className="lp-section lp-section--gradient" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Примеры</SectionLabel>
            <h2 className="lp-section-title" ref={showcaseRef}>
              Челленджи, которые<br />вдохновляют
            </h2>
            <div className="lp-showcase" ref={parallaxCards}>
              {[
                { emoji: '🏃', title: 'Спортивный марафон', desc: '30 дней бега и ЗОЖ. Ежедневные задания, трекинг прогресса, призы от партнёров.', color: 'linear-gradient(135deg, #FF6B6B, #FF385C)' },
                { emoji: '📚', title: 'Образовательный интенсив', desc: 'Новый навык за 14 дней. Проверка знаний, сертификаты, рейтинг участников.', color: 'linear-gradient(135deg, #4ECDC4, #44B09E)' },
                { emoji: '🎨', title: 'Творческий конкурс', desc: 'Покажи талант. Жюри из экспертов, голосование аудитории, реальные призы.', color: 'linear-gradient(135deg, #A78BFA, #7C3AED)' },
                { emoji: '🌍', title: 'Экологическая акция', desc: 'Собери мусор, посади дерево. Благотворительность с геймификацией и достижениями.', color: 'linear-gradient(135deg, #34D399, #059669)' },
              ].map((c, i) => (
                <div key={i} className="lp-showcase-card lp-reveal" style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="lp-showcase-visual" style={{ background: c.color }}>
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

        {/* ═══════════ PRICING ═══════════ */}
        <section className="lp-section" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container">
            <SectionLabel>Тарифы</SectionLabel>
            <h2 className="lp-section-title" ref={pricingRef}>
              Прозрачные цены<br />для каждого
            </h2>
            <div className="lp-pricing-grid">
              {PUBLISH_TARIFFS.map((t, i) => (
                <div
                  key={t.id}
                  className={`lp-price-card lp-reveal ${t.recommended ? 'lp-price-card--featured' : ''}`}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`lp-btn ${t.recommended ? 'lp-btn--primary' : 'lp-btn--outline'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {t.price === 0 ? 'Начать бесплатно' : 'Выбрать тариф'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section className="lp-section lp-section--dark" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container" style={{ maxWidth: 760 }}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="lp-section-title" ref={faqRef}>
              Частые вопросы
            </h2>
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

        {/* ═══════════ CTA ═══════════ */}
        <section className="lp-section" style={{ paddingTop: 160, paddingBottom: 160 }}>
          <div className="lp-container" style={{ textAlign: 'center' }}>
            <div ref={ctaRef} className="lp-reveal">
              <h2 className="lp-cta-title">
                Готовы создать<br />свой первый челлендж?
              </h2>
              <p className="lp-cta-desc">
                Присоединяйтесь к тысячам организаторов и участников.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/register" className="lp-btn lp-btn--primary lp-btn--lg">
                  <span>Начать бесплатно</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="/explore" className="lp-btn lp-btn--ghost lp-btn--lg">
                  Смотреть каталог
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        /* ─── Base ─── */
        .lp {
          --bg: #0a0a0a;
          --bg-elevated: #111111;
          --bg-subtle: #161616;
          --surface: #1a1a1a;
          --border: rgba(255,255,255,0.06);
          --text: #f5f5f5;
          --text-muted: #888888;
          --text-dim: #555555;
          --brand: #FF385C;
          --brand-glow: rgba(255, 56, 92, 0.25);
          --radius: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }

        /* ─── Reveal animation ─── */
        .lp-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ─── Hero ─── */
        .lp-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .lp-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .lp-hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, var(--brand-glow) 0%, transparent 70%);
          filter: blur(80px);
          opacity: 0.5;
          animation: pulseGlow 6s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
        }
        .lp-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 800px;
          padding: 120px 24px 80px;
        }
        .lp-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 56, 92, 0.08);
          border: 1px solid rgba(255, 56, 92, 0.2);
          border-radius: 99px;
          font-size: 13px;
          font-weight: 700;
          color: var(--brand);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }
        .lp-hero-content h1 {
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -0.04em;
          margin: 0 0 28px 0;
          color: white;
        }
        .lp-gradient {
          background: linear-gradient(135deg, #FF385C 0%, #FF6B8A 50%, #FFA0B4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-content p {
          font-size: clamp(16px, 2vw, 20px);
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 560px;
          margin: 0 auto 40px;
        }

        /* ─── Hero Stats ─── */
        .lp-hero-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          margin-top: 56px;
          padding-top: 40px;
          border-top: 1px solid var(--border);
        }
        .lp-stat {
          text-align: center;
        }
        .lp-stat-num {
          display: block;
          font-size: 28px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }
        .lp-stat-label {
          display: block;
          font-size: 13px;
          color: var(--text-dim);
          font-weight: 500;
          margin-top: 4px;
        }
        .lp-stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border);
        }

        /* ─── Buttons ─── */
        .lp-btn {
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

        /* ─── Sections ─── */
        .lp-section {
          position: relative;
        }
        .lp-section--dark {
          background: var(--bg-elevated);
        }
        .lp-section--gradient {
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg-elevated) 50%, var(--bg) 100%);
        }
        .lp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
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

        /* ─── Features Grid ─── */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .lp-feature-card {
          padding: 48px 36px;
          background: var(--bg);
          position: relative;
          transition: background 0.3s;
        }
        .lp-feature-card:hover {
          background: var(--surface);
        }
        .lp-feature-num {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: var(--brand);
          letter-spacing: 0.05em;
          margin-bottom: 20px;
          font-variant-numeric: tabular-nums;
        }
        .lp-feature-card h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 12px 0;
          color: white;
          letter-spacing: -0.02em;
        }
        .lp-feature-card p {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        /* ─── Steps ─── */
        .lp-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 700px;
          margin: 0 auto;
        }
        .lp-step {
          display: flex;
          gap: 32px;
          padding: 48px 0;
          border-bottom: 1px solid var(--border);
        }
        .lp-step:last-child {
          border-bottom: none;
        }
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
        .lp-step:last-child .lp-step-line {
          display: none;
        }
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
        .lp-step-accent {
          display: inline-block;
          margin-top: 16px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ─── Stats Row ─── */
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
        .lp-stat-block:hover {
          background: var(--surface);
        }
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

        /* ─── Showcase ─── */
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
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-showcase-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border-color: rgba(255,255,255,0.1);
        }
        .lp-showcase-visual {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .lp-showcase-emoji {
          font-size: 64px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-showcase-card:hover .lp-showcase-emoji {
          transform: scale(1.15) rotate(-5deg);
        }
        .lp-showcase-info {
          padding: 28px 32px;
        }
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

        /* ─── Pricing ─── */
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
        .lp-price-card--featured:hover {
          border-color: var(--brand);
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
          line-height: 1.4;
        }
        .lp-price-features li svg {
          color: var(--brand);
          flex-shrink: 0;
        }

        /* ─── FAQ ─── */
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
        .lp-faq-item:hover {
          border-color: rgba(255,255,255,0.12);
        }
        .lp-faq-item[open] {
          border-color: rgba(255,255,255,0.12);
        }
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

        /* ─── CTA ─── */
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

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .lp-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .lp-pricing-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .lp-hero-content h1 {
            font-size: clamp(36px, 10vw, 56px);
          }
          .lp-hero-stats {
            flex-direction: column;
            gap: 24px;
          }
          .lp-stat-divider {
            width: 40px;
            height: 1px;
          }
          .lp-features-grid {
            grid-template-columns: 1fr;
          }
          .lp-step {
            flex-direction: column;
            gap: 20px;
            padding: 32px 0;
          }
          .lp-step-visual {
            flex-direction: row;
          }
          .lp-step-line {
            width: 40px;
            height: 1px;
            min-height: unset;
          }
          .lp-stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .lp-showcase {
            grid-template-columns: 1fr;
          }
          .lp-section-title {
            margin-bottom: 48px;
          }
        }

        @media (max-width: 480px) {
          .lp-btn {
            padding: 14px 24px;
            font-size: 14px;
          }
          .lp-btn--lg {
            padding: 16px 28px;
          }
          .lp-feature-card {
            padding: 32px 24px;
          }
        }

        /* ─── Reduced motion ─── */
        @media (prefers-reduced-motion: reduce) {
          .lp-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .lp-hero-glow {
            animation: none;
          }
          .lp-btn--primary:hover,
          .lp-showcase-card:hover {
            transform: none;
          }
        }
      `}</style>
    </PageShell>
  );
}
