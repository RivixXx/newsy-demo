'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CRITICAL_ROUTES = ['/', '/explore', '/login', '/register'];

export function NavigationWarmup() {
  const router = useRouter();
  useEffect(() => {
    const warm = () => CRITICAL_ROUTES.forEach((route) => router.prefetch(route));
    const windowWithIdle = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number };
    if (windowWithIdle.requestIdleCallback) {
      const id = windowWithIdle.requestIdleCallback(warm, { timeout: 1800 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(warm, 600);
    return () => window.clearTimeout(id);
  }, [router]);
  return null;
}
