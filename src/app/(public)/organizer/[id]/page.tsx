import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { PageShell } from '@/shared/components/page-shell';
import { MapPin, Users, Trophy, ArrowLeft, ExternalLink } from 'lucide-react';

async function getOrganizer(id: string) {
  try {
    const organizer = await prisma.organizer.findUnique({
      where: { id },
      include: {
        challenges: {
          where: { deletedAt: null, status: 'PUBLISHED' },
          include: {
            _count: { select: { participations: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { challenges: true } },
      },
    });

    if (!organizer) return null;

    const totalParticipants = organizer.challenges.reduce(
      (acc, c) => acc + c._count.participations, 0
    );

    return { ...organizer, totalParticipants };
  } catch {
    return null;
  }
}

export default async function OrganizerPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organizer = await getOrganizer(id);

  if (!organizer) {
    return (
      <PageShell>
        <main style={styles.page}>
          <p style={styles.notFound}>Организатор не найден</p>
          <Link href="/explore" style={styles.backLink}>
            <ArrowLeft size={16} /> Вернуться в каталог
          </Link>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/explore" style={styles.backLink}>
          <ArrowLeft size={16} /> Вернуться в каталог
        </Link>

        {/* Профиль */}
        <section style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              {organizer.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div style={styles.nameRow}>
                <h1 style={styles.orgName}>{organizer.name}</h1>
                {organizer.isVerified && (
                  <span style={styles.verifiedBadge} title="Верифицированный организатор">
                    ✓ Верифицирован
                  </span>
                )}
              </div>
              <p style={styles.orgType}>{organizer.type}</p>
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <Trophy size={18} color="#FF385C" />
              <span style={styles.statValue}>{organizer._count.challenges}</span>
              <span style={styles.statLabel}>челленджей</span>
            </div>
            <div style={styles.stat}>
              <Users size={18} color="#3b82f6" />
              <span style={styles.statValue}>{organizer.totalParticipants}</span>
              <span style={styles.statLabel}>участников</span>
            </div>
          </div>
        </section>

        {/* Активные челленджи */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Активные челленджи</h2>
          {organizer.challenges.length === 0 ? (
            <p style={styles.emptyText}>Пока нет опубликованных челленджей</p>
          ) : (
            <div style={styles.challengesGrid}>
              {organizer.challenges.map((c) => (
                <Link key={c.id} href={`/challenges/${c.id}`} style={styles.challengeCard}>
                  <div style={styles.challengeImg}>
                    <img
                      src={c.media?.[0]?.url || '/images/challenge-placeholder.svg'}
                      alt={c.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={styles.challengeBody}>
                    <h3 style={styles.challengeTitle}>{c.title}</h3>
                    <div style={styles.challengeMeta}>
                      <span>{c._count.participations} участников</span>
                      {c.endDate && (
                        <span>до {new Date(c.endDate).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
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
  notFound: {
    textAlign: 'center',
    color: '#999',
    fontSize: 18,
  },
  profileCard: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    borderRadius: 24,
    padding: 32,
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: 'linear-gradient(135deg, #FF385C, #ff6b8a)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 900,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  orgName: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    background: '#dcfce7',
    color: '#166534',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  orgType: {
    margin: 0,
    fontSize: 14,
    color: '#888',
  },
  statsRow: {
    display: 'flex',
    gap: 24,
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 900,
  },
  statLabel: {
    fontSize: 13,
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
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
    margin: 0,
  },
  challengesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 16,
  },
  challengeCard: {
    background: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #f0f0f0',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  challengeImg: {
    height: 140,
    background: '#f3f4f6',
    overflow: 'hidden',
  },
  challengeBody: {
    padding: 14,
  },
  challengeTitle: {
    margin: '0 0 6px 0',
    fontSize: 15,
    fontWeight: 800,
    lineHeight: 1.3,
  },
  challengeMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#888',
  },
};
