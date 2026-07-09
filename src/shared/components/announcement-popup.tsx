'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Smartphone, Wrench, Shield, Zap, MapPin, Phone, Clock, Copy, Check } from 'lucide-react';

export function AnnouncementPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('newsy_popup_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('newsy_popup_dismissed', '1');
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('САЙТ').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  const rotateX = mousePos.y * -8;
  const rotateY = mousePos.x * 8;

  return (
    <>
      <div className="ap-overlay" onClick={handleClose} />
      <div className="ap-wrap">
        <div
          ref={cardRef}
          className="ap-card"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
          style={{
            transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          <button className="ap-close" onClick={handleClose} aria-label="Закрыть">
            <X size={20} />
          </button>

          {/* ─── LEFT: Dark hero with parallax layers ─── */}
          <div className="ap-hero">
            {/* Parallax background layers */}
            <div
              className="ap-bg-layer ap-bg-grid"
              style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
            />
            <div
              className="ap-bg-layer ap-bg-glow"
              style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }}
            />
            <div
              className="ap-bg-layer ap-bg-phone"
              style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px) rotate(${mousePos.x * 5}deg)` }}
            >
              <Smartphone size={180} strokeWidth={0.8} />
            </div>

            {/* Content */}
            <div className="ap-hero-content">
              <div className="ap-badge">
                <Zap size={13} />
                ПАРТНЁР В ТАМБОВЕ
              </div>
              <h2 className="ap-title">
                iStore68<br />
                <span className="ap-title-accent">Ремонт Apple</span>
              </h2>
              <p className="ap-subtitle">
                Оригинальные запчасти, гарантия 30 дней,<br />
                фотоотчёт ремонта. от 15 минут.
              </p>

              <div className="ap-discount-block">
                <div className="ap-discount-value">-20%</div>
                <div className="ap-discount-label">на первый ремонт</div>
              </div>

              <div className="ap-promo-row">
                <span className="ap-promo-label">Промокод:</span>
                <button className="ap-promo-code" onClick={handleCopyCode}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Скопировано!' : 'САЙТ'}
                </button>
              </div>
            </div>

            {/* Floating device icons with parallax */}
            <div className="ap-float ap-float-1" style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}>
              <Shield size={24} />
            </div>
            <div className="ap-float ap-float-2" style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)` }}>
              <Wrench size={20} />
            </div>
          </div>

          {/* ─── RIGHT: Info + CTA ─── */}
          <div className="ap-body">
            <div className="ap-services">
              <h3 className="ap-services-title">Что ремонтируем</h3>
              <div className="ap-service-grid">
                <div className="ap-service">
                  <div className="ap-service-icon"><Smartphone size={20} /></div>
                  <span>iPhone</span>
                </div>
                <div className="ap-service">
                  <div className="ap-service-icon"><Smartphone size={20} /></div>
                  <span>iPad</span>
                </div>
                <div className="ap-service">
                  <div className="ap-service-icon"><Wrench size={20} /></div>
                  <span>MacBook</span>
                </div>
                <div className="ap-service">
                  <div className="ap-service-icon"><Shield size={20} /></div>
                  <span>Android</span>
                </div>
              </div>
            </div>

            <div className="ap-contacts">
              <div className="ap-contact">
                <MapPin size={15} />
                <span>г. Тамбов, ул. Чичерина, 17</span>
              </div>
              <div className="ap-contact">
                <Phone size={15} />
                <span>+7 (962) 230-40-40</span>
              </div>
              <div className="ap-contact">
                <Clock size={15} />
                <span>Каждый день 10:00–19:00</span>
              </div>
            </div>

            <div className="ap-actions">
              <a
                href="https://istore68.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="ap-btn-primary"
              >
                Перейти на сайт
              </a>
              <button className="ap-btn-ghost" onClick={handleClose}>
                Не сейчас
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ap-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(12px);
          z-index: 9000; animation: apFadeIn 0.4s ease;
        }
        .ap-wrap {
          position: fixed; inset: 0; z-index: 9001;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: apSlideUp 0.5s cubic-bezier(0.16,1,0.3,1);
        }

        /* Card */
        .ap-card {
          background: #fff; border-radius: 28px;
          width: 100%; max-width: 1080px;
          overflow: hidden; position: relative;
          display: grid; grid-template-columns: 1.1fr 1fr;
          box-shadow: 0 50px 120px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1);
          transition: transform 0.15s ease-out;
          will-change: transform;
        }
        .ap-close {
          position: absolute; top: 18px; right: 18px; z-index: 10;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.15); border: none;
          color: white; display: grid; place-items: center;
          cursor: pointer; transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .ap-close:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }

        /* ─── HERO (left) ─── */
        .ap-hero {
          background: linear-gradient(160deg, #0a0a0f 0%, #111118 40%, #1a1025 100%);
          padding: 48px 40px; color: white;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center;
          min-height: 520px;
        }

        /* Parallax BG layers */
        .ap-bg-layer {
          position: absolute; inset: 0;
          transition: transform 0.2s ease-out;
          will-change: transform;
        }
        .ap-bg-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .ap-bg-glow {
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,56,92,0.2) 0%, transparent 70%);
          top: 20%; left: 30%;
          filter: blur(60px);
        }
        .ap-bg-phone {
          position: absolute; right: -20px; bottom: -30px;
          color: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
        }

        .ap-hero-content { position: relative; z-index: 2; }
        .ap-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,56,92,0.9); color: white;
          padding: 6px 14px; border-radius: 99px;
          font-size: 11px; font-weight: 800;
          letter-spacing: 0.1em; width: fit-content;
          margin-bottom: 20px;
        }
        .ap-title {
          font-size: clamp(28px, 4vw, 38px);
          font-weight: 900; margin: 0 0 12px;
          line-height: 1.1; letter-spacing: -1px;
        }
        .ap-title-accent {
          background: linear-gradient(135deg, #FF385C, #ff6b8a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ap-subtitle {
          font-size: 14px; color: rgba(255,255,255,0.6);
          margin: 0 0 28px; line-height: 1.6;
        }

        .ap-discount-block {
          display: flex; align-items: baseline; gap: 12px;
          margin-bottom: 20px;
        }
        .ap-discount-value {
          font-size: 48px; font-weight: 900;
          background: linear-gradient(135deg, #FF385C, #ff6b8a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; line-height: 1;
        }
        .ap-discount-label {
          font-size: 16px; font-weight: 700;
          color: rgba(255,255,255,0.8);
        }

        .ap-promo-row {
          display: flex; align-items: center; gap: 10px;
        }
        .ap-promo-label {
          font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 600;
        }
        .ap-promo-code {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: white; font-size: 15px; font-weight: 800;
          letter-spacing: 0.15em; cursor: pointer;
          transition: all 0.2s; backdrop-filter: blur(4px);
        }
        .ap-promo-code:hover { background: rgba(255,255,255,0.18); }

        /* Floating icons */
        .ap-float {
          position: absolute; z-index: 1;
          transition: transform 0.25s ease-out;
          will-change: transform;
        }
        .ap-float-1 {
          top: 20%; right: 15%;
          color: rgba(255,56,92,0.3);
        }
        .ap-float-2 {
          bottom: 25%; right: 25%;
          color: rgba(255,255,255,0.1);
        }

        /* ─── BODY (right) ─── */
        .ap-body {
          padding: 44px 40px;
          display: flex; flex-direction: column; justify-content: center;
          gap: 28px;
        }
        .ap-services-title {
          font-size: 16px; font-weight: 800; color: #111;
          margin: 0 0 14px;
        }
        .ap-service-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .ap-service {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px;
          background: #f7f7f8; border: 1px solid #eee;
          font-size: 14px; font-weight: 700; color: #333;
          transition: border-color 0.2s, transform 0.2s;
        }
        .ap-service:hover { border-color: #FF385C; transform: translateY(-2px); }
        .ap-service-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #FF385C, #E31C5F);
          color: white; display: grid; place-items: center;
          flex-shrink: 0;
        }

        .ap-contacts {
          display: flex; flex-direction: column; gap: 10px;
        }
        .ap-contact {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #666;
        }
        .ap-contact svg { color: #FF385C; flex-shrink: 0; }

        .ap-actions { display: flex; gap: 10px; }
        .ap-btn-primary {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 14px 20px; border-radius: 14px;
          background: linear-gradient(135deg, #FF385C, #E31C5F);
          color: white; font-size: 15px; font-weight: 800;
          text-decoration: none; border: none; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(255,56,92,0.3);
        }
        .ap-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,56,92,0.4); }
        .ap-btn-ghost {
          padding: 14px 20px; border-radius: 14px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          background: #f5f5f5; border: none; color: #666;
          transition: background 0.2s;
        }
        .ap-btn-ghost:hover { background: #eee; }

        @keyframes apFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes apSlideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 900px) {
          .ap-card { grid-template-columns: 1fr; max-width: 520px; }
          .ap-hero { min-height: auto; padding: 36px 28px; }
          .ap-bg-phone { display: none; }
          .ap-body { padding: 28px; }
          .ap-discount-value { font-size: 36px; }
        }
        @media (max-width: 480px) {
          .ap-wrap { padding: 12px; }
          .ap-hero { padding: 28px 20px; }
          .ap-body { padding: 20px; }
          .ap-service-grid { grid-template-columns: 1fr; }
          .ap-actions { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
