import { ChallengeFeed } from '@/modules/challenges/components/challenge-feed';
import { PageShell } from '@/shared/components/page-shell';

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
