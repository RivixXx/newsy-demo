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
      <div className="form-header" style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,56,92,0.1)', border: '1px solid rgba(255,56,92,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Shield size={28} style={{ color: '#FF385C' }} />
        </div>
        <h2>Двухфакторная аутентификация</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0', lineHeight: 1.5 }}>
          {isBackup
            ? 'Введите один из резервных кодов'
            : 'Введите код из приложения-аутентификатора'}
        </p>
      </div>

      <form action={formAction} className="auth-form" style={{ marginTop: 16 }}>
        <div className="field-group" style={{ marginBottom: 8 }}>
          <label className="field-label" style={{ textAlign: 'center', fontSize: 12, marginBottom: 8 }}>
            {isBackup ? 'Резервный код' : 'Код подтверждения'}
          </label>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8,
          }}>
            <input
              name="code"
              type="text"
              inputMode={isBackup ? 'text' : 'numeric'}
              autoComplete="one-time-code"
              maxLength={isBackup ? 13 : 6}
              placeholder={isBackup ? 'XXXXXX-XXXXXX' : '• • • • • •'}
              className="field-input"
              style={{
                width: isBackup ? 200 : 200,
                height: 52,
                textAlign: 'center',
                fontSize: isBackup ? 16 : 24,
                letterSpacing: isBackup ? 2 : 8,
                fontWeight: 700,
                fontFamily: isBackup ? 'inherit' : 'monospace',
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                color: 'white',
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#FF385C'; e.target.style.boxShadow = '0 0 0 3px rgba(255,56,92,0.2)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
              autoFocus
            />
          </div>
        </div>

        <input type="hidden" name="isBackup" value={isBackup ? 'true' : 'false'} />

        {state.error && (
          <div className="msg msg--error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
        style={{
          display: 'block', width: '100%', textAlign: 'center',
          background: 'none', border: 'none',
          fontSize: 13, fontWeight: 600,
          color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
          marginTop: 12, padding: 8, borderRadius: 8,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#FF385C'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
      >
        <KeyRound size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
        {isBackup ? 'Ввести код из приложения' : 'Использовать резервный код'}
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'block', width: '100%', textAlign: 'center',
          background: 'none', border: 'none',
          fontSize: 13, fontWeight: 600,
          color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
          marginTop: 4, padding: 8, borderRadius: 8,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
      >
        ← Назад
      </button>
    </div>
  );
}
