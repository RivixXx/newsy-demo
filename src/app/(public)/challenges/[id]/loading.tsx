import { PageShell } from '@/shared/components/page-shell';
import { PageSkeleton } from '@/shared/components/page-skeleton';

export default function ChallengeLoading() {
  return <PageShell variant="public"><PageSkeleton variant="detail" /></PageShell>;
}
