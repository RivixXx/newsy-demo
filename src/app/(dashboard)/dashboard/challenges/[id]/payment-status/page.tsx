'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';

export default function PaymentStatusPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const queryStatus = searchParams.get('status');
    const mock = searchParams.get('mock');
    const challengeId = params?.id;

    if (!challengeId) { setStatus('error'); return; }

    if (mock === 'true') {
      fetch('/api/payments/confirm-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      })
        .then(r => r.json())
        .then(d => setStatus(d.success ? 'success' : 'error'))
        .catch(() => setStatus('error'));
    } else if (queryStatus === 'success') {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [searchParams, params?.id]);

  return (
    <div className="status-page">
      <div className="status-card">
        {status === 'loading' && (
          <>
            <div className="icon-container loading">
              <Loader2 size={64} className="spin" />
            </div>
            <h1>Проверяем оплату...</h1>
            <p>Пожалуйста, подождите</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="icon-container success">
              <CheckCircle size={64} />
            </div>
            <h1>Оплата прошла успешно!</h1>
            <p>
              Ваш челлендж опубликован. Теперь участники могут найти его в каталоге.
            </p>
            <div className="stats-preview">
              <div className="stat">
                <span>Статус</span>
                <strong className="published-badge">Опубликован</strong>
              </div>
              <div className="stat">
                <span>Видимость</span>
                <strong>Публичный</strong>
              </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="icon-container error">
              <XCircle size={64} />
            </div>
            <h1>Оплата не прошла</h1>
            <p>
              Что-то пошло не так с транзакцией. Не переживайте — ваш челлендж
              сохранён как черновик. Вы можете попробовать опубликовать снова.
            </p>
          </>
        )}

        <div className="actions">
          {status === 'success' && (
            <Link href="/" className="btn-primary">
              <Sparkles size={18} /> Перейти в каталог
            </Link>
          )}
          {status === 'error' && (
            <Link href="/dashboard" className="btn-primary">
              <ChevronLeft size={18} /> Вернуться в кабинет
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .status-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4f4f5;
          padding: 20px;
        }
        .status-card {
          max-width: 500px;
          width: 100%;
          background: white;
          border-radius: 20px;
          padding: 48px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
        }
        .icon-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .icon-container.success { background: #f0fdf4; color: #22c55e; }
        .icon-container.error { background: #fef2f2; color: #ef4444; }
        .icon-container.loading { background: #f0f9ff; color: #3b82f6; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        h1 { font-size: 24px; font-weight: 800; margin: 0 0 16px; color: #111; }
        p { color: #71717a; line-height: 1.6; margin-bottom: 32px; }
        .stats-preview {
          background: #f9fafb; border-radius: 12px; padding: 16px;
          display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px;
        }
        .stat { display: flex; justify-content: space-between; font-size: 14px; }
        .stat span { color: #71717a; }
        .published-badge { color: #22c55e; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
        .actions { display: flex; flex-direction: column; gap: 12px; }
        .btn-primary {
          padding: 14px; border-radius: 12px; font-weight: 700;
          text-decoration: none; display: flex; align-items: center;
          justify-content: center; gap: 8px; transition: all 0.2s;
          background: #18181b; color: white;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      `}</style>
    </div>
  );
}
