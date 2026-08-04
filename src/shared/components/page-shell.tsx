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
      <div
        className={variant === 'public' ? 'page-shell public-shell' : 'page-shell'}
        style={variant === 'public' ? styles.publicShell : styles.shell}
      >
        <SiteNav variant={variant} />
        <div style={variant === 'public' ? styles.publicContent : styles.content}>{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
  },
  shell: {
    flex: '1 1 auto',
    width: '100%',
  },
  publicShell: {
    flex: '1 1 auto',
    width: '100%',
  },
  content: {
    flex: '1 1 auto',
    width: '100%',
  },
  publicContent: {
    flex: '1 1 auto',
    width: '100%',
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
