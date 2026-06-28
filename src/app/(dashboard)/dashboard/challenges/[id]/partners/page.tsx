'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Loader2, Building2 } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';

interface Partner {
  id: string;
  partnerName: string;
  partnerLogoUrl: string | null;
  createdAt: string;
}

export default function PartnersPage() {
  const params = useParams<{ id: string }>();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/challenges/partners?challengeId=${params.id}`)
      .then(r => r.json())
      .then(d => { setPartners(d.partners || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAdd = async () => {
    if (!name.trim()) { setError('Введите название партнёра'); return; }
    setSaving(true); setError(null);

    try {
      const res = await fetch('/api/challenges/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: params.id, partnerName: name.trim(), partnerLogoUrl: logoUrl || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.partner) { setError(data.error || 'Ошибка'); return; }
      setPartners(prev => [data.partner, ...prev]);
      setName(''); setLogoUrl('');
    } catch { setError('Ошибка сети'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (partnerId: string) => {
    try {
      const res = await fetch('/api/challenges/partners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      setPartners(prev => prev.filter(p => p.id !== partnerId));
    } catch {}
  };

  return (
    <PageShell>
      <div className="partners-page">
        <header className="p-header">
          <Link href="/dashboard" className="p-back"><ChevronLeft size={18} /> Назад</Link>
          <h1>Партнёры челленджа</h1>
          <p>Добавьте бренды-партнёры для совместного продвижения</p>
        </header>

        <div className="p-form">
          <div className="p-input-row">
            <div className="p-field">
              <label>Название бренда</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nike, Coca-Cola..." maxLength={100} />
            </div>
            <div className="p-field">
              <label>Лого URL (необязательно)</label>
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <button className="p-add-btn" onClick={handleAdd} disabled={saving || !name.trim()}>
              {saving ? <Loader2 size={16} className="spin" /> : <><Plus size={16} /> Добавить</>}
            </button>
          </div>
          {error && <div className="p-error">{error}</div>}
        </div>

        <div className="p-list">
          {partners.length === 0 && !loading && <p className="p-empty">Партнёров пока нет</p>}
          {partners.map(p => (
            <div key={p.id} className="p-card">
              <div className="p-icon"><Building2 size={20} /></div>
              <div className="p-info">
                <span className="p-name">{p.partnerName}</span>
                {p.partnerLogoUrl && <span className="p-url">{p.partnerLogoUrl}</span>}
              </div>
              <button className="p-del" onClick={() => handleDelete(p.id)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>

        <style jsx>{`
          .partners-page { max-width: 700px; margin: 0 auto; padding: 32px 20px 80px; }
          .p-header { margin-bottom: 32px; }
          .p-back { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: #71717a; text-decoration: none; margin-bottom: 16px; }
          .p-back:hover { color: #18181b; }
          .p-header h1 { font-size: 24px; font-weight: 900; margin: 0 0 8px; color: #111; }
          .p-header p { font-size: 14px; color: #71717a; margin: 0; }
          .p-form { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; margin-bottom: 24px; }
          .p-input-row { display: flex; gap: 12px; align-items: flex-end; }
          .p-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
          .p-field label { font-size: 11px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; }
          .p-field input { padding: 10px 12px; border: 1.5px solid #e4e4e7; border-radius: 10px; font-size: 13px; outline: none; }
          .p-field input:focus { border-color: #FF385C; }
          .p-add-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 10px; border: none; background: #FF385C; color: white; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
          .p-add-btn:disabled { opacity: 0.5; }
          .p-error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-top: 12px; }
          .p-list { display: flex; flex-direction: column; gap: 10px; }
          .p-empty { text-align: center; color: #aaa; padding: 40px; font-size: 14px; }
          .p-card { display: flex; align-items: center; gap: 12px; background: white; border-radius: 12px; padding: 14px 16px; border: 1px solid #f0f0f0; }
          .p-icon { width: 40px; height: 40px; border-radius: 10px; background: #f3f4f6; display: grid; place-items: center; color: #71717a; flex-shrink: 0; }
          .p-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
          .p-name { font-size: 14px; font-weight: 700; color: #111; }
          .p-url { font-size: 11px; color: #aaa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .p-del { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
          .p-del:hover { background: #fee2e2; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 600px) { .p-input-row { flex-direction: column; } .p-add-btn { width: 100%; justify-content: center; } }
        `}</style>
      </div>
    </PageShell>
  );
}
