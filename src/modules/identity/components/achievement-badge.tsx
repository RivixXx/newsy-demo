import React from 'react';
import { Lock } from 'lucide-react';
import { Achievement } from '../types/gamification';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'md' 
}) => {
  const { title, icon, isEarned, milestoneCurrent, milestoneTotal } = achievement;
  
  const progress = milestoneTotal && milestoneCurrent 
    ? Math.min(100, (milestoneCurrent / milestoneTotal) * 100) 
    : 0;

  return (
    <div className={`achievement-badge ${isEarned ? 'earned' : 'locked'} size-${size}`}>
      <div className="badge-ring">
        {isEarned ? (
          <span className="badge-icon">{icon}</span>
        ) : (
          <div className="locked-icon">
            <Lock size={size === 'sm' ? 12 : 16} />
          </div>
        )}
        {milestoneTotal && !isEarned && (
          <svg className="progress-ring" viewBox="0 0 40 40">
            <circle
              className="progress-ring-circle"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              r="18"
              cx="20"
              cy="20"
              style={{
                strokeDasharray: '113.1',
                strokeDashoffset: `${113.1 - (113.1 * progress) / 100}`
              }}
            />
          </svg>
        )}
      </div>
      <p className="badge-title">{title}</p>
      
      <style jsx>{`
        .achievement-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          transition: transform 0.2s ease;
        }

        .achievement-badge:active {
          transform: scale(0.95);
        }

        .badge-ring {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-accent, #eee);
          border: 2px solid transparent;
        }

        .size-sm .badge-ring { width: 48px; height: 48px; }
        .size-lg .badge-ring { width: 80px; height: 80px; }

        .earned .badge-ring {
          background: linear-gradient(135deg, #fff, #f6f1ea);
          border-color: var(--brand, #b45f34);
          box-shadow: 0 8px 20px rgba(180, 95, 52, 0.2);
        }

        .locked .badge-ring {
          opacity: 0.6;
          background: var(--bg-accent, #eee);
          color: var(--text-muted);
        }

        .badge-icon {
          font-size: 32px;
        }
        .size-sm .badge-icon { font-size: 24px; }
        .size-lg .badge-icon { font-size: 40px; }

        .locked-icon {
          color: var(--text-muted);
        }

        .progress-ring {
          position: absolute;
          top: -4px;
          left: -4px;
          width: calc(100% + 8px);
          height: calc(100% + 8px);
          transform: rotate(-90deg);
          color: var(--brand);
          pointer-events: none;
        }

        .progress-ring-circle {
          transition: stroke-dashoffset 0.35s;
          transform-origin: 50% 50%;
        }

        .badge-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          max-width: 80px;
          line-height: 1.2;
        }

        .locked .badge-title {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
