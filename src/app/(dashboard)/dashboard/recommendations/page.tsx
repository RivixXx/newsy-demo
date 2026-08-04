import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Sparkles, Users, Star } from 'lucide-react';

async function getRecommendations(userId?: string) {
  if (!userId) return [];

  try {
    // Получаем категории, в которых пользователь участвовал
    const userParticipations = await prisma.userProgress.findMany({
      where: { userId },
      include: { challenge: { select: { category: true } } },
    });

    const participatedCategories = [...new Set(
      userParticipations.map(p => p.challenge.category).filter((c): c is string => typeof c === 'string')
    )];

    const participatedChallengeIds = userParticipations.map(p => p.challengeId);

    // Рекомендации: челленджи из любимых категорий
    let recommendations = await prisma.challenge.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        id: { notIn: participatedChallengeIds },
        ...(participatedCategories.length > 0 && {
          category: { in: participatedCategories },
        }),
      },
      include: {
        organizer: { select: { name: true } },
        media: { take: 1 },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    // Если мало — добавляем популярные
    if (recommendations.length < 12) {
      const popular = await prisma.challenge.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          id: { notIn: [...participatedChallengeIds, ...recommendations.map(r => r.id)] },
        },
        include: {
          organizer: { select: { name: true } },
          media: { take: 1 },
          _count: { select: { participations: true } },
        },
        orderBy: { participations: { _count: 'desc' } },
        take: 12 - recommendations.length,
      });
      recommendations = [...recommendations, ...popular];
    }

    return recommendations;
  } catch {
    return [];
  }
}

export default async function RecommendationsPage() {
  const session = await getCurrentAuthSession();
  const recommendations = await getRecommendations(session?.user.id);

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к дашборду
        </Link>

        <header style={styles.header}>
          <Sparkles size={32} color="#8b5cf6" />
          <div>
            <h1 style={styles.title}>Рекомендации</h1>
            <p style={styles.subtitle}>Подобраны специально для вас</p>
          </div>
        </header>

        {recommendations.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>Рекомендаций пока нет</p>
        ) : (
          <div style={styles.grid}>
            {(recommendations as any[]).map((item: any) => (
              <Link key={item.id} href={`/challenges/${item.id}`} style={styles.card}>
                <div style={styles.cardImage}>
                  <img src={item.media?.[0]?.url || '/images/challenge-placeholder.svg'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardOrganizer}>{item.organizer?.name}</p>
                  <div style={styles.cardMeta}>
                    <span style={styles.metaItem}>
                      <Users size={14} /> {item._count?.participations}
                    </span>
                    <span style={styles.categoryBadge}>{item.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    padding: '20px clamp(12px, 3vw, 24px)',
    maxWidth: 1000,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#666',
    textDecoration: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 3vw, 32px)',
    fontWeight: 900,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #f0f0f0',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardImage: {
    position: 'relative',
    height: 160,
    background: '#f3f4f6',
  },
  reasonBadge: {
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: 16,
    fontWeight: 700,
  },
  cardOrganizer: {
    margin: '0 0 10px',
    fontSize: 13,
    color: '#888',
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: '#666',
  },
  categoryBadge: {
    padding: '3px 8px',
    background: '#f3f4f6',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    color: '#666',
  },
};
