'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  /** Дата старта в ISO формате */
  targetDate: string;
  /** Компактный режим (для карточек) */
  compact?: boolean;
  /** CSS-класс */
  className?: string;
}

function calcRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { days, hours, minutes, seconds, total: diff };
}

export function CountdownTimer({ targetDate, compact = false, className = '' }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(calcRemaining(new Date(targetDate)));

  useEffect(() => {
    setRemaining(calcRemaining(new Date(targetDate)));

    const interval = setInterval(() => {
      const r = calcRemaining(new Date(targetDate));
      setRemaining(r);
      if (!r) clearInterval(interval);
    }, compact ? 60_000 : 1_000);

    return () => clearInterval(interval);
  }, [targetDate, compact]);

  if (!remaining) {
    return (
      <span className={`cdt-started ${className}`}>
        <Clock size={compact ? 12 : 14} />
        <span>ЧИ началось!</span>
      </span>
    );
  }

  if (compact) {
    // Компакт: "2д 5ч"
    const parts: string[] = [];
    if (remaining.days > 0) parts.push(`${remaining.days}д`);
    if (remaining.hours > 0) parts.push(`${remaining.hours}ч`);
    if (parts.length === 0) parts.push(`${remaining.minutes}мин`);
    return (
      <span className={`cdt-compact ${className}`}>
        <Clock size={12} />
        <span>Старт через {parts.join(' ')}</span>
      </span>
    );
  }

  // Полный: "2 дня 5 часов 30 минут"
  const plural = (n: number, forms: [string, string, string]) =>
    n % 10 === 1 && n % 100 !== 11 ? forms[0] :
    n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? forms[1] : forms[2];

  const p: string[] = [];
  if (remaining.days > 0) p.push(`${remaining.days} ${plural(remaining.days, ['день', 'дня', 'дней'])}`);
  if (remaining.hours > 0) p.push(`${remaining.hours} ${plural(remaining.hours, ['час', 'часа', 'часов'])}`);
  if (remaining.minutes > 0) p.push(`${remaining.minutes} ${plural(remaining.minutes, ['минута', 'минуты', 'минут'])}`);
  if (remaining.seconds > 0 && remaining.days === 0) p.push(`${remaining.seconds} ${plural(remaining.seconds, ['секунда', 'секунды', 'секунд'])}`);

  return (
    <div className={`cdt-full ${className}`}>
      <Clock size={16} />
      <div className="cdt-info">
        <span className="cdt-label">Регистрация / Оплата до</span>
        <span className="cdt-value">{p.join(' ')}</span>
      </div>

      <style jsx>{`
        .cdt-full {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fff7ed, #fffbeb);
          border: 1px solid #fed7aa;
          border-radius: 14px;
        }
        .cdt-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cdt-label {
          font-size: 11px;
          font-weight: 700;
          color: #d97706;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cdt-value {
          font-size: 18px;
          font-weight: 900;
          color: #92400e;
        }
        .cdt-full svg {
          color: #d97706;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
