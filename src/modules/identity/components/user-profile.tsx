'use client';

import React from 'react';
import { 
  Share2, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  ChevronRight,
  Award,
  Calendar
} from 'lucide-react';
import { AchievementBadge } from './achievement-badge';
import { GamifiedProfile } from '../types/gamification';

interface UserProfileProps {
  profile: GamifiedProfile;
  userName: string;
  avatarUrl?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  profile, 
  userName,
  avatarUrl 
}) => {
  const {
    level,
    experience,
    nextLevelExperience,
    totalPoints,
    rating,
    completedChallengesCount,
    activeChallengesCount,
    badgesCount,
    achievements,
    recentActivity
  } = profile;

  const expProgress = (experience / nextLevelExperience) * 100;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${userName}'s NEWSY Profile`,
        text: `I'm level ${level} on NEWSY! Check out my achievements.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser');
    }
  };

  return (
    <div className="user-profile-container">
      {/* Profile Header */}
      <header className="profile-header">
        <div className="avatar-section">
          <div className="avatar-ring">
            <svg className="level-progress-svg" viewBox="0 0 100 100">
              <circle
                className="level-progress-bg"
                cx="50" cy="50" r="46"
                fill="transparent"
                strokeWidth="4"
              />
              <circle
                className="level-progress-fill"
                cx="50" cy="50" r="46"
                fill="transparent"
                strokeWidth="4"
                style={{
                  strokeDasharray: '289',
                  strokeDashoffset: `${289 - (289 * expProgress) / 100}`
                }}
              />
            </svg>
            <div className="avatar-image-container">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">{userName.charAt(0)}</div>
              )}
            </div>
            <div className="level-badge">Lv.{level}</div>
          </div>
          
          <div className="user-info">
            <h1 className="user-name">{userName}</h1>
            <p className="user-rank">Elite Explorer</p>
          </div>

          <button className="share-button" onClick={handleShare} aria-label="Share profile">
            <Share2 size={20} />
          </button>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-value">{totalPoints.toLocaleString()}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">#{rating}</span>
            <span className="stat-label">Global Rank</span>
          </div>
        </div>
      </header>

      {/* Statistics Row */}
      <section className="stats-row">
        <div className="stats-card">
          <div className="stats-card-icon"><Trophy size={20} /></div>
          <div className="stats-card-content">
            <span className="stats-card-value">{completedChallengesCount}</span>
            <span className="stats-card-label">Completed</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-card-icon"><Target size={20} /></div>
          <div className="stats-card-content">
            <span className="stats-card-value">{activeChallengesCount}</span>
            <span className="stats-card-label">Active</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-card-icon"><Award size={20} /></div>
          <div className="stats-card-content">
            <span className="stats-card-value">{badgesCount}</span>
            <span className="stats-card-label">Badges</span>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">Your Trophies</h2>
          <button className="text-button">View All</button>
        </div>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
        </div>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon-container">
                {activity.type === 'CHALLENGE_COMPLETED' ? (
                  <Trophy size={16} className="text-brand" />
                ) : activity.type === 'STEP_COMPLETED' ? (
                  <Zap size={16} className="text-yellow" />
                ) : (
                  <Award size={16} className="text-brand" />
                )}
              </div>
              <div className="activity-details">
                <p className="activity-title">{activity.title}</p>
                <div className="activity-meta">
                  <Calendar size={12} />
                  <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                  {activity.points && (
                    <span className="activity-points">+{activity.points} pts</span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="activity-chevron" />
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .user-profile-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Header Styles */
        .profile-header {
          background: var(--surface, #fff);
          border-radius: var(--radius-xl, 28px);
          padding: 24px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .avatar-ring {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .level-progress-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .level-progress-bg {
          stroke: var(--bg-accent, #eee);
        }

        .level-progress-fill {
          stroke: var(--brand, #b45f34);
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
        }

        .avatar-image-container {
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 6px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--bg-accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          font-size: 28px;
          font-weight: 800;
          color: var(--brand);
        }

        .level-badge {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--brand-strong, #7e3f22);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          border: 2px solid var(--surface, #fff);
        }

        .user-info {
          flex-grow: 1;
        }

        .user-name {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          color: var(--text);
        }

        .user-rank {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }

        .share-button {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .share-button:active {
          background: var(--bg-accent);
        }

        .quick-stats {
          display: flex;
          align-items: center;
          background: var(--bg-accent, #f6f1ea);
          border-radius: 16px;
          padding: 12px;
        }

        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 24px;
          background: var(--line);
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stats-card {
          background: var(--surface);
          padding: 12px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid var(--line);
        }

        .stats-card-icon {
          color: var(--brand);
          background: var(--bg-accent);
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stats-card-value {
          font-size: 16px;
          font-weight: 800;
          display: block;
        }

        .stats-card-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        /* Sections */
        .section-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-title {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
        }

        .text-button {
          background: transparent;
          border: none;
          color: var(--brand);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          background: var(--surface);
          padding: 20px;
          border-radius: var(--radius-xl);
          border: 1px solid var(--line);
        }

        /* Activity List */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .activity-item {
          background: var(--surface);
          padding: 12px 16px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--line);
          transition: transform 0.2s;
        }

        .activity-item:active {
          transform: scale(0.98);
        }

        .activity-icon-container {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: var(--bg-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-details {
          flex-grow: 1;
        }

        .activity-title {
          font-size: 14px;
          font-weight: 700;
          margin: 0;
        }

        .activity-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .activity-points {
          font-weight: 800;
          color: var(--brand);
        }

        .activity-chevron {
          color: var(--line);
        }

        .text-brand { color: var(--brand); }
        .text-yellow { color: #f59e0b; }

        @media (max-width: 400px) {
          .achievements-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
