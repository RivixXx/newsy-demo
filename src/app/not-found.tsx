'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, Zap } from 'lucide-react';
import { IconRocket, IconTarget, IconRoute, IconBulb, IconStar, IconFlame, IconDeviceGamepad, IconTrophy } from '@tabler/icons-react';

function FloatingIcon({ icon, delay, x }: { icon: React.ReactNode; delay: number; x: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="float-emoji"
      style={{
        left: `${x}%`,
        animationDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
      }}
    >
      {icon}
    </div>
  );
}

export default function NotFound() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const icons = [
    <IconRocket size={24} />, <IconTarget size={24} />, <IconRoute size={24} />,
    <IconBulb size={24} />, <IconStar size={24} />, <IconFlame size={24} />,
    <IconDeviceGamepad size={24} />, <IconTrophy size={24} />,
  ];

  return (
    <div className="nf-page">
      {/* Animated background */}
      <div className="nf-bg">
        <div className="nf-grid" />
        {icons.map((icon, i) => (
          <FloatingIcon key={i} icon={icon} delay={i * 200} x={10 + (i * 11)} />
        ))}
      </div>

      <div className="nf-content">
        {/* Glitch 404 */}
        <div className={`nf-number ${glitch ? 'glitch' : ''}`}>
          <span className="nf-digit">4</span>
          <div className="nf-zero-wrap">
            <div className="nf-orbit">
              <div className="nf-orbit-dot" />
            </div>
            <span className="nf-digit nf-zero">0</span>
          </div>
          <span className="nf-digit">4</span>
        </div>

        <h1 className="nf-title">Страница не найдена</h1>
        <p className="nf-desc">
          Похоже, эта страница отправилась в экспедицию
          <br />и пока не вернулась. Попробуй вернуться домой.
        </p>

        {/* Search-like bar */}
        <div className="nf-search">
          <Search size={18} color="#aaa" />
          <span className="nf-search-text">Попробуй поискать на главной...</span>
        </div>

        {/* Action buttons */}
        <div className="nf-actions">
          <Link href="/" className="nf-btn nf-btn--primary">
            <Home size={18} /> На главную
          </Link>
          <button className="nf-btn nf-btn--ghost" onClick={() => window.history.back()}>
            <ArrowLeft size={18} /> Назад
          </button>
        </div>

        {/* Fun fact */}
        <div className="nf-fact">
          <Zap size={14} />
          <span>Знаешь? Код 404 придумали в CERN в 1992 году. С тех пор он стал самым знаменитым ошибочным кодом в мире.</span>
        </div>
      </div>

      <style>{`
        .nf-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #f7f7f7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Background */
        .nf-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .nf-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,56,92,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,56,92,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove {
          from { transform: translate(0, 0); }
          to { transform: translate(60px, 60px); }
        }

        .float-emoji {
          position: absolute;
          top: -40px;
          font-size: 28px;
          color: rgba(255,56,92,0.3);
          animation: floatDown 6s ease-in-out infinite;
          transition: opacity 0.5s;
        }
        @keyframes floatDown {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }

        /* Content */
        .nf-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 40px 24px;
          max-width: 520px;
        }

        /* 404 Number */
        .nf-number {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 24px;
          position: relative;
        }
        .nf-digit {
          font-size: clamp(80px, 15vw, 140px);
          font-weight: 900;
          color: #111;
          line-height: 1;
          letter-spacing: -4px;
        }
        .nf-zero-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nf-zero {
          color: #FF385C;
          position: relative;
          z-index: 1;
        }

        /* Orbit around 0 */
        .nf-orbit {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 2px dashed rgba(255,56,92,0.2);
          border-radius: 50%;
          animation: orbitSpin 6s linear infinite;
        }
        .nf-orbit-dot {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background: #FF385C;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(255,56,92,0.5);
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Glitch effect */
        .nf-number.glitch .nf-digit {
          animation: glitchText 0.2s ease;
        }
        @keyframes glitchText {
          0% { transform: translate(0); }
          25% { transform: translate(-3px, 2px); color: #FF385C; }
          50% { transform: translate(3px, -1px); color: #3b82f6; }
          75% { transform: translate(-1px, -2px); }
          100% { transform: translate(0); }
        }

        .nf-title {
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 900;
          color: #111;
          margin: 0 0 12px;
        }
        .nf-desc {
          font-size: 15px;
          color: #888;
          line-height: 1.6;
          margin: 0 0 28px;
        }

        /* Search bar */
        .nf-search {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          margin-bottom: 28px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .nf-search:hover { border-color: #FF385C; }
        .nf-search-text { font-size: 14px; color: #aaa; }

        /* Buttons */
        .nf-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 32px;
        }
        .nf-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
        }
        .nf-btn--primary {
          background: #FF385C;
          color: white;
        }
        .nf-btn--primary:hover { background: #E31C5F; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,56,92,0.3); }
        .nf-btn--ghost {
          background: white;
          color: #555;
          border: 1.5px solid #e5e7eb;
        }
        .nf-btn--ghost:hover { border-color: #ccc; }

        /* Fun fact */
        .nf-fact {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 14px 18px;
          background: white;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          text-align: left;
        }
        .nf-fact svg { flex-shrink: 0; margin-top: 2px; color: #f59e0b; }
        .nf-fact span { font-size: 12px; color: #888; line-height: 1.5; }

        @media (max-width: 480px) {
          .nf-actions { flex-direction: column; }
          .nf-btn { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
