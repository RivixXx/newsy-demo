import Link from 'next/link';
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
        status: 'APPROVED',
        submission: { not: null },
      },
      include: {
        userProgress: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            challenge: { select: { id: true, title: true } },
          },
        },
        step: { select: { title: true, type: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    return stepProgress
      .filter(sp => sp.completedAt)
      .map(sp => ({
        id: sp.id,
        userName: `${sp.userProgress.user.firstName || ''} ${sp.userProgress.user.lastName || ''}`.trim() || 'Участник',
        userAvatar: sp.userProgress.user.avatarUrl,
        challengeTitle: sp.userProgress.challenge.title,
        challengeId: sp.userProgress.challengeId,
        stepTitle: sp.step.title || 'Этап',
        stepType: sp.step.type,
        submission: typeof sp.submission === 'string' ? sp.submission : null,
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

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const items = await getFeedItems();

  return (
    <PageShell variant="public">
      <div style={s.page}>
        <Link href="/" style={s.back}>
          <ArrowLeft size={16} /> На главную
        </Link>

        <header style={s.header}>
          <h1 style={s.h1}>Лента активности</h1>
          <p style={s.sub}>Последние выполненные этапы от участников NEWSY</p>
        </header>

        {items.length === 0 ? (
          <div style={s.empty}>
            <p style={{ margin: '0 0 16px', fontSize: 16, color: '#888' }}>Пока нет активности</p>
            <Link href="/explore" style={s.cta}>Станьте первым!</Link>
          </div>
        ) : (
          <div style={s.grid}>
            {items.map(item => (
              <div key={item.id} style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.avatar}>
                    {item.userAvatar ? (
                      <img src={item.userAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      item.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.userName}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{getTimeAgo(item.completedAt)}</div>
                  </div>
                </div>

                <div style={s.cardBody}>
                  <div style={s.badge}>
                    {getStepTypeEmoji(item.stepType)} {item.stepTitle}
                  </div>
                  <Link href={`/challenges/${item.challengeId}`} style={s.challengeLink}>
                    {item.challengeTitle} <ExternalLink size={12} />
                  </Link>
                  {item.submission && (
                    <p style={s.submission}>{item.submission}</p>
                  )}
                </div>

                <div style={s.actions}>
                  <button style={s.actionBtn}><Heart size={16} /> <span>Нравится</span></button>
                  <button style={s.actionBtn}><MessageCircle size={16} /> <span>Комментарии</span></button>
                  <button style={s.actionBtn}><Share2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 600, margin: '0 auto', padding: '40px clamp(16px, 3vw, 40px) 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#666', textDecoration: 'none', marginBottom: 24 },
  header: { textAlign: 'center', marginBottom: 32 },
  h1: { fontSize: 28, fontWeight: 900, margin: '0 0 8px' },
  sub: { fontSize: 15, color: '#888', margin: 0 },
  empty: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, border: '1px solid #f0f0f0' },
  cta: { display: 'inline-block', padding: '12px 24px', background: '#FF385C', color: 'white', borderRadius: 12, fontWeight: 700, textDecoration: 'none' },
  grid: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: 16 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF385C, #ff6b8a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, overflow: 'hidden', flexShrink: 0 },
  cardBody: { padding: '0 16px 16px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f3f4f6', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 8 },
  challengeLink: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: '#FF385C', textDecoration: 'none', marginBottom: 8 },
  submission: { fontSize: 14, color: '#555', lineHeight: 1.5, margin: '8px 0 0', padding: 12, background: '#fafafa', borderRadius: 10 },
  actions: { display: 'flex', borderTop: '1px solid #f0f0f0' },
  actionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, border: 'none', background: 'none', fontSize: 13, fontWeight: 600, color: '#888', cursor: 'pointer' },
};
