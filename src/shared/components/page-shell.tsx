import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';

import { SiteNav } from './site-nav';
import { SiteFooter } from './site-footer';

type PageShellProps = {
  children: ReactNode;
  variant?: 'compact' | 'public';
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
    minHeight: '100vh',
  },
  shell: {
    width: '100%',
    margin: '0 auto',
    padding: '0',
    flex: '1 0 auto',
  },
  publicShell: {
    width: '100%',
    margin: '0',
    padding: '0',
    flex: '1 0 auto',
  },
  publicContent: {
    width: '100%',
  },
  content: {
    width: '100%',
  },
};
