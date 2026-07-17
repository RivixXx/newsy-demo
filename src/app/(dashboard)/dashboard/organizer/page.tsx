import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { Plus, BarChart3, DollarSign, Settings, Eye } from 'lucide-react';

async function getOrganizerData(userId?: string) {
  if (!userId) return { challenges: [], stats: { total: 0, published: 0, draft: 0, totalParticipants: 0 } };

  try {
    // Находим организатора пользователя
    const member = await prisma.organizerMember.findFirst({
      where: { userId },
      include: { organizer: true },
    });

    if (!member) {
      return { challenges: [], stats: { total: 0, published: 0, draft: 0, totalParticipants: 0 } };
    }

    const challenges = await prisma.challenge.findMany({
      where: { organizerId: member.organizerId, deletedAt: null },
      select: {
        id: true,
        title: true,
        category: true,
        format: true,
        status: true,
        maxParticipants: true,
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: challenges.length,
      published: challenges.filter(c => c.status === 'PUBLISHED' || c.status === 'ONGOING').length,
      draft: challenges.filter(c => c.status === 'DRAFT').length,
      totalParticipants: challenges.reduce((acc, c) => acc + c._count.participations, 0),
    };

    return { challenges, stats };
  } catch {
    return { challenges: [], stats: { total: 0, published: 0, draft: 0, totalParticipants: 0 } };
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Черновик', color: '#6b7280' },
  PENDING_REVIEW: { label: 'На модерации', color: '#f59e0b' },
  PUBLISHED: { label: 'Опубликован', color: '#22c55e' },
  ONGOING: { label: 'Идёт', color: '#3b82f6' },
  COMPLETED: { label: 'Завершён', color: '#8b5cf6' },
  ARCHIVED: { label: 'В архиве', color: '#9ca3af' },
};

export default async function OrganizerDashboardPage() {
  const session = await getCurrentAuthSession();
  const { challenges, stats } = await getOrganizerData(session?.user.id);

  return (
    <PageShell>
      <main style={styles.page}>
        <section style={styles.header}>
          <div>
            <p style={styles.kicker}>Организатор</p>
            <h1 style={styles.title}>Мои челленджи</h1>
          </div>
          <Link href="/dashboard/challenges/new" style={styles.primaryBtn}>
            <Plus size={18} /> Создать челлендж
          </Link>
        </section>

        {/* Статистика */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <BarChart3 size={20} color="#FF385C" />
            <div>
              <span style={styles.statValue}>{stats.total}</span>
              <span style={styles.statLabel}>Всего ЧИ</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <Eye size={20} color="#22c55e" />
            <div>
              <span style={styles.statValue}>{stats.published}</span>
              <span style={styles.statLabel}>Активных</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <Settings size={20} color="#f59e0b" />
            <div>
              <span style={styles.statValue}>{stats.draft}</span>
              <span style={styles.statLabel}>Черновиков</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <DollarSign size={20} color="#3b82f6" />
            <div>
              <span style={styles.statValue}>{stats.totalParticipants}</span>
              <span style={styles.statLabel}>Участников</span>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div style={styles.navRow}>
          <Link href="/dashboard/organizer/finances" style={styles.navLink}>
            <DollarSign size={16} /> Финансы
          </Link>
          <Link href="/dashboard/analytics" style={styles.navLink}>
            <BarChart3 size={16} /> Аналитика
          </Link>
        </div>

        {/* Список челленджей */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Название</th>
                <th style={styles.th}>Статус</th>
                <th style={styles.th}>Участники</th>
                <th style={styles.th}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {challenges.length === 0 ? (
                <tr>
                  <td colSpan={4} style={styles.emptyCell}>
                    У вас пока нет челленджей.{' '}
                    <Link href="/dashboard/challenges/new" style={{ color: '#FF385C', fontWeight: 700 }}>
                      Создайте первый!
                    </Link>
                  </td>
                </tr>
              ) : challenges.map((c) => {
                const status = STATUS_LABELS[c.status] || { label: c.status, color: '#6b7280' };
                return (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.challengeName}>{c.title}</div>
                      <div style={styles.challengeMeta}>{c.category} · {c.format || 'ONLINE'}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: status.color + '18', color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {c._count.participations || 0}{c.maxParticipants ? ` / ${c.maxParticipants}` : ''}
                    </td>
                    <td style={styles.td}>
                      <Link href={`/dashboard/organizer/${c.id}`} style={styles.actionLink}>
                        Детали
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .table-wrap { overflow-x: auto; }
        }
      `}</style>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    padding: '20px clamp(12px, 3vw, 24px)',
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  kicker: {
    margin: 0,
    color: 'var(--brand-strong)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 3vw, 36px)',
    letterSpacing: '-0.03em',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    background: '#FF385C',
    color: 'white',
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 14,
    textDecoration: 'none',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
  },
  statValue: {
    display: 'block',
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1.2,
  },
  statLabel: {
    display: 'block',
    fontSize: 12,
    color: '#888',
    fontWeight: 600,
  },
  navRow: {
    display: 'flex',
    gap: 12,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    fontSize: 14,
    fontWeight: 700,
    color: '#333',
    textDecoration: 'none',
  },
  tableWrap: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 18px',
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
    padding: '14px 18px',
    fontSize: 14,
    borderBottom: '1px solid #f5f5f5',
    verticalAlign: 'middle',
  },
  challengeName: {
    fontWeight: 700,
    color: '#111',
  },
  challengeMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  actionLink: {
    color: '#FF385C',
    fontWeight: 700,
    fontSize: 13,
    textDecoration: 'none',
  },
  emptyCell: {
    padding: '40px 18px',
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
};
