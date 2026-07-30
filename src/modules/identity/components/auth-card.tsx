'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff, Tag, Calendar,
  Building2, Landmark, Users, MapPin, Briefcase, Store,
  ChevronLeft, Check, UserCircle, Trophy, Zap,
} from 'lucide-react';
import { loginAction, registerAction, type AuthActionState } from '@/modules/identity/actions';
import { TwoFactorVerify } from './two-factor-verify';

/* ─────────────────────────── types ─────────────────────────────── */

const ACCOUNT_TYPES = [
  { id: 'individual', label: 'Физ. лицо', icon: <UserCircle size={22} />, desc: 'Участник' },
  { id: 'ip', label: 'ИП', icon: <Store size={22} />, desc: 'ИП' },
  { id: 'ooo', label: 'ООО', icon: <Building2 size={22} />, desc: 'ООО' },
  { id: 'ao', label: 'АО', icon: <Landmark size={22} />, desc: 'АО' },
  { id: 'self_employed', label: 'Самозанятый', icon: <Briefcase size={22} />, desc: 'НПД' },
];

const USER_ROLES = [
  { id: 'participant' as const, label: 'Участвовать', icon: <Trophy size={24} />, desc: 'Выполнять челленджи' },
  { id: 'organizer' as const, label: 'Создавать', icon: <Zap size={24} />, desc: 'Запускать конкурсы' },
];

const COMPANY_SIZES = [
  { id: '1-5', label: '1–5' }, { id: '6-20', label: '6–20' },
  { id: '21-50', label: '21–50' }, { id: '51-200', label: '51–200' },
  { id: '201-1000', label: '201–1 000' }, { id: '1000+', label: '1 000+' },
];

const IS_BUSINESS = (t: string) => t !== 'individual';

/* ═══════════════════════════════════════════════════════════════════
   MAIN AUTH CARD
   ═══════════════════════════════════════════════════════════════════ */

export function AuthCard({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className="auth-root">
      {/* Animated background orbs */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="auth-grid-pattern" />
      </div>

      <div className="auth-container">
        {/* Left branding panel */}
        <div className="auth-brand">
          <Link href="/welcome" className="brand-link">
            <img src="/icon.png" alt="" className="brand-logo" />
            <span className="brand-name">ЧИ</span>
          </Link>
          <h2 className="brand-headline">Соревнуйся.<br/>Побеждай.<br/>Получай награды.</h2>
          <p className="brand-desc">
            Платформа интерактивных челленджей для бизнеса, блогеров и каждого.
          </p>
          <div className="stats-row" style={s.statsRow}>
            <Stat num="50k+" label="участников" />
            <Stat num="1.2k" label="челенджей" />
            <Stat num="4.9" label="рейтинг" />
          </div>
        </div>
      </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="glass-card">
            {/* Tab switcher */}
            <div className="tab-bar">
              <button
                className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Вход
              </button>
              <button
                className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => setMode('register')}
              >
                Регистрация
              </button>
              <div className="tab-slider" style={{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }} />
            </div>

            {/* Forms — only one rendered at a time, no overlap */}
            {mode === 'login' && <LoginForm action={loginAction} />}
            {mode === 'register' && <RegisterWizard action={registerAction} />}
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div >
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN FORM
   ═══════════════════════════════════════════════════════════════════ */

function LoginForm({ action }: { action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [showPass, setShowPass] = useState(false);
  const [show2fa, setShow2fa] = useState(false);

  // When loginAction returns twoFactorToken, show 2FA verification
  if (state.twoFactorToken === 'required' || show2fa) {
    return (
      <TwoFactorVerify
        onBack={() => {
          setShow2fa(false);
          // Clear the 2FA flag by resetting state — a full page navigation would also work
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="form-wrap">
      <div className="form-header">
        <h2>С возвращением!</h2>
        <p>Войдите, чтобы продолжить свои челленджи</p>
      </div>

      <form action={formAction} className="auth-form">
        <Field icon={<Mail size={18} />} name="identifier" placeholder="demo@chi.ru" label="Email или Телефон" />
        <Field
          icon={<Lock size={18} />} name="password" placeholder="••••••••" label="Пароль"
          type={showPass ? 'text' : 'password'}
          trailing={
            <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Скрыть' : 'Показать'}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <input type="hidden" name="provider" value="email" />

        {state.error && <div className="msg msg--error">{state.error}</div>}

        <button type="submit" disabled={isPending} className="submit-btn">
          {isPending ? 'Входим...' : 'Войти'} <ArrowRight size={18} />
        </button>
      </form>

      <Link href="/forgot-password" className="forgot-link">Забыли пароль?</Link>

      <p className="switch-text">
        Нет аккаунта?{' '}
        <Link href="/register" className="switch-link">Зарегистрироваться</Link>
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REGISTER WIZARD — sequential DOM, no absolute stacking
   ═══════════════════════════════════════════════════════════════════ */

function RegisterWizard({ action }: { action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [step, setStep] = useState(0);
  const [userRole, setUserRole] = useState<'participant' | 'organizer'>('participant');
  const [accountType, setAccountType] = useState('individual');
  const [formHeight, setFormHeight] = useState<number | 'auto'>('auto');

  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const stepFinalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isOrganizer = userRole === 'organizer';
  const isBusiness = isOrganizer && IS_BUSINESS(accountType);
  const maxStep = isOrganizer ? (isBusiness ? 3 : 2) : 1;

  const getStepRef = useCallback((idx: number) => {
    if (idx === 0) return step0Ref;
    if (idx === 1) return step1Ref;
    if (idx === 2 && isOrganizer) return isBusiness ? step2Ref : stepFinalRef;
    if (idx === 3 && isBusiness) return stepFinalRef;
    return stepFinalRef;
  }, [isOrganizer, isBusiness]);

  // Measure active step height on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      const ref = getStepRef(step);
      if (ref.current) {
        const h = ref.current.scrollHeight;
        setFormHeight(h + 24); // +24 for padding
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [step, getStepRef]);

  const goNext = useCallback(() => { setDirection('forward'); setStep(s => s + 1); }, []);
  const goBack = useCallback(() => { setDirection('back'); setStep(s => s - 1); }, []);

  const progressPct = Math.round(((step + 1) / (maxStep + 1)) * 100);

  return (
    <div className="form-wrap">
      <div className="form-header">
        <h2>Создать аккаунт</h2>
        <p>Зарегистрируйтесь, чтобы участвовать в челленджах</p>
      </div>

      {/* Progress */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="step-dots">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className={`dot ${i <= step ? 'dot--active' : ''} ${i === step ? 'dot--current' : ''}`} />
        ))}
      </div>

      <form ref={formRef} action={formAction} style={{ ...s.form, height: formHeight }} onSubmit={(e) => {
        if (step < maxStep) { e.preventDefault(); goNext(); }
      }}>
        <input type="hidden" name="accountType" value={accountType} />
        <input type="hidden" name="userRole" value={userRole} />

        {/* ── Step: Role ── */}
        {showRole && (
          <div className="step-section">
            <label className="field-label">Я хочу</label>
            <div className="choice-grid">
              {USER_ROLES.map(r => (
                <button key={r.id} type="button" className={`choice-card ${userRole === r.id ? 'choice-card--active' : ''}`}
                  onClick={() => setUserRole(r.id)}>
                  <span className="choice-icon">{r.icon}</span>
                  <span className="choice-label">{r.label}</span>
                  <span className="choice-desc">{r.desc}</span>
                  {userRole === r.id && <span className="choice-check"><Check size={14} /></span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step: Account Type ── */}
        {showAccountType && (
          <div className="step-section">
            <label className="field-label">Тип аккаунта</label>
            <div className="choice-grid choice-grid--wrap">
              {ACCOUNT_TYPES.map(t => (
                <button key={t.id} type="button" className={`choice-card choice-card--sm ${accountType === t.id ? 'choice-card--active' : ''}`}
                  onClick={() => setAccountType(t.id)}>
                  <span className="choice-icon">{t.icon}</span>
                  <span className="choice-label">{t.label}</span>
                  {accountType === t.id && <span className="choice-check"><Check size={14} /></span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 1 (participant) / STEP 2 (organizer): Personal Info ─── */}
        <div ref={step1Ref} style={{
          ...s.stepPane,
          opacity: step === (isOrganizer ? 2 : 1) ? 1 : 0,
          transform: step === (isOrganizer ? 2 : 1) ? 'translateX(0) scale(1)' : `translateX(${direction === 'forward' ? 30 : -30}px) scale(0.97)`,
          pointerEvents: step === (isOrganizer ? 2 : 1) ? 'auto' : 'none',
        }}>
          <div className="reg-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField icon={<User size={18} />} name="firstName" placeholder="Алексей" label="Имя" />
            <InputField icon={<User size={18} />} name="lastName" placeholder="Иванов" label="Фамилия" />
          </div>
          <InputField icon={<Mail size={18} />} name="email" placeholder="demo@newsy.ru" label="Email" type="email" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={s.inputGroup}>
              <label style={s.label}>Пол</label>
              <div style={s.inputWrap}>
                <select name="gender" style={{ ...s.input, cursor: 'pointer' }}>
                  <option value="">Не указан</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>
            <InputField icon={<Calendar size={18} />} name="birthDate" placeholder="дд.мм.гггг" label="Дата рождения" type="date" />
          </div>
        )}

          {/* ── Step: Business Info ── */}
          {showBusiness && (
            <div className="step-section">
              <div className="step-badge">
                <Building2 size={16} /> Данные {ACCOUNT_TYPES.find(t => t.id === accountType)?.label}
              </div>
              <Field icon={<Building2 size={18} />} name="companyName" placeholder="ООО «Рога и Копыта»" label="Наименование" />
              <Field icon={<Landmark size={18} />} name="inn" placeholder="7701234567" label="ИНН" maxLength={12} />
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Размер</label>
                  <div className="input-wrap">
                    <select name="companySize" className="field-input" style={{ cursor: 'pointer' }}>
                      <option value="">Не указан</option>
                      {COMPANY_SIZES.map(sz => <option key={sz.id} value={sz.id}>{sz.label} сотр.</option>)}
                    </select>
                  </div>
                </div>
                <Field icon={<Users size={18} />} name="employeeCount" placeholder="12" label="Число работников" type="number" />
              </div>
              <Field icon={<MapPin size={18} />} name="companyAddress" placeholder="г. Москва, ул. Примерная, д. 1" label="Адрес" />
              <Field icon={<Store size={18} />} name="platformName" placeholder="Мой бренд" label="Название на платформе" />
            </div>
          )}

          {/* ── Step: Password ── */}
          {showPassword && (
            <div className="step-section">
              <PasswordField />
              <Field icon={<Tag size={18} />} name="referralCode" placeholder="Например: IVANOV2026" label="Код приглашения (необязательно)" />
            </div>
          )}

          {state.error && <div className="msg msg--error">{state.error}</div>}
          {state.success && <div className="msg msg--success">{state.success}</div>}
      </form>

      {/* Nav buttons — outside the form */}
      <div className="nav-row">
        {step > 0 && (
          <button type="button" onClick={goBack} className="back-btn">
            <ChevronLeft size={18} /> Назад
          </button>
        )}
        <div style={{ flex: 1 }} />
        {!isLastStep ? (
          <button type="button" onClick={goNext} className="next-btn">
            Далее <ArrowRight size={18} />
          </button>
        ) : (
          <button type="submit" form="" disabled={isPending} style={s.submitBtn} onClick={() => {
            const form = document.querySelector('form');
            form?.requestSubmit();
          }}>
            {isPending ? 'Создаём...' : 'Зарегистрироваться'} <ArrowRight size={18} />
          </button>
        )}
      </div>

      <p className="switch-text">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="switch-link">Войти</Link>
      </p>
    </div>
  );
}

/* ─── Password sub-step ─── */

function PasswordStep() {
  const [showPass, setShowPass] = useState(false);
  return (
    <>
      <InputField
        icon={<Lock size={18} />}
        name="password"
        placeholder="Минимум 8 символов"
        label="Пароль"
        type={showPass ? 'text' : 'password'}
        trailing={
          <button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn} aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}>
            {showPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        }
      />
      <InputField icon={<Lock size={18} />} name="confirm" placeholder="Повторите пароль" label="Повторите пароль" type="password" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN FORM
   ═══════════════════════════════════════════════════════════════════ */

function LoginForm({ action }: { action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [showPass, setShowPass] = useState(false);

  return (
    <div>
      <h2 className="auth-form-title" style={s.formTitle}>С возвращением!</h2>
      <p style={s.formSubtitle}>Войдите в NEWSY, чтобы продолжить свои челенджи</p>

      <form action={formAction} style={s.form}>
        <InputField icon={<Mail size={18} />} name="identifier" placeholder="demo@newsy.ru" label="Email или Телефон" />
        <InputField icon={<Lock size={18} />} name="password" placeholder="••••••••" label="Пароль" type={showPass ? 'text' : 'password'} trailing={<button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn} aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}>{showPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}</button>} />
        <input type="hidden" name="provider" value="email" />

        {state.error && <p style={s.error}>{state.error}</p>}

        <button type="submit" disabled={isPending} style={s.submitBtn}>
          {isPending ? 'Входим...' : 'Войти'} <ArrowRight size={18} />
        </button>
      </form>

      <p style={{ ...s.footerText, marginTop: 12 }}>
        <Link href="/forgot-password" style={s.footerLink}>Забыли пароль?</Link>
      </p>

      <p style={s.footerText}>
        Нет аккаунта?{' '}
        <Link href="/register" style={s.footerLink}>Зарегистрироваться</Link>
      </p>
    </div>
  );
}

/* ─── Shared Input ─── */

function Field({ icon, name, placeholder, label, type = 'text', trailing, maxLength }: {
  icon: React.ReactNode; name: string; placeholder: string; label: string;
  type?: string; trailing?: React.ReactNode; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const id = `f-${name}`;
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">{label}</label>
      <div className={`input-wrap ${focused ? 'input-wrap--focus' : ''}`}>
        <span className="input-icon">{icon}</span>
        <input
          id={id} name={name} type={type} placeholder={placeholder}
          className="field-input"
          required={name !== 'confirm' && name !== 'referralCode'}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          maxLength={maxLength}
        />
        {trailing}
      </div>
    </div>
  );
}

function PasswordField() {
  const [show, setShow] = useState(false);
  return (
    <>
      <Field
        icon={<Lock size={18} />} name="password" placeholder="Минимум 8 символов" label="Пароль"
        type={show ? 'text' : 'password'}
        trailing={
          <button type="button" className="eye-btn" onClick={() => setShow(v => !v)} aria-label={show ? 'Скрыть' : 'Показать'}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <Field icon={<Lock size={18} />} name="confirm" placeholder="Повторите пароль" label="Повторите пароль" type="password" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CSS — Glassmorphism Auth
   ═══════════════════════════════════════════════════════════════════ */

const css = `
  /* ── Reset for this scope ── */
  .auth-root *, .auth-root *::before, .auth-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh; width: 100%; position: relative; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
    background: #111;
  }

  /* ── Animated background ── */
  .auth-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
  }
  .auth-bg::before {
    content: ''; position: absolute; inset: 0;
    background: url('/auth-bg.jpg') center / cover no-repeat;
    filter: blur(20px) brightness(0.4) saturate(1.2);
    transform: scale(1.05);
  }
  .auth-bg::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(10,10,18,0.5);
  }
  .orb {
    position: absolute; border-radius: 50%; filter: blur(100px);
    animation: orbFloat 12s ease-in-out infinite alternate;
  }
  .orb-1 {
    width: 500px; height: 500px; top: -10%; left: -5%;
    background: radial-gradient(circle, rgba(255,56,92,0.25), transparent 70%);
    animation-duration: 14s;
  }
  .orb-2 {
    width: 400px; height: 400px; bottom: -10%; right: -5%;
    background: radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%);
    animation-duration: 18s; animation-delay: -4s;
  }
  .orb-3 {
    width: 300px; height: 300px; top: 40%; left: 50%; transform: translateX(-50%);
    background: radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%);
    animation-duration: 22s; animation-delay: -8s;
  }
  @keyframes orbFloat {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 15px) scale(0.95); }
    100% { transform: translate(10px, -10px) scale(1.02); }
  }
  .auth-grid-pattern {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* ── Layout ── */
  .auth-container {
    position: relative; z-index: 1;
    display: flex; min-height: 100vh;
  }

  /* ── Left brand panel ── */
  .auth-brand {
    flex: 0 0 42%; display: flex; flex-direction: column; justify-content: center;
    padding: 60px; position: relative;
  }
  .brand-link {
    display: inline-flex; align-items: center; gap: 14px; text-decoration: none; margin-bottom: 48px;
  }
  .brand-logo { width: 48px; height: 48px; transition: transform 0.3s; }
  .brand-link:hover .brand-logo { transform: scale(1.1) rotate(-5deg); }
  .brand-name { font-size: 36px; font-weight: 900; color: #FF385C; letter-spacing: -1.5px; }
  .brand-headline {
    font-size: clamp(32px, 3.5vw, 48px); font-weight: 900; color: white;
    line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 20px;
  }
  .brand-desc {
    font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.7; margin-bottom: 48px; max-width: 340px;
  }
  .brand-stats { display: flex; gap: 40px; }
  .bs-item { text-align: center; }
  .bs-num { display: block; font-size: 24px; font-weight: 900; color: white; }
  .bs-label { display: block; font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; margin-top: 4px; }

  /* ── Right form panel ── */
  .auth-form-panel {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 40px;
  }

  /* ── Glass card ── */
  .glass-card {
    width: 100%; max-width: 460px;
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(40px) saturate(150%);
    -webkit-backdrop-filter: blur(40px) saturate(150%);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 28px;
    padding: 36px;
    box-shadow:
      0 8px 32px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.08);
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Tabs ── */
  .tab-bar {
    display: flex; position: relative;
    background: rgba(255,255,255,0.06); border-radius: 14px; padding: 4px;
    margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.08);
  }
  .tab-btn {
    flex: 1; padding: 12px 0; font-size: 14px; font-weight: 700;
    color: rgba(255,255,255,0.35); background: transparent; border: none;
    cursor: pointer; border-radius: 11px; position: relative; z-index: 1;
    transition: color 0.25s;
  }
  .tab-btn.active { color: white; }
  .tab-btn:hover:not(.active) { color: rgba(255,255,255,0.6); }
  .tab-slider {
    position: absolute; top: 4px; left: 4px;
    width: calc(50% - 4px); height: calc(100% - 8px);
    background: rgba(255,255,255,0.12);
    border-radius: 11px;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    border: 1px solid rgba(255,255,255,0.08);
  }

  /* ── Form wrapper ── */
  .form-wrap { animation: formFade 0.3s ease; }
  @keyframes formFade { from { opacity: 0; } to { opacity: 1; } }

  .form-header { margin-bottom: 28px; }
  .form-header h2 {
    font-size: 24px; font-weight: 900; color: white; margin: 0 0 6px; letter-spacing: -0.02em;
  }
  .form-header p { font-size: 14px; color: rgba(255,255,255,0.4); margin: 0; line-height: 1.5; }

  /* ── Form layout ── */
  .auth-form {
    display: flex; flex-direction: column; gap: 16px;
  }

  /* ── Step section (sequential, no absolute) ── */
  .step-section {
    display: flex; flex-direction: column; gap: 14px;
    animation: stepIn 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes stepIn {
    from { opacity: 0; transform: translateX(16px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* ── Fields ── */
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5);
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .input-wrap {
    display: flex; align-items: center; gap: 10px;
    padding: 0 14px; height: 48px; border-radius: 12px;
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.1);
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .input-wrap:hover { border-color: rgba(255,255,255,0.2); }
  .input-wrap--focus {
    border-color: #FF385C !important;
    box-shadow: 0 0 0 3px rgba(255,56,92,0.2);
    background: rgba(255,255,255,0.08);
  }
  .input-icon { color: rgba(255,255,255,0.25); display: flex; flex-shrink: 0; }
  .field-input {
    flex: 1; border: none; outline: none; background: transparent;
    font-size: 14px; color: white; height: 100%;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.25); }
  select.field-input { appearance: none; cursor: pointer; }
  select.field-input option { background: #1a1a2e; color: white; }

  .eye-btn {
    background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.3);
    display: flex; padding: 4px; transition: color 0.15s;
  }
  .eye-btn:hover { color: rgba(255,255,255,0.7); }

  /* ── Choice cards ── */
  .choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .choice-grid--wrap { grid-template-columns: repeat(3, 1fr); }
  .choice-card {
    position: relative; display: flex; flex-direction: column; align-items: center;
    gap: 6px; padding: 18px 12px; border-radius: 14px;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    cursor: pointer; text-align: center; color: white;
    transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
  }
  .choice-card:hover {
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.08);
    transform: translateY(-2px);
  }
  .choice-card--active {
    border-color: #FF385C !important;
    background: rgba(255,56,92,0.08) !important;
    box-shadow: 0 0 0 3px rgba(255,56,92,0.1);
  }
  .choice-card--sm { padding: 14px 8px; }
  .choice-icon { color: rgba(255,255,255,0.5); transition: color 0.2s, transform 0.3s; }
  .choice-card--active .choice-icon { color: #FF385C; }
  .choice-card:hover .choice-icon { transform: scale(1.1); }
  .choice-label { font-size: 13px; font-weight: 800; line-height: 1.2; }
  .choice-desc { font-size: 11px; color: rgba(255,255,255,0.35); line-height: 1.3; }
  .choice-check {
    position: absolute; top: 8px; right: 8px;
    width: 20px; height: 20px; border-radius: 50%;
    background: #FF385C; color: white;
    display: flex; align-items: center; justify-content: center;
    animation: popIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

  /* ── Step badge ── */
  .step-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px;
    background: rgba(255,56,92,0.08); border: 1px solid rgba(255,56,92,0.15);
    font-size: 13px; font-weight: 700; color: #FF385C;
    width: fit-content; margin-bottom: 4px;
  }

  /* ── Progress ── */
  .progress-track {
    height: 3px; background: rgba(255,255,255,0.08); border-radius: 99px;
    margin-bottom: 10px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: linear-gradient(90deg, #FF385C, #E31C5F);
    border-radius: 99px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  }
  .step-dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 20px; }
  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .dot--active { background: #FF385C; }
  .dot--current { transform: scale(1.4); box-shadow: 0 0 8px rgba(255,56,92,0.5); }

  /* ── Messages ── */
  .msg {
    padding: 10px 14px; border-radius: 10px;
    font-size: 13px; font-weight: 600; text-align: center;
  }
  .msg--error { background: rgba(255,56,92,0.1); color: #ff6b8a; border: 1px solid rgba(255,56,92,0.15); }
  .msg--success { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.15); }

  /* ── Buttons ── */
  .submit-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    height: 48px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #FF385C, #E31C5F);
    color: white; font-size: 15px; font-weight: 800;
    cursor: pointer; margin-top: 8px;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 16px rgba(255,56,92,0.3);
  }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(255,56,92,0.4);
  }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .next-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    height: 44px; padding: 0 28px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #FF385C, #E31C5F);
    color: white; font-size: 14px; font-weight: 800; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 16px rgba(255,56,92,0.3);
  }
  .next-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,56,92,0.35); }

  .back-btn {
    display: flex; align-items: center; gap: 4px; height: 44px; padding: 0 20px;
    border-radius: 12px; background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.1);
    font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.6);
    cursor: pointer; transition: all 0.2s;
  }
  .back-btn:hover { border-color: rgba(255,255,255,0.25); color: white; }

  /* ── Nav row ── */
  .nav-row { display: flex; align-items: center; margin-top: 16px; }

  /* ── Footer links ── */
  .forgot-link {
    display: block; text-align: center; font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.45); text-decoration: none; margin-top: 16px;
    transition: color 0.15s;
  }
  .forgot-link:hover { color: #FF385C; }

  .switch-text {
    text-align: center; font-size: 14px; color: rgba(255,255,255,0.45);
    margin-top: 24px;
  }
  .switch-link {
    color: #FF385C; font-weight: 700; text-decoration: none;
    transition: opacity 0.15s;
  }
  .switch-link:hover { opacity: 0.8; }

  .reg-name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

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
`;
