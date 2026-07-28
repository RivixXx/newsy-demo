import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';

import { SiteNav } from './site-nav';
import { SiteFooter } from './site-footer';

type PageShellProps = {
  children: ReactNode;
  variant?: 'compact' | 'public' | 'landing';
};

export function PageShell({ children, variant = 'compact' }: PageShellProps) {
  return (
    <div className="page-shell-root" style={styles.root}>
      <SiteNav variant={variant} />
      <main style={variant === 'public' ? styles.publicMain : styles.main}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: '1 1 auto',
    width: '100%',
  },
  publicMain: {
    flex: '1 1 auto',
    width: '100%',
  },
};
