'use client';

import React from 'react';
import { Radio, ExternalLink } from 'lucide-react';

interface LiveStreamEmbedProps {
  platform: 'youtube' | 'vk' | 'twitch';
  videoId: string;
  title?: string;
  isLive?: boolean;
}

export function LiveStreamEmbed({ platform, videoId, title, isLive = true }: LiveStreamEmbedProps) {
  const getEmbedUrl = () => {
    switch (platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
      case 'vk':
        return `https://vk.com/video_ext.php?oid=-${videoId}&hd=2`;
      case 'twitch':
        return `https://player.twitch.tv/?channel=${videoId}&parent=chillenge-russia.ru`;
      default:
        return '';
    }
  };

  const getDirectUrl = () => {
    switch (platform) {
      case 'youtube':
        return `https://www.youtube.com/watch?v=${videoId}`;
      case 'vk':
        return `https://vk.com/video?z=video-${videoId}`;
      case 'twitch':
        return `https://www.twitch.tv/${videoId}`;
      default:
        return '#';
    }
  };

  return (
    <div className="stream-container">
      {isLive && (
        <div className="stream-live-badge">
          <Radio size={12} /> LIVE
        </div>
      )}
      <iframe
        src={getEmbedUrl()}
        className="stream-iframe"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title={title || 'Live Stream'}
      />
      <div className="stream-footer">
        <a href={getDirectUrl()} target="_blank" rel="noopener noreferrer" className="stream-link">
          <ExternalLink size={14} /> Открыть на {platform}
        </a>
      </div>

      <style jsx>{`
        .stream-container {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
        }
        .stream-live-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ef4444;
          color: white;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          z-index: 10;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .stream-iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border: none;
        }
        .stream-footer {
          padding: 12px 16px;
          background: #111;
        }
        .stream-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #aaa;
          text-decoration: none;
          transition: color 0.2s;
        }
        .stream-link:hover {
          color: white;
        }
      `}</style>
    </div>
  );
}
