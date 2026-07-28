'use client';

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapTooltipProps {
  /** Текстовый адрес (город, улица, место) */
  address: string;
  /** Широта для отображения на карте */
  latitude?: number | null;
  /** Долгота для отображения на карте */
  longitude?: number | null;
  /** Формат челленджа: ONLINE — не показываем локацию */
  format?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  /** Дополнительный CSS-класс */
  className?: string;
}

const ONLINE_KEYWORDS = ['онлайн', 'online', 'весь мир', 'ваш город', 'по всей россии', 'дома'];

function isOnlineAddress(address: string): boolean {
  const lower = address.toLowerCase();
  return ONLINE_KEYWORDS.some(kw => lower === kw || lower.startsWith(kw) || lower.endsWith(kw));
}

/**
 * Компонент для отображения адреса с картой Яндекс.Карт по ховеру.
 *
 * - Если адрес похож на «Онлайн» → ничего не рендерит.
 * - Если есть координаты → показывает адрес + iframe Яндекс.Карт при наведении.
 * - Если координат нет → показывает только адрес (текст с иконкой).
 */
export function MapTooltip({ address, latitude, longitude, format, className = '' }: MapTooltipProps) {
  const [showMap, setShowMap] = useState(false);

  // Не показываем локацию для онлайн-челленджей
  if (!address || format === 'ONLINE' || isOnlineAddress(address)) return null;

  const hasCoords = latitude != null && longitude != null;

  return (
    <div
      className={`map-tooltip-wrap ${className}`}
      onMouseEnter={() => hasCoords && setShowMap(true)}
      onMouseLeave={() => setShowMap(false)}
    >
      <MapPin size={13} className="map-tooltip-icon" />
      <span className="map-tooltip-address">{address}</span>

      {hasCoords && showMap && (
        <div className="map-tooltip-popover">
          <iframe
            width="260"
            height="170"
            style={{ border: 0, borderRadius: 10 }}
            loading="lazy"
            src={`https://yandex.ru/map-widget/v1/?ll=${longitude}%2C${latitude}&z=15&pt=${longitude}%2C${latitude}&l=map`}
            title={`Карта: ${address}`}
          />
          <div className="map-tooltip-popover-address">
            <MapPin size={12} />
            <span>{address}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .map-tooltip-wrap {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #888;
          font-weight: 600;
          cursor: ${hasCoords ? 'pointer' : 'default'};
          position: relative;
          white-space: nowrap;
        }

        .map-tooltip-icon {
          flex-shrink: 0;
          color: #FF385C;
        }

        .map-tooltip-address {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .map-tooltip-popover {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
          padding: 8px;
          z-index: 100;
          animation: mapFadeIn 0.2s ease;
        }

        .map-tooltip-popover-address {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 4px 2px;
          font-size: 11px;
          font-weight: 700;
          color: #444;
        }

        @keyframes mapFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
