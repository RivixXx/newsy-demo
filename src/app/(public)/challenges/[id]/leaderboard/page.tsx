import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Trophy, Clock, Zap, Medal } from 'lucide-react';

async function getLeaderboard(challengeId: string) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, title: true },
    });

    if (!challenge) return null;

    const participants = await prisma.userProgress.findMany({
      where: { challengeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Сортировка: по завершённым этапам (убывание), затем по времени завершения (возрастание)
    const ranked = participants
      .map((p) => {
        const progress = (p as any).stepProgress || [];
        const completedSteps = progress.filter((s: any) => s.completed).length;
        const lastCompletedAt = progress
          .filter((s: any) => s.completedAt)
          .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]?.completedAt;

        return {
          id: p.user.id,
          name: `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || 'Участник',
          avatar: p.user.avatarUrl,
          completedSteps,
          totalSteps: progress.length || 1,
          completedAt: lastCompletedAt ? new Date(lastCompletedAt) : null,
          joinedAt: p.startedAt,
        };
      })
      .sort((a, b) => {
        // Сначала по количеству завершённых этапов
        if (b.completedSteps !== a.completedSteps) {
          return b.completedSteps - a.completedSteps;
        }
        // Затем по времени завершения (кто раньше)
        if (a.completedAt && b.completedAt) {
          return a.completedAt.getTime() - b.completedAt.getTime();
        }
        if (a.completedAt) return -1;
        if (b.completedAt) return 1;
        // Наконец, по дате регистрации
        return a.joinedAt.getTime() - b.joinedAt.getTime();
      });

    return {
      challenge,
      leaderboard: ranked.slice(0, 50), // Топ-50
    };
  } catch {
    return null;
  }
}

function getMedalColor(position: number): string {
  if (position === 0) return '#FFD700'; // Золото
  if (position === 1) return '#C0C0C0'; // Серебро
  if (position === 2) return '#CD7F32'; // Бронза
  return 'transparent';
}

function getMedalBg(position: number): string {
  if (position === 0) return 'linear-gradient(135deg, #FFD700, #FFA500)';
  if (position === 1) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
  if (position === 2) return 'linear-gradient(135deg, #CD7F32, #A0522D)';
  return '#f3f4f6';
}

export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLeaderboard(id);

  if (!data) {
    return (
      <PageShell>
        <main style={styles.page}>
          <p>Челлендж не найден</p>
          <Link href="/explore" style={styles.backLink}>
            <ArrowLeft size={16} /> Вернуться в каталог
          </Link>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href={`/challenges/${id}`} style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к челленджу
        </Link>

        <header style={styles.header}>
          <Trophy size={32} color="#FFD700" />
          <div>
            <h1 style={styles.title}>Рейтинг</h1>
            <p style={styles.subtitle}>{data.challenge.title}</p>
          </div>
        </header>

        {/* Топ-3 */}
        {data.leaderboard.length >= 3 && (
          <div style={styles.top3}>
            {data.leaderboard.slice(0, 3).map((p, i) => {
              const positions = [1, 0, 2]; // Серебро, Золото, Бронза
              const actualPos = positions[i];
              const item = data.leaderboard[actualPos];
              return (
                <div key={item.id} style={{
                  ...styles.topCard,
                  order: i,
                  transform: actualPos === 0 ? 'scale(1.05)' : undefined,
                }}>
                  <div style={{
                    ...styles.topMedal,
                    background: getMedalBg(actualPos),
                  }}>
                    {actualPos === 0 ? '🥇' : actualPos === 1 ? '🥈' : '🥉'}
                  </div>
                  <div style={styles.topName}>{item.name}</div>
                  <div style={styles.topScore}>{item.completedSteps} этапов</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Полная таблица */}
        <section style={styles.tableSection}>
          <h2 style={styles.sectionTitle}>
            <Medal size={18} /> Все участники ({data.leaderboard.length})
          </h2>
          {data.leaderboard.length === 0 ? (
            <p style={styles.emptyText}>Пока нет участников в рейтинге</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Участник</th>
                    <th style={styles.th}>Этапы</th>
                    <th style={styles.th}>Прогресс</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.map((p, i) => (
                    <tr key={p.id} style={{
                      ...styles.tr,
                      background: i < 3 ? (i === 0 ? '#FFFBEB' : i === 1 ? '#F9FAFB' : '#FFF7ED') : undefined,
                    }}>
                      <td style={styles.td}>
                        <div style={{
                          ...styles.positionBadge,
                          background: getMedalBg(i),
                          color: i < 3 ? 'white' : '#666',
                        }}>
                          {i + 1}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <div style={styles.avatar}>
                            {p.avatar ? (
                              <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              p.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span style={styles.userName}>{p.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <strong>{p.completedSteps}</strong> / {p.totalSteps}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.progressBar}>
                          <div style={{
                            ...styles.progressFill,
                            width: `${p.totalSteps > 0 ? (p.completedSteps / p.totalSteps) * 100 : 0}%`,
                          }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    padding: '20px clamp(12px, 3vw, 24px)',
    maxWidth: 800,
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
  top3: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    padding: '20px 0',
  },
  topCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 20,
    background: 'white',
    borderRadius: 20,
    border: '1px solid #f0f0f0',
    minWidth: 120,
  },
  topMedal: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  topName: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
  },
  topScore: {
    fontSize: 12,
    color: '#888',
  },
  tableSection: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    borderRadius: 20,
    padding: 24,
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: 16,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
    margin: 0,
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 800,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #f0f0f0',
  },
  tr: {
    transition: 'background 0.15s',
  },
  td: {
    padding: '12px 14px',
    fontSize: 14,
    borderBottom: '1px solid #f5f5f5',
    verticalAlign: 'middle',
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#666',
    overflow: 'hidden',
  },
  userName: {
    fontWeight: 600,
  },
  progressBar: {
    width: 80,
    height: 6,
    background: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF385C, #ff6b8a)',
    borderRadius: 3,
  },
};
