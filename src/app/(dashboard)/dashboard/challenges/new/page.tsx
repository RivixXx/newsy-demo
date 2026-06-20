import { ChallengeConstructor } from '@/modules/challenges/components/challenge-constructor';
import { PageShell } from '@/shared/components/page-shell';

export default async function NewChallengePage() {
  return (
    <PageShell>
      <main>
        <ChallengeConstructor />
      </main>
    </PageShell>
  );
}
