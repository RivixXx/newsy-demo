'use client';

import React from 'react';
import Link from 'next/link';
import { PageShell } from '@/shared/components/page-shell';
import { ScrollHero } from '@/shared/components/scroll-hero';

export default function WelcomePage() {
  return (
    <PageShell variant="public">
      <ScrollHero />

      <style>{`
        /* Kill any extra spacing — hero owns the full viewport */
        .page-shell-root { min-height: 100vh; }
      `}</style>
    </PageShell>
  );
}
