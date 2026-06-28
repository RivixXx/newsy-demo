'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';

export default function MailingPage() {
  const params = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { setError('Заполните заголовок и текст'); return; }
    setSending(true); setError(null);

    try {
      const res = await fetch('/api/mailings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: params.id, title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Ошибка отправки'); return; }
      setSent(true);
      setSentCount(data.sentCount);
    } catch { setError('Ошибка сети'); }
    finally { setSending(false); }
  };

  return (
    <PageShell>
      <div className="mailing-page">
        <header className="m-header">
          <Link href="/dashboard" className="m-back"><ChevronLeft size={18} /> Назад</Link>
          <h1>Рассылка участникам</h1>
          <p>Отправьте уведомление всем участникам этого челленджа</p>
        </header>

        {sent ? (
          <div className="m-success">
            <CheckCircle size={48} color="#16a34a" />
            <h2>Рассылка отправлена!</h2>
            <p>Уведомление получили {sentCount} {sentCount === 1 ? 'участник' : 'участников'}</p>
            <Link href="/dashboard" className="m-btn">Вернуться в кабинет</Link>
          </div>
        ) : (
          <div className="m-form">
            <div className="m-field">
              <label>Заголовок</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Новое задание добавлено" maxLength={200} />
            </div>
            <div className="m-field">
              <label>Текст сообщения</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Расскажите участникам об обновлениях..." rows={6} maxLength={2000} />
              <span className="m-hint">{body.length}/2000</span>
            </div>
            {error && <div className="m-error">{error}</div>}
            <button className="m-send" onClick={handleSend} disabled={sending || !title.trim() || !body.trim()}>
              {sending ? <Loader2 size={16} className="spin" /> : <><Send size={16} /> Отправить</>}
            </button>
          </div>
        )}

        <style jsx>{`
          .mailing-page { max-width: 600px; margin: 0 auto; padding: 32px 20px 80px; }
          .m-header { margin-bottom: 32px; }
          .m-back { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: #71717a; text-decoration: none; margin-bottom: 16px; }
          .m-back:hover { color: #18181b; }
          .m-header h1 { font-size: 24px; font-weight: 900; margin: 0 0 8px; color: #111; }
          .m-header p { font-size: 14px; color: #71717a; margin: 0; }
          .m-form { background: white; border-radius: 16px; padding: 24px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 16px; }
          .m-field { display: flex; flex-direction: column; gap: 6px; }
          .m-field label { font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; }
          .m-field input, .m-field textarea { padding: 12px 14px; border: 1.5px solid #e4e4e7; border-radius: 10px; font-size: 14px; outline: none; font-family: inherit; resize: vertical; }
          .m-field input:focus, .m-field textarea:focus { border-color: #FF385C; }
          .m-hint { font-size: 11px; color: #d4d4d8; text-align: right; }
          .m-error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 700; }
          .m-send { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 12px; border: none; background: #FF385C; color: white; font-size: 15px; font-weight: 800; cursor: pointer; }
          .m-send:hover:not(:disabled) { background: #E31C5F; }
          .m-send:disabled { opacity: 0.5; }
          .m-success { display: flex; flex-direction: column; align-items: center; gap: 12px; background: white; border-radius: 16px; padding: 48px; border: 1px solid #f0f0f0; text-align: center; }
          .m-success h2 { font-size: 22px; font-weight: 900; margin: 8px 0 0; color: #111; }
          .m-success p { font-size: 14px; color: #71717a; margin: 0; }
          .m-btn { padding: 12px 24px; border-radius: 10px; background: #111; color: white; font-size: 14px; font-weight: 700; text-decoration: none; margin-top: 16px; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </PageShell>
  );
}
