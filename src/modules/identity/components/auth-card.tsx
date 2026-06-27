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
        {/* Starfield background */}
        <div className="stars stars-sm" />
        <div className="stars stars-md" />
        <div className="stars stars-lg" />

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
        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }

        .stars {
          position: absolute; top: 0; left: 0; right: 0;
          width: 1px; height: 1px; background: transparent;
          border-radius: 50%;
        }
        .stars-sm {
          box-shadow: 412px 1634px #FFF, 1247px 412px #FFF, 1893px 967px #FFF, 723px 1891px #FFF, 1534px 312px #FFF, 982px 1456px #FFF, 1823px 743px #FFF, 432px 1234px #FFF, 1654px 1678px #FFF, 891px 567px #FFF, 1234px 1823px #FFF, 567px 891px #FFF, 1789px 1234px #FFF, 345px 1567px #FFF, 1456px 678px #FFF, 678px 1123px #FFF, 1891px 456px #FFF, 234px 1789px #FFF, 1345px 234px #FFF, 876px 1678px #FFF, 1567px 891px #FFF, 445px 1345px #FFF, 1678px 567px #FFF, 789px 1234px #FFF, 1234px 1789px #FFF, 345px 678px #FFF, 1891px 1123px #FFF, 567px 1567px #FFF, 1456px 234px #FFF, 891px 1891px #FFF, 1234px 456px #FFF, 678px 1345px #FFF, 1789px 891px #FFF, 345px 1234px #FFF, 1567px 1789px #FFF, 891px 345px #FFF, 1345px 1678px #FFF, 567px 567px #FFF, 1678px 1123px #FFF, 789px 1891px #FFF, 1234px 678px #FFF, 456px 1456px #FFF, 1891px 234px #FFF, 678px 891px #FFF, 1345px 1567px #FFF, 891px 1123px #FFF, 1567px 456px #FFF, 234px 1789px #FFF, 1123px 1345px #FFF, 678px 1678px #FFF, 156px 923px #FFF, 1834px 1567px #FFF, 723px 345px #FFF, 1456px 1891px #FFF, 345px 891px #FFF, 1678px 234px #FFF, 891px 1456px #FFF, 1234px 567px #FFF, 567px 1234px #FFF, 1891px 678px #FFF, 345px 1789px #FFF, 1123px 456px #FFF, 678px 1567px #FFF, 1456px 345px #FFF, 789px 891px #FFF, 1234px 1123px #FFF, 567px 678px #FFF, 1678px 1456px #FFF, 345px 456px #FFF, 1891px 1345px #FFF, 891px 567px #FFF, 1345px 234px #FFF, 456px 1678px #FFF, 1567px 891px #FFF, 678px 345px #FFF, 1789px 1567px #FFF, 234px 1234px #FFF, 1123px 1891px #FFF, 789px 456px #FFF, 1456px 1123px #FFF, 345px 567px #FFF, 1678px 891px #FFF, 891px 234px #FFF, 1234px 1678px #FFF, 567px 456px #FFF, 1891px 345px #FFF, 678px 1891px #FFF, 1345px 891px #FFF, 456px 678px #FFF, 1789px 234px #FFF, 345px 1456px #FFF, 1567px 1123px #FFF, 891px 1789px #FFF, 1234px 345px #FFF, 567px 1891px #FFF, 1891px 567px #FFF, 678px 1456px #FFF, 1345px 678px #FFF, 456px 891px #FFF, 1678px 1234px #FFF, 789px 1567px #FFF;
          animation: animStar 50s linear infinite;
        }
        .stars-sm:after {
          content: " "; position: absolute; top: 2000px;
          width: 1px; height: 1px; background: transparent;
          box-shadow: 412px 1634px #FFF, 1247px 412px #FFF, 1893px 967px #FFF, 723px 1891px #FFF, 1534px 312px #FFF, 982px 1456px #FFF, 1823px 743px #FFF, 432px 1234px #FFF, 1654px 1678px #FFF, 891px 567px #FFF, 1234px 1823px #FFF, 567px 891px #FFF, 1789px 1234px #FFF, 345px 1567px #FFF, 1456px 678px #FFF, 678px 1123px #FFF, 1891px 456px #FFF, 234px 1789px #FFF, 1345px 234px #FFF, 876px 1678px #FFF, 1567px 891px #FFF, 445px 1345px #FFF, 1678px 567px #FFF, 789px 1234px #FFF, 1234px 1789px #FFF, 345px 678px #FFF, 1891px 1123px #FFF, 567px 1567px #FFF, 1456px 234px #FFF, 891px 1891px #FFF, 1234px 456px #FFF, 678px 1345px #FFF, 1789px 891px #FFF, 345px 1234px #FFF, 1567px 1789px #FFF, 891px 345px #FFF, 1345px 1678px #FFF, 567px 567px #FFF, 1678px 1123px #FFF, 789px 1891px #FFF, 1234px 678px #FFF, 456px 1456px #FFF, 1891px 234px #FFF, 678px 891px #FFF, 1345px 1567px #FFF, 891px 1123px #FFF, 1567px 456px #FFF, 234px 1789px #FFF, 1123px 1345px #FFF, 678px 1678px #FFF, 156px 923px #FFF, 1834px 1567px #FFF, 723px 345px #FFF, 1456px 1891px #FFF, 345px 891px #FFF, 1678px 234px #FFF, 891px 1456px #FFF, 1234px 567px #FFF, 567px 1234px #FFF, 1891px 678px #FFF, 345px 1789px #FFF, 1123px 456px #FFF, 678px 1567px #FFF, 1456px 345px #FFF, 789px 891px #FFF, 1234px 1123px #FFF, 567px 678px #FFF, 1678px 1456px #FFF, 345px 456px #FFF, 1891px 1345px #FFF, 891px 567px #FFF, 1345px 234px #FFF, 456px 1678px #FFF, 1567px 891px #FFF, 678px 345px #FFF, 1789px 1567px #FFF, 234px 1234px #FFF, 1123px 1891px #FFF, 789px 456px #FFF, 1456px 1123px #FFF, 345px 567px #FFF, 1678px 891px #FFF, 891px 234px #FFF, 1234px 1678px #FFF, 567px 456px #FFF, 1891px 345px #FFF, 678px 1891px #FFF, 1345px 891px #FFF, 456px 678px #FFF, 1789px 234px #FFF, 345px 1456px #FFF, 1567px 1123px #FFF, 891px 1789px #FFF, 1234px 345px #FFF, 567px 1891px #FFF, 1891px 567px #FFF, 678px 1456px #FFF, 1345px 678px #FFF, 456px 891px #FFF, 1678px 1234px #FFF, 789px 1567px #FFF;
        }

        .stars-md {
          width: 2px; height: 2px;
          box-shadow: 345px 1234px 2px 1px rgba(255,255,255,0.5), 1567px 678px 2px 1px rgba(255,255,255,0.5), 891px 1891px 2px 1px rgba(255,255,255,0.5), 1234px 456px 2px 1px rgba(255,255,255,0.5), 678px 1345px 2px 1px rgba(255,255,255,0.5), 1789px 891px 2px 1px rgba(255,255,255,0.5), 456px 1678px 2px 1px rgba(255,255,255,0.5), 1123px 234px 2px 1px rgba(255,255,255,0.5), 567px 1123px 2px 1px rgba(255,255,255,0.5), 1891px 1345px 2px 1px rgba(255,255,255,0.5), 234px 567px 2px 1px rgba(255,255,255,0.5), 1345px 1891px 2px 1px rgba(255,255,255,0.5), 789px 345px 2px 1px rgba(255,255,255,0.5), 1678px 1567px 2px 1px rgba(255,255,255,0.5), 456px 891px 2px 1px rgba(255,255,255,0.5), 1234px 1234px 2px 1px rgba(255,255,255,0.5), 567px 1789px 2px 1px rgba(255,255,255,0.5), 1891px 567px 2px 1px rgba(255,255,255,0.5), 891px 1456px 2px 1px rgba(255,255,255,0.5), 1567px 234px 2px 1px rgba(255,255,255,0.5), 678px 891px 2px 1px rgba(255,255,255,0.5), 1456px 1123px 2px 1px rgba(255,255,255,0.5), 345px 1678px 2px 1px rgba(255,255,255,0.5), 1123px 567px 2px 1px rgba(255,255,255,0.5), 891px 345px 2px 1px rgba(255,255,255,0.5), 1789px 1456px 2px 1px rgba(255,255,255,0.5), 456px 1234px 2px 1px rgba(255,255,255,0.5), 1345px 891px 2px 1px rgba(255,255,255,0.5), 678px 1891px 2px 1px rgba(255,255,255,0.5), 1567px 1567px 2px 1px rgba(255,255,255,0.5), 234px 1345px 2px 1px rgba(255,255,255,0.5), 1891px 234px 2px 1px rgba(255,255,255,0.5), 567px 567px 2px 1px rgba(255,255,255,0.5), 1234px 1789px 2px 1px rgba(255,255,255,0.5), 789px 1123px 2px 1px rgba(255,255,255,0.5);
          animation: animStar 100s linear infinite;
        }
        .stars-md:after {
          content: " "; position: absolute; top: 2000px;
          width: 2px; height: 2px; background: transparent;
          box-shadow: 345px 1234px 2px 1px rgba(255,255,255,0.5), 1567px 678px 2px 1px rgba(255,255,255,0.5), 891px 1891px 2px 1px rgba(255,255,255,0.5), 1234px 456px 2px 1px rgba(255,255,255,0.5), 678px 1345px 2px 1px rgba(255,255,255,0.5), 1789px 891px 2px 1px rgba(255,255,255,0.5), 456px 1678px 2px 1px rgba(255,255,255,0.5), 1123px 234px 2px 1px rgba(255,255,255,0.5), 567px 1123px 2px 1px rgba(255,255,255,0.5), 1891px 1345px 2px 1px rgba(255,255,255,0.5), 234px 567px 2px 1px rgba(255,255,255,0.5), 1345px 1891px 2px 1px rgba(255,255,255,0.5), 789px 345px 2px 1px rgba(255,255,255,0.5), 1678px 1567px 2px 1px rgba(255,255,255,0.5), 456px 891px 2px 1px rgba(255,255,255,0.5), 1234px 1234px 2px 1px rgba(255,255,255,0.5), 567px 1789px 2px 1px rgba(255,255,255,0.5), 1891px 567px 2px 1px rgba(255,255,255,0.5), 891px 1456px 2px 1px rgba(255,255,255,0.5), 1567px 234px 2px 1px rgba(255,255,255,0.5);
        }

        .stars-lg {
          width: 3px; height: 3px;
          box-shadow: 1234px 891px 3px 1px rgba(255,255,255,0.3), 567px 1567px 3px 1px rgba(255,255,255,0.3), 1891px 456px 3px 1px rgba(255,255,255,0.3), 345px 1234px 3px 1px rgba(255,255,255,0.3), 1567px 1891px 3px 1px rgba(255,255,255,0.3), 891px 678px 3px 1px rgba(255,255,255,0.3), 1345px 234px 3px 1px rgba(255,255,255,0.3), 678px 1123px 3px 1px rgba(255,255,255,0.3), 1789px 1678px 3px 1px rgba(255,255,255,0.3), 456px 567px 3px 1px rgba(255,255,255,0.3), 1123px 1345px 3px 1px rgba(255,255,255,0.3), 234px 891px 3px 1px rgba(255,255,255,0.3), 1678px 345px 3px 1px rgba(255,255,255,0.3), 789px 1456px 3px 1px rgba(255,255,255,0.3), 1456px 678px 3px 1px rgba(255,255,255,0.3), 567px 1234px 3px 1px rgba(255,255,255,0.3), 1891px 1123px 3px 1px rgba(255,255,255,0.3), 345px 567px 3px 1px rgba(255,255,255,0.3), 1234px 1789px 3px 1px rgba(255,255,255,0.3), 678px 456px 3px 1px rgba(255,255,255,0.3);
          animation: animStar 150s linear infinite;
        }
        .stars-lg:after {
          content: " "; position: absolute; top: 2000px;
          width: 3px; height: 3px; background: transparent;
          box-shadow: 1234px 891px 3px 1px rgba(255,255,255,0.3), 567px 1567px 3px 1px rgba(255,255,255,0.3), 1891px 456px 3px 1px rgba(255,255,255,0.3), 345px 1234px 3px 1px rgba(255,255,255,0.3), 1567px 1891px 3px 1px rgba(255,255,255,0.3), 891px 678px 3px 1px rgba(255,255,255,0.3), 1345px 234px 3px 1px rgba(255,255,255,0.3), 678px 1123px 3px 1px rgba(255,255,255,0.3), 1789px 1678px 3px 1px rgba(255,255,255,0.3), 456px 567px 3px 1px rgba(255,255,255,0.3);
        }

        .brand-logo { transition: transform 0.3s ease; position: relative; z-index: 1; }
        .brand-logo:hover { transform: scale(1.1) rotate(-5deg); }
        .brand-title { position: relative; z-index: 1; }
        .brand-subtitle { position: relative; z-index: 1; }
        .stats-row { position: relative; z-index: 1; }

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
    background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
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
