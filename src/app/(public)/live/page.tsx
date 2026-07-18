'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Radio, Calendar, Clock } from 'lucide-react';
import { LiveStreamEmbed } from '@/shared/components/live-stream-embed';

const MOCK_STREAMS = [
  {
    id: '1',
    platform: 'youtube' as const,
    videoId: 'dQw4w9WgXcQ',
    title: 'Старт марафона ЗОЖ 2026',
    challenge: 'Марафон ЗОЖ',
    scheduledAt: '2026-07-15T10:00:00Z',
    isLive: true,
  },
  {
    id: '2',
    platform: 'youtube' as const,
    videoId: 'jNQXAC9IVRw',
    title: 'Объявление победителей фото-охоты',
    challenge: 'Фото-охота',
    scheduledAt: '2026-07-20T18:00:00Z',
    isLive: false,
  },
];

export default function LivePage() {
  const liveStream = MOCK_STREAMS.find(s => s.isLive);
  const scheduledStreams = MOCK_STREAMS.filter(s => !s.isLive);

  return (
    <div className="live-page">
      <Link href="/explore" className="live-back">
        <ArrowLeft size={18} /> На главную
      </Link>

      <header className="live-header">
        <Radio size={32} color="#ef4444" />
        <div>
          <h1>Live-стримы</h1>
          <p>Прямые трансляции от организаторов челленджей</p>
        </div>
      </header>

      {/* Активный стрим */}
      {liveStream && (
        <section className="live-section">
          <h2 className="section-title">
            <Radio size={18} color="#ef4444" /> Прямо сейчас
          </h2>
          <LiveStreamEmbed
            platform={liveStream.platform}
            videoId={liveStream.videoId}
            title={liveStream.title}
            isLive={true}
          />
          <div className="stream-info">
            <h3>{liveStream.title}</h3>
            <p>{liveStream.challenge}</p>
          </div>
        </section>
      )}

      {/* Запланированные */}
      <section className="live-section">
        <h2 className="section-title">
          <Calendar size={18} /> Запланированные трансляции
        </h2>
        {scheduledStreams.length === 0 ? (
          <p className="empty-text">Нет запланированных трансляций</p>
        ) : (
          <div className="scheduled-list">
            {scheduledStreams.map(stream => (
              <div key={stream.id} className="scheduled-card">
                <div className="scheduled-time">
                  <Calendar size={16} />
                  {new Date(stream.scheduledAt).toLocaleDateString('ru-RU')}
                </div>
                <div className="scheduled-info">
                  <h3>{stream.title}</h3>
                  <p>{stream.challenge}</p>
                </div>
                <button className="remind-btn">Напомнить</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .live-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px clamp(16px, 3vw, 40px) 80px;
        }
        .live-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-decoration: none;
          margin-bottom: 24px;
        }
        .live-back:hover { color: #FF385C; }
        .live-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .live-header h1 {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          margin: 0;
        }
        .live-header p {
          font-size: 16px;
          color: #666;
          margin: 4px 0 0;
        }
        .live-section {
          margin-bottom: 32px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 16px;
        }
        .stream-info {
          padding: 16px;
          background: white;
          border-radius: 0 0 16px 16px;
          border: 1px solid #f0f0f0;
          border-top: none;
        }
        .stream-info h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 700;
        }
        .stream-info p {
          margin: 0;
          font-size: 14px;
          color: #888;
        }
        .empty-text {
          text-align: center;
          padding: 40px;
          color: #888;
          background: white;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
        }
        .scheduled-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .scheduled-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 14px;
          border: 1px solid #f0f0f0;
        }
        .scheduled-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
          flex-shrink: 0;
        }
        .scheduled-info {
          flex: 1;
        }
        .scheduled-info h3 {
          margin: 0 0 2px;
          font-size: 14px;
          font-weight: 700;
        }
        .scheduled-info p {
          margin: 0;
          font-size: 12px;
          color: #888;
        }
        .remind-btn {
          padding: 8px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        .remind-btn:hover {
          border-color: #FF385C;
          color: #FF385C;
        }
      `}</style>
    </div>
  );
}
