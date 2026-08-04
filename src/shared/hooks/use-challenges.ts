'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/shared/components/session-provider';
import { type CatalogChallenge } from '@/shared/data/challenges';

export function useChallenges() {
  const session = useSession();
  const [dbChallenges, setDbChallenges] = useState<CatalogChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.roles?.includes('admin') ?? false;

  useEffect(() => {
    fetch('/api/challenges')
      .then((r) => r.json())
      .then((data) => {
        setDbChallenges(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const challenges = dbChallenges;

  return { challenges, loading, isAdmin, dbChallenges };
}
