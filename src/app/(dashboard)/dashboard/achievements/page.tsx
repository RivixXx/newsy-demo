import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Trophy, Lock } from 'lucide-react';

async function getAchievements(userId?: string) {
  if (!userId) return { all: [], earned: [] };

  try {
    const all = await prisma.achievement.findMany({
      where: { isApproved: true },
      orderBy: { key: 'asc' },
    });

    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    return {
      all,
      earned: earned.map(e => e.achievementId),
    };
  } catch {
    return { all: [], earned: [] };
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  progress: 'Прогресс',
  social: 'Социальное',
  sport: 'Спорт',
  education: 'Обучение',
  art: 'Искусство',
  eco: 'Экология',
  streak: 'Серия',
  special: 'Особое',
  organizer: 'Организатор',
};

const CATEGORY_ICONS: Record<string, string> = {
  progress: '📈',
  social: '👥',
  sport: '🏃',
  education: '📚',
  art: '🎨',
  eco: '🌍',
  streak: '🔥',
  special: '⭐',
  organizer: '🎪',
};

export default async function AchievementsPage() {
  const session = await getCurrentAuthSession();
  const { all, earned } = await getAchievements(session?.user.id);
  const earnedCount = earned.length;
  const totalCount = all.length;

  // Группируем по категориям
  const categories = [...new Set(all.map(a => a.category || 'special'))];

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к дашборду
        </Link>

        <header style={styles.header}>
          <Trophy size={32} color="#FFD700" />
          <div>
            <h1 style={styles.title}>Достижения</h1>
            <p style={styles.subtitle}>
              {earnedCount} из {totalCount} получено
            </p>
          </div>
        </header>

        {/* Прогресс-бар */}
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Общий прогресс</span>
            <span style={styles.progressValue}>
              {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
            </span>
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`,
            }} />
          </div>
        </div>

        {/* Категории */}
        {categories.map(cat => {
          const catAchievements = all.filter(a => (a.category || 'special') === cat);
          const catEarned = catAchievements.filter(a => earned.includes(a.id));

          return (
            <section key={cat} style={styles.section}>
              <h2 style={styles.sectionTitle}>
                {CATEGORY_ICONS[cat] || '🏆'} {CATEGORY_LABELS[cat] || cat}
                <span style={styles.sectionCount}>{catEarned.length}/{catAchievements.length}</span>
              </h2>
              <div style={styles.achievementsGrid}>
                {catAchievements.map(achievement => {
                  const isEarned = earned.includes(achievement.id);
                  return (
                    <div key={achievement.id} style={{
                      ...styles.achievementCard,
                      opacity: isEarned ? 1 : 0.6,
                    }}>
                      <div style={{
                        ...styles.achievementIcon,
                        background: isEarned ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#f3f4f6',
                      }}>
                        {isEarned ? (achievement.icon || '🏆') : <Lock size={20} color="#ccc" />}
                      </div>
                      <div style={styles.achievementInfo}>
                        <div style={styles.achievementName}>{achievement.name}</div>
                        <div style={styles.achievementDesc}>{achievement.description}</div>
                      </div>
                      {isEarned && (
                        <div style={styles.earnedBadge}>✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    padding: '20px clamp(12px, 3vw, 24px)',
    maxWidth: 900,
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
  progressCard: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    borderRadius: 16,
    padding: 20,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 700,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 900,
    color: '#FF385C',
  },
  progressBar: {
    height: 8,
    background: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
    borderRadius: 4,
    transition: 'width 0.3s',
  },
  section: {
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
  sectionCount: {
    marginLeft: 'auto',
    fontSize: 13,
    color: '#888',
    fontWeight: 600,
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 12,
  },
  achievementCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    background: '#fafafa',
    borderRadius: 14,
    position: 'relative',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    flexShrink: 0,
  },
  achievementInfo: {
    flex: 1,
    minWidth: 0,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#888',
    lineHeight: 1.4,
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#22c55e',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
  },
};
