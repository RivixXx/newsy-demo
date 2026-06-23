'use client';

import React, { createContext, useContext } from 'react';
import type { AuthSession } from '@/lib/auth';

const SessionContext = createContext<AuthSession | null>(null);

export function SessionProvider({ session, children }: { session: AuthSession | null; children: React.ReactNode }) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): AuthSession | null {
  return useContext(SessionContext);
}
