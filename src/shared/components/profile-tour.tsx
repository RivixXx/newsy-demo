'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TourStep[] = [
  { target: 'avatar-edit', title: 'Фото профиля', text: 'Нажми сюда, чтобы загрузить своё фото или выбрать аватар', position: 'right' },
  { target: 'edit-name', title: 'Имя', text: 'Нажми сюда, чтобы отредактировать своё имя', position: 'bottom' },
  { target: 'hero-share', title: 'Поделиться', text: 'Нажми сюда, чтобы поделиться профилем с друзьями', position: 'left' },
  { target: 'hero-public', title: 'Публичный профиль', text: 'Нажми сюда, чтобы посмотреть как твой профиль видят другие', position: 'left' },
  { target: 'tabs-bar', title: 'Навигация', text: 'Здесь ты переключаешься между разделами: достижения, награды, история', position: 'bottom' },
];

const STORAGE_KEY = 'newsy-profile-tour-done';

export function ProfileTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [arrowAngle, setArrowAngle] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const el = document.querySelector(`[data-tour="${STEPS[step].target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    setTooltipPos({ x: cx, y: cy });

    const tooltip = tooltipRef.current;
    if (tooltip) {
      const tr = tooltip.getBoundingClientRect();
      const tx = tr.left + tr.width / 2;
      const ty = tr.top + tr.height / 2;
      const angle = Math.atan2(cy - ty, cx - tx) * (180 / Math.PI);
      setArrowAngle(angle);
    }
  }, [active, step]);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setActive(false);
  };

  if (!active) return null;

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div className="tour-backdrop" onClick={finish} />

      {/* Highlight ring around target */}
      <div
        className="tour-spotlight"
        style={{
          top: tooltipPos.y - 30,
          left: tooltipPos.x - 30,
        }}
      />

      {/* Spiral Arrow SVG */}
      <svg
        className="tour-arrow"
        style={{
          top: tooltipPos.y,
          left: tooltipPos.x,
          transform: `rotate(${arrowAngle + 180}deg)`,
        }}
        width="120"
        height="60"
        viewBox="0 0 120 60"
      >
        <path
          d="M10,50 C10,50 20,10 50,10 C80,10 90,30 80,40 C70,50 55,35 60,25 C65,15 75,20 72,28"
          fill="none"
          stroke="#FF385C"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="spiral-path"
        />
        <polygon
          points="72,22 78,30 66,30"
          fill="#FF385C"
          className="spiral-head"
        />
      </svg>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="tour-tooltip"
        style={{
          top: tooltipPos.y,
          left: tooltipPos.x,
        }}
      >
        <div className="tour-tooltip-inner">
          <div className="tour-header">
            <div className="tour-step-badge">
              <Sparkles size={12} /> {step + 1} из {STEPS.length}
            </div>
            <button className="tour-close" onClick={finish}>
              <X size={14} />
            </button>
          </div>
          <h4 className="tour-title">{current.title}</h4>
          <p className="tour-text">{current.text}</p>
          <div className="tour-progress">
            <div className="tour-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="tour-actions">
            <button
              className="tour-btn tour-btn--secondary"
              onClick={prev}
              disabled={step === 0}
            >
              <ChevronLeft size={14} /> Назад
            </button>
            <button className="tour-btn tour-btn--primary" onClick={next}>
              {step === STEPS.length - 1 ? 'Готово!' : 'Далее'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .tour-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(2px);
          z-index: 9998;
          animation: fadeIn 0.3s ease;
        }
        .tour-spotlight {
          position: fixed;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid #FF385C;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.3), 0 0 20px rgba(255,56,92,0.3);
          z-index: 9999;
          transform: translate(-50%, -50%);
          animation: pulseRing 1.5s ease infinite;
          pointer-events: none;
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.3), 0 0 20px rgba(255,56,92,0.3); }
          50% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.3), 0 0 30px rgba(255,56,92,0.5); }
        }

        .tour-arrow {
          position: fixed;
          z-index: 10000;
          pointer-events: none;
          transform-origin: 0 0;
          animation: arrowAppear 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          filter: drop-shadow(0 2px 4px rgba(255,56,92,0.3));
        }
        .spiral-path {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawSpiral 0.8s ease 0.2s forwards;
        }
        .spiral-head {
          opacity: 0;
          animation: fadeIn 0.3s ease 0.8s forwards;
        }
        @keyframes drawSpiral {
          to { stroke-dashoffset: 0; }
        }
        @keyframes arrowAppear {
          from { opacity: 0; transform: rotate(var(--angle)) scale(0.5); }
          to { opacity: 1; transform: rotate(var(--angle)) scale(1); }
        }

        .tour-tooltip {
          position: fixed;
          z-index: 10001;
          transform: translate(50px, -80px);
          animation: tooltipPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-delay: 0.15s;
          opacity: 0;
        }
        @keyframes tooltipPop {
          from { opacity: 0; transform: translate(50px, -80px) scale(0.9); }
          to { opacity: 1; transform: translate(50px, -80px) scale(1); }
        }

        .tour-tooltip-inner {
          background: white;
          border-radius: 16px;
          padding: 20px;
          width: 260px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
        }
        .tour-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .tour-step-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #FF385C;
          background: #fff0f3;
          padding: 4px 10px;
          border-radius: 99px;
        }
        .tour-close {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          border: none;
          background: #f5f5f5;
          color: #888;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tour-close:hover { background: #eee; color: #333; }
        .tour-title {
          font-size: 16px;
          font-weight: 800;
          color: #111;
          margin: 0 0 6px;
        }
        .tour-text {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
          margin: 0 0 14px;
        }
        .tour-progress {
          height: 3px;
          background: #f0f0f0;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .tour-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF385C, #ff8c00);
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        .tour-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .tour-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }
        .tour-btn--primary {
          background: #FF385C;
          color: white;
        }
        .tour-btn--primary:hover { background: #E31C5F; }
        .tour-btn--secondary {
          background: #f5f5f5;
          color: #666;
        }
        .tour-btn--secondary:hover { background: #eee; }
        .tour-btn:disabled { opacity: 0.4; cursor: default; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 600px) {
          .tour-tooltip {
            transform: translate(-50px, 20px);
          }
          @keyframes tooltipPop {
            from { opacity: 0; transform: translate(-50px, 20px) scale(0.9); }
            to { opacity: 1; transform: translate(-50px, 20px) scale(1); }
          }
          .tour-tooltip-inner { width: 220px; padding: 16px; }
        }
      `}</style>
    </>
  );
}
