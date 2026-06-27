'use client';

import { Share2, Send, MessageCircle, Image as ImageIcon } from 'lucide-react';

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

function shareToTelegram(url: string, title: string) {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
}

function shareToVK(url: string, title: string) {
  window.open(`https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
}

function shareToWhatsApp(url: string, title: string) {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
}

function shareToInstagram() {
  window.open('https://www.instagram.com/', '_blank');
}

export function ShareButtons({ challengeId, title, compact }: ShareButtonsProps) {
  const share = (platform: string) => {
    const url = getShareUrl(challengeId);
    const text = `${title} — участвуй на NEWSY!`;
    switch (platform) {
      case 'telegram': shareToTelegram(url, text); break;
      case 'vk': shareToVK(url, text); break;
      case 'whatsapp': shareToWhatsApp(url, text); break;
      case 'instagram': shareToInstagram(); break;
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
              <span style={{ fontWeight: 900, fontSize: 13 }}>VK</span>
            </button>
            <button className="share-btn wa" onClick={() => share('whatsapp')} title="WhatsApp">
              <MessageCircle size={14} />
            </button>
            <button className="share-btn ig" onClick={() => share('instagram')} title="Instagram">
              <ImageIcon size={14} />
            </button>
          </div>
        </div>
        <style jsx>{`
          .share-row {
            display: flex; align-items: center; gap: 10px;
            padding: 12px 0; border-top: 1px solid #f0f0f0; margin-top: 8px;
          }
          .share-label { font-size: 13px; color: #888; font-weight: 600; }
          .share-btns { display: flex; gap: 8px; margin-left: auto; }
          .share-btn {
            width: 34px; height: 34px; border-radius: 50%;
            border: 1px solid #e5e7eb; background: white;
            display: grid; place-items: center; cursor: pointer;
            transition: all 0.15s; color: #555;
          }
          .share-btn:hover { transform: scale(1.1); }
          .share-btn.tg:hover { background: #0088cc; color: white; border-color: #0088cc; }
          .share-btn.vk:hover { background: #4a76a8; color: white; border-color: #4a76a8; }
          .share-btn.wa:hover { background: #25d366; color: white; border-color: #25d366; }
          .share-btn.ig:hover { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; border-color: transparent; }
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
            <span style={{ fontWeight: 900, fontSize: 18 }}>VK</span>
            <span>ВКонтакте</span>
          </button>
          <button className="share-card wa" onClick={() => share('whatsapp')}>
            <MessageCircle size={20} />
            <span>WhatsApp</span>
          </button>
          <button className="share-card ig" onClick={() => share('instagram')}>
            <ImageIcon size={20} />
            <span>Instagram</span>
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
        .share-card.wa:hover { background: #25d366; color: white; border-color: #25d366; }
        .share-card.ig:hover { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; border-color: transparent; }
        @media (max-width: 480px) {
          .share-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
