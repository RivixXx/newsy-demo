import { Skeleton } from '@/components/ui/skeleton';

type PageSkeletonProps = { variant?: 'catalog' | 'dashboard' | 'detail' };

export function PageSkeleton({ variant = 'catalog' }: PageSkeletonProps) {
  if (variant === 'dashboard') {
    return <div className="route-skeleton route-skeleton--dashboard" role="status" aria-live="polite">
      <span className="sr-only">Загружаем личный кабинет…</span>
      <div className="route-skeleton__heading"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-72 max-w-full" /></div>
      <div className="route-skeleton__stats">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)}</div>
      <div className="route-skeleton__dashboard-grid"><Skeleton className="h-[360px] rounded-xl" /><Skeleton className="h-[360px] rounded-xl" /></div>
    </div>;
  }

  if (variant === 'detail') {
    return <div className="route-skeleton route-skeleton--detail" role="status" aria-live="polite">
      <span className="sr-only">Загружаем страницу…</span><Skeleton className="h-5 w-40" />
      <div className="route-skeleton__detail-grid"><Skeleton className="aspect-[16/10] w-full rounded-xl" /><div className="route-skeleton__stack"><Skeleton className="h-4 w-28" /><Skeleton className="h-12 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-5 h-12 w-44" /></div></div>
    </div>;
  }

  return <div className="route-skeleton route-skeleton--catalog" role="status" aria-live="polite">
    <span className="sr-only">Загружаем каталог челленджей…</span>
    <div className="route-skeleton__heading"><Skeleton className="h-4 w-28" /><Skeleton className="h-12 w-[32rem] max-w-full" /><Skeleton className="h-5 w-[42rem] max-w-full" /><Skeleton className="h-14 w-[45rem] max-w-full rounded-xl" /></div>
    <div className="route-skeleton__filters">{[72, 94, 112, 88, 126].map((width) => <Skeleton key={width} className="h-11 rounded-full" style={{ width }} />)}</div>
    <div className="route-skeleton__cards">{Array.from({ length: 6 }, (_, index) => <div className="route-skeleton__card" key={index}><Skeleton className="aspect-[16/10] w-full rounded-none" /><div className="route-skeleton__card-body"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div></div>)}</div>
  </div>;
}
