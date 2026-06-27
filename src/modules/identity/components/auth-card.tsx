'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Tag } from 'lucide-react';
import { loginAction, registerAction, type AuthActionState } from '@/modules/identity/actions';

export function AuthCard({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="auth-wrapper" style={s.wrapper}>
      {/* Left panel — brand */}
      <div className="auth-left" style={s.leftPanel}>
        {/* Animated background shapes */}
        <div className="anim-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
          <div className="shape shape-4" />
        </div>

        <div style={s.brandBlock}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', marginBottom: 8 }}>
            <img src="/icon.png" alt="" style={{ width: 48, height: 48 }} className="brand-logo" />
            <h1 className="brand-title" style={s.brandTitle}>NEWSY</h1>
          </Link>
          <p className="brand-subtitle" style={s.brandSubtitle}>
            Платформа интерактивных челенджей.
            <br />Растей над собой, соревнуйся с друзьями и получай реальные награды.
          </p>
          <div className="stats-row" style={s.statsRow}>
            <Stat num="50k+" label="участников" />
            <Stat num="1.2k" label="челенджей" />
            <Stat num="4.9" label="рейтинг" />
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right" style={s.rightPanel}>
        <div className="auth-form-container" style={s.formContainer}>
          {/* Tabs */}
          <div style={s.tabs}>
            <button
              onClick={() => setMode('login')}
              style={{
                ...s.tab,
                ...(mode === 'login' ? s.tabActive : {}),
              }}
            >
              Вход
            </button>
            <button
              onClick={() => setMode('register')}
              style={{
                ...s.tab,
                ...(mode === 'register' ? s.tabActive : {}),
              }}
            >
              Регистрация
            </button>
            <div
              style={{
                ...s.tabIndicator,
                transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)',
              }}
            />
          </div>

          {/* Animated form switcher */}
          <div style={s.formScroller}>
            <div
              style={{
                ...s.formTrack,
                transform: mode === 'login' ? 'translateX(0)' : 'translateX(-50%)',
              }}
            >
              {/* LOGIN FORM */}
              <div style={s.formPane}>
                <LoginForm action={loginAction} />
              </div>

              {/* REGISTER FORM */}
              <div style={s.formPane}>
                <RegisterForm action={registerAction} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -30px) rotate(10deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-25px, 20px) rotate(-8deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 25px) scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .anim-shapes {
          position: absolute; inset: 0; overflow: hidden; z-index: 0;
        }
        .shape {
          position: absolute; border-radius: 50%;
          background: rgba(255, 56, 92, 0.08);
        }
        .shape-1 {
          width: 200px; height: 200px; top: -50px; right: -50px;
          animation: float1 8s ease-in-out infinite;
        }
        .shape-2 {
          width: 150px; height: 150px; bottom: 20%; left: -30px;
          animation: float2 10s ease-in-out infinite;
          background: rgba(255, 140, 0, 0.06);
        }
        .shape-3 {
          width: 100px; height: 100px; top: 40%; right: 20%;
          animation: float3 7s ease-in-out infinite;
          background: rgba(255, 255, 255, 0.05);
        }
        .shape-4 {
          width: 80px; height: 80px; bottom: 10%; right: 10%;
          animation: pulse 5s ease-in-out infinite;
          background: rgba(255, 56, 92, 0.1);
        }

        .brand-logo { transition: transform 0.3s ease; }
        .brand-logo:hover { transform: scale(1.1) rotate(-5deg); }

        .reg-name-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        @media (max-width: 860px) {
          .auth-wrapper { flex-direction: column !important; }
          .auth-left { flex: 0 0 auto !important; min-height: 180px !important; padding: 36px 24px !important; }
          .auth-left .brand-subtitle, .auth-left .stats-row { display: none !important; }
          .auth-left .brand-title { font-size: 36px !important; margin: 8px 0 0 !important; }
          .auth-right { padding: 24px 16px !important; }
        }
        @media (max-width: 480px) {
          .auth-left { min-height: 120px !important; padding: 24px 16px !important; }
          .auth-left .brand-title { font-size: 28px !important; }
          .auth-left .brand-logo { width: 40px !important; height: 40px !important; }
          .reg-name-row { grid-template-columns: 1fr !important; }
          .auth-form-title { font-size: 22px !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── LOGIN ────────────────────────────────────────────────────────────── */

function LoginForm({ action }: { action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [showPass, setShowPass] = useState(false);

  return (
    <div>
      <h2 className="auth-form-title" style={s.formTitle}>С возвращением!</h2>
      <p style={s.formSubtitle}>Войдите в NEWSY, чтобы продолжить свои челенджи</p>

      <form action={formAction} style={s.form}>
        <InputField icon={<Mail size={18} />} name="identifier" placeholder="demo@newsy.ru" label="Email или Телефон" />
        <InputField icon={<Lock size={18} />} name="password" placeholder="••••••••" label="Пароль" type={showPass ? 'text' : 'password'} trailing={<button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
        <input type="hidden" name="provider" value="email" />

        {state.error && <p style={s.error}>{state.error}</p>}

        <button type="submit" disabled={isPending} style={s.submitBtn}>
          {isPending ? 'Входим...' : 'Войти'} <ArrowRight size={18} />
        </button>
      </form>

      <p style={s.footerText}>
        Нет аккаунта?{' '}
        <Link href="/register" style={s.footerLink}>Зарегистрироваться</Link>
      </p>
    </div>
  );
}

/* ─── REGISTER ─────────────────────────────────────────────────────────── */

function RegisterForm({ action }: { action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [showPass, setShowPass] = useState(false);

  return (
    <div>
      <h2 className="auth-form-title" style={s.formTitle}>Создать аккаунт</h2>
      <p style={s.formSubtitle}>Зарегистрируйтесь, чтобы участвовать в челленджи</p>

      <form action={formAction} style={s.form}>
        <div className="reg-name-row">
          <InputField icon={<User size={18} />} name="firstName" placeholder="Алексей" label="Имя" />
          <InputField icon={<User size={18} />} name="lastName" placeholder="Иванов" label="Фамилия" />
        </div>
        <InputField icon={<Mail size={18} />} name="email" placeholder="demo@newsy.ru" label="Email" type="email" />
        <InputField icon={<Lock size={18} />} name="password" placeholder="Минимум 6 символов" label="Пароль" type={showPass ? 'text' : 'password'} trailing={<button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
        <InputField icon={<Lock size={18} />} name="confirm" placeholder="Повторите пароль" label="Повторите пароль" type="password" />
        <InputField icon={<Tag size={18} />} name="referralCode" placeholder="Например: IVANOV2026" label="Код приглашения (необязательно)" />

        {state.error && <p style={s.error}>{state.error}</p>}

        <button type="submit" disabled={isPending} style={s.submitBtn}>
          {isPending ? 'Создаём...' : 'Зарегистрироваться'} <ArrowRight size={18} />
        </button>
      </form>

      <p style={s.footerText}>
        Уже есть аккаунт?{' '}
        <Link href="/login" style={s.footerLink}>Войти</Link>
      </p>
    </div>
  );
}

/* ─── Shared Input ─────────────────────────────────────────────────────── */

function InputField({ icon, name, placeholder, label, type = 'text', trailing }: {
  icon: React.ReactNode; name: string; placeholder: string; label: string; type?: string; trailing?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={s.inputGroup}>
      <label style={s.label}>{label}</label>
      <div style={{
        ...s.inputWrap,
        borderColor: focused ? '#FF385C' : '#e5e7eb',
        boxShadow: focused ? '0 0 0 3px rgba(255,56,92,0.1)' : 'none',
      }}>
        <span style={{ color: '#aaa', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          style={s.input}
          required={name !== 'confirm'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {trailing}
      </div>
    </div>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{num}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────── */

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
  },
  leftPanel: {
    flex: '0 0 42%',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  brandBlock: {
    position: 'relative',
    zIndex: 1,
    animation: 'fadeSlideIn 0.6s ease',
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: 900,
    color: '#FF385C',
    margin: 0,
    letterSpacing: -2,
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.7,
    margin: '0 0 40px',
    maxWidth: 320,
  },
  statsRow: {
    display: 'flex',
    gap: 40,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    background: '#fafafa',
  },
  formContainer: {
    width: '100%',
    maxWidth: 440,
    animation: 'fadeSlideIn 0.5s ease',
  },
  tabs: {
    display: 'flex',
    position: 'relative',
    background: '#f0f0f0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 36,
  },
  tab: {
    flex: 1,
    padding: '12px 0',
    fontSize: 14,
    fontWeight: 700,
    color: '#888',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 11,
    transition: 'color 0.25s',
    position: 'relative',
    zIndex: 1,
  },
  tabActive: {
    color: '#111',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 'calc(50% - 4px)',
    height: 'calc(100% - 8px)',
    background: 'white',
    borderRadius: 11,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 0,
  },
  formScroller: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  formTrack: {
    display: 'flex',
    width: '200%',
    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
  },
  formPane: {
    width: '50%',
    flexShrink: 0,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 900,
    margin: '0 0 6px',
    color: '#111',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#888',
    margin: '0 0 28px',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 14px',
    height: 52,
    borderRadius: 14,
    border: '1.5px solid #e5e7eb',
    background: 'white',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 15,
    color: '#111',
    background: 'transparent',
    height: '100%',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#aaa',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #FF385C, #E31C5F)',
    color: 'white',
    fontSize: 15,
    fontWeight: 800,
    border: 'none',
    cursor: 'pointer',
    marginTop: 8,
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 16px rgba(255,56,92,0.3)',
  },
  error: {
    margin: 0,
    padding: '10px 14px',
    borderRadius: 10,
    background: '#fff0f3',
    color: '#e03e5c',
    fontWeight: 600,
    fontSize: 13,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
  },
  footerLink: {
    color: '#FF385C',
    fontWeight: 700,
    textDecoration: 'none',
  },
};
