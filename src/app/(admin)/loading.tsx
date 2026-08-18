import { PageShell } from '@/shared/components/page-shell';
import { PageSkeleton } from '@/shared/components/page-skeleton';

export default function AdminLoading() {
  return <PageShell><PageSkeleton variant="dashboard" /></PageShell>;
}
