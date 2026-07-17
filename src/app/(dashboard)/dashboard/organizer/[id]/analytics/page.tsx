import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Users, TrendingUp, MapPin, Calendar } from 'lucide-react';

async function getAnalytics(challengeId: string, userId?: string) {
  if (!userId || !challengeId) return null;

  try {
    const member = await prisma.organizerMember.findFirst({
      where: { userId },
      select: { organizerId: true },
    });

    if (!member) return null;

    const challenge = await prisma.challenge.findFirst({
      where: { id: challengeId, organizerId: member.organizerId, deletedAt: null },
      include: {
        participations: {
          include: { user: { select: { region: true, createdAt: true } } },
        },
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { participations: true } },
      },
    });

    if (!challenge) return null;

    // Воронка
    const totalJoined = challenge._count.participations;
    const completedSteps: Record<number, number> = {};
    challenge.steps.forEach((_, i) => {
      completedSteps[i] = challenge.participations.filter(p => {
        const progress = (p as any).stepProgress || [];
        return progress.some((s: any) => s.stepIndex === i && s.completed);
      }).length;
    });

    // География
    const regions: Record<string, number> = {};
    challenge.participations.forEach(p => {
      const region = p.user.region || 'Не указан';
      regions[region] = (regions[region] || 0) + 1;
    });

    // Динамика регистрации по дням
    const dailyRegistrations: Record<string, number> = {};
    challenge.participations.forEach(p => {
      const date = new Date(p.joinedAt).toISOString().slice(0, 10);
      dailyRegistrations[date] = (dailyRegistrations[date] || 0) + 1;
    });

    return {
      challenge: {
        id: challenge.id,
        title: challenge.title,
        status: challenge.status,
      },
      funnel: {
        totalJoined,
        completedSteps,
        totalSteps: challenge.steps.length,
      },
      regions: Object.entries(regions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      dailyRegistrations: Object.entries(dailyRegistrations)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14),
    };
  } catch {
    return null;
  }
}

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentAuthSession();
  const analytics = await getAnalytics(id, session?.user.id);

  if (!analytics) {
    return (
      <PageShell>
        <main style={styles.page}>
          <p>Аналитика недоступна</p>
          <Link href="/dashboard/organizer" style={styles.backLink}>
            <ArrowLeft size={16} /> Назад
          </Link>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href={`/dashboard/organizer/${id}`} style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к челленджу
        </Link>

        <h1 style={styles.title}>Аналитика: {analytics.challenge.title}</h1>

        {/* Воронка */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <TrendingUp size={18} /> Воронка участия
          </h2>
          <div style={styles.funnelGrid}>
            <div style={styles.funnelItem}>
              <span style={styles.funnelValue}>{analytics.funnel.totalJoined}</span>
              <span style={styles.funnelLabel}>Зарегистрировались</span>
            </div>
            {Object.entries(analytics.funnel.completedSteps).map(([step, count]) => (
              <div key={step} style={styles.funnelItem}>
                <span style={styles.funnelValue}>{count}</span>
                <span style={styles.funnelLabel}>Этап {Number(step) + 1}</span>
              </div>
            ))}
          </div>
          <div style={styles.funnelBar}>
            <div style={{
              ...styles.funnelBarFill,
              width: `${analytics.funnel.totalJoined > 0 ? (analytics.funnel.totalJoined / analytics.funnel.totalJoined) * 100 : 0}%`,
            }} />
          </div>
        </section>

        {/* География */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <MapPin size={18} /> География участников
          </h2>
          {analytics.regions.length === 0 ? (
            <p style={styles.emptyText}>Нет данных</p>
          ) : (
            <div style={styles.regionsList}>
              {analytics.regions.map(([region, count]) => (
                <div key={region} style={styles.regionRow}>
                  <span style={styles.regionName}>{region}</span>
                  <span style={styles.regionCount}>{count}</span>
                  <div style={styles.regionBar}>
                    <div style={{
                      ...styles.regionBarFill,
                      width: `${(count / analytics.regions[0][1]) * 100}%`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Динамика */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Calendar size={18} /> Динамика регистраций
          </h2>
          {analytics.dailyRegistrations.length === 0 ? (
            <p style={styles.emptyText}>Нет данных</p>
          ) : (
            <div style={styles.chartContainer}>
              <div style={styles.chart}>
                {analytics.dailyRegistrations.map(([date, count]) => {
                  const maxCount = Math.max(...analytics.dailyRegistrations.map(d => d[1]));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={date} style={styles.chartBar}>
                      <div style={{
                        ...styles.chartBarFill,
                        height: `${height}%`,
                      }} />
                      <span style={styles.chartBarLabel}>{date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
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
  title: {
    margin: 0,
    fontSize: 'clamp(20px, 3vw, 28px)',
    letterSpacing: '-0.02em',
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
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
    margin: 0,
  },
  funnelGrid: {
    display: 'flex',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  funnelItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#fafafa',
    borderRadius: 12,
    flex: 1,
    minWidth: 100,
  },
  funnelValue: {
    fontSize: 24,
    fontWeight: 900,
  },
  funnelLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  funnelBar: {
    height: 8,
    background: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF385C, #ff6b8a)',
    borderRadius: 4,
    transition: 'width 0.3s',
  },
  regionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  regionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  regionName: {
    width: 150,
    fontSize: 14,
    fontWeight: 600,
  },
  regionCount: {
    width: 40,
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'right',
  },
  regionBar: {
    flex: 1,
    height: 8,
    background: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  regionBarFill: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: 4,
  },
  chartContainer: {
    overflowX: 'auto',
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    height: 150,
    padding: '0 4px',
  },
  chartBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 40,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    background: 'linear-gradient(180deg, #FF385C, #ff6b8a)',
    borderRadius: '4px 4px 0 0',
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#888',
  },
};
