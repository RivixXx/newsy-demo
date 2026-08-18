import { PageShell } from '@/shared/components/page-shell';
import { PageSkeleton } from '@/shared/components/page-skeleton';

export default function PublicLoading() {
  return <PageShell variant="public"><PageSkeleton /></PageShell>;
}
