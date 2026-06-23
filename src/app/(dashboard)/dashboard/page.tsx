import Link from 'next/link';
import type { CSSProperties } from 'react';

import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';

async function getStats(userId?: string) {
  try {
    const challengeCount = await prisma.challenge.count({ where: { deletedAt: null, status: 'PUBLISHED' } });
    const participationCount = userId ? await prisma.userProgress.count({ where: { userId } }) : 0;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    
    return {
      challengeCount,
      participationCount,
      points: user?.points ?? 0,
      email: user?.email ?? user?.id ?? 'Гость'
    };
  } catch (e) {
    // Fallback if DB is not reachable
    return {
      challengeCount: 12,
      participationCount: 3,
      points: 450,
      email: 'demo@newsy.ru'
    };
  }
}

export default async function DashboardPage() {
  const session = await getCurrentAuthSession();
  const stats = await getStats(session?.user.id);

  return (
    <PageShell>
      <main style={styles.page}>
        <section className="dash-card" style={styles.card}>
          <p style={styles.kicker}>Личный кабинет</p>
          <h1 style={styles.title}>Рабочее пространство NEWSY</h1>
          <p style={styles.lead}>
            Отслеживайте свой прогресс, управляйте челенджами и просматривайте достижения в реальном времени.
          </p>

          <div className="dash-grid" style={styles.grid}>
            <div style={styles.panel}>
              <strong>Пользователь</strong>
              <span>{stats.email}</span>
            </div>
            <div style={styles.panel}>
              <strong>Челенджей доступно</strong>
              <span>{stats.challengeCount}</span>
            </div>
            <div style={styles.panel}>
              <strong>Мои участия</strong>
              <span>{stats.participationCount}</span>
            </div>
            <div style={styles.panel}>
              <strong>Заработано баллов</strong>
              <span>{stats.points}</span>
            </div>
          </div>

          <div className="dash-actions" style={styles.actions}>
            <Link href="/" style={styles.primaryAction}>
              Исследовать челенджи
            </Link>
            <Link href="/dashboard/profile" style={styles.secondaryAction}>
              Мой профиль
            </Link>
            <Link href="/dashboard/challenges/new" style={styles.secondaryAction}>
              Создать челендж
            </Link>
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .dash-card { padding: 20px !important; border-radius: 20px !important; }
          .dash-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .dash-card { padding: 16px !important; border-radius: 16px !important; }
          .dash-grid { grid-template-columns: 1fr !important; }
          .dash-actions { flex-direction: column; }
          .dash-actions a { width: 100%; text-align: center; }
        }
      `}</style>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '60vh',
    padding: '20px clamp(12px, 3vw, 24px)',
  },
  card: {
    width: 'min(920px, 100%)',
    padding: '32px',
    borderRadius: '28px',
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    boxShadow: 'var(--shadow)',
    display: 'grid',
    gap: '18px'
  },
  kicker: {
    margin: 0,
    color: 'var(--brand-strong)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  },
  title: {
    margin: 0,
    fontSize: 'clamp(32px, 4vw, 56px)',
    letterSpacing: '-0.05em'
  },
  lead: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '18px',
    lineHeight: 1.6,
    maxWidth: '66ch'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px'
  },
  panel: {
    padding: '18px',
    borderRadius: '20px',
    background: 'rgba(255,247,240,0.92)',
    border: '1px solid rgba(180,95,52,0.14)',
    display: 'grid',
    gap: '6px'
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '6px'
  },
  primaryAction: {
    padding: '13px 18px',
    borderRadius: '999px',
    background: 'var(--brand)',
    color: '#fff',
    fontWeight: 800
  },
  secondaryAction: {
    padding: '13px 18px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(29,26,22,0.1)',
    color: 'var(--text)',
    fontWeight: 700
  }
};
