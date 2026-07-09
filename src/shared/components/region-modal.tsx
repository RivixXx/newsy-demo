'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, MapPin, Search, Navigation } from 'lucide-react';
import { RUSSIAN_REGIONS } from '@/shared/hooks/use-region';

interface RegionModalProps {
  isOpen: boolean;
  onSelect: (region: string) => void;
  onSkip: () => void;
}

export function RegionModal({ isOpen, onSelect, onSkip }: RegionModalProps) {
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return RUSSIAN_REGIONS.slice(0, 12);
    const q = query.toLowerCase();
    return RUSSIAN_REGIONS.filter(r => r.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Auto-detect via timezone
  useEffect(() => {
    if (!isOpen) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzCity = tz.split('/').pop()?.replace(/_/g, ' ');
      if (tzCity) {
        const match = RUSSIAN_REGIONS.find(r =>
          r.toLowerCase().includes(tzCity.toLowerCase())
        );
        setDetectedCity(match || tzCity);
      }
    } catch {
      setDetectedCity(null);
    }
  }, [isOpen]);

  const handleDetect = () => {
    if (!navigator.geolocation) {
      // Fallback: use timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzCity = tz.split('/').pop()?.replace(/_/g, ' ');
        if (tzCity) setDetectedCity(tzCity);
      } catch { /* ignore */ }
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Use timezone as fallback (free geocoding is unreliable)
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const tzCity = tz.split('/').pop()?.replace(/_/g, ' ');
          if (tzCity) setDetectedCity(tzCity);
        } catch { /* ignore */ }
        setDetecting(false);
      },
      () => {
        // Permission denied or error — try timezone
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const tzCity = tz.split('/').pop()?.replace(/_/g, ' ');
          if (tzCity) setDetectedCity(tzCity);
        } catch { /* ignore */ }
        setDetecting(false);
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  };

  const handleSubmit = () => {
    const val = query.trim();
    if (val) onSelect(val);
  };

  const handleItemClick = (city: string) => {
    setQuery(city);
    onSelect(city);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="region-overlay" />
      <div className="region-wrap">
        <div className="region-card">
          <button className="region-close" onClick={onSkip} aria-label="Закрыть">
            <X size={20} />
          </button>

          <div className="region-header">
            <div className="region-icon">
              <MapPin size={28} />
            </div>
            <h2 className="region-title">Где вы находитесь?</h2>
            <p className="region-subtitle">
              Введите название города, чтобы видеть челленджи рядом с вами
            </p>
          </div>

          {/* City input */}
          <div className="region-search">
            <Search size={16} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Введите город..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="region-input"
            />
            {query.trim() && (
              <button className="region-submit" onClick={handleSubmit}>
                OK
              </button>
            )}
          </div>

          {/* Timezone detection */}
          <button className="region-detect" onClick={handleDetect} disabled={detecting}>
            <Navigation size={15} />
            {detecting ? 'Определяем...' : 'Определить по геолокации'}
          </button>

          {detectedCity && (
            <div className="region-detected">
              <span>Ваш город: <strong>{detectedCity}</strong></span>
              <button className="region-detected-btn" onClick={() => onSelect(detectedCity)}>
                Выбрать
              </button>
            </div>
          )}

          {/* Suggestions */}
          {filtered.length > 0 && (
            <div className="region-list">
              {filtered.map((r) => (
                <button key={r} className="region-item" onClick={() => handleItemClick(r)}>
                  <MapPin size={14} />
                  {r}
                </button>
              ))}
            </div>
          )}

          <button className="region-skip" onClick={onSkip}>
            Показать все города
          </button>
        </div>
      </div>

      <style jsx>{`
        .region-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          z-index: 9500; animation: fadeIn 0.25s ease;
        }
        .region-wrap {
          position: fixed; inset: 0; z-index: 9501;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .region-card {
          background: white; border-radius: 24px;
          width: 100%; max-width: 440px; max-height: 85vh;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 40px 100px rgba(0,0,0,0.25);
          position: relative;
        }
        .region-close {
          position: absolute; top: 16px; right: 16px; z-index: 10;
          width: 36px; height: 36px; border-radius: 50%;
          background: #f5f5f5; border: none; color: #666;
          display: grid; place-items: center; cursor: pointer;
          transition: background 0.2s;
        }
        .region-close:hover { background: #eee; }
        .region-header {
          padding: 32px 28px 0; text-align: center;
        }
        .region-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg, #FF385C, #E31C5F);
          color: white; display: inline-flex; align-items: center;
          justify-content: center; margin-bottom: 16px;
        }
        .region-title {
          font-size: 22px; font-weight: 900; margin: 0 0 6px; color: #111;
        }
        .region-subtitle {
          font-size: 14px; color: #888; margin: 0 0 20px; line-height: 1.5;
        }
        .region-search {
          display: flex; align-items: center; gap: 8px;
          margin: 0 28px 12px; padding: 0 8px 0 14px;
          height: 48px; border-radius: 12px;
          border: 1.5px solid #e5e7eb; background: #fafafa;
          transition: border-color 0.2s;
        }
        .region-search:focus-within { border-color: #FF385C; }
        .region-search svg { color: #aaa; flex-shrink: 0; }
        .region-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 15px; color: #111; height: 100%;
        }
        .region-input::placeholder { color: #bbb; }
        .region-submit {
          padding: 6px 14px; border-radius: 8px; border: none;
          background: #FF385C; color: white; font-size: 13px;
          font-weight: 800; cursor: pointer; transition: background 0.15s;
        }
        .region-submit:hover { background: #E31C5F; }
        .region-detect {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin: 0 28px 12px; padding: 11px;
          border-radius: 12px; border: 1.5px solid #e5e7eb;
          background: white; font-size: 13px; font-weight: 700;
          color: #555; cursor: pointer; transition: border-color 0.2s;
        }
        .region-detect:hover { border-color: #FF385C; color: #333; }
        .region-detect:disabled { opacity: 0.6; cursor: wait; }
        .region-detected {
          display: flex; align-items: center; gap: 8px;
          margin: 0 28px 12px; padding: 10px 14px;
          border-radius: 10px; background: #f0fdf4;
          font-size: 13px; color: #166534; font-weight: 600;
          animation: popIn 0.2s ease;
        }
        .region-detected-btn {
          margin-left: auto; padding: 5px 14px;
          border-radius: 8px; border: none;
          background: #16a34a; color: white;
          font-size: 12px; font-weight: 700; cursor: pointer;
        }
        .region-detected-btn:hover { background: #15803d; }
        .region-list {
          flex: 1; overflow-y: auto; padding: 0 28px;
          max-height: 240px;
        }
        .region-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 14px; border-radius: 10px;
          border: none; background: transparent;
          font-size: 14px; font-weight: 600; color: #333;
          cursor: pointer; text-align: left;
          transition: background 0.15s;
        }
        .region-item:hover { background: #f5f5f5; }
        .region-item svg { color: #ccc; flex-shrink: 0; }
        .region-skip {
          margin: 12px 28px 24px; padding: 12px;
          border-radius: 12px; border: none;
          background: transparent; font-size: 14px;
          font-weight: 700; color: #888; cursor: pointer;
          transition: color 0.2s;
        }
        .region-skip:hover { color: #333; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 480px) {
          .region-card { max-height: 90vh; }
          .region-header { padding: 28px 20px 0; }
          .region-list { padding: 0 20px; }
          .region-detect, .region-search { margin-left: 20px; margin-right: 20px; }
          .region-skip { margin-left: 20px; margin-right: 20px; }
        }
      `}</style>
    </>
  );
}
