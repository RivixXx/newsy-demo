'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════
   SCROLL HERO — 5-phase scroll-driven 3D experience
   ═══════════════════════════════════════════════════════ */

// Deterministic pseudo-random for particles
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/* ─── Particle field ─── */
function Particles({ progress }: { progress: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 3 + 1) * 100,
      y: seededRandom(i * 3 + 2) * 100,
      size: 1.5 + seededRandom(i * 3 + 3) * 3,
      delay: seededRandom(i * 3 + 4) * 6,
      duration: 4 + seededRandom(i * 3 + 5) * 6,
      opacity: 0.15 + seededRandom(i * 3 + 6) * 0.35,
    }));
  }, []);

  return (
    <div className="sh-particles">
      {particles.map((p) => {
        const drift = Math.sin(progress * Math.PI * 2 + p.delay) * 30;
        const fade = progress < 0.05 ? progress / 0.05 : progress > 0.9 ? (1 - progress) / 0.1 : 1;
        return (
          <div
            key={p.id}
            className="sh-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity * Math.max(0, fade),
              transform: `translateY(${-drift}px) translateX(${drift * 0.5}px)`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Hexagonal NEWSY Logo ─── */
function HexLogo({ progress }: { progress: number }) {
  // 0-20%: logo assembles
  const assembleProgress = Math.min(1, progress / 0.2);
  const opacity = assembleProgress;
  const scale = 0.6 + assembleProgress * 0.4;
  const rotation = (1 - assembleProgress) * 180;

  // After 20%, logo moves up and fades
  const postAssemble = progress > 0.2 ? Math.min(1, (progress - 0.2) / 0.15) : 0;
  const translateY = -postAssemble * 60;
  const fadeOut = 1 - postAssemble;

  return (
    <div
      className="sh-logo"
      style={{
        opacity: opacity * fadeOut,
        transform: `scale(${scale}) rotate(${rotation}deg) translateY(${translateY}px)`,
      }}
    >
      <svg viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF385C" />
            <stop offset="100%" stopColor="#FF6B8A" />
          </linearGradient>
        </defs>
        {/* Hexagon fragments that assemble */}
        {[
          'M60 10 L95 30 L95 70 L60 90 L25 70 L25 30 Z', // full hex
        ].map((d, i) => {
          const fragOffset = (1 - assembleProgress) * (i % 2 === 0 ? 80 : -80);
          const fragRot = (1 - assembleProgress) * (i % 2 === 0 ? 90 : -90);
          return (
            <g key={i} style={{
              transform: `translateX(${fragOffset}px) rotate(${fragRot}deg)`,
              transformOrigin: '60px 50px',
              transition: 'none',
            }}>
              <path d={d} fill="url(#logo-grad)" opacity={0.9} />
            </g>
          );
        })}
        {/* N letter */}
        <text
          x="60" y="58" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="36" fontWeight="900" fontFamily="system-ui"
          style={{ opacity: assembleProgress }}
        >
          N
        </text>
      </svg>
    </div>
  );
}

/* ─── 3D Phone Mockup ─── */
function PhoneMockup({ progress, phase }: { progress: number; phase: number }) {
  // Phase 1 (20-40%): Phone enters and rotates to front
  const enterProgress = phase >= 1 ? Math.min(1, (progress - 0.2) / 0.2) : 0;
  // Phase 2 (40-60%): Phone stays, screen transitions
  const featureProgress = phase >= 2 ? Math.min(1, (progress - 0.4) / 0.2) : 0;
  // Phase 3 (60-80%): Multiple phones fan out
  const socialProgress = phase >= 3 ? Math.min(1, (progress - 0.6) / 0.2) : 0;
  // Phase 4 (80-100%): Converge to CTA
  const ctaProgress = phase >= 4 ? Math.min(1, (progress - 0.8) / 0.2) : 0;

  // Main phone transforms
  const phoneRotY = enterProgress < 1
    ? 90 - enterProgress * 90  // 90° → 0° (side to front)
    : 0;
  const phoneRotX = -5 + Math.sin(progress * Math.PI) * 5;
  const phoneTranslateY = enterProgress < 1
    ? 200 - enterProgress * 200  // slide up from bottom
    : 0;
  const phoneScale = 0.85 + enterProgress * 0.15;
  const phoneZ = socialProgress > 0 ? -50 * socialProgress : 0;

  // Screen content based on phase
  const screenContent = phase < 1 ? 'splash'
    : phase < 2 ? 'explore'
    : phase < 3 ? 'challenge'
    : phase < 4 ? 'stats'
    : 'cta';

  // Glow intensity
  const glowIntensity = 0.2 + Math.sin(progress * Math.PI) * 0.3;

  return (
    <div className="sh-phone-stage">
      {/* Main phone */}
      <div
        className="sh-phone"
        style={{
          transform: `
            perspective(1200px)
            rotateY(${phoneRotY}deg)
            rotateX(${phoneRotX}deg)
            translateY(${phoneTranslateY}px)
            scale(${phoneScale})
            translateZ(${phoneZ}px)
          `,
          opacity: enterProgress > 0 ? 1 : 0,
        }}
      >
        <div className="sh-phone-frame">
          <div className="sh-phone-notch" />
          <div className="sh-phone-screen">
            <ScreenContent type={screenContent} progress={progress} />
          </div>
          <div className="sh-phone-glow" style={{ opacity: glowIntensity }} />
        </div>
      </div>

      {/* Shadow on floor */}
      <div
        className="sh-phone-shadow"
        style={{
          opacity: enterProgress * 0.4,
          transform: `scaleX(${0.8 + enterProgress * 0.2})`,
        }}
      />

      {/* Fan-out phones (phase 3) */}
      {socialProgress > 0 && (
        <>
          <div
            className="sh-phone sh-phone--ghost sh-phone--left"
            style={{
              transform: `
                perspective(1200px)
                rotateY(${-25 * socialProgress}deg)
                rotateX(${-3 * socialProgress}deg)
                translateX(${-280 * socialProgress}px)
                translateY(${-20 * socialProgress}px)
                translateZ(${-100 * socialProgress}px)
                scale(${0.7 * socialProgress})
              `,
              opacity: socialProgress * 0.7,
            }}
          >
            <div className="sh-phone-frame sh-phone-frame--mini">
              <div className="sh-phone-notch sh-phone-notch--mini" />
              <div className="sh-phone-screen">
                <ScreenContent type="explore" progress={progress} />
              </div>
            </div>
          </div>
          <div
            className="sh-phone sh-phone--ghost sh-phone--right"
            style={{
              transform: `
                perspective(1200px)
                rotateY(${25 * socialProgress}deg)
                rotateX(${-3 * socialProgress}deg)
                translateX(${280 * socialProgress}px)
                translateY(${-20 * socialProgress}px)
                translateZ(${-100 * socialProgress}px)
                scale(${0.7 * socialProgress})
              `,
              opacity: socialProgress * 0.7,
            }}
          >
            <div className="sh-phone-frame sh-phone-frame--mini">
              <div className="sh-phone-notch sh-phone-notch--mini" />
              <div className="sh-phone-screen">
                <ScreenContent type="challenge" progress={progress} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* CTA convergence effect */}
      {ctaProgress > 0 && (
        <div className="sh-converge-ring" style={{
          opacity: ctaProgress * 0.6,
          transform: `scale(${0.5 + ctaProgress * 0.5})`,
        }} />
      )}
    </div>
  );
}

/* ─── Screen Content ─── */
function ScreenContent({ type, progress }: { type: string; progress: number }) {
  if (type === 'splash') {
    return (
      <div className="sh-screen sh-screen--splash">
        <div className="sh-screen-logo-mini">N</div>
        <div className="sh-screen-text">NEWSY</div>
      </div>
    );
  }

  if (type === 'explore') {
    return (
      <div className="sh-screen sh-screen--explore">
        <div className="sh-screen-nav">
          <div className="sh-screen-search" />
          <div className="sh-screen-avatar" />
        </div>
        <div className="sh-screen-title-sm">Каталог</div>
        <div className="sh-screen-cards">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sh-screen-card" style={{
              animationDelay: `${i * 0.1}s`,
              transform: `translateY(${Math.sin(progress * Math.PI + i) * 3}px)`,
            }}>
              <div className="sh-screen-card-img" style={{
                background: `linear-gradient(135deg, ${['#FF385C', '#4ECDC4', '#A78BFA'][i - 1]}, ${['#FF6B8A', '#44B09E', '#7C3AED'][i - 1]})`,
              }} />
              <div className="sh-screen-card-text">
                <div className="sh-screen-line sh-screen-line--title" />
                <div className="sh-screen-line sh-screen-line--sub" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'challenge') {
    return (
      <div className="sh-screen sh-screen--challenge">
        <div className="sh-screen-hero-img" />
        <div className="sh-screen-challenge-info">
          <div className="sh-screen-line sh-screen-line--lg sh-screen-line--white" />
          <div className="sh-screen-line sh-screen-line--md" />
          <div className="sh-screen-progress-bar">
            <div className="sh-screen-progress-fill" style={{ width: '65%' }} />
          </div>
          <div className="sh-screen-btn" />
        </div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="sh-screen sh-screen--stats">
        <div className="sh-screen-stats-title">Прогресс</div>
        <div className="sh-screen-ring-container">
          <svg viewBox="0 0 80 80" className="sh-screen-ring">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#FF385C" strokeWidth="6"
              strokeDasharray="140 201" strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
          </svg>
          <div className="sh-screen-ring-text">72%</div>
        </div>
        <div className="sh-screen-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="sh-screen-stat-item">
              <div className="sh-screen-stat-val">{[850, 12, 4.8, 28][i - 1]}</div>
              <div className="sh-screen-stat-label" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // CTA screen
  return (
    <div className="sh-screen sh-screen--cta">
      <div className="sh-screen-cta-icon">🏆</div>
      <div className="sh-screen-line sh-screen-line--lg sh-screen-line--white" style={{ width: '60%', margin: '0 auto' }} />
      <div className="sh-screen-btn sh-screen-btn--glow" />
    </div>
  );
}

/* ─── Orbiting Feature Icons ─── */
function OrbitIcons({ progress }: { progress: number }) {
  const iconProgress = progress >= 0.4 && progress <= 0.6
    ? (progress - 0.4) / 0.2
    : progress < 0.4 ? 0 : 1;

  const icons = [
    { emoji: '🏆', label: 'Достижения', angle: 0 },
    { emoji: '📍', label: 'Геолокация', angle: 72 },
    { emoji: '👥', label: 'Команды', angle: 144 },
    { emoji: '⚡', label: 'Геймификация', angle: 216 },
    { emoji: '🎯', label: 'Цели', angle: 288 },
  ];

  if (iconProgress <= 0) return null;

  return (
    <div className="sh-orbit">
      <div className="sh-orbit-ring" style={{ opacity: iconProgress * 0.3 }} />
      {icons.map((icon, i) => {
        const angle = icon.angle + progress * 120; // slow rotation
        const rad = (angle * Math.PI) / 180;
        const radius = 200;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius * 0.4; // elliptical orbit
        const z = Math.sin(rad) * 60;
        const itemScale = 0.5 + iconProgress * 0.5;
        const pulse = 1 + Math.sin(progress * Math.PI * 4 + i) * 0.08;

        return (
          <div
            key={i}
            className="sh-orbit-icon"
            style={{
              transform: `translate(${x}px, ${y}px) translateZ(${z}px) scale(${itemScale * pulse})`,
              opacity: iconProgress * (0.6 + (z + 60) / 120 * 0.4),
              zIndex: Math.round(z + 100),
            }}
          >
            <span className="sh-orbit-emoji">{icon.emoji}</span>
            <span className="sh-orbit-label">{icon.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Animated Stats ─── */
function AnimatedStats({ progress }: { progress: number }) {
  const show = progress >= 0.65 && progress <= 0.85;
  const p = show ? (progress - 0.65) / 0.2 : 0;

  const stats = [
    { value: '50K+', label: 'участников' },
    { value: '1.2K', label: 'челленджей' },
    { value: '4.9', label: 'рейтинг' },
  ];

  return (
    <div className="sh-stats" style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      {stats.map((s, i) => (
        <div key={i} className="sh-stats-item" style={{
          transform: `translateY(${(1 - p) * 20 + i * 5}px)`,
          opacity: p > i * 0.15 ? 1 : 0,
        }}>
          <span className="sh-stats-val">{s.value}</span>
          <span className="sh-stats-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Confetti ─── */
function Confetti({ progress }: { progress: number }) {
  const show = progress >= 0.6 && progress <= 0.85;
  if (!show) return null;

  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: seededRandom(i * 7 + 1) * 100,
    delay: seededRandom(i * 7 + 2) * 2,
    color: ['#FF385C', '#FF6B8A', '#FFA0B4', '#4ECDC4', '#A78BFA'][i % 5],
    rotation: seededRandom(i * 7 + 3) * 360,
    size: 4 + seededRandom(i * 7 + 4) * 6,
  })), []);

  return (
    <div className="sh-confetti">
      {pieces.map((p) => {
        const localP = (progress - 0.6) / 0.25;
        const y = -localP * 200 + seededRandom(p.id + 10) * 100;
        const opacity = localP > 0.8 ? (1 - localP) / 0.2 : Math.min(1, localP * 3);
        return (
          <div
            key={p.id}
            className="sh-confetti-piece"
            style={{
              left: `${p.x}%`,
              top: `${50 + y * 0.3}%`,
              width: p.size,
              height: p.size * 0.6,
              background: p.color,
              transform: `rotate(${p.rotation + localP * 360}deg) translateY(${y}px)`,
              opacity: Math.max(0, opacity) * 0.8,
              borderRadius: p.size > 7 ? '50%' : '1px',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Phase Indicator ─── */
function PhaseIndicator({ phase, progress }: { phase: number; progress: number }) {
  const labels = ['Введение', 'Устройство', 'Функции', 'Социум', 'Действие'];
  return (
    <div className="sh-phase">
      {labels.map((label, i) => (
        <div key={i} className={`sh-phase-item ${i === phase ? 'sh-phase-item--active' : ''} ${i < phase ? 'sh-phase-item--done' : ''}`}>
          <div className="sh-phase-dot" />
          <span className="sh-phase-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN SCROLL HERO COMPONENT
   ═══════════════════════════════════════════════════════ */
export function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const viewH = window.innerHeight;
          const raw = (viewH - rect.top) / (viewH + rect.height);
          const p = Math.max(0, Math.min(1, raw));
          setProgress(p);

          // Determine phase
          if (p < 0.2) setPhase(0);
          else if (p < 0.4) setPhase(1);
          else if (p < 0.6) setPhase(2);
          else if (p < 0.8) setPhase(3);
          else setPhase(4);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dynamic background gradient
  const bgProgress = Math.min(1, progress * 1.2);
  const bgStyle = {
    background: `linear-gradient(180deg,
      hsl(${230 + bgProgress * 10}, ${20 + bgProgress * 30}%, ${3 + bgProgress * 5}%) 0%,
      hsl(${235 + bgProgress * 5}, ${15 + bgProgress * 20}%, ${5 + bgProgress * 3}%) 100%
    )`,
  };

  // CTA section
  const ctaVisible = progress >= 0.82;
  const ctaP = ctaVisible ? Math.min(1, (progress - 0.82) / 0.15) : 0;

  return (
    <div ref={containerRef} className="sh-container">
      {/* Sticky viewport */}
      <div className="sh-viewport" style={bgStyle}>
        <Particles progress={progress} />
        <HexLogo progress={progress} />
        <PhoneMockup progress={progress} phase={phase} />
        <OrbitIcons progress={progress} />
        <AnimatedStats progress={progress} />
        <Confetti progress={progress} />
        <PhaseIndicator phase={phase} progress={progress} />

        {/* CTA overlay */}
        <div className="sh-cta-overlay" style={{
          opacity: ctaP,
          pointerEvents: ctaP > 0.5 ? 'auto' : 'none',
        }}>
          <h2 className="sh-cta-title">Создавай. Соревнуйся. Побеждай.</h2>
          <p className="sh-cta-sub">Присоединяйся к тысячам участников</p>
          <Link href="/register" className="sh-cta-btn">
            <span>Создать челлендж</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="sh-progress">
          <div className="sh-progress-bar" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <style>{`
        /* ═══════════════ CONTAINER ═══════════════ */
        .sh-container {
          position: relative;
          width: 100%;
          height: 500vh;
        }
        .sh-viewport {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ═══════════════ PARTICLES ═══════════════ */
        .sh-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .sh-particle {
          position: absolute;
          background: rgba(255, 56, 92, 0.6);
          border-radius: 50%;
          animation: particleDrift linear infinite;
          will-change: transform, opacity;
        }
        @keyframes particleDrift {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-5px) translateX(-8px); }
          75% { transform: translateY(-25px) translateX(5px); }
          100% { transform: translateY(0) translateX(0); }
        }

        /* ═══════════════ LOGO ═══════════════ */
        .sh-logo {
          position: absolute;
          z-index: 5;
          will-change: transform, opacity;
          filter: drop-shadow(0 0 30px rgba(255, 56, 92, 0.4));
        }

        /* ═══════════════ PHONE ═══════════════ */
        .sh-phone-stage {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          perspective: 1200px;
        }
        .sh-phone {
          will-change: transform, opacity;
          transition: opacity 0.3s;
        }
        .sh-phone--ghost {
          position: absolute;
        }
        .sh-phone--left { left: 50%; margin-left: -140px; }
        .sh-phone--right { left: 50%; margin-left: 140px; }
        .sh-phone-frame {
          width: 280px;
          height: 580px;
          background: #1a1a1a;
          border-radius: 40px;
          border: 3px solid rgba(255, 255, 255, 0.12);
          position: relative;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 25px 80px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(255, 56, 92, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        .sh-phone-frame--mini {
          width: 200px;
          height: 410px;
          border-radius: 28px;
          border-width: 2px;
        }
        .sh-phone-notch {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 28px;
          background: #0a0a0a;
          border-radius: 0 0 18px 18px;
          z-index: 20;
        }
        .sh-phone-notch--mini {
          width: 70px;
          height: 20px;
          top: 8px;
          border-radius: 0 0 12px 12px;
        }
        .sh-phone-screen {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          background: #0d0d0f;
        }
        .sh-phone-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50px;
          background: radial-gradient(ellipse at center, rgba(255, 56, 92, 0.3), transparent 70%);
          filter: blur(30px);
          pointer-events: none;
          z-index: -1;
        }
        .sh-phone-shadow {
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 30px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 70%);
          border-radius: 50%;
          filter: blur(10px);
          z-index: 1;
        }

        /* ═══════════════ SCREEN CONTENT ═══════════════ */
        .sh-screen {
          width: 100%;
          height: 100%;
          padding: 40px 16px 16px;
          display: flex;
          flex-direction: column;
        }
        .sh-screen--splash {
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .sh-screen-logo-mini {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FF385C, #FF6B8A);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          color: white;
        }
        .sh-screen-text {
          font-size: 18px;
          font-weight: 800;
          color: white;
          letter-spacing: 3px;
        }
        .sh-screen--explore { gap: 12px; }
        .sh-screen-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }
        .sh-screen-search {
          flex: 1;
          height: 32px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          margin-right: 10px;
        }
        .sh-screen-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FF385C, #FF6B8A);
          border-radius: 50%;
        }
        .sh-screen-title-sm {
          font-size: 16px;
          font-weight: 800;
          color: white;
          padding: 4px;
        }
        .sh-screen-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .sh-screen-card {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s;
        }
        .sh-screen-card-img {
          height: 60px;
          width: 100%;
        }
        .sh-screen-card-text {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sh-screen-line {
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.08);
        }
        .sh-screen-line--title { width: 70%; }
        .sh-screen-line--sub { width: 45%; }
        .sh-screen-line--lg { height: 10px; width: 80%; }
        .sh-screen-line--md { height: 8px; width: 60%; }
        .sh-screen-line--white { background: rgba(255, 255, 255, 0.15); }

        .sh-screen--challenge {
          padding-top: 0;
          gap: 0;
        }
        .sh-screen-hero-img {
          height: 45%;
          background: linear-gradient(135deg, #FF385C, #A78BFA);
          border-radius: 0 0 20px 20px;
        }
        .sh-screen-challenge-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .sh-screen-progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }
        .sh-screen-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF385C, #FF6B8A);
          border-radius: 3px;
          transition: width 0.5s;
        }
        .sh-screen-btn {
          height: 36px;
          background: #FF385C;
          border-radius: 10px;
          margin-top: auto;
        }
        .sh-screen-btn--glow {
          box-shadow: 0 0 20px rgba(255, 56, 92, 0.5);
          animation: btnPulse 2s ease-in-out infinite;
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 56, 92, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 56, 92, 0.6); }
        }

        .sh-screen--stats {
          align-items: center;
          gap: 12px;
          padding-top: 44px;
        }
        .sh-screen-stats-title {
          font-size: 14px;
          font-weight: 700;
          color: white;
        }
        .sh-screen-ring-container {
          position: relative;
          width: 100px;
          height: 100px;
        }
        .sh-screen-ring {
          width: 100%;
          height: 100%;
        }
        .sh-screen-ring-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          color: white;
        }
        .sh-screen-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          width: 100%;
          padding: 0 8px;
        }
        .sh-screen-stat-item {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 10px;
          text-align: center;
        }
        .sh-screen-stat-val {
          font-size: 16px;
          font-weight: 800;
          color: white;
        }
        .sh-screen-stat-label {
          height: 4px;
          width: 60%;
          margin: 4px auto 0;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
        }

        .sh-screen--cta {
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .sh-screen-cta-icon {
          font-size: 48px;
          animation: trophyBounce 1s ease-in-out infinite;
        }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        /* ═══════════════ ORBIT ═══════════════ */
        .sh-orbit {
          position: absolute;
          z-index: 8;
          pointer-events: none;
        }
        .sh-orbit-ring {
          position: absolute;
          width: 400px;
          height: 160px;
          border: 1px dashed rgba(255, 56, 92, 0.2);
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .sh-orbit-icon {
          position: absolute;
          left: 50%;
          top: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          will-change: transform;
          filter: drop-shadow(0 0 12px rgba(255, 56, 92, 0.4));
        }
        .sh-orbit-emoji {
          font-size: 28px;
          display: block;
        }
        .sh-orbit-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          letter-spacing: 0.03em;
        }

        /* ═══════════════ STATS ═══════════════ */
        .sh-stats {
          position: absolute;
          z-index: 12;
          display: flex;
          gap: 48px;
          will-change: transform, opacity;
        }
        .sh-stats-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: opacity 0.4s, transform 0.4s;
        }
        .sh-stats-val {
          font-size: 36px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.03em;
        }
        .sh-stats-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        /* ═══════════════ CONFETTI ═══════════════ */
        .sh-confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 15;
        }
        .sh-confetti-piece {
          position: absolute;
          will-change: transform, opacity;
        }

        /* ═══════════════ PHASE INDICATOR ═══════════════ */
        .sh-phase {
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 20px;
          z-index: 20;
        }
        .sh-phase-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sh-phase-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transition: all 0.3s;
        }
        .sh-phase-item--active .sh-phase-dot {
          background: #FF385C;
          box-shadow: 0 0 12px rgba(255, 56, 92, 0.5);
          width: 10px;
          height: 10px;
        }
        .sh-phase-item--done .sh-phase-dot {
          background: rgba(255, 56, 92, 0.4);
        }
        .sh-phase-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 0.03em;
          transition: color 0.3s;
        }
        .sh-phase-item--active .sh-phase-label {
          color: rgba(255, 255, 255, 0.7);
        }

        /* ═══════════════ CTA ═══════════════ */
        .sh-cta-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          z-index: 30;
          transition: opacity 0.4s;
        }
        .sh-cta-title {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 900;
          color: white;
          text-align: center;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0;
        }
        .sh-cta-sub {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 8px;
        }
        .sh-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 18px 40px;
          background: #FF385C;
          color: white;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 0 0 rgba(255, 56, 92, 0.3);
          animation: ctaGlow 2s ease-in-out infinite;
        }
        .sh-cta-btn:hover {
          background: #E31C5F;
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(255, 56, 92, 0.4);
        }
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 56, 92, 0.3); }
          50% { box-shadow: 0 0 0 12px rgba(255, 56, 92, 0); }
        }

        /* ═══════════════ PROGRESS ═══════════════ */
        .sh-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          z-index: 50;
        }
        .sh-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #FF385C, #FF6B8A, #FFA0B4);
          transform-origin: left;
          will-change: transform;
        }

        /* ═══════════════ CONVERGE RING ═══════════════ */
        .sh-converge-ring {
          position: absolute;
          width: 300px;
          height: 300px;
          border: 2px solid rgba(255, 56, 92, 0.3);
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          will-change: transform, opacity;
          filter: blur(1px);
        }

        /* ═══════════════ RESPONSIVE ═══════════════ */
        @media (max-width: 768px) {
          .sh-phone-frame {
            width: 220px;
            height: 460px;
            border-radius: 32px;
          }
          .sh-phone-frame--mini {
            width: 160px;
            height: 330px;
            border-radius: 22px;
          }
          .sh-phone-notch { width: 80px; height: 22px; }
          .sh-phone-notch--mini { width: 56px; height: 16px; }
          .sh-orbit { transform: scale(0.7); }
          .sh-stats { gap: 24px; }
          .sh-stats-val { font-size: 28px; }
          .sh-phase { right: 12px; gap: 14px; }
          .sh-phase-label { display: none; }
          .sh-phone--left { margin-left: -120px; }
          .sh-phone--right { margin-left: 120px; }
        }

        @media (max-width: 480px) {
          .sh-phone-frame { width: 180px; height: 380px; border-radius: 26px; }
          .sh-phone-frame--mini { width: 130px; height: 270px; border-radius: 18px; }
          .sh-orbit { transform: scale(0.5); }
          .sh-stats { gap: 16px; flex-wrap: wrap; justify-content: center; }
          .sh-stats-val { font-size: 22px; }
          .sh-phone--left { margin-left: -100px; }
          .sh-phone--right { margin-left: 100px; }
        }

        /* ═══════════════ REDUCED MOTION ═══════════════ */
        @media (prefers-reduced-motion: reduce) {
          .sh-particle { animation: none; }
          .sh-cta-btn { animation: none; }
          .sh-screen-cta-icon { animation: none; }
          .sh-phone, .sh-orbit-icon, .sh-stats-item, .sh-confetti-piece {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
