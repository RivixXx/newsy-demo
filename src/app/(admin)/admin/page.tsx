'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy, CreditCard, Bell, TrendingUp, Activity, DollarSign, Eye, Edit3, Trash2, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { useSession } from '@/shared/components/session-provider';
import { useToast } from '@/shared/components/toast';

interface AdminStats {
  users: { total: number; active: number; pending: number };
  challenges: { total: number; published: number; draft: number; ongoing: number; pendingReview: number };
  payments: { total: number; succeeded: number; pending: number; revenue: number };
  subscriptions: { active: number; canceled: number };
  recentUsers: { id: string; email: string; name: string; status: string; createdAt: string; isOrganizer: boolean }[];
  recentChallenges: { id: string; title: string; status: string; organizer: string; createdAt: string }[];
  recentPayments: { id: string; amount: number; status: string; type: string; createdAt: string }[];
}

interface PendingChallenge {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  organizer: { name: string };
  media: { url: string }[];
  steps: { title: string; type: string; rewardPoints: number }[];
  _count: { participations: number };
}

export default function AdminPage() {
  const session = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingChallenges, setPendingChallenges] = useState<PendingChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'challenges' | 'payments' | 'moderation'>('overview');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ challengeId: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { toast } = useToast();

  const isAdmin = session?.user?.roles?.includes('admin');

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoading(false); return; }
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/admin/challenges/pending')
      .then(r => r.json())
      .then(d => {
        if (d.challenges) setPendingChallenges(d.challenges);
      })
      .catch(() => {});
  }, [isAdmin]);

  const handleReview = async (challengeId: string, action: 'approve' | 'reject', reason?: string) => {
    setReviewing(challengeId);
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingChallenges(prev => prev.filter(c => c.id !== challengeId));
        if (stats) {
          setStats({
            ...stats,
            challenges: {
              ...stats.challenges,
              pendingReview: stats.challenges.pendingReview - 1,
              published: action === 'approve' ? stats.challenges.published + 1 : stats.challenges.published,
              draft: action === 'reject' ? stats.challenges.draft + 1 : stats.challenges.draft,
            },
          });
        }
        toast('success', action === 'approve' ? 'Челлендж одобрен и опубликован' : 'Челлендж возвращён на доработку');
      }
    } catch {}
    setReviewing(null);
  };

  if (!isAdmin) {
    return (
      <PageShell>
        <div className="admin-page">
          <div className="admin-denied">
            <Shield size={48} color="#ddd" />
            <h2>Доступ запрещён</h2>
            <p>Нужна роль администратора</p>
            <Link href="/login" className="admin-btn">Войти</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="admin-page">
          <header className="admin-header">
            <div>
              <h1><Shield size={24} /> Админ-панель</h1>
              <p>Управление платформой NEWSY</p>
            </div>
          </header>
          <div className="loader-page">
            <div className="loader-spinner">
              <div className="spinner-ring" />
              <div className="spinner-ring ring-2" />
              <div className="spinner-logo">N</div>
            </div>
            <p className="loader-text">Загружаем данные...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!stats) {
    return (
      <PageShell>
        <div className="admin-page">
          <header className="admin-header">
            <div>
              <h1><Shield size={24} /> Админ-панель</h1>
              <p>Управление платформой NEWSY</p>
            </div>
          </header>
          <div className="admin-denied">
            <TrendingUp size={48} color="#ddd" />
            <h2>Данные недоступны</h2>
            <p>Не удалось загрузить статистику. Возможно, база данных не мигрирована.</p>
            <p style={{fontSize:12, color:'#aaa', marginTop:8}}>Выполните: npx prisma migrate deploy</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="admin-page">
        <header className="admin-header">
          <div>
            <h1><Shield size={24} /> Админ-панель</h1>
            <p>Управление платформой NEWSY</p>
          </div>
        </header>

        <div className="admin-tabs">
          {(['overview', 'moderation', 'users', 'challenges', 'payments'] as const).map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Обзор' : t === 'moderation' ? `Модерация (${pendingChallenges.length})` : t === 'users' ? 'Пользователи' : t === 'challenges' ? 'Челленджи' : 'Платежи'}
            </button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div className="overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}><Users size={20} /></div>
                <div className="stat-info">
                  <div className="stat-value">{stats.users.total}</div>
                  <div className="stat-label">Пользователей</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#FF385C15', color: '#FF385C' }}><Trophy size={20} /></div>
                <div className="stat-info">
                  <div className="stat-value">{stats.challenges.total}</div>
                  <div className="stat-label">Челленджей</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#16a34a15', color: '#16a34a' }}><DollarSign size={20} /></div>
                <div className="stat-info">
                  <div className="stat-value">{stats.payments.revenue.toLocaleString('ru-RU')} ₽</div>
                  <div className="stat-label">Выручка</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#d9770615', color: '#d97706' }}><CreditCard size={20} /></div>
                <div className="stat-info">
                  <div className="stat-value">{stats.subscriptions.active}</div>
                  <div className="stat-label">Активных подписок</div>
                </div>
              </div>
            </div>

            {pendingChallenges.length > 0 && (
              <div className="pending-banner" onClick={() => setTab('moderation')}>
                <Clock size={20} />
                <span><strong>{pendingChallenges.length}</strong> челлендж(ей) ожидают модерации</span>
                <span className="pending-arrow">→</span>
              </div>
            )}

            <div className="detail-grid">
              <div className="detail-card">
                <h3><Users size={16} /> Пользователи</h3>
                <div className="detail-row"><span>Всего</span><strong>{stats.users.total}</strong></div>
                <div className="detail-row"><span>Активных</span><strong style={{color:'#16a34a'}}>{stats.users.active}</strong></div>
                <div className="detail-row"><span>Ожидают</span><strong style={{color:'#d97706'}}>{stats.users.pending}</strong></div>
              </div>
              <div className="detail-card">
                <h3><Trophy size={16} /> Челленджи</h3>
                <div className="detail-row"><span>Всего</span><strong>{stats.challenges.total}</strong></div>
                <div className="detail-row"><span>Опубликовано</span><strong style={{color:'#16a34a'}}>{stats.challenges.published}</strong></div>
                <div className="detail-row"><span>Черновики</span><strong style={{color:'#d97706'}}>{stats.challenges.draft}</strong></div>
                <div className="detail-row"><span>В процессе</span><strong style={{color:'#3b82f6'}}>{stats.challenges.ongoing}</strong></div>
              </div>
              <div className="detail-card">
                <h3><CreditCard size={16} /> Платежи</h3>
                <div className="detail-row"><span>Всего</span><strong>{stats.payments.total}</strong></div>
                <div className="detail-row"><span>Успешных</span><strong style={{color:'#16a34a'}}>{stats.payments.succeeded}</strong></div>
                <div className="detail-row"><span>Ожидают</span><strong style={{color:'#d97706'}}>{stats.payments.pending}</strong></div>
              </div>
            </div>

            <div className="lists-grid">
              <div className="list-card">
                <h3>Последние пользователи</h3>
                {stats.recentUsers.map(u => (
                  <div key={u.id} className="list-row">
                    <div className="list-info">
                      <span className="list-name">{u.name || u.email}</span>
                      <span className="list-meta">{u.email}</span>
                    </div>
                    <span className={`status-badge ${u.status === 'ACTIVE' ? 'active' : 'pending'}`}>{u.status}</span>
                  </div>
                ))}
              </div>
              <div className="list-card">
                <h3>Последние челленджи</h3>
                {stats.recentChallenges.map(ch => (
                  <div key={ch.id} className="list-row">
                    <div className="list-info">
                      <span className="list-name">{ch.title}</span>
                      <span className="list-meta">{ch.organizer}</span>
                    </div>
                    <span className={`status-badge ${ch.status === 'PUBLISHED' ? 'active' : 'pending'}`}>{ch.status}</span>
                  </div>
                ))}
              </div>
              <div className="list-card">
                <h3>Последние платежи</h3>
                {stats.recentPayments.map(p => (
                  <div key={p.id} className="list-row">
                    <div className="list-info">
                      <span className="list-name">{p.amount.toLocaleString('ru-RU')} ₽</span>
                      <span className="list-meta">{p.type}</span>
                    </div>
                    <span className={`status-badge ${p.status === 'SUCCEEDED' ? 'active' : 'pending'}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && stats && (
          <div className="tab-content">
            <div className="list-card full">
              <h3>Все пользователи ({stats.recentUsers.length})</h3>
              {stats.recentUsers.map(u => (
                <div key={u.id} className="list-row">
                  <div className="list-info">
                    <span className="list-name">
                      {u.name || u.email}
                      {u.isOrganizer && <span className="org-badge">Организатор</span>}
                    </span>
                    <span className="list-meta">{u.email} · {new Date(u.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`status-badge ${u.status === 'ACTIVE' ? 'active' : 'pending'}`}>{u.status}</span>
                    {!u.isOrganizer ? (
                      <button
                        className="add-org-btn"
                        onClick={async () => {
                          const res = await fetch('/api/admin/organizer/add-member', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: u.id }),
                          });
                      const data = await res.json();
                      if (data.success) {
                        setStats({
                          ...stats,
                          recentUsers: stats.recentUsers.map(usr =>
                            usr.id === u.id ? { ...usr, isOrganizer: true } : usr
                          ),
                        });
                        toast('success', data.message);
                      } else {
                        toast('error', data.error);
                      }
                        }}
                      >
                        + В организацию
                      </button>
                    ) : (
                      <span className="org-already">✓ В организации</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'moderation' && (
          <div className="tab-content">
            {pendingChallenges.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} color="#16a34a" />
                <h3>Все проверено</h3>
                <p>Нет челленджей, ожидающих модерации</p>
              </div>
            ) : (
              pendingChallenges.map(ch => (
                <div key={ch.id} className="moderation-card">
                  <div className="mod-header">
                    {ch.media[0] && <img src={ch.media[0].url} alt="" className="mod-thumb" />}
                    <div className="mod-info">
                      <h3>{ch.title}</h3>
                      <p>{ch.description || 'Без описания'}</p>
                      <div className="mod-meta">
                        <span>Организатор: <strong>{ch.organizer.name}</strong></span>
                        <span>Категория: <strong>{ch.category || '—'}</strong></span>
                        <span>Этапов: <strong>{ch.steps.length}</strong></span>
                        <span>{new Date(ch.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mod-steps">
                    {ch.steps.map((s, i) => (
                      <span key={i} className="mod-step-badge">{s.title} ({s.rewardPoints} б.)</span>
                    ))}
                  </div>
                  <div className="mod-actions">
                    <button
                      className="mod-btn approve"
                      onClick={() => handleReview(ch.id, 'approve')}
                      disabled={reviewing === ch.id}
                    >
                      <CheckCircle size={16} /> Одобрить
                    </button>
                    <button
                      className="mod-btn reject"
                      onClick={() => setRejectModal({ challengeId: ch.id, title: ch.title })}
                      disabled={reviewing === ch.id}
                    >
                      <XCircle size={16} /> Отклонить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'challenges' && stats && (
          <div className="tab-content">
            <div className="list-card full">
              <h3>Все челленджи ({stats.recentChallenges.length})</h3>
              {stats.recentChallenges.map(ch => (
                <div key={ch.id} className="list-row">
                  <div className="list-info">
                    <span className="list-name">{ch.title}</span>
                    <span className="list-meta">{ch.organizer} · {new Date(ch.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <span className={`status-badge ${ch.status === 'PUBLISHED' ? 'active' : ch.status === 'DRAFT' ? 'draft' : 'pending'}`}>{ch.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'payments' && stats && (
          <div className="tab-content">
            <div className="list-card full">
              <h3>Все платежи ({stats.recentPayments.length})</h3>
              {stats.recentPayments.map(p => (
                <div key={p.id} className="list-row">
                  <div className="list-info">
                    <span className="list-name">{p.amount.toLocaleString('ru-RU')} ₽</span>
                    <span className="list-meta">{p.type} · {new Date(p.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <span className={`status-badge ${p.status === 'SUCCEEDED' ? 'active' : 'pending'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          .admin-page { max-width: 1200px; margin: 0 auto; padding: 32px 20px 80px; display: flex; flex-direction: column; }
          .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .admin-header h1 { display: flex; align-items: center; gap: 10px; font-size: 28px; font-weight: 900; margin: 0; color: #111; }
          .admin-header p { font-size: 14px; color: #71717a; margin: 4px 0 0; }
          .admin-tabs { display: flex; gap: 6px; margin-bottom: 24px; overflow-x: auto; }
          .admin-tab { padding: 10px 20px; border-radius: 12px; border: 1.5px solid #e5e7eb; background: white; font-size: 14px; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
          .admin-tab.active { background: #111; border-color: #111; color: white; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
          .stat-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; display: flex; align-items: center; gap: 14px; }
          .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
          .stat-value { font-size: 22px; font-weight: 900; color: #111; }
          .stat-label { font-size: 12px; color: #888; font-weight: 600; }
          .detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
          .detail-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; }
          .detail-card h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 800; margin: 0 0 12px; color: #111; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-row span { color: #888; }
          .detail-row strong { color: #111; }
          .lists-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .list-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; }
          .list-card.full { grid-column: 1 / -1; }
          .list-card h3 { font-size: 15px; font-weight: 800; margin: 0 0 12px; color: #111; }
          .list-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
          .list-row:last-child { border-bottom: none; }
          .list-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
          .list-name { font-size: 13px; font-weight: 700; color: #111; }
          .list-meta { font-size: 11px; color: #aaa; }
          .status-badge { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
          .status-badge.active { background: #f0fdf4; color: #16a34a; }
          .status-badge.pending { background: #fffbeb; color: #d97706; }
          .status-badge.draft { background: #f3f4f6; color: #6b7280; }
          .admin-denied { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px; text-align: center; }
          .admin-denied h2 { font-size: 22px; font-weight: 900; margin: 0; }
          .admin-denied p { font-size: 14px; color: #888; margin: 0; }
          .admin-btn { padding: 12px 24px; border-radius: 12px; background: #111; color: white; font-size: 14px; font-weight: 700; text-decoration: none; margin-top: 12px; }
          .admin-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 20px; gap: 16px; }
          .admin-loading p { font-size: 14px; color: #888; font-weight: 600; margin: 0; }
          .loader-page { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; min-height: 50vh; gap: 24px; }
          .loader-spinner { position: relative; width: 80px; height: 80px; }
          .spinner-ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid transparent; border-top-color: #FF385C; animation: spin 1s linear infinite; }
          .spinner-ring.ring-2 { inset: 8px; border-top-color: #E31C5F; animation-duration: 1.5s; animation-direction: reverse; }
          .spinner-logo { position: absolute; inset: 0; display: grid; place-items: center; font-size: 28px; font-weight: 900; color: #FF385C; }
          .loader-text { font-size: 14px; color: #888; font-weight: 600; margin: 0; animation: pulse 1.5s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
          .tab-content { display: flex; flex-direction: column; gap: 14px; }
          .add-org-btn { padding: 4px 10px; border-radius: 8px; border: 1px solid #16a34a; background: #f0fdf4; color: #16a34a; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
          .add-org-btn:hover { background: #16a34a; color: white; }
          .org-badge { display: inline-block; margin-left: 6px; padding: 1px 6px; border-radius: 6px; background: #ede9fe; color: #7c3aed; font-size: 10px; font-weight: 700; vertical-align: middle; }
          .org-already { font-size: 11px; color: #16a34a; font-weight: 700; white-space: nowrap; }
          .pending-banner { display: flex; align-items: center; gap: 10px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; cursor: pointer; transition: background 0.15s; margin-bottom: 24px; }
          .pending-banner:hover { background: #fef3c7; }
          .pending-banner span { font-size: 14px; color: #92400e; }
          .pending-arrow { margin-left: auto; font-size: 18px; }
          .empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px; text-align: center; }
          .empty-state h3 { font-size: 18px; font-weight: 800; margin: 0; color: #111; }
          .empty-state p { font-size: 14px; color: #888; margin: 0; }
          .moderation-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 14px; }
          .mod-header { display: flex; gap: 14px; }
          .mod-thumb { width: 120px; height: 80px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
          .mod-info { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
          .mod-info h3 { font-size: 16px; font-weight: 800; margin: 0; color: #111; }
          .mod-info p { font-size: 13px; color: #71717a; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .mod-meta { display: flex; gap: 14px; font-size: 12px; color: #888; margin-top: 4px; flex-wrap: wrap; }
          .mod-meta strong { color: #333; }
          .mod-steps { display: flex; gap: 6px; flex-wrap: wrap; }
          .mod-step-badge { padding: 4px 10px; border-radius: 8px; background: #f3f4f6; font-size: 11px; font-weight: 600; color: #555; }
          .mod-actions { display: flex; gap: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5; }
          .mod-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; transition: all 0.15s; }
          .mod-btn:disabled { opacity: 0.5; cursor: default; }
          .mod-btn.approve { background: #16a34a; color: white; }
          .mod-btn.approve:hover:not(:disabled) { background: #15803d; }
          .mod-btn.reject { background: #fee2e2; color: #dc2626; }
          .mod-btn.reject:hover:not(:disabled) { background: #fecaca; }
          @media (max-width: 900px) { .stats-grid, .detail-grid, .lists-grid { grid-template-columns: 1fr; } }
          .reject-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000; display: grid; place-items: center; animation: fadeIn 0.2s; }
          .reject-modal { background: white; border-radius: 20px; padding: 28px; width: 90%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: slideUp 0.3s; }
          .reject-modal h3 { font-size: 18px; font-weight: 900; margin: 0 0 6px; color: #111; }
          .reject-modal .reject-subtitle { font-size: 13px; color: #888; margin: 0 0 16px; }
          .reject-modal .reject-challenge { font-size: 14px; font-weight: 700; color: #dc2626; margin-bottom: 16px; padding: 10px 14px; background: #fef2f2; border-radius: 10px; }
          .reject-modal textarea { width: 100%; min-height: 100px; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 14px; font-family: inherit; resize: vertical; outline: none; transition: border-color 0.2s; }
          .reject-modal textarea:focus { border-color: #dc2626; }
          .reject-modal .reject-hint { font-size: 12px; color: #aaa; margin: 8px 0 0; }
          .reject-modal .reject-actions { display: flex; gap: 10px; margin-top: 16px; justify-content: flex-end; }
          .reject-modal .reject-cancel { padding: 10px 20px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; font-size: 13px; font-weight: 700; cursor: pointer; }
          .reject-modal .reject-confirm { padding: 10px 20px; border-radius: 10px; border: none; background: #dc2626; color: white; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
          .reject-modal .reject-confirm:hover { background: #b91c1c; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>

      {rejectModal && (
        <div className="reject-overlay" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
          <div className="reject-modal" onClick={e => e.stopPropagation()}>
            <h3>Отклонить челлендж</h3>
            <p className="reject-subtitle">Укажите причину возврата на доработку</p>
            <div className="reject-challenge">«{rejectModal.title}»</div>
            <textarea
              placeholder="Что нужно исправить или улучшить..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <p className="reject-hint">Если поле пустое, будет отправлено стандартное сообщение</p>
            <div className="reject-actions">
              <button className="reject-cancel" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Отмена</button>
              <button className="reject-confirm" onClick={() => {
                handleReview(rejectModal.challengeId, 'reject', rejectReason);
                setRejectModal(null);
                setRejectReason('');
              }}>Отклонить</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
