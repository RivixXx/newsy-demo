'use client';

import { useActionState, useId, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, Store, Trophy, User } from 'lucide-react';
import { loginAction, registerAction, type AuthActionState } from '@/modules/identity/actions';
import { TwoFactorVerify } from './two-factor-verify';

const focus = 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 focus-visible:border-orange-600';
const input = `min-h-12 w-full rounded-lg border border-slate-400 bg-white px-4 text-base text-slate-950 placeholder:text-slate-500 ${focus}`;
const primary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-[15px] font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 ${focus}`;

type FieldProps = { name: string; label: string; type?: string; placeholder?: string; icon?: ReactNode; required?: boolean; autoComplete?: string; children?: ReactNode; maxLength?: number };
function Field({ name, label, type = 'text', placeholder, icon, required = true, autoComplete, children, maxLength }: FieldProps) {
  const id = useId();
  return <div className="flex min-w-0 flex-col gap-2">
    <label htmlFor={id} className="text-sm font-bold text-slate-800">{label}{required && <span aria-hidden> *</span>}</label>
    <div className="relative">
      {icon && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500 [&>svg]:size-[18px]">{icon}</span>}
      <input id={id} name={name} type={type} placeholder={placeholder} required={required} autoComplete={autoComplete} maxLength={maxLength}
        className={`${input} ${icon ? 'pl-11' : ''} ${children ? 'pr-12' : ''}`} />
      {children}
    </div>
  </div>;
}

function Notice({ state, prefix }: { state: AuthActionState; prefix: string }) {
  if (state.error) return <div id={`${prefix}-message`} role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-900">{state.error}</div>;
  if (state.success) return <div id={`${prefix}-message`} role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">{state.success}</div>;
  return null;
}

export function AuthCard({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  return <main className="grid min-h-dvh place-items-center bg-slate-50 p-0 text-slate-950 sm:p-8">
    <section className="grid min-h-dvh w-full max-w-6xl overflow-hidden bg-white sm:min-h-[680px] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-xl lg:grid-cols-[.85fr_1.15fr]" aria-label={initialMode === 'login' ? 'Вход' : 'Регистрация'}>
      <aside className="flex items-center justify-between gap-5 bg-slate-950 px-6 py-5 text-white lg:flex-col lg:items-start lg:p-11">
        <Link href="/" aria-label="ЧИ — на главную" className={`inline-flex min-h-11 items-center gap-3 text-xl font-black ${focus}`}><Image src="/icon.svg" alt="" width={40} height={40} />ЧИ</Link>
        <div className="hidden lg:block">
          <p className="mb-4 text-sm font-bold uppercase tracking-wider text-orange-300">Платформа челленджей</p>
          <h1 className="mb-5 text-5xl font-black leading-[1.05] tracking-tight">Делайте то, что давно откладывали.</h1>
          <p className="text-base leading-7 text-slate-300">Выбирайте челлендж, двигайтесь к цели вместе с другими и фиксируйте результат.</p>
          <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-200"><li className="flex gap-2"><ShieldCheck className="size-5 text-orange-300" />Данные защищены</li><li className="flex gap-2"><Trophy className="size-5 text-orange-300" />Условия участия видны заранее</li></ul>
        </div>
        <Link href="/" className={`inline-flex min-h-11 items-center gap-2 text-sm font-bold ${focus}`}><ArrowLeft className="size-5" /><span className="hidden sm:inline">Вернуться к каталогу</span></Link>
      </aside>
      <div className="flex flex-col px-6 py-7 sm:px-12 lg:px-16">
        <nav aria-label="Вход или регистрация" className="mb-10 grid grid-cols-2 border-b border-slate-200">
          {([['login','Вход'],['register','Регистрация']] as const).map(([mode,label]) => <Link key={mode} href={`/${mode}`} aria-current={initialMode === mode ? 'page' : undefined} className={`grid min-h-12 place-items-center border-b-2 text-[15px] font-bold ${focus} ${initialMode === mode ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-600'}`}>{label}</Link>)}
        </nav>
        {initialMode === 'login' ? <Login action={loginAction} /> : <Register action={registerAction} />}
      </div>
    </section>
  </main>;
}

function Login({ action }: { action: (s: AuthActionState, d: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [shown, setShown] = useState(false);
  if (state.twoFactorToken === 'required') return <TwoFactorVerify onBack={() => location.reload()} />;
  return <div className="my-auto w-full max-w-xl">
    <header className="mb-8"><h2 className="mb-2 text-3xl font-black tracking-tight">С возвращением</h2><p className="text-sm leading-6 text-slate-600">Введите данные, чтобы продолжить.</p></header>
    <form action={formAction} className="flex flex-col gap-5" aria-describedby={state.error ? 'login-message' : undefined}>
      <Field name="identifier" label="Email или телефон" placeholder="name@example.ru" icon={<Mail />} autoComplete="username" />
      <Field name="password" label="Пароль" placeholder="Введите пароль" icon={<Lock />} type={shown ? 'text' : 'password'} autoComplete="current-password"><PasswordButton shown={shown} toggle={() => setShown(!shown)} /></Field>
      <input type="hidden" name="provider" value="email" /><Notice state={state} prefix="login" />
      <Link href="/forgot-password" className={`ml-auto inline-flex min-h-11 items-center text-sm font-bold text-slate-800 underline-offset-4 hover:underline ${focus}`}>Забыли пароль?</Link>
      <button className={primary} disabled={pending}>{pending ? 'Входим…' : 'Войти'}<ArrowRight className="size-5" /></button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-600">Нет аккаунта? <Link className={`inline-flex min-h-11 items-center font-bold text-slate-950 underline ${focus}`} href="/register">Зарегистрироваться</Link></p>
  </div>;
}

function Register({ action }: { action: (s: AuthActionState, d: FormData) => Promise<AuthActionState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [role, setRole] = useState<'participant'|'organizer'>('participant');
  const [account, setAccount] = useState('individual');
  const [shown, setShown] = useState(false);
  const business = role === 'organizer' && account !== 'individual';
  return <div className="w-full max-w-xl">
    <header className="mb-7"><h2 className="mb-2 text-3xl font-black tracking-tight">Создать аккаунт</h2><p className="text-sm leading-6 text-slate-600">Заполните данные. Обязательные поля отмечены звёздочкой.</p></header>
    <form action={formAction} className="flex flex-col gap-5" aria-describedby={(state.error || state.success) ? 'register-message' : undefined}>
      <Choice label="Я хочу" value={role} setValue={v => setRole(v as typeof role)} options={[['participant','Участвовать'],['organizer','Создавать ЧИ']]} />
      <Choice label="Тип аккаунта" value={account} setValue={setAccount} options={[['individual','Физ. лицо'],['self_employed','Самозанятый'],['ip','ИП'],['ooo','ООО'],['ao','АО']]} />
      <div className="grid gap-4 sm:grid-cols-2"><Field name="firstName" label="Имя" icon={<User />} autoComplete="given-name" /><Field name="lastName" label="Фамилия" icon={<User />} autoComplete="family-name" /></div>
      <Field name="email" label="Email" type="email" icon={<Mail />} placeholder="name@example.ru" autoComplete="email" />
      <div className="grid gap-4 sm:grid-cols-2"><Select name="gender" label="Пол" items={[['','Не указан'],['male','Мужской'],['female','Женский']]} /><Field name="birthDate" label="Дата рождения" type="date" required={false} /></div>
      {business && <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="flex items-center gap-2 text-sm font-bold"><Building2 className="size-5" />Данные организации</p><Field name="companyName" label="Наименование" /><Field name="inn" label="ИНН" maxLength={12} /><div className="grid gap-4 sm:grid-cols-2"><Select name="companySize" label="Размер" items={[['','Не указан'],['1-5','1–5'],['6-20','6–20'],['21-50','21–50'],['51-200','51–200'],['201-1000','201–1 000'],['1000+','1 000+']]} /><Field name="employeeCount" label="Число работников" type="number" required={false} /></div><Field name="companyAddress" label="Адрес" /><Field name="platformName" label="Название на платформе" icon={<Store />} /></div>}
      <Field name="password" label="Пароль" placeholder="Минимум 8 символов" icon={<Lock />} type={shown ? 'text' : 'password'} autoComplete="new-password"><PasswordButton shown={shown} toggle={() => setShown(!shown)} /></Field>
      <Field name="confirm" label="Повторите пароль" icon={<Lock />} type={shown ? 'text' : 'password'} autoComplete="new-password" />
      <Field name="referralCode" label="Код приглашения" placeholder="Если есть" required={false} />
      <input type="hidden" name="userRole" value={role} /><input type="hidden" name="accountType" value={account} /><Notice state={state} prefix="register" />
      <p className="text-sm leading-6 text-slate-600">Создавая аккаунт, вы соглашаетесь с условиями использования и политикой конфиденциальности.</p>
      <button className={primary} disabled={pending}>{pending ? 'Создаём…' : 'Создать аккаунт'}<ArrowRight className="size-5" /></button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-600">Уже есть аккаунт? <Link className={`inline-flex min-h-11 items-center font-bold text-slate-950 underline ${focus}`} href="/login">Войти</Link></p>
  </div>;
}

function Choice({ label, value, setValue, options }: { label: string; value: string; setValue: (v:string)=>void; options: string[][] }) {
  return <fieldset><legend className="mb-2 text-sm font-bold text-slate-800">{label}</legend><div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{options.map(([id,text]) => <label key={id} className={`relative flex min-h-12 cursor-pointer items-center justify-center rounded-lg border px-3 text-center text-sm font-bold ${value === id ? 'border-slate-950 bg-slate-100' : 'border-slate-300 bg-white'} focus-within:ring-4 focus-within:ring-orange-200`}><input className="sr-only" type="radio" name={`${label}-choice`} checked={value === id} onChange={() => setValue(id)} />{text}</label>)}</div></fieldset>;
}
function Select({ name, label, items }: { name:string; label:string; items:string[][] }) { const id=useId(); return <div className="flex flex-col gap-2"><label htmlFor={id} className="text-sm font-bold text-slate-800">{label}</label><select id={id} name={name} className={input}>{items.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></div>; }
function PasswordButton({ shown, toggle }: { shown:boolean; toggle:()=>void }) { return <button type="button" onClick={toggle} aria-label={shown ? 'Скрыть пароль' : 'Показать пароль'} className={`absolute inset-y-0 right-0 grid min-h-12 w-12 place-items-center text-slate-600 ${focus}`}>{shown ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button>; }
