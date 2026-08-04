'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

/* ─── Stat component for brand panel ─── */

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="bs-item">
      <span className="bs-num">{num}</span>
      <span className="bs-label">{label}</span>
    </div>
  );
}

/* ─── InputField (alias for Field with style object support) ─── */

function InputField({ icon, name, placeholder, label, type = 'text', trailing, maxLength, style }: {
  icon: React.ReactNode; name: string; placeholder: string; label: string;
  type?: string; trailing?: React.ReactNode; maxLength?: number; style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  const id = `f-${name}`;
  return (
    <div className="field-group" style={style}>
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
            <img src="/icon.svg" alt="" className="brand-logo" />
            <span className="brand-name">ЧИ</span>
          </Link>
          <h2 className="brand-headline">Соревнуйся.<br/>Побеждай.<br/>Получай награды.</h2>
          <p className="brand-desc">
            Платформа интерактивных челленджей для бизнеса, блогеров и каждого.
          </p>
          <div className="stats-row">
            <Stat num="50k+" label="участников" />
            <Stat num="1.2k" label="челенджей" />
            <Stat num="4.9" label="рейтинг" />
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
    </div>
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
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const stepFinalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isOrganizer = userRole === 'organizer';
  const isBusiness = isOrganizer && IS_BUSINESS(accountType);
  const maxStep = isOrganizer ? (isBusiness ? 3 : 2) : 1;

  // Visibility of conditional sub-steps
  const showRole = step === 0;
  const showAccountType = step === 1 || (isOrganizer && step === 2);
  const showBusiness = isBusiness && step === 3;
  const showPassword = isOrganizer && step === 2 && !isBusiness || (!isOrganizer && step >= 1);

  const totalSteps = isOrganizer ? (isBusiness ? 4 : 3) : 2;
  const isLastStep = step >= maxStep;

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

      <form ref={formRef} action={formAction} onSubmit={(e) => {
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
        {(showAccountType || step === (isOrganizer ? 2 : 1)) && (
          <>
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

            {/* ── Personal info fields ── */}
            {step >= 1 && (
              <div className="reg-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField icon={<User size={18} />} name="firstName" placeholder="Алексей" label="Имя" />
                <InputField icon={<User size={18} />} name="lastName" placeholder="Иванов" label="Фамилия" />
              </div>
            )}
            {step >= 1 && (
              <InputField icon={<Mail size={18} />} name="email" placeholder="demo@chi.ru" label="Email" type="email" />
            )}
            {step >= 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-group">
                  <label className="field-label">Пол</label>
                  <div className="input-wrap">
                    <select name="gender" style={{ cursor: 'pointer' }}>
                      <option value="">Не указан</option>
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                    </select>
                  </div>
                </div>
                {step >= 1 && (
                  <InputField icon={<Calendar size={18} />} name="birthDate" placeholder="дд.мм.гггг" label="Дата рождения" type="date" />
                )}
              </div>
            )}
          </>
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
          <button type="submit" disabled={isPending} onClick={() => {
            formRef.current?.requestSubmit();
          }} className="submit-final">
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

/* ─── Shared Field ─── */

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

