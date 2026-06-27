import type { Metadata } from 'next';
import { ChallengeFeed } from '@/modules/challenges/components/challenge-feed';
import { PageShell } from '@/shared/components/page-shell';

export const metadata: Metadata = {
  title: 'Поиск челленджей',
  description: 'Найди интересный челлендж по названию, бренду или теме на платформе NEWSY.',
  robots: { index: false },
};

export default async function SearchPage() {
  return (
    <PageShell variant="public">
      <main>
        <div style={{ padding: '20px 0' }}>
          <ChallengeFeed />
        </div>
      </main>
    </PageShell>
  );
}
