import Link from 'next/link';
import type { CSSProperties } from 'react';

import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { DashboardCharts } from './charts';

async function getStats(userId?: string) {
  try {
    const challengeCount = await prisma.challenge.count({ where: { deletedAt: null, status: 'PUBLISHED' } });
    const participationCount = userId ? await prisma.userProgress.count({ where: { userId } }) : 0;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true, lastName: true, createdAt: true } }) : null;
    const achievementsCount = userId ? await prisma.userAchievement.count({ where: { userId } }) : 0;

    // Recent participations for activity chart
    const recentParticipations = userId ? await prisma.userProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { updatedAt: true, status: true },
    }) : [];

    // Challenges by category
    const categoryStats = await prisma.challenge.groupBy({
      by: ['category'],
      where: { deletedAt: null, status: 'PUBLISHED' },
      _count: true,
    });

    // User's challenge creator stats
    const createdChallenges = userId ? await prisma.challenge.count({
      where: { organizer: { members: { some: { userId } } }, deletedAt: null },
    }) : 0;

    const pendingReview = userId ? await prisma.challenge.count({
      where: { organizer: { members: { some: { userId } } }, status: 'PENDING_REVIEW' },
    }) : 0;

    return {
      challengeCount,
      participationCount,
      achievementsCount,
      createdChallenges,
      pendingReview,
      email: user?.email ?? 'Гость',
      name: user?.firstName || user?.email?.split('@')[0] || 'Гость',
      memberSince: user?.createdAt?.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) || '',
      recentParticipations: recentParticipations.map(p => ({
        date: p.updatedAt.toISOString(),
        status: p.status,
      })),
      categoryStats: categoryStats.map(c => ({
        name: c.category || 'Другое',
        value: c._count,
      })),
    };
  } catch (e) {
    return {
      challengeCount: 12,
      participationCount: 3,
      achievementsCount: 5,
      createdChallenges: 2,
      pendingReview: 1,
      email: 'demo@newsy.ru',
      name: 'Демо',
      memberSince: 'январь 2025',
      recentParticipations: [],
      categoryStats: [
        { name: 'Спорт', value: 4 },
        { name: 'Обучение', value: 3 },
        { name: 'Квесты', value: 5 },
        { name: 'Искусство', value: 2 },
        { name: 'Технологии', value: 3 },
      ],
    };
  }
}

export default async function DashboardPage() {
  const session = await getCurrentAuthSession();
  const stats = await getStats(session?.user.id);

  return (
    <PageShell>
      <main style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.kicker}>Личный кабинет</p>
            <h1 style={s.title}>Привет, {stats.name}</h1>
            <p style={s.lead}>Управляйте челленджами и отслеживайте прогресс</p>
          </div>
          {stats.memberSince && (
            <div style={s.sinceBadge}>Участник с {stats.memberSince}</div>
          )}
        </div>

        {/* Stats row */}
        <div className="dash-stats-row">
          <div style={{ ...s.statCard, borderLeft: '4px solid #FF385C' }}>
            <div style={s.statIcon}><span style={{ fontSize: 24 }}>🏆</span></div>
            <div style={s.statInfo}>
              <span style={s.statValue}>{stats.challengeCount}</span>
              <span style={s.statLabel}>Челленджей доступно</span>
            </div>
          </div>
          <div style={{ ...s.statCard, borderLeft: '4px solid #2563eb' }}>
            <div style={s.statIcon}><span style={{ fontSize: 24 }}>🎯</span></div>
            <div style={s.statInfo}>
              <span style={s.statValue}>{stats.participationCount}</span>
              <span style={s.statLabel}>Моих участий</span>
            </div>
          </div>
          <div style={{ ...s.statCard, borderLeft: '4px solid #16a34a' }}>
            <div style={s.statIcon}><span style={{ fontSize: 24 }}>⭐</span></div>
            <div style={s.statInfo}>
              <span style={s.statValue}>{stats.achievementsCount}</span>
              <span style={s.statLabel}>Достижений</span>
            </div>
          </div>
          <div style={{ ...s.statCard, borderLeft: '4px solid #d97706' }}>
            <div style={s.statIcon}><span style={{ fontSize: 24 }}>📝</span></div>
            <div style={s.statInfo}>
              <span style={s.statValue}>{stats.createdChallenges}</span>
              <span style={s.statLabel}>Создано челленджей</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <DashboardCharts
          categoryStats={stats.categoryStats}
          recentParticipations={stats.recentParticipations}
        />

        {/* Quick actions */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Быстрые действия</h2>
          <div className="dash-actions-grid">
            <Link href="/explore" style={{ ...s.actionBtn, ...s.actionPrimary }}>
              <span style={{ fontSize: 20 }}>🔍</span>
              <span>Исследовать челенджи</span>
            </Link>
            <Link href="/dashboard/challenges/new" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>➕</span>
              <span>Создать челлендж</span>
            </Link>
            <Link href="/dashboard/profile" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>👤</span>
              <span>Мой профиль</span>
            </Link>
            <Link href="/dashboard/daily" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span>Сегодняшние задания</span>
            </Link>
            <Link href="/dashboard/achievements" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>🏅</span>
              <span>Достижения</span>
            </Link>
            <Link href="/dashboard/recommendations" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span>Рекомендации</span>
            </Link>
            <Link href="/dashboard/shop" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>🛒</span>
              <span>Магазин призов</span>
            </Link>
            <Link href="/dashboard/organizer" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>📊</span>
              <span>Дашборд организатора</span>
            </Link>
            <Link href="/dashboard/analytics" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>📈</span>
              <span>Аналитика</span>
            </Link>
            <Link href="/dashboard/partner" style={s.actionBtn}>
              <span style={{ fontSize: 20 }}>🤝</span>
              <span>Партнёрская программа</span>
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        .dash-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .dash-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        @media (max-width: 768px) {
          .dash-stats-row { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .dash-stats-row { grid-template-columns: 1fr !important; }
          .dash-actions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageShell>
  );
}

const s: Record<string, CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px clamp(12px, 3vw, 24px) 60px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  kicker: {
    margin: '0 0 4px',
    color: '#FF385C',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '0 0 6px',
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    color: '#111',
  },
  lead: {
    margin: 0,
    color: '#888',
    fontSize: 15,
    lineHeight: 1.5,
  },
  sinceBadge: {
    padding: '8px 16px',
    borderRadius: 12,
    background: '#f5f5f5',
    fontSize: 13,
    fontWeight: 600,
    color: '#666',
    border: '1px solid #e5e5e5',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 16px',
    borderRadius: 16,
    background: 'white',
    border: '1px solid #f0f0f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    transition: 'all 0.2s',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: '#fafafa',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 900,
    color: '#111',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#999',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    color: '#111',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 10,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    borderRadius: 14,
    background: 'white',
    border: '1px solid #f0f0f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    color: '#333',
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  actionPrimary: {
    background: '#FF385C',
    color: 'white',
    border: '1px solid #FF385C',
    boxShadow: '0 4px 16px rgba(255,56,92,0.2)',
  },
};
