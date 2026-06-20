'use client';

import { useActionState } from 'react';

import type { AuthActionState } from '@/modules/identity/actions';

type LoginFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>С возвращением!</h1>
          <p style={styles.subtitle}>Войдите в NEWSY, чтобы продолжить свои челенджи</p>
        </div>

        <form action={formAction} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email или Телефон</label>
            <input 
              name="identifier" 
              type="text" 
              placeholder="demo@newsy.ru" 
              style={styles.input} 
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Пароль</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              style={styles.input} 
              required 
            />
          </div>
          <input type="hidden" name="provider" value="email" />

          {state.error && <p style={styles.error}>{state.error}</p>}

          <button type="submit" disabled={isPending} style={styles.submit}>
            {isPending ? 'Входим...' : 'Войти в аккаунт'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>Нет аккаунта? <span style={{ color: '#ff385c', cursor: 'pointer' }}>Зарегистрироваться</span></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '80vh',
    padding: '20px'
  },
  card: {
    width: 'min(420px, 100%)',
    padding: '40px',
    borderRadius: '32px',
    background: '#fff',
    boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
    border: '1px solid var(--line)'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 900,
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0
  },
  form: {
    display: 'grid',
    gap: '20px'
  },
  inputGroup: {
    display: 'grid',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  input: {
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid var(--line)',
    background: 'var(--bg-accent)',
    fontSize: '16px',
    outline: 'none'
  },
  submit: {
    padding: '16px',
    borderRadius: '16px',
    background: 'var(--text)',
    color: '#fff',
    fontWeight: 800,
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    margin: 0,
    color: '#ff385c',
    fontWeight: 700,
    textAlign: 'center' as const,
    fontSize: '14px'
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
    fontSize: '14px',
    color: 'var(--text-muted)'
  }
};
