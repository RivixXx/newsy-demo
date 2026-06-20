import type { CSSProperties } from 'react';

import { loginAction } from '@/modules/identity/actions';
import { LoginForm } from '@/modules/identity/components/login-form';
import { PageShell } from '@/shared/components/page-shell';

export default function LoginPage() {
  return (
    <PageShell>
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.kicker}>Вход</p>
          <h1 style={styles.title}>Авторизация в NEWSY</h1>
          <p style={styles.lead}>
            Подключён рабочий вход с cookie-сессией. Тестовый аккаунт уже зашит в базу и готов к
            проверке.
          </p>

          <div style={styles.info}>
            <strong>Тестовый логин</strong>
            <span>Email: <code>admin@newsy.ru</code></span>
            <span>Пароль: <code>Newsy123!</code></span>
          </div>

          <LoginForm action={loginAction} />
        </section>
      </main>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '60vh'
  },
  card: {
    width: 'min(720px, 100%)',
    padding: '32px',
    borderRadius: '28px',
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    boxShadow: 'var(--shadow)',
    display: 'grid',
    gap: '16px'
  },
  kicker: {
    margin: 0,
    color: 'var(--brand-strong)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  },
  title: {
    margin: 0,
    fontSize: 'clamp(32px, 4vw, 56px)',
    letterSpacing: '-0.05em'
  },
  lead: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '18px',
    lineHeight: 1.6
  },
  info: {
    display: 'grid',
    gap: '4px',
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(255,247,240,0.94)',
    border: '1px solid rgba(180,95,52,0.14)',
    color: 'var(--text-muted)'
  }
};
