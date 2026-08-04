import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Gift, Star, ShoppingBag, Check } from 'lucide-react';

interface ShopPrize {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  cost: number;
  stock: number;
}

async function getPrizes(): Promise<ShopPrize[]> {
  try {
    return await prisma.prize.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { cost: 'asc' },
    });
  } catch {
    return [];
  }
}

async function getUserPoints(userId?: string): Promise<number> {
  if (!userId) return 0;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
    return user?.points ?? 0;
  } catch {
    return 0;
  }
}

export default async function ShopPage() {
  const session = await getCurrentAuthSession();
  const userPoints = await getUserPoints(session?.user.id);
  const prizes = await getPrizes();

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к дашборду
        </Link>

        <header style={styles.header}>
          <ShoppingBag size={32} color="#FF385C" />
          <div>
            <h1 style={styles.title}>Магазин призов</h1>
            <p style={styles.subtitle}>Обменивайте баллы на реальные призы</p>
          </div>
        </header>

        {/* Баланс */}
        <div style={styles.balanceCard}>
          <Star size={28} color="#FFD700" />
          <div>
            <span style={styles.balanceValue}>{userPoints.toLocaleString('ru-RU')}</span>
            <span style={styles.balanceLabel}>баллов доступно</span>
          </div>
        </div>

        {/* Каталог призов */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Gift size={18} /> Каталог призов
          </h2>
          {prizes.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>Призов пока нет</p>
          ) : (
            <div style={styles.prizesGrid}>
              {prizes.map(prize => {
                const canAfford = userPoints >= prize.cost;
                return (
                  <div key={prize.id} style={{
                    ...styles.prizeCard,
                    opacity: canAfford ? 1 : 0.7,
                  }}>
                    <div style={styles.prizeImage}>
                      <Gift size={32} color="#FF385C" />
                    </div>
                    <div style={styles.prizeInfo}>
                      <h3 style={styles.prizeName}>{prize.name}</h3>
                      <p style={styles.prizeDesc}>{prize.description}</p>
                      <div style={styles.prizeMeta}>
                        <span style={styles.prizeCost}>
                          <Star size={14} color="#FFD700" /> {prize.cost}
                        </span>
                        <span style={styles.prizeStock}>Осталось: {prize.stock}</span>
                      </div>
                    </div>
                    <button
                      style={{
                        ...styles.buyBtn,
                        background: canAfford ? '#FF385C' : '#e5e7eb',
                        color: canAfford ? 'white' : '#999',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Обменять' : 'Не хватает'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Информация */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Как заработать баллы?</h2>
          <div style={styles.tipsList}>
            <div style={styles.tipItem}>
              <Check size={18} color="#22c55e" />
              <span>Выполняйте ежедневные задания (+10-30 баллов)</span>
            </div>
            <div style={styles.tipItem}>
              <Check size={18} color="#22c55e" />
              <span>Завершайте челленджи (+50-200 баллов)</span>
            </div>
            <div style={styles.tipItem}>
              <Check size={18} color="#22c55e" />
              <span>Приглашайте друзей (+100 баллов за каждого)</span>
            </div>
            <div style={styles.tipItem}>
              <Check size={18} color="#22c55e" />
              <span>Попадайте в топ рейтингов (+200 баллов)</span>
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
  balanceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
    borderRadius: 20,
    border: '2px solid #FDE68A',
  },
  balanceValue: {
    display: 'block',
    fontSize: 32,
    fontWeight: 900,
    color: '#92400e',
  },
  balanceLabel: {
    display: 'block',
    fontSize: 13,
    color: '#B45309',
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
  prizesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  prizeCard: {
    background: 'white',
    border: '1px solid #f0f0f0',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  prizeImage: {
    height: 120,
    background: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeInfo: {
    padding: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  prizeName: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
  },
  prizeDesc: {
    margin: 0,
    fontSize: 12,
    color: '#888',
    lineHeight: 1.4,
    flex: 1,
  },
  prizeMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeCost: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 14,
    fontWeight: 800,
    color: '#92400e',
  },
  prizeStock: {
    fontSize: 11,
    color: '#888',
  },
  buyBtn: {
    margin: 16,
    marginTop: 0,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    transition: 'all 0.2s',
  },
  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  tipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    color: '#444',
  },
};
