'use client';

import { useState } from 'react';
import { Share2, Send, MessageCircle, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  challengeId: string;
  title: string;
  compact?: boolean;
}

function getShareUrl(challengeId: string) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/challenges/${challengeId}`;
  }
  return `https://chillenge-russia.ru/challenges/${challengeId}`;
}

export function ShareButtons({ challengeId, title, compact }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const share = (platform: string) => {
    const url = getShareUrl(challengeId);
    const text = `${title} — участвуй на NEWSY!`;
    switch (platform) {
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'vk':
        window.open(`https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'max':
        window.open(`https://max.ru/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }
  };

  if (compact) {
    return (
      <>
        <div className="share-row">
          <Share2 size={15} color="#888" />
          <span className="share-label">Поделиться</span>
          <div className="share-btns">
            <button className="share-btn tg" onClick={() => share('telegram')} title="Telegram">
              <Send size={14} />
            </button>
            <button className="share-btn vk" onClick={() => share('vk')} title="ВКонтакте">
              <span style={{ fontWeight: 900, fontSize: 12 }}>VK</span>
            </button>
            <button className="share-btn max" onClick={() => share('max')} title="MAX">
              <span style={{ fontWeight: 900, fontSize: 11 }}>MAX</span>
            </button>
            <button className="share-btn copy" onClick={() => share('copy')} title="Копировать ссылку">
              {copied ? <Check size={14} /> : <Link2 size={14} />}
            </button>
          </div>
        </div>
        <style jsx>{`
          .share-row {
            display: flex; align-items: center; gap: 10px;
            padding: 12px 0; border-top: 1px solid #f0f0f0; margin-top: 8px;
            flex-wrap: wrap;
          }
          .share-label { font-size: 13px; color: #888; font-weight: 600; }
          .share-btns { display: flex; gap: 6px; margin-left: auto; flex-wrap: wrap; }
          .share-btn {
            min-width: 32px; height: 32px; border-radius: 8px;
            border: 1px solid #e5e7eb; background: white;
            display: inline-flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.15s; color: #555;
            padding: 0 8px;
          }
          .share-btn:hover { transform: scale(1.05); }
          .share-btn.tg:hover { background: #0088cc; color: white; border-color: #0088cc; }
          .share-btn.vk:hover { background: #4a76a8; color: white; border-color: #4a76a8; }
          .share-btn.max:hover { background: #ff6600; color: white; border-color: #ff6600; }
          .share-btn.copy:hover { background: #22c55e; color: white; border-color: #22c55e; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="share-block">
        <p className="share-title">Поделиться с друзьями</p>
        <div className="share-grid">
          <button className="share-card tg" onClick={() => share('telegram')}>
            <Send size={20} />
            <span>Telegram</span>
          </button>
          <button className="share-card vk" onClick={() => share('vk')}>
            <span style={{ fontWeight: 900, fontSize: 16 }}>VK</span>
            <span>ВКонтакте</span>
          </button>
          <button className="share-card max" onClick={() => share('max')}>
            <span style={{ fontWeight: 900, fontSize: 14 }}>MAX</span>
            <span>MAX</span>
          </button>
          <button className="share-card copy" onClick={() => share('copy')}>
            {copied ? <Check size={20} /> : <Link2 size={20} />}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
      </div>
      <style jsx>{`
        .share-block { padding: 16px 0; }
        .share-title { font-size: 14px; font-weight: 700; color: #333; margin: 0 0 12px; }
        .share-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .share-card {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 8px; border-radius: 14px;
          border: 1.5px solid #e5e7eb; background: white;
          cursor: pointer; transition: all 0.2s; font-size: 12px; font-weight: 700; color: #444;
        }
        .share-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
        .share-card.tg:hover { background: #0088cc; color: white; border-color: #0088cc; }
        .share-card.vk:hover { background: #4a76a8; color: white; border-color: #4a76a8; }
        .share-card.max:hover { background: #ff6600; color: white; border-color: #ff6600; }
        .share-card.copy:hover { background: #22c55e; color: white; border-color: #22c55e; }
        @media (max-width: 480px) {
          .share-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
