'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/shared/components/session-provider';

const LS_KEY = 'newsy_favorites';

export function useFavorites() {
  const session = useSession();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  // Load favorites
  useEffect(() => {
    if (userId) {
      // Authenticated: load from API
      fetch('/api/favorites')
        .then(r => r.json())
        .then(d => {
          const ids = new Set<string>(d.favorites?.map((f: { id: string }) => f.id) || []);
          setFavoriteIds(ids);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // Guest: load from localStorage
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          setFavoriteIds(new Set(JSON.parse(raw)));
        }
      } catch {}
      setLoading(false);
    }
  }, [userId]);

  // Sync localStorage → API on login
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const localIds: string[] = JSON.parse(raw);
        if (localIds.length > 0) {
          // Sync each local favorite to API
          Promise.all(
            localIds.map(id =>
              fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId: id }),
              }).catch(() => {})
            )
          ).then(() => {
            localStorage.removeItem(LS_KEY);
            // Reload from API
            fetch('/api/favorites')
              .then(r => r.json())
              .then(d => {
                const ids = new Set<string>(d.favorites?.map((f: { id: string }) => f.id) || []);
                setFavoriteIds(ids);
              });
          });
        }
      }
    } catch {}
  }, [userId]);

  const isFavorite = useCallback((challengeId: string) => {
    return favoriteIds.has(challengeId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (challengeId: string): Promise<boolean> => {
    const wasFavorite = favoriteIds.has(challengeId);

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (wasFavorite) {
        next.delete(challengeId);
      } else {
        next.add(challengeId);
      }
      return next;
    });

    if (userId) {
      // Authenticated: API call
      try {
        const method = wasFavorite ? 'DELETE' : 'POST';
        const res = await fetch('/api/favorites', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId }),
        });
        const data = await res.json();
        if (!data.success) {
          // Revert on error
          setFavoriteIds(prev => {
            const next = new Set(prev);
            if (wasFavorite) next.add(challengeId);
            else next.delete(challengeId);
            return next;
          });
          return false;
        }
      } catch {
        // Revert on network error
        setFavoriteIds(prev => {
          const next = new Set(prev);
          if (wasFavorite) next.add(challengeId);
          else next.delete(challengeId);
          return next;
        });
        return false;
      }
    } else {
      // Guest: save to localStorage
      const ids = Array.from(wasFavorite
        ? [...favoriteIds].filter(id => id !== challengeId)
        : [...favoriteIds, challengeId]
      );
      localStorage.setItem(LS_KEY, JSON.stringify(ids));
    }

    return !wasFavorite; // returns true if added, false if removed
  }, [userId, favoriteIds]);

  const favoritesCount = favoriteIds.size;

  return { favoriteIds, isFavorite, toggleFavorite, favoritesCount, loading };
}
