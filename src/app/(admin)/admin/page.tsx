'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy, CreditCard, Bell, TrendingUp, Activity, DollarSign, Eye, Edit3, Trash2, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { useSession } from '@/shared/components/session-provider';

interface AdminStats {
  users: { total: number; active: number; pending: number };
  challenges: { total: number; published: number; draft: number; ongoing: number };
  payments: { total: number; succeeded: number; pending: number; revenue: number };
  subscriptions: { active: number; canceled: number };
  recentUsers: { id: string; email: string; name: string; status: string; createdAt: string }[];
  recentChallenges: { id: string; title: string; status: string; organizer: string; createdAt: string }[];
  recentPayments: { id: string; amount: number; status: string; type: string; createdAt: string }[];
}

export default function AdminPage() {
  const session = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'challenges' | 'payments'>('overview');

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
  }, [isAdmin]);

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
          <div className="admin-loading">Загрузка...</div>
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
          {(['overview', 'users', 'challenges', 'payments'] as const).map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Обзор' : t === 'users' ? 'Пользователи' : t === 'challenges' ? 'Челленджи' : 'Платежи'}
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
                    <span className="list-name">{u.name || u.email}</span>
                    <span className="list-meta">{u.email} · {new Date(u.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <span className={`status-badge ${u.status === 'ACTIVE' ? 'active' : 'pending'}`}>{u.status}</span>
                </div>
              ))}
            </div>
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
          .admin-page { max-width: 1200px; margin: 0 auto; padding: 32px 20px 80px; }
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
          .admin-loading { text-align: center; padding: 80px; color: #71717a; }
          .tab-content { display: flex; flex-direction: column; gap: 14px; }
          @media (max-width: 900px) { .stats-grid, .detail-grid, .lists-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </PageShell>
  );
}
