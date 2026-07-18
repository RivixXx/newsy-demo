import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Users, DollarSign, TrendingUp, Copy, Check, Share2 } from 'lucide-react';

async function getPartnerStats(userId?: string) {
  if (!userId) return { referrals: 0, earnings: 0, pending: 0 };

  try {
    const referrals = await prisma.referralEvent.count({
      where: { referrerId: userId, eventType: 'ORGANIZER_REFERRAL' },
    });

    const aggregate = await prisma.referralEvent.aggregate({
      where: { referrerId: userId, eventType: 'ORGANIZER_REFERRAL' },
      _sum: { rewardAmount: true },
    });

    return {
      referrals,
      earnings: aggregate._sum.rewardAmount ?? 0,
      pending: 0,
    };
  } catch {
    return { referrals: 0, earnings: 0, pending: 0 };
  }
}

export default async function PartnerPage() {
  const session = await getCurrentAuthSession();
  const stats = await getPartnerStats(session?.user.id);
  const partnerCode = session?.user?.id ? `PARTNER-${session.user.id.slice(0, 8).toUpperCase()}` : '';

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к дашборду
        </Link>

        <header style={styles.header}>
          <Share2 size={32} color="#FF385C" />
          <div>
            <h1 style={styles.title}>Партнёрская программа</h1>
            <p style={styles.subtitle}>Приводите других организаторов и получайте % от их платежей</p>
          </div>
        </header>

        {/* Статистика */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <Users size={24} color="#3b82f6" />
            <div>
              <span style={styles.statValue}>{stats.referrals}</span>
              <span style={styles.statLabel}>Приглашено</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <DollarSign size={24} color="#22c55e" />
            <div>
              <span style={styles.statValue}>{stats.earnings.toLocaleString('ru-RU')} ₽</span>
              <span style={styles.statLabel}>Заработано</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <TrendingUp size={24} color="#f59e0b" />
            <div>
              <span style={styles.statValue}>{stats.pending.toLocaleString('ru-RU')} ₽</span>
              <span style={styles.statLabel}>Ожидает</span>
            </div>
          </div>
        </div>

        {/* Партнёрская ссылка */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Ваша партнёрская ссылка</h2>
          <div style={styles.linkCard}>
            <code style={styles.linkCode}>
              {typeof window !== 'undefined' ? window.location.origin : 'https://chillenge-russia.ru'}/register?partner={partnerCode}
            </code>
            <button style={styles.copyBtn}>
              <Copy size={16} /> Копировать
            </button>
          </div>
          <p style={styles.linkHint}>Отправьте эту ссылку другим организаторам. За каждого зарегистрированного организатора вы получаете 10% от его платежей в течение 12 месяцев.</p>
        </section>

        {/* Условия */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Условия программы</h2>
          <div style={styles.termsList}>
            <div style={styles.termItem}>
              <span style={styles.termNum}>1</span>
              <div>
                <strong>Пригласите организатора</strong>
                <p>Отправьте партнёрскую ссылку kollegе или партнёру</p>
              </div>
            </div>
            <div style={styles.termItem}>
              <span style={styles.termNum}>2</span>
              <div>
                <strong>Он оплачивает подписку</strong>
                <p>Когда приглашённый оплачивает тариф «Бизнес» или «Корпоратив»</p>
              </div>
            </div>
            <div style={styles.termItem}>
              <span style={styles.termNum}>3</span>
              <div>
                <strong>Вы получаете 10%</strong>
                <p>10% от каждого платежа в течение 12 месяцев</p>
              </div>
            </div>
          </div>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
  },
  statValue: {
    display: 'block',
    fontSize: 20,
    fontWeight: 900,
  },
  statLabel: {
    display: 'block',
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
    fontSize: 16,
    fontWeight: 800,
  },
  linkCard: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: 16,
    background: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  linkCode: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '8px 14px',
    background: '#FF385C',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },
  linkHint: {
    fontSize: 13,
    color: '#888',
    lineHeight: 1.5,
    margin: 0,
  },
  termsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  termItem: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  termNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#FF385C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
};
