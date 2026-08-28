'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface StoryItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  userName: string;
  userAvatar?: string;
  challengeTitle: string;
  stepTitle: string;
  createdAt: string;
}

interface StoriesViewerProps {
  stories: StoryItem[];
  initialIndex?: number;
  onClose: () => void;
}

export function StoriesViewer({ stories, initialIndex = 0, onClose }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Прогресс-бар
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (videoRef.current && videoRef.current.duration) {
        const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(pct);

        if (pct >= 100) {
          goNext();
        }
      }
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, isPlaying]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  if (!currentStory) return null;

  return (
    <div className="stories-overlay" onClick={onClose}>
      <div className="stories-container" onClick={e => e.stopPropagation()}>
        {/* Прогресс-бар */}
        <div className="stories-progress">
          {stories.map((_, i) => (
            <div key={i} className="progress-segment">
              <div className="progress-fill" style={{
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
              }} />
            </div>
          ))}
        </div>

        {/* Инфо о пользователе */}
        <div className="stories-header">
          <div className="stories-user">
            <div className="stories-avatar">
              {currentStory.userAvatar ? (
                <img src={currentStory.userAvatar} alt="" />
              ) : (
                currentStory.userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="stories-user-info">
              <span className="stories-username">{currentStory.userName}</span>
              <span className="stories-challenge">{currentStory.challengeTitle}</span>
            </div>
          </div>
          <button className="stories-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Видео */}
        <div className="stories-video-container">
          <video
            ref={videoRef}
            src={currentStory.videoUrl}
            className="stories-video"
            playsInline
            loop={false}
            onClick={togglePlay}
          />

          {/* Навигация */}
          {currentIndex > 0 && (
            <button className="stories-nav prev" onClick={goPrev}>
              <ChevronLeft size={24} />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button className="stories-nav next" onClick={goNext}>
              <ChevronRight size={24} />
            </button>
          )}

          {/* Контролы */}
          <div className="stories-controls">
            <button onClick={togglePlay} className="stories-control-btn">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={toggleMute} className="stories-control-btn">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Название этапа */}
          <div className="stories-step-info">
            <span className="stories-step-title">{currentStory.stepTitle}</span>
            <span className="stories-time">{new Date(currentStory.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>

        <style jsx>{`
          .stories-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
          }
          .stories-container {
            position: relative;
            width: 100%;
            max-width: 420px;
            height: 100dvh;
            max-height: 750px;
            background: #000;
            border-radius: 20px;
            overflow: hidden;
          }
          .stories-progress {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            gap: 4px;
            z-index: 10;
          }
          .progress-segment {
            flex: 1;
            height: 3px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: white;
            border-radius: 2px;
            transition: width 0.1s linear;
          }
          .stories-header {
            position: absolute;
            top: max(24px, calc(env(safe-area-inset-top) + 12px));
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
          }
          .stories-user {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .stories-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF385C, #ff6b8a);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 14px;
            overflow: hidden;
          }
          .stories-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .stories-user-info {
            display: flex;
            flex-direction: column;
          }
          .stories-username {
            font-size: 13px;
            font-weight: 700;
            color: white;
          }
          .stories-challenge {
            font-size: 11px;
            color: rgba(255,255,255,0.7);
          }
          .stories-close {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(0,0,0,0.5);
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .stories-video-container {
            width: 100%;
            height: 100%;
            position: relative;
          }
          .stories-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .stories-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(0,0,0,0.5);
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 5;
          }
          .stories-nav.prev { left: 8px; }
          .stories-nav.next { right: 8px; }
          .stories-controls {
            position: absolute;
            bottom: max(60px, calc(env(safe-area-inset-bottom) + 52px));
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            z-index: 5;
          }
          .stories-control-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(0,0,0,0.5);
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .stories-step-info {
            position: absolute;
            bottom: max(16px, calc(env(safe-area-inset-bottom) + 12px));
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 5;
          }
          .stories-step-title {
            font-size: 13px;
            font-weight: 600;
            color: white;
          }
          .stories-time {
            font-size: 11px;
            color: rgba(255,255,255,0.7);
          }
          @media (max-width: 480px) {
            .stories-overlay { padding: 0; }
            .stories-container {
              max-width: 100%;
              max-height: 100%;
              border-radius: 0;
            }
            .stories-user-info { min-width: 0; }
            .stories-username,
            .stories-challenge,
            .stories-step-title {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .stories-step-title { max-width: 68%; }
          }
        `}</style>
      </div>
    </div>
  );
}
