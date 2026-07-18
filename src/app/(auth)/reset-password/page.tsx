'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Токен сброса пароля отсутствует. Запросите сброс повторно.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Токен отсутствует');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка при сбросе пароля');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Ошибка сети. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={s.wrapper}>
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
        </div>
      </div>

      <div className="auth-right" style={s.rightPanel}>
        <div className="auth-form-container" style={s.formContainer}>
          <Link href="/login" style={s.backLink}>
            <ArrowLeft size={18} /> Назад к входу
          </Link>

          <h2 style={s.title}>Новый пароль</h2>
          <p style={s.subtitle}>Придумайте надёжный пароль для вашего аккаунта.</p>

          {success ? (
            <div style={s.successBox}>
              <CheckCircle size={48} color="#22c55e" />
              <p style={s.successTitle}>Пароль успешно изменён!</p>
              <p style={s.successText}>Теперь вы можете войти с новым паролем.</p>
              <Link href="/login" style={s.primaryBtn}>Войти в аккаунт</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.inputGroup}>
                <label style={s.label}>Новый пароль</label>
                <div style={s.inputWrap}>
                  <Lock size={18} style={s.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Минимум 8 символов"
                    required
                    minLength={8}
                    style={s.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={s.eyeBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>Подтвердите пароль</label>
                <div style={s.inputWrap}>
                  <Lock size={18} style={s.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                    required
                    style={s.input}
                  />
                </div>
              </div>

              {error && <p style={s.error}>{error}</p>}

              <button
                type="submit"
                disabled={loading || !token}
                style={{ ...s.primaryBtn, opacity: loading || !token ? 0.6 : 1 }}
              >
                {loading ? 'Сохранение...' : 'Сохранить пароль'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right { padding: 24px 16px !important; }
        }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#faf9f7',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 80px',
    position: 'relative',
    overflow: 'hidden',
  },
  brandBlock: {
    position: 'relative',
    zIndex: 2,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.03em',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
    marginTop: 16,
    maxWidth: 380,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#666',
    textDecoration: 'none',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: '#111',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 1.5,
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: '#aaa',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    border: '2px solid #e5e5e5',
    borderRadius: 14,
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#fff',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#aaa',
    padding: 4,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '15px 24px',
    background: '#FF385C',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'background 0.2s',
    width: '100%',
    textDecoration: 'none',
  },
  error: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: 600,
    margin: 0,
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: 32,
    background: '#f0fdf4',
    borderRadius: 16,
    border: '1px solid #bbf7d0',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#166534',
    margin: 0,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    margin: 0,
  },
};
