import { PageShell } from '@/shared/components/page-shell';
import { PageSkeleton } from '@/shared/components/page-skeleton';

export default function DashboardLoading() {
  return <PageShell><PageSkeleton variant="dashboard" /></PageShell>;
}
