import Link from 'next/link';
import type { CSSProperties } from 'react';

import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';

export default async function AdminPage() {
  const session = await getCurrentAuthSession();
  const isAdmin = Boolean(session?.user.roles.includes('admin'));

  const userCount = await prisma.user.count({ where: { deletedAt: null } });
  const challengeCount = await prisma.challenge.count({ where: { deletedAt: null } });
  const organizerCount = await prisma.organizer.count({ where: { deletedAt: null } });
  const notificationCount = await prisma.notification.count({ where: { deletedAt: null } });

  return (
    <PageShell>
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.kicker}>Администрирование</p>
          <h1 style={styles.title}>Панель управления NEWSY</h1>
          <p style={styles.lead}>
            Управление пользователями, челленджами, организаторами и системными настройками.
          </p>

          {!isAdmin ? (
            <div style={styles.notice}>
              <strong>Доступ ограничен.</strong>
              <span>
                Для входа в админку используйте тестовый аккаунт администратора или другую учётную
                запись с ролью <code>admin</code>.
              </span>
              <Link href="/login" style={styles.primaryAction}>
                Войти
              </Link>
            </div>
          ) : (
            <div style={styles.grid}>
              <div style={styles.panel}>
                <strong>Пользователи</strong>
                <span>{userCount}</span>
              </div>
              <div style={styles.panel}>
                <strong>Челленджи</strong>
                <span>{challengeCount}</span>
              </div>
              <div style={styles.panel}>
                <strong>Организаторы</strong>
                <span>{organizerCount}</span>
              </div>
              <div style={styles.panel}>
                <strong>Уведомления</strong>
                <span>{notificationCount}</span>
              </div>
              <div style={styles.panel}>
                <strong>Роли</strong>
                <span>{session?.user.roles.join(', ')}</span>
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <Link href="/dashboard" style={styles.primaryAction}>
              В кабинет
            </Link>
            <Link href="/" style={styles.secondaryAction}>
              На главную
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '60vh'
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
    maxWidth: '70ch'
  },
  notice: {
    display: 'grid',
    gap: '6px',
    padding: '18px',
    borderRadius: '20px',
    background: 'rgba(255,247,240,0.92)',
    border: '1px solid rgba(180,95,52,0.14)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
