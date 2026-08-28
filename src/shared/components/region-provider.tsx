'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'chi_region';

interface RegionCtx {
  region: string | null;
  isLoaded: boolean;
  showModal: boolean;
  setRegion: (r: string | null) => void;
  changeRegion: () => void;
  skipRegion: () => void;
  closeRegionModal: () => void;
}

const Ctx = createContext<RegionCtx>({
  region: null, isLoaded: false, showModal: false,
  setRegion: () => {}, changeRegion: () => {}, skipRegion: () => {}, closeRegionModal: () => {},
});

export function useRegion() {
  return useContext(Ctx);
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRegionState(stored);
    }
    setIsLoaded(true);
  }, []);

  const setRegion = useCallback((r: string | null) => {
    setRegionState(r);
    if (r) {
      localStorage.setItem(STORAGE_KEY, r);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setShowModal(false);
  }, []);

  const changeRegion = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeRegionModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const skipRegion = useCallback(() => {
    setRegionState(null);
    localStorage.removeItem(STORAGE_KEY);
    setShowModal(false);
  }, []);

  return (
    <Ctx.Provider value={{ region, isLoaded, showModal, setRegion, changeRegion, skipRegion, closeRegionModal }}>
      {children}
    </Ctx.Provider>
  );
}
