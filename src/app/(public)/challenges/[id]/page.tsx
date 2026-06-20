import { PageShell } from '@/shared/components/page-shell';
import ChallengeDetailContent from './challenge-detail-content';

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageShell variant="public">
      <ChallengeDetailContent challengeId={id} />
    </PageShell>
  );
}