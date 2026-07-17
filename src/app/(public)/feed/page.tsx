import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';

interface FeedItem {
  id: string;
  userName: string;
  userAvatar: string | null;
  challengeTitle: string;
  challengeId: string;
  stepTitle: string;
  stepType: string;
  submission: string | null;
  completedAt: Date;
}

async function getFeedItems(): Promise<FeedItem[]> {
  try {
    const stepProgress = await prisma.stepProgress.findMany({
      where: {
        completed: true,
        submission: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
          },
        },
        step: {
          select: {
            title: true,
            type: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    return stepProgress
      .filter(sp => sp.completedAt)
      .map(sp => ({
        id: sp.id,
        userName: `${sp.user.firstName || ''} ${sp.user.lastName || ''}`.trim() || 'Участник',
        userAvatar: sp.user.avatarUrl,
        challengeTitle: sp.challenge.title,
        challengeId: sp.challengeId,
        stepTitle: sp.step.title || 'Этап',
        stepType: sp.step.type,
        submission: sp.submission,
        completedAt: sp.completedAt!,
      }));
  } catch {
    return [];
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  return `${days} дн. назад`;
}

function getStepTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    ACTION: '✅',
    PHOTO: '📸',
    QUESTION: '❓',
    LOCATION: '📍',
    VIDEO: '🎥',
  };
  return map[type] || '📝';
}

export default async function FeedPage() {
  const items = await getFeedItems();

  return (
    <PageShell variant="public">
      <div className="feed-page">
        <Link href="/" className="feed-back">
          <ArrowLeft size={16} /> На главную
        </Link>

        <header className="feed-header">
          <h1>Лента активности</h1>
          <p>Последние выполненные этапы от участников NEWSY</p>
        </header>

        {items.length === 0 ? (
          <div className="feed-empty">
            <p>Пока нет активности</p>
            <Link href="/explore" className="feed-cta">Станьте первым!</Link>
          </div>
        ) : (
          <div className="feed-grid">
            {items.map(item => (
              <div key={item.id} className="feed-card">
                <div className="feed-card-header">
                  <div className="feed-avatar">
                    {item.userAvatar ? (
                      <img src={item.userAvatar} alt="" />
                    ) : (
                      item.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="feed-user-info">
                    <span className="feed-user-name">{item.userName}</span>
                    <span className="feed-time">{getTimeAgo(item.completedAt)}</span>
                  </div>
                </div>

                <div className="feed-card-body">
                  <div className="feed-step-badge">
                    {getStepTypeEmoji(item.stepType)} {item.stepTitle}
                  </div>
                  <Link href={`/challenges/${item.challengeId}`} className="feed-challenge-link">
                    {item.challengeTitle} <ExternalLink size={12} />
                  </Link>
                  {item.submission && (
                    <p className="feed-submission">{item.submission}</p>
                  )}
                </div>

                <div className="feed-card-actions">
                  <button className="feed-action">
                    <Heart size={16} /> <span>Нравится</span>
                  </button>
                  <button className="feed-action">
                    <MessageCircle size={16} /> <span>Комментарии</span>
                  </button>
                  <button className="feed-action">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .feed-page {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px clamp(16px, 3vw, 40px) 80px;
          }
          .feed-back {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            font-weight: 600;
            color: #666;
            text-decoration: none;
            margin-bottom: 24px;
          }
          .feed-back:hover { color: #FF385C; }
          .feed-header {
            text-align: center;
            margin-bottom: 32px;
          }
          .feed-header h1 {
            font-size: 28px;
            font-weight: 900;
            margin: 0 0 8px;
          }
          .feed-header p {
            font-size: 15px;
            color: #888;
            margin: 0;
          }
          .feed-empty {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 20px;
            border: 1px solid #f0f0f0;
          }
          .feed-empty p {
            font-size: 16px;
            color: #888;
            margin: 0 0 16px;
          }
          .feed-cta {
            display: inline-block;
            padding: 12px 24px;
            background: #FF385C;
            color: white;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
          }
          .feed-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .feed-card {
            background: white;
            border-radius: 16px;
            border: 1px solid #f0f0f0;
            overflow: hidden;
          }
          .feed-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
          }
          .feed-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF385C, #ff6b8a);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            overflow: hidden;
          }
          .feed-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .feed-user-info {
            flex: 1;
          }
          .feed-user-name {
            display: block;
            font-weight: 700;
            font-size: 14px;
          }
          .feed-time {
            display: block;
            font-size: 12px;
            color: #888;
          }
          .feed-card-body {
            padding: 0 16px 16px;
          }
          .feed-step-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #f3f4f6;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .feed-challenge-link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;
            font-weight: 700;
            color: #FF385C;
            text-decoration: none;
            margin-bottom: 8px;
          }
          .feed-challenge-link:hover {
            text-decoration: underline;
          }
          .feed-submission {
            font-size: 14px;
            color: #555;
            line-height: 1.5;
            margin: 8px 0 0;
            padding: 12px;
            background: #fafafa;
            border-radius: 10px;
          }
          .feed-card-actions {
            display: flex;
            border-top: 1px solid #f0f0f0;
          }
          .feed-action {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 12px;
            border: none;
            background: none;
            font-size: 13px;
            font-weight: 600;
            color: #888;
            cursor: pointer;
            transition: all 0.2s;
          }
          .feed-action:hover {
            background: #fafafa;
            color: #FF385C;
          }
        `}</style>
      </div>
    </PageShell>
  );
}
