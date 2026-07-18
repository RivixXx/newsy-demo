'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Eye } from 'lucide-react';
import { StoriesViewer } from '@/shared/components/stories-viewer';

interface Story {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  userName: string;
  userAvatar?: string;
  challengeTitle: string;
  challengeId: string;
  stepTitle: string;
  createdAt: string;
}

// Mock данные для демонстрации
const MOCK_STORIES: Story[] = [
  {
    id: '1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    userName: 'Алексей Петров',
    challengeTitle: 'Марафон ЗОЖ',
    challengeId: '1',
    stepTitle: 'Утренняя разминка',
    createdAt: '2026-07-13T10:30:00Z',
  },
  {
    id: '2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    userName: 'Мария Иванова',
    challengeTitle: 'Фото-охота',
    challengeId: '2',
    stepTitle: 'Поиск сокровищ',
    createdAt: '2026-07-13T11:15:00Z',
  },
  {
    id: '3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    userName: 'Дмитрий Козлов',
    challengeTitle: 'Код за 30 дней',
    challengeId: '3',
    stepTitle: 'День 1: Hello World',
    createdAt: '2026-07-13T12:00:00Z',
  },
  {
    id: '4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    userName: 'Анна Сидорова',
    challengeTitle: 'Марафон ЗОЖ',
    challengeId: '1',
    stepTitle: 'Вечерняя пробежка',
    createdAt: '2026-07-13T18:45:00Z',
  },
  {
    id: '5',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    userName: 'Сергей Николаев',
    challengeTitle: 'Творческий конкурс',
    challengeId: '4',
    stepTitle: 'Мой арт-объект',
    createdAt: '2026-07-13T15:20:00Z',
  },
];

export default function StoriesPage() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const openStory = (index: number) => {
    setSelectedStoryIndex(index);
    setViewerOpen(true);
  };

  return (
    <div className="stories-page">
      <Link href="/explore" className="stories-back">
        <ArrowLeft size={18} /> На главную
      </Link>

      <header className="stories-header">
        <h1>Stories</h1>
        <p>Видео-отчёты участников от этапов челленджей</p>
      </header>

      <div className="stories-grid">
        {MOCK_STORIES.map((story, index) => (
          <div
            key={story.id}
            className="story-card"
            onClick={() => openStory(index)}
          >
            <div className="story-thumbnail">
              <div className="story-gradient" />
              <div className="story-play">
                <Play size={24} fill="white" />
              </div>
              <div className="story-duration">
                <Eye size={12} /> {(index + 1) * 234}
              </div>
            </div>
            <div className="story-info">
              <div className="story-avatar">
                {story.userAvatar ? (
                  <img src={story.userAvatar} alt="" />
                ) : (
                  story.userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="story-meta">
                <span className="story-user">{story.userName}</span>
                <span className="story-challenge">{story.challengeTitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewerOpen && (
        <StoriesViewer
          stories={MOCK_STORIES}
          initialIndex={selectedStoryIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      <style jsx>{`
        .stories-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px clamp(16px, 3vw, 40px) 80px;
        }
        .stories-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-decoration: none;
          margin-bottom: 24px;
        }
        .stories-back:hover { color: #FF385C; }
        .stories-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .stories-header h1 {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          margin: 0 0 12px;
        }
        .stories-header p {
          font-size: 16px;
          color: #666;
          margin: 0;
        }
        .stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .story-card {
          cursor: pointer;
          border-radius: 16px;
          overflow: hidden;
          background: #1a1a1a;
          transition: transform 0.2s;
        }
        .story-card:hover {
          transform: scale(1.02);
        }
        .story-thumbnail {
          position: relative;
          height: 280px;
          background: linear-gradient(135deg, #1a1a1a, #333);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .story-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%);
        }
        .story-play {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1;
          transition: all 0.2s;
        }
        .story-card:hover .story-play {
          background: #FF385C;
          transform: scale(1.1);
        }
        .story-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(0,0,0,0.6);
          border-radius: 6px;
          font-size: 11px;
          color: white;
          z-index: 1;
        }
        .story-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
        }
        .story-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF385C, #ff6b8a);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
        }
        .story-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .story-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .story-user {
          font-size: 13px;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .story-challenge {
          font-size: 11px;
          color: #888;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 480px) {
          .stories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .story-thumbnail {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
