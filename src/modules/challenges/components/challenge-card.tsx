'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Trophy, ChevronRight, Zap } from 'lucide-react';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const {
    id,
    title,
    organizer,
    category,
    pointsReward,
    imageUrl,
    participantsCount,
    isJoined,
    progress,
    badges,
  } = challenge;

  // Функция перевода категорий для интерфейса
  const translateCategory = (cat: string) => {
    const mapping: Record<string, string> = {
      'Sport': 'Спорт',
      'Education': 'Обучение',
      'Quest': 'Квест',
      'Art': 'Искусство',
      'Tech': 'Техно'
    };
    return mapping[cat] || cat;
  };

  return (
    <Link href={`/challenges/${id}`} className="challenge-card-link">
      <div className="challenge-card">
        <div className="card-image-container">
          <img src={imageUrl} alt={title} className="card-image" />
          <div className="category-badge">{translateCategory(category)}</div>
          <div className="points-badge">
            <Zap size={14} fill="currentColor" />
            <span>{pointsReward} баллов</span>
          </div>
        </div>

        <div className="card-content">
          <div className="card-header">
            <p className="organizer-text">от {organizer}</p>
            <h3 className="challenge-title">{title}</h3>
          </div>

          <div className="social-proof">
            <div className="participants">
              <Users size={16} />
              <span>{participantsCount.toLocaleString()} участников</span>
            </div>
            {badges && badges.length > 0 && (
              <div className="badges-row">
                {badges.map((badge, index) => (
                  <span key={index} className="badge-icon" title={badge === 'cooperative' ? 'Командный' : 'Горячий'}>
                    {badge === 'cooperative' ? '🤝' : '🔥'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isJoined && progress !== undefined && (
            <div className="progress-container">
              <div className="progress-header">
                <span className="progress-label">Ваш прогресс</span>
                <span className="progress-value">{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className={`action-button ${isJoined ? 'joined' : ''}`}>
            {isJoined ? 'Продолжить' : 'Участвовать'}
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .challenge-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }

        .challenge-card {
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(0,0,0,0.05);
          height: 100%;
        }

        .challenge-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .card-image-container {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .challenge-card:hover .card-image {
          transform: scale(1.05);
        }

        .category-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          color: black;
          text-transform: uppercase;
        }

        .points-badge {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: linear-gradient(135deg, #ff385c, #ff8c00);
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .organizer-text {
          font-size: 12px;
          color: #666;
          margin: 0 0 4px 0;
          font-weight: 600;
        }

        .challenge-title {
          font-size: 19px;
          font-weight: 900;
          margin: 0 0 16px 0;
          line-height: 1.2;
          color: black;
        }

        .social-proof {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .participants {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #666;
          font-weight: 700;
        }

        .badges-row {
          display: flex;
          gap: 4px;
        }

        .badge-icon {
          font-size: 16px;
          background: #f0f0f0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .progress-container {
          margin-bottom: 20px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 8px;
          text-transform: uppercase;
          color: #666;
        }

        .progress-bar-bg {
          height: 6px;
          background: #eee;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff385c, #ff8c00);
          border-radius: 3px;
        }

        .action-button {
          margin-top: auto;
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: black;
          color: white;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s ease;
        }

        .action-button.joined {
          background: #ff385c;
        }
      `}</style>
    </Link>
  );
};
