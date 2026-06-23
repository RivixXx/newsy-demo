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
    <>
      <div
        className={variant === 'public' ? 'page-shell public-shell' : 'page-shell'}
        style={variant === 'public' ? styles.publicShell : styles.shell}
      >
        <SiteNav variant={variant} />
        <div style={variant === 'public' ? styles.publicContent : styles.content}>{children}</div>
      </div>
      <SiteFooter />
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    width: 'min(1200px, calc(100% - 32px))',
    margin: '0 auto',
    padding: '20px 0 48px'
  },
  publicShell: {
    width: '100%',
    margin: '0',
    padding: '0 0 48px'
  },
  publicContent: {
    width: '100%',
  },
  content: {
    width: '100%'
  }
};
