'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff, Tag, Calendar,
  Building2, Landmark, Users, MapPin, Briefcase, Store,
  ChevronLeft, Check, UserCircle,
} from 'lucide-react';
import { loginAction, registerAction, type AuthActionState } from '@/modules/identity/actions';

/* ─────────────────────────── types ─────────────────────────────── */

type AccountTypeOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
};

const ACCOUNT_TYPES: AccountTypeOption[] = [
  { id: 'individual', label: 'Физическое лицо', icon: <UserCircle size={28} />, desc: 'Участник челленджей' },
  { id: 'ip', label: 'ИП', icon: <Store size={28} />, desc: 'Индивидуальный предприниматель' },
  { id: 'ooo', label: 'ООО', icon: <Building2 size={28} />, desc: 'Общество с ограниченной ответственностью' },
  { id: 'ao', label: 'АО', icon: <Landmark size={28} />, desc: 'Акционерное общество' },
  { id: 'self_employed', label: 'Самозанятый', icon: <Briefcase size={28} />, desc: 'НПД / самозанятость' },
];

const COMPANY_SIZES = [
  { id: '1-5', label: '1–5' },
  { id: '6-20', label: '6–20' },
  { id: '21-50', label: '21–50' },
  { id: '51-200', label: '51–200' },
  { id: '201-1000', label: '201–1 000' },
  { id: '1000+', label: '1 000+' },
];

const IS_BUSINESS = (t: string) => t !== 'individual';

/* ─────────────────────────── main ──────────────────────────────── */

export function AuthCard({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className="auth-wrapper" style={s.wrapper}>
      {/* Left panel — brand */}
      <div className="auth-left" style={s.leftPanel}>
        <div className="stars stars-sm" />
        <div className="stars stars-md" />
        <div className="stars stars-lg" />

        <div style={s.brandBlock}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', marginBottom: 8 }}>
            <img src="/icon.png" alt="" style={{ width: 48, height: 48 }} className="brand-logo" />
            <h1 className="brand-title" style={s.brandTitle}>NEWSY</h1>
          </Link>
          <p className="brand-subtitle" style={s.brandSubtitle}>
            Платформа интерактивных челленджей.
            <br />Соревнуйся, выполняй задания и получай награды.
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
              style={{ ...s.tab, ...(mode === 'login' ? s.tabActive : {}) }}
            >
              Вход
            </button>
            <button
              onClick={() => setMode('register')}
              style={{ ...s.tab, ...(mode === 'register' ? s.tabActive : {}) }}
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
              <div style={s.formPane}>
                <LoginForm action={loginAction} />
              </div>
              <div style={s.formPane}>
                <RegisterWizard action={registerAction} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{globalCSS}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REGISTER WIZARD — multi-step animated form
   ═══════════════════════════════════════════════════════════════════ */

function RegisterWizard({ action }: { action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [accountType, setAccountType] = useState('individual');
  const [formHeight, setFormHeight] = useState<number | 'auto'>('auto');

  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const stepFinalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isBusiness = IS_BUSINESS(accountType);
  const maxStep = isBusiness ? 3 : 2;

  const getStepRef = useCallback((idx: number) => {
    if (idx === 0) return step0Ref;
    if (idx === 1) return step1Ref;
    if (idx === 2 && isBusiness) return step2Ref;
    return stepFinalRef;
  }, [isBusiness]);

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
    <div>
      <h2 className="auth-form-title" style={s.formTitle}>Создать аккаунт</h2>
      <p style={s.formSubtitle}>Зарегистрируйтесь в NEWSY, чтобы участвовать в челленджах</p>

      {/* Progress bar */}
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${progressPct}%` }} />
      </div>

      {/* Step indicators */}
      <div style={s.stepIndicators}>
        {Array.from({ length: maxStep + 1 }, (_, i) => (
          <div key={i} style={{
            ...s.stepDot,
            background: i <= step ? '#FF385C' : '#e5e7eb',
            transform: i === step ? 'scale(1.3)' : 'scale(1)',
          }} />
        ))}
      </div>

      <form ref={formRef} action={formAction} style={{ ...s.form, height: formHeight }} onSubmit={(e) => {
        if (step < maxStep) { e.preventDefault(); goNext(); }
      }}>
        <input type="hidden" name="accountType" value={accountType} />

        {/* ─── STEP 0: Account Type ─── */}
        <div ref={step0Ref} style={{
          ...s.stepPane,
          opacity: step === 0 ? 1 : 0,
          transform: step === 0 ? 'translateX(0) scale(1)' : `translateX(${direction === 'forward' ? -30 : 30}px) scale(0.97)`,
          pointerEvents: step === 0 ? 'auto' : 'none',
        }}>
          <label style={{ ...s.label, marginBottom: 8 }}>Тип аккаунта</label>
          <div style={s.accountTypeGrid}>
            {ACCOUNT_TYPES.map((t) => (
              <button key={t.id} type="button" onClick={() => setAccountType(t.id)}
                style={{ ...s.accountTypeCard, ...(accountType === t.id ? s.accountTypeCardActive : {}) }}>
                <span style={{ ...s.accountTypeIcon, color: accountType === t.id ? '#FF385C' : '#888' }}>{t.icon}</span>
                <span style={s.accountTypeLabel}>{t.label}</span>
                <span style={s.accountTypeDesc}>{t.desc}</span>
                {accountType === t.id && <span style={s.accountTypeCheck}><Check size={14} /></span>}
              </button>
            ))}
          </div>
        </div>

        {/* ─── STEP 1: Personal Info ─── */}
        <div ref={step1Ref} style={{
          ...s.stepPane,
          opacity: step === 1 ? 1 : 0,
          transform: step === 1 ? 'translateX(0) scale(1)' : `translateX(${direction === 'forward' ? 30 : -30}px) scale(0.97)`,
          pointerEvents: step === 1 ? 'auto' : 'none',
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
        </div>

        {/* ─── STEP 2: Business Info (conditional) ─── */}
        {isBusiness && (
          <div ref={step2Ref} style={{
            ...s.stepPane,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateX(0) scale(1)' : `translateX(${direction === 'forward' ? 30 : -30}px) scale(0.97)`,
            pointerEvents: step === 2 ? 'auto' : 'none',
          }}>
            <div style={s.businessStepHeader}>
              <Building2 size={20} color="#FF385C" />
              <span>Данные {ACCOUNT_TYPES.find(t => t.id === accountType)?.label || 'компании'}</span>
            </div>
            <InputField icon={<Building2 size={18} />} name="companyName" placeholder="ООО «Рога и Копыта»" label="Полное наименование" />
            <InputField icon={<Landmark size={18} />} name="inn" placeholder="7701234567" label="ИНН" maxLength={12} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={s.inputGroup}>
                <label style={s.label}>Размер компании</label>
                <div style={s.inputWrap}>
                  <select name="companySize" style={{ ...s.input, cursor: 'pointer' }}>
                    <option value="">Не указан</option>
                    {COMPANY_SIZES.map(sz => (
                      <option key={sz.id} value={sz.id}>{sz.label} сотрудников</option>
                    ))}
                  </select>
                </div>
              </div>
              <InputField icon={<Users size={18} />} name="employeeCount" placeholder="12" label="Число работников" type="number" />
            </div>
            <InputField icon={<MapPin size={18} />} name="companyAddress" placeholder="г. Москва, ул. Примерная, д. 1" label="Юридический адрес" />
            <InputField icon={<Store size={18} />} name="platformName" placeholder="Мой бренд" label="Название на платформе" />
          </div>
        )}

        {/* ─── STEP 2 (individual) / STEP 3 (business): Password ─── */}
        <div ref={stepFinalRef} style={{
          ...s.stepPane,
          opacity: step === maxStep ? 1 : 0,
          transform: step === maxStep ? 'translateX(0) scale(1)' : `translateX(${direction === 'forward' ? 30 : -30}px) scale(0.97)`,
          pointerEvents: step === maxStep ? 'auto' : 'none',
        }}>
          <PasswordStep />
          <InputField icon={<Tag size={18} />} name="referralCode" placeholder="Например: IVANOV2026" label="Код приглашения (необязательно)" />
        </div>
      </form>

      {/* Navigation buttons */}
      <div style={s.navRow}>
        {step > 0 && (
          <button type="button" onClick={goBack} style={s.backBtn}>
            <ChevronLeft size={18} /> Назад
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < maxStep ? (
          <button type="button" onClick={goNext} style={s.nextBtn}>
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

      {state.error && <p style={s.error}>{state.error}</p>}
      {state.success && <p style={s.success}>{state.success}</p>}

      <p style={s.footerText}>
        Уже есть аккаунт?{' '}
        <Link href="/login" style={s.footerLink}>Войти</Link>
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
          <button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
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

/* ─── Shared Input ─── */

function InputField({ icon, name, placeholder, label, type = 'text', trailing, maxLength }: {
  icon: React.ReactNode; name: string; placeholder: string; label: string; type?: string; trailing?: React.ReactNode; maxLength?: number;
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
          required={name !== 'confirm' && name !== 'referralCode'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
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

/* ═══════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════ */

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', minHeight: '100vh', width: '100%' },
  leftPanel: {
    flex: '0 0 42%', background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60,
    position: 'relative', overflow: 'hidden',
  },
  brandBlock: { position: 'relative', zIndex: 1, animation: 'fadeSlideIn 0.6s ease' },
  brandTitle: { fontSize: 40, fontWeight: 900, color: '#FF385C', margin: 0, letterSpacing: -2 },
  brandSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 40px', maxWidth: 320 },
  statsRow: { display: 'flex', gap: 40 },
  rightPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#fafafa' },
  formContainer: { width: '100%', maxWidth: 440, animation: 'fadeSlideIn 0.5s ease' },
  tabs: { display: 'flex', position: 'relative', background: '#f0f0f0', borderRadius: 14, padding: 4, marginBottom: 36 },
  tab: {
    flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 700, color: '#888',
    background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 11,
    transition: 'color 0.25s', position: 'relative', zIndex: 1,
  },
  tabActive: { color: '#111' },
  tabIndicator: {
    position: 'absolute', top: 4, left: 4, width: 'calc(50% - 4px)', height: 'calc(100% - 8px)',
    background: 'white', borderRadius: 11, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', zIndex: 0,
  },
  formScroller: { overflow: 'hidden', borderRadius: 20 },
  formTrack: {
    display: 'flex', width: '200%',
    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
  },
  formPane: { width: '50%', flexShrink: 0 },
  formTitle: { fontSize: 26, fontWeight: 900, margin: '0 0 6px', color: '#111' },
  formSubtitle: { fontSize: 14, color: '#888', margin: '0 0 20px', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)' },
  stepPane: {
    position: 'absolute', left: 0, right: 0, top: 0,
    display: 'flex', flexDirection: 'column', gap: 14,
    transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.4,0,0.2,1)',
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 48,
    borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#111', background: 'transparent', height: '100%' },
  eyeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
    display: 'flex', alignItems: 'center', padding: 4,
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48,
    borderRadius: 12, background: 'linear-gradient(135deg, #FF385C, #E31C5F)', color: 'white',
    fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', marginTop: 8,
    transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 4px 16px rgba(255,56,92,0.3)',
  },
  error: {
    margin: 0, padding: '10px 14px', borderRadius: 10, background: '#fff0f3',
    color: '#e03e5c', fontWeight: 600, fontSize: 13, textAlign: 'center',
  },
  success: {
    margin: 0, padding: '10px 14px', borderRadius: 10, background: '#f0fdf4',
    color: '#166534', fontWeight: 600, fontSize: 13, textAlign: 'center',
  },
  footerText: { marginTop: 28, textAlign: 'center', fontSize: 14, color: '#888' },
  footerLink: { color: '#FF385C', fontWeight: 700, textDecoration: 'none' },

  /* Wizard-specific */
  progressTrack: {
    height: 3, background: '#f0f0f0', borderRadius: 99, marginBottom: 12, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg, #FF385C, #E31C5F)',
    borderRadius: 99, transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
  },
  stepIndicators: {
    display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20,
  },
  stepDot: {
    width: 8, height: 8, borderRadius: '50%',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  },
  navRow: {
    display: 'flex', alignItems: 'center', marginTop: 12,
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 4, height: 44, padding: '0 20px',
    borderRadius: 12, background: 'white', border: '1.5px solid #e5e7eb',
    fontSize: 14, fontWeight: 700, color: '#555', cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
  },
  nextBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44,
    padding: '0 28px', borderRadius: 12,
    background: 'linear-gradient(135deg, #FF385C, #E31C5F)', color: 'white',
    fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 4px 16px rgba(255,56,92,0.3)',
  },

  /* Account type cards */
  accountTypeGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
  },
  accountTypeCard: {
    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, padding: '16px 10px', borderRadius: 14,
    border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    textAlign: 'center',
  },
  accountTypeCardActive: {
    borderColor: '#FF385C', background: '#fff5f7',
    boxShadow: '0 0 0 3px rgba(255,56,92,0.1)',
  },
  accountTypeIcon: {
    fontSize: 24, transition: 'color 0.2s, transform 0.3s',
  },
  accountTypeLabel: {
    fontSize: 13, fontWeight: 800, color: '#111', lineHeight: 1.2,
  },
  accountTypeDesc: {
    fontSize: 11, color: '#999', lineHeight: 1.3,
  },
  accountTypeCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: '50%',
    background: '#FF385C', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
  },

  /* Business step header */
  businessStepHeader: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    borderRadius: 10, background: '#fff5f7', marginBottom: 4,
    fontSize: 14, fontWeight: 700, color: '#e03e5c',
  },
};

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL CSS (injected via <style>)
   ═══════════════════════════════════════════════════════════════════ */

const globalCSS = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
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
