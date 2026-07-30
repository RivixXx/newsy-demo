'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldOff, Copy, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  enable2faAction,
  verifyAndEnable2faAction,
  disable2faAction,
  check2faStatusAction,
  type TwoFactorSetupState,
} from '@/modules/identity/actions/2fa';

type SetupStep = 'loading' | 'idle' | 'setup' | 'backup' | 'enabled';

export function TwoFactorSetup() {
  const [step, setStep] = useState<SetupStep>('loading');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisablePass, setShowDisablePass] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableError, setDisableError] = useState('');

  // Check current 2FA status on mount
  useEffect(() => {
    check2faStatusAction().then(result => {
      setStep(result.success === true ? 'enabled' : 'idle');
    }).catch(() => {
      setStep('idle');
    });
  }, []);

  const handleEnable = async () => {
    setError('');
    setIsPending(true);
    try {
      const result = await enable2faAction();
      if (result.error) {
        if (result.error === 'Двухфакторная аутентификация уже включена.') {
          setStep('enabled');
        } else {
          setError(result.error);
        }
        return;
      }
      if (result.qrDataUrl && result.secret) {
        setQrDataUrl(result.qrDataUrl);
        setSecret(result.secret);
        setStep('setup');
      }
    } catch {
      setError('Ошибка при включении 2FA.');
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Код должен состоять из 6 цифр.');
      return;
    }

    setError('');
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set('secret', secret);
      formData.set('code', code);

      // simulate 2-action pattern with formData
      const result: TwoFactorSetupState = await new Promise((resolve) => {
        // Since verifyAndEnable2faAction is a server action expecting formData,
        // we use a wrapper
        const form = new FormData();
        form.set('secret', secret);
        form.set('code', code);
        verifyAndEnable2faAction({}, form).then(resolve);
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.backupCodes && result.backupCodes.length > 0) {
        setBackupCodes(result.backupCodes);
        setStep('backup');
      }
    } catch (e) {
      setError('Ошибка при проверке кода.');
    } finally {
      setIsPending(false);
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinishSetup = () => {
    setStep('enabled');
  };

  const handleDisable = async () => {
    if (!disablePassword) {
      setDisableError('Введите пароль.');
      return;
    }

    setIsPending(true);
    setDisableError('');

    try {
      const formData = new FormData();
      formData.set('password', disablePassword);
      const result = await disable2faAction({}, formData);

      if (result.error) {
        setDisableError(result.error);
        return;
      }

      setStep('idle');
      setDisablePassword('');
      setShowDisableConfirm(false);
    } catch {
      setDisableError('Ошибка при отключении 2FA.');
    } finally {
      setIsPending(false);
    }
  };

  // Loading state
  if (step === 'loading') {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загрузка...
      </div>
    );
  }

  // 2FA is enabled
  if (step === 'enabled') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-green-500 font-medium">Двухфакторная аутентификация включена</span>
        </div>

        {!showDisableConfirm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDisableConfirm(true)}
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <ShieldOff className="h-4 w-4" />
            Отключить 2FA
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <p className="text-sm font-medium">Подтвердите паролем отключение 2FA</p>
            <div className="flex items-center gap-2">
              <input
                type={showDisablePass ? 'text' : 'password'}
                placeholder="Текущий пароль"
                value={disablePassword}
                onChange={e => setDisablePassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onKeyDown={e => { if (e.key === 'Enter') handleDisable(); }}
              />
              <button
                type="button"
                onClick={() => setShowDisablePass(v => !v)}
                className="p-2 text-muted-foreground hover:text-foreground"
                aria-label={showDisablePass ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showDisablePass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {disableError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {disableError}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDisable} disabled={isPending}>
                {isPending ? 'Отключаем...' : 'Отключить'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowDisableConfirm(false); setDisableError(''); setDisablePassword(''); }}>
                Отмена
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Idle — 2FA is not enabled
  if (step === 'idle') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Защитите аккаунт с помощью приложения-аутентификатора
        </p>
        <Button variant="outline" size="sm" onClick={handleEnable} disabled={isPending} className="gap-2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          Включить 2FA
        </Button>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Setup — show QR code and input field
  if (step === 'setup') {
    return (
      <div className="space-y-4">
        <div className="text-sm space-y-2">
          <p className="font-medium">1. Отсканируйте QR-код</p>
          <p className="text-muted-foreground">
            Откройте приложение-аутентификатор (Google Authenticator, Authy и др.)
            и отсканируйте этот QR-код.
          </p>
        </div>

        <div className="flex justify-center p-4 bg-white rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR-код для настройки TOTP"
            className="w-48 h-48"
          />
        </div>

        <div className="text-sm space-y-2">
          <p className="font-medium">2. Введите код из приложения</p>
          <p className="text-muted-foreground">
            После сканирования введите 6-значный код, который появится в приложении.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="• • • • • •"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="flex h-10 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-lg text-center font-mono tracking-[0.3em] shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onKeyDown={e => { if (e.key === 'Enter') handleVerifyCode(); }}
          />
          <Button
            size="sm"
            onClick={handleVerifyCode}
            disabled={isPending || code.length !== 6}
            className="gap-1"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Подтвердить'
            )}
          </Button>
        </div>

        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Backup codes — show the one-time codes
  return (
    <div className="space-y-4">
      <div className="text-sm space-y-2">
        <p className="font-medium">Резервные коды</p>
        <p className="text-muted-foreground">
          Сохраните эти коды в надёжном месте. Каждый код можно использовать
          только один раз для входа без приложения.
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm space-y-1.5">
        {backupCodes.map((bc, i) => (
          <div key={i} className="text-center tracking-wider text-foreground/80">
            {bc}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyBackupCodes} className="gap-2">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Скопировано' : 'Копировать'}
        </Button>
        <Button size="sm" onClick={handleFinishSetup} className="gap-2">
          <Check className="h-4 w-4" />
          Я сохранил, дальше
        </Button>
      </div>
    </div>
  );
}
