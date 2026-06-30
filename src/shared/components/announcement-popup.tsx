'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, Star } from 'lucide-react';

export function AnnouncementPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('newsy_popup_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('newsy_popup_dismissed', '1');
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="popup-overlay" onClick={handleClose} />
      <div className="popup-wrap">
        <div className="popup-card">
          <button className="popup-close" onClick={handleClose} aria-label="Закрыть">
            <X size={20} />
          </button>

          {/* Верхний цветной блок */}
          <div className="popup-hero">
            <div className="popup-badge">
              <Sparkles size={14} />
              НОВИНКА
            </div>
            <h2 className="popup-title">
              Кооперативные<br />квесты — уже здесь!
            </h2>
            <p className="popup-subtitle">
              Собери команду, выполняйте задания вместе<br />и получайте награды от брендов-партнёров.
            </p>
            <div className="popup-perks">
              <div className="perk">
                <Star size={16} />
                <span>Реальные награды</span>
              </div>
              <div className="perk">
                <Gift size={16} />
                <span>Скидки от брендов</span>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80"
              alt="Квест"
              className="popup-img"
            />
          </div>

          {/* Нижний блок */}
          <div className="popup-body">
            <p className="popup-desc">
              <strong>Yandex Travel × NEWSY:</strong> выполни квест «Путь исследователя» и выиграй
              поездку на Алтай на двоих. Старт — 1 июля 2026.
            </p>
            <div className="popup-actions">
              <button className="popup-btn-primary" onClick={handleClose}>
                Смотреть квесты
              </button>
              <button className="popup-btn-ghost" onClick={handleClose}>
                Не сейчас
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(6px);
          z-index: 9000;
          animation: fadeIn 0.3s ease;
        }

        .popup-wrap {
          position: fixed;
          inset: 0;
          z-index: 9001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .popup-card {
          background: #fff;
          border-radius: 28px;
          width: 100%;
          max-width: 960px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.3);
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .popup-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.35);
          border: none;
          color: white;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }

        .popup-close:hover {
          background: rgba(0, 0, 0, 0.55);
          transform: scale(1.08);
        }

        {/* Hero */}
        .popup-hero {
          background: linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
          padding: 48px 40px 40px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .popup-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 56, 92, 0.9);
          color: white;
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          width: fit-content;
        }

        .popup-title {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 900;
          margin: 0;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }

        .popup-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
          line-height: 1.5;
        }

        .popup-perks {
          display: flex;
          gap: 16px;
          margin-top: 4px;
        }

        .perk {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
        }

        .popup-img {
          position: absolute;
          right: -20px;
          bottom: -10px;
          width: 280px;
          height: 200px;
          object-fit: cover;
          border-radius: 20px;
          opacity: 0.35;
          transform: rotate(6deg);
        }

        /* Body */
        .popup-body {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 24px;
        }

        .popup-desc {
          font-size: 15px;
          color: #444;
          line-height: 1.6;
          margin: 0;
        }

        .popup-desc strong {
          color: #111;
        }

        .popup-actions {
          display: flex;
          gap: 12px;
        }

        .popup-btn-primary {
          flex: 1;
          background: #FF385C;
          color: white;
          border: none;
          padding: 14px 20px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s, background 0.2s;
        }

        .popup-btn-primary:hover {
          background: #E31C5F;
          transform: translateY(-1px);
        }

        .popup-btn-ghost {
          padding: 14px 20px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          background: #f5f5f5;
          border: none;
          color: #666;
          transition: background 0.2s;
        }

        .popup-btn-ghost:hover {
          background: #ebebeb;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
          .popup-card { grid-template-columns: 1fr; max-width: 480px; }
          .popup-hero { padding: 32px 24px 24px; }
          .popup-body { padding: 24px; }
          .popup-img { width: 180px; height: 120px; }
          .popup-title { font-size: 22px; }
        }
      `}</style>
    </>
  );
}
