import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Users, Calendar, MapPin, Trophy, Gift, BarChart3 } from 'lucide-react';

async function getChallengeDetails(id: string, userId?: string) {
  if (!userId || !id) return null;

  try {
    const member = await prisma.organizerMember.findFirst({
      where: { userId },
      select: { organizerId: true },
    });

    if (!member) return null;

    const challenge = await prisma.challenge.findFirst({
      where: { id, organizerId: member.organizerId, deletedAt: null },
      include: {
        steps: { orderBy: { order: 'asc' } },
        participations: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          take: 50,
        },
        _count: { select: { participations: true } },
      },
    });

    return challenge;
  } catch {
    return null;
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Черновик', color: '#6b7280' },
  PENDING_REVIEW: { label: 'На модерации', color: '#f59e0b' },
  PUBLISHED: { label: 'Опубликован', color: '#22c55e' },
  ONGOING: { label: 'Идёт', color: '#3b82f6' },
  COMPLETED: { label: 'Завершён', color: '#8b5cf6' },
};

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentAuthSession();
  const challenge = await getChallengeDetails(id, session?.user.id);

  if (!challenge) {
    return (
      <PageShell>
        <main style={styles.page}>
          <p>Челлендж не найден или у вас нет доступа.</p>
          <Link href="/dashboard/organizer" style={styles.backLink}>
            <ArrowLeft size={16} /> Назад к списку
          </Link>
        </main>
      </PageShell>
    );
  }

  const status = STATUS_LABELS[challenge.status] || { label: challenge.status, color: '#6b7280' };

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/dashboard/organizer" style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к списку
        </Link>

        {/* Заголовок */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{challenge.title}</h1>
            <div style={styles.meta}>
              <span style={{ ...styles.statusBadge, background: status.color + '18', color: status.color }}>
                {status.label}
              </span>
              <span style={styles.metaItem}>
                <Calendar size={14} /> {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString('ru-RU') : 'Бессрочно'}
              </span>
              {challenge.address && (
                <span style={styles.metaItem}>
                  <MapPin size={14} /> {challenge.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <Users size={18} color="#3b82f6" />
            <span style={styles.statNum}>{challenge._count.participations}</span>
            <span style={styles.statText}>участников</span>
          </div>
          <div style={styles.statBox}>
            <BarChart3 size={18} color="#22c55e" />
            <span style={styles.statNum}>{challenge.steps.length}</span>
            <span style={styles.statText}>этапов</span>
          </div>
        </div>

        {/* Этапы */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Этапы ({challenge.steps.length})</h2>
          <div style={styles.stepsList}>
            {challenge.steps.map((step, i) => (
              <div key={step.id} style={styles.stepItem}>
                <div style={styles.stepNum}>{i + 1}</div>
                <div>
                  <div style={styles.stepTitle}>{step.title || 'Без названия'}</div>
                  <div style={styles.stepMeta}>{step.type} · {step.description?.slice(0, 60) || 'Без описания'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Участники */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Участники ({challenge._count.participations})</h2>
          {challenge.participations.length === 0 ? (
            <p style={styles.emptyText}>Пока нет участников</p>
          ) : (
            <div style={styles.participantsList}>
              {challenge.participations.map((p) => (
                <div key={p.id} style={styles.participantRow}>
                  <div style={styles.participantName}>
                    {p.user.firstName || p.user.lastName
                      ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim()
                      : p.user.email}
                  </div>
                  <div style={styles.participantStatus}>{p.status}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Кнопка аналитики */}
        <Link href={`/dashboard/organizer/${id}/analytics`} style={styles.analyticsBtn}>
          <BarChart3 size={18} /> Открыть расширенную аналитику
        </Link>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 3vw, 32px)',
    letterSpacing: '-0.02em',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: '#888',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  statsRow: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 18px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
  },
  statNum: {
    fontSize: 16,
    fontWeight: 900,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  section: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    borderRadius: 20,
    padding: 24,
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: 18,
    fontWeight: 800,
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 12,
    background: '#fafafa',
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#FF385C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },
  stepTitle: {
    fontWeight: 700,
    fontSize: 14,
  },
  stepMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
    margin: 0,
  },
  participantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  participantRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 10,
    background: '#fafafa',
  },
  participantName: {
    fontWeight: 600,
    fontSize: 14,
  },
  participantStatus: {
    fontSize: 12,
    color: '#888',
  },
  analyticsBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 24px',
    background: 'white',
    border: '2px solid #FF385C',
    borderRadius: 14,
    color: '#FF385C',
    fontWeight: 800,
    fontSize: 14,
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
};
