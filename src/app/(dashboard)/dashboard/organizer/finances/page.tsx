import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, DollarSign, TrendingUp, Clock } from 'lucide-react';

async function getFinances(userId?: string) {
  if (!userId) return { balance: 0, payouts: [] };

  try {
    const member = await prisma.organizerMember.findFirst({
      where: { userId },
      select: { organizerId: true },
    });

    if (!member) return { balance: 0, payouts: [] };

    const payouts = await prisma.commissionPayout.findMany({
      where: { organizerId: member.organizerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const balance = payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((acc, p) => acc + p.amount, 0);

    return { balance, payouts };
  } catch {
    return { balance: 0, payouts: [] };
  }
}

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Ожидает', color: '#f59e0b' },
  PROCESSING: { label: 'Обработка', color: '#3b82f6' },
  COMPLETED: { label: 'Выплачен', color: '#22c55e' },
  FAILED: { label: 'Ошибка', color: '#ef4444' },
};

export default async function FinancesPage() {
  const session = await getCurrentAuthSession();
  const { balance, payouts } = await getFinances(session?.user.id);

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/dashboard/organizer" style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к дашборду
        </Link>

        <h1 style={styles.title}>Финансы</h1>

        {/* Баланс */}
        <div style={styles.balanceCard}>
          <DollarSign size={32} color="white" />
          <div>
            <span style={styles.balanceLabel}>Текущий баланс</span>
            <span style={styles.balanceValue}>{balance.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        {/* История выплат */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Clock size={18} /> История выплат
          </h2>
          {payouts.length === 0 ? (
            <p style={styles.emptyText}>Пока нет выплат</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Дата</th>
                    <th style={styles.th}>Сумма</th>
                    <th style={styles.th}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => {
                    const status = PAYOUT_STATUS[p.status] || { label: p.status, color: '#6b7280' };
                    return (
                      <tr key={p.id}>
                        <td style={styles.td}>
                          {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td style={styles.td}>
                          <strong>{p.amount.toLocaleString('ru-RU')} ₽</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, background: status.color + '18', color: status.color }}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 3vw, 32px)',
    letterSpacing: '-0.02em',
  },
  balanceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 28,
    borderRadius: 20,
    background: 'linear-gradient(135deg, #FF385C, #ff6b8a)',
    color: 'white',
  },
  balanceLabel: {
    display: 'block',
    fontSize: 13,
    opacity: 0.8,
    fontWeight: 600,
  },
  balanceValue: {
    display: 'block',
    fontSize: 32,
    fontWeight: 900,
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
  td: {
    padding: '12px 14px',
    fontSize: 14,
    borderBottom: '1px solid #f5f5f5',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
};
