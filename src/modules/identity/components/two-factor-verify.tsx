'use client';

import React, { useState } from 'react';
import { useActionState } from 'react';
import { ArrowRight, Shield, KeyRound, AlertCircle } from 'lucide-react';

import { verify2faLoginAction, type TwoFactorVerifyState } from '@/modules/identity/actions/2fa';

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
    <div className="form-wrap">
      <div className="form-header">
        <div className="tf-icon-wrap">
          <Shield size={28} />
        </div>
        <h2>Двухфакторная аутентификация</h2>
        <p>
          {isBackup
            ? 'Введите один из резервных кодов'
            : 'Введите код из приложения-аутентификатора'}
        </p>
      </div>

      <form action={formAction} className="auth-form">
        <div className="field-group">
          <label className="field-label">
            {isBackup ? 'Резервный код' : 'Код подтверждения'}
          </label>
          <input
            name="code"
            type="text"
            inputMode={isBackup ? 'text' : 'numeric'}
            autoComplete="one-time-code"
            maxLength={isBackup ? 13 : 6}
            placeholder={isBackup ? 'XXXXXX-XXXXXX' : '• • • • • •'}
            className={`field-input tf-input ${isBackup ? 'tf-input--backup' : ''}`}
            autoFocus
          />
        </div>

        <input type="hidden" name="isBackup" value={isBackup ? 'true' : 'false'} />

        {state.error && (
          <div className="msg msg--error">
            <AlertCircle size={14} />
            {state.error}
          </div>
        )}

        <button type="submit" disabled={isPending} className="submit-btn">
          {isPending ? 'Проверяем...' : 'Подтвердить'} <ArrowRight size={18} />
        </button>
      </form>

      <button
        type="button"
        onClick={() => setIsBackup(v => !v)}
        className="tf-secondary-btn"
      >
        <KeyRound size={14} />
        {isBackup ? 'Ввести код из приложения' : 'Использовать резервный код'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="tf-back-btn"
      >
        ← Назад
      </button>
    </div>
  );
}
