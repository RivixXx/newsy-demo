'use client';

import React, { useState } from 'react';
import { useActionState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

import { verify2faLoginAction } from '@/modules/identity/actions/2fa';

/* ═══════════════════════════════════════════════════════════════════
   TWO-FACTOR VERIFY — shown inside AuthCard after password login
   ═══════════════════════════════════════════════════════════════════ */

interface TwoFactorVerifyProps {
  onBack: () => void;
}

export function TwoFactorVerify({ onBack }: TwoFactorVerifyProps) {
  const [state, formAction, isPending] = useActionState(verify2faLoginAction, {});
  const [isBackup, setIsBackup] = useState(false);

  return (
    <div className="my-auto w-full max-w-xl text-slate-950">
      <header className="mb-8">
        <div className="mb-5 grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-800" aria-hidden="true">
          <ShieldCheck className="size-6" />
        </div>
        <h2 className="mb-2 text-3xl font-black tracking-tight">Подтвердите вход</h2>
        <p className="text-sm leading-6 text-slate-600">
          {isBackup
            ? 'Введите один из резервных кодов'
            : 'Введите код из приложения-аутентификатора'}
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-5" aria-describedby={state.error ? 'two-factor-error' : 'two-factor-help'}>
        <div className="flex flex-col gap-2">
          <label htmlFor="two-factor-code" className="text-sm font-bold text-slate-800">
            {isBackup ? 'Резервный код' : 'Код подтверждения'}
          </label>
          <input
            id="two-factor-code"
            name="code"
            type="text"
            inputMode={isBackup ? 'text' : 'numeric'}
            autoComplete="one-time-code"
            maxLength={isBackup ? 13 : 6}
            placeholder={isBackup ? 'XXXXXX-XXXXXX' : '• • • • • •'}
            className="min-h-14 w-full rounded-lg border border-slate-400 bg-white px-4 text-center font-mono text-xl tracking-[.3em] text-slate-950 placeholder:text-slate-400 focus-visible:border-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            required
            aria-invalid={Boolean(state.error)}
            autoFocus
          />
        </div>

        <input type="hidden" name="isBackup" value={isBackup ? 'true' : 'false'} />

        {state.error && (
          <div id="two-factor-error" role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-900">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.error}
          </div>
        )}

        <button type="submit" disabled={isPending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-[15px] font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
          {isPending ? 'Проверяем…' : 'Подтвердить'} <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-2">
      <button type="button" onClick={() => setIsBackup(v => !v)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
        <KeyRound className="size-4" aria-hidden="true" />
        {isBackup ? 'Ввести код из приложения' : 'Использовать резервный код'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Назад
      </button>
      </div>
    </div>
  );
}
