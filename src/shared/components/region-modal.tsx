'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';

interface RegionModalProps {
  isOpen: boolean;
  onSelect: (region: string) => void;
  onSkip: () => void;
}

// Reverse geocode via Nominatim (OpenStreetMap) — free, no API key
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru&zoom=10`,
      { headers: { 'User-Agent': 'CHIApp/1.0' } }
    );
    const data = await resp.json();
    // Try city/town/village first, then fallback to state
    const city = data.address?.city || data.address?.town || data.address?.village;
    const state = data.address?.state;
    return city || state || null;
  } catch {
    return null;
  }
}

export function RegionModal({ isOpen, onSelect, onSkip }: RegionModalProps) {
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-detect on open
  useEffect(() => {
    if (!isOpen || autoDetected) return;

    setAutoDetected(true);
    setDetecting(true);

    if (!navigator.geolocation) {
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (city) {
          setDetectedCity(city);
          setQuery(city);
        }
        setDetecting(false);
      },
      () => {
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [isOpen, autoDetected]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSkip();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onSkip]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setDetectedCity(null);
      setAutoDetected(false);
    }
  }, [isOpen]);

  const handleManualDetect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (city) {
          setDetectedCity(city);
          setQuery(city);
        }
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleSubmit = () => {
    const val = query.trim();
    if (val) onSelect(val);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="region-overlay" onClick={onSkip} aria-hidden="true" />
      <div className="region-wrap" role="dialog" aria-modal="true" aria-labelledby="region-title" aria-describedby="region-description">
        <div className="region-card">
          <button className="region-close" onClick={onSkip} aria-label="Закрыть">
            <X size={20} />
          </button>

          <div className="region-header">
            <div className="region-icon">
              <MapPin size={28} />
            </div>
            <h2 className="region-title" id="region-title">Выберите город</h2>
            <p className="region-subtitle" id="region-description">
              Чтобы показывать челленджи рядом с вами
            </p>
          </div>

          {/* City input — always visible, always works */}
          <div className="region-input-wrap">
            <MapPin size={16} className="region-input-icon" />
            <input
              ref={inputRef}
              type="text"
              aria-label="Город"
              placeholder="Тамбов"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="region-text-input"
              autoComplete="off"
              spellCheck={false}
            />
            {query.trim() && (
              <button className="region-ok-btn" onClick={handleSubmit} type="button">
                Выбрать
              </button>
            )}
          </div>

          {/* Auto-detect button */}
          <button className="region-detect-btn" onClick={handleManualDetect} disabled={detecting} type="button">
            {detecting ? (
              <>
                <Loader2 size={15} className="spin" />
                Определяем ваш город...
              </>
            ) : (
              <>
                <Navigation size={15} />
                Определить автоматически
              </>
            )}
          </button>

          {/* Detected city suggestion */}
          {detectedCity && !query.trim() && (
            <div className="region-suggestion">
              <span>Ваш город: <strong>{detectedCity}</strong></span>
              <button className="region-suggestion-btn" onClick={() => onSelect(detectedCity)} type="button">
                Выбрать
              </button>
            </div>
          )}

          <button className="region-skip" onClick={onSkip} type="button">
            Показать все города
          </button>
        </div>
      </div>

      <style>{`
        .region-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          z-index: 9500; animation: regFadeIn 0.25s ease;
        }
        .region-wrap {
          position: fixed; inset: 0; z-index: 9501;
          display: flex; align-items: center; justify-content: center;
          padding: max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left)); animation: regSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .region-card {
          background: white; border-radius: 24px;
          width: 100%; max-width: 420px;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 40px 100px rgba(0,0,0,0.25);
          position: relative;
          max-height: min(90dvh, 720px); overflow-y: auto; overscroll-behavior: contain;
        }
        .region-close {
          position: absolute; top: 16px; right: 16px; z-index: 10;
          width: 44px; height: 44px; border-radius: 50%;
          background: #f5f5f5; border: none; color: #666;
          display: grid; place-items: center; cursor: pointer;
          transition: background 0.2s;
        }
        .region-close:hover { background: #eee; }

        .region-header { padding: 32px 28px 0; text-align: center; }
        .region-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg, #FF385C, #E31C5F);
          color: white; display: inline-flex; align-items: center;
          justify-content: center; margin-bottom: 16px;
        }
        .region-title { font-size: 22px; font-weight: 900; margin: 0 0 6px; color: #111; }
        .region-subtitle { font-size: 14px; color: #888; margin: 0 0 24px; line-height: 1.5; }

        /* Input */
        .region-input-wrap {
          display: flex; align-items: center; gap: 0;
          margin: 0 28px; padding: 0;
          height: 52px; border-radius: 14px;
          border: 2px solid #e5e7eb; background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .region-input-wrap:focus-within {
          border-color: #FF385C;
          box-shadow: 0 0 0 3px rgba(255,56,92,0.1);
        }
        .region-input-icon { margin-left: 14px; color: #bbb; flex-shrink: 0; }
        .region-text-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 16px; color: #111; height: 100%;
          padding: 0 12px; font-family: inherit;
        }
        .region-text-input::placeholder { color: #ccc; }
        .region-ok-btn {
          height: 100%; padding: 0 18px; border: none;
          background: #FF385C; color: white;
          font-size: 14px; font-weight: 800;
          cursor: pointer; transition: background 0.15s;
          white-space: nowrap;
        }
        .region-ok-btn:hover { background: #E31C5F; }

        /* Detect button */
        .region-detect-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin: 12px 28px 0; padding: 12px;
          border-radius: 12px; border: 1.5px solid #e5e7eb;
          background: white; font-size: 14px; font-weight: 700;
          color: #555; cursor: pointer; transition: all 0.2s;
        }
        .region-detect-btn:hover { border-color: #FF385C; color: #FF385C; }
        .region-detect-btn:disabled { opacity: 0.5; cursor: wait; }

        /* Detected suggestion */
        .region-suggestion {
          display: flex; align-items: center; gap: 8px;
          margin: 12px 28px 0; padding: 10px 14px;
          border-radius: 10px; background: #f0fdf4;
          font-size: 13px; color: #166534; font-weight: 600;
          animation: regPopIn 0.2s ease;
        }
        .region-suggestion-btn {
          margin-left: auto; padding: 5px 14px;
          border-radius: 8px; border: none;
          background: #16a34a; color: white;
          font-size: 12px; font-weight: 700; cursor: pointer;
        }
        .region-suggestion-btn:hover { background: #15803d; }

        .region-skip {
          margin: 16px 28px 24px; padding: 12px;
          border-radius: 12px; border: none;
          background: transparent; font-size: 14px;
          font-weight: 700; color: #aaa; cursor: pointer;
          transition: color 0.2s;
        }
        .region-skip:hover { color: #555; }

        .spin { animation: regSpin 1s linear infinite; }

        @keyframes regFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes regSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes regPopIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes regSpin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .region-wrap { align-items: flex-end; padding: max(12px, env(safe-area-inset-top)) 0 0; }
          .region-card { max-height: calc(100dvh - max(12px, env(safe-area-inset-top))); border-radius: 24px 24px 0 0; padding-bottom: env(safe-area-inset-bottom); }
          .region-header { padding: 28px 20px 0; }
          .region-input-wrap, .region-detect-btn, .region-suggestion, .region-skip {
            margin-left: 20px; margin-right: 20px;
          }
        }
      `}</style>
    </>
  );
}
