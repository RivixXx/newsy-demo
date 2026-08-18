'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/shared/components/session-provider';
import { type CatalogChallenge } from '@/shared/data/challenges';

let cachedChallenges: CatalogChallenge[] | null = null;

export function useChallenges() {
  const session = useSession();
  const [dbChallenges, setDbChallenges] = useState<CatalogChallenge[]>(() => cachedChallenges ?? []);
  const [loading, setLoading] = useState(cachedChallenges === null);

  const isAdmin = session?.user?.roles?.includes('admin') ?? false;

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/challenges', { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        // API returns { success: true, data: { data: [...], pagination: {...} } }
        // Extract the actual challenges array from the nested response
        const challenges = Array.isArray(data?.data?.data) ? data.data.data : [];
        cachedChallenges = challenges;
        setDbChallenges(challenges);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const challenges = dbChallenges;

  return { challenges, loading, isAdmin, dbChallenges };
}
