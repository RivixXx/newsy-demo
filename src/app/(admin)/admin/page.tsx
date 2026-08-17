'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy, CreditCard, Bell, TrendingUp, Activity, DollarSign, Eye, Edit3, Trash2, CheckCircle, XCircle, Clock, BarChart3, Megaphone, Save, Info } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { PageSpinner } from '@/shared/components/spinner';
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
  format: string;
  challengeType: string;
  address: string | null;
  city: string | null;
  startDate: string | null;
  endDate: string | null;
  maxParticipants: number | null;
  entryFee: number;
  requirements: string | null;
  cancellationPolicy: string;
  status: string;
  createdAt: string;
  organizer: { name: string };
  media: { url: string }[];
  steps: { title: string; type: string; rewardPoints: number; description: string | null }[];
  _count: { participations: number };
}

export default function AdminPage() {
  const session = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingChallenges, setPendingChallenges] = useState<PendingChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'organizations' | 'challenges' | 'payments' | 'moderation' | 'ads'>('overview');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ challengeId: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adConfig, setAdConfig] = useState<Record<string, string | boolean | string[]>>({});
  const [adSaving, setAdSaving] = useState(false);
  const [organizations, setOrganizations] = useState<{ id: string; name: string; inn: string | null; type: string; status: string; memberCount: number; challengeCount: number; createdAt: string }[]>([]);
  const { toast } = useToast();

  const isAdmin = session?.user?.roles?.includes('admin');

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (!d.success || !d.data) { setLoading(false); return; }
        setStats(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/admin/challenges/pending')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data?.challenges)) setPendingChallenges(d.data.challenges);
      })
      .catch(() => {});

    fetch('/api/admin/ad-config')
      .then(r => r.json())
      .then(d => setAdConfig(d))
      .catch(() => {});

    fetch('/api/admin/organizations')
      .then(r => r.json())
      .then(d => setOrganizations(d.organizations || []))
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
              <p>Управление платформой ЧИ</p>
            </div>
          </header>
          <PageSpinner text="Загружаем данные..." />
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
              <p>Управление платформой ЧИ</p>
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
            <p>Управление платформой ЧИ</p>
          </div>
        </header>

        <div className="admin-tabs" role="tablist" aria-label="Разделы админ-панели">
          {(['overview', 'moderation', 'users', 'organizations', 'challenges', 'payments', 'ads'] as const).map(t => (
            <button type="button" key={t} role="tab" aria-selected={tab === t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Обзор' : t === 'moderation' ? `Модерация (${pendingChallenges.length})` : t === 'users' ? 'Пользователи' : t === 'organizations' ? 'Организации' : t === 'challenges' ? 'Челленджи' : t === 'payments' ? 'Платежи' : 'Реклама'}
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
              <button type="button" className="pending-banner" onClick={() => setTab('moderation')}>
                <Clock size={20} />
                <span><strong>{pendingChallenges.length}</strong> челлендж(ей) ожидают модерации</span>
                <span className="pending-arrow">→</span>
              </button>
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

        {tab === 'organizations' && (
          <div className="tab-content">
            <div className="list-card full">
              <h3>Организации ({organizations.length})</h3>
              {organizations.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>
                  Нет зарегистрированных организаций
                </div>
              ) : (
                organizations.map(o => (
                  <div key={o.id} className="list-row">
                    <div className="list-info">
                      <span className="list-name">
                        {o.name}
                        {o.inn && <span className="org-badge" style={{ marginLeft: 8, background: '#dbeafe', color: '#2563eb' }}>ИНН {o.inn}</span>}
                      </span>
                      <span className="list-meta">{o.type} · {o.memberCount} участников · {o.challengeCount} челленджей · {new Date(o.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <span className={`status-badge ${o.status === 'ACTIVE' ? 'active' : 'pending'}`}>{o.status}</span>
                  </div>
                ))
              )}
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
                        <span>Формат: <strong>{ch.format}</strong></span>
                        <span>Тип: <strong>{ch.challengeType === 'OPEN' ? 'Открытый' : 'Закрытый'}</strong></span>
                        {ch.city && <span>Город: <strong>{ch.city}</strong></span>}
                        {ch.startDate && <span>Начало: <strong>{new Date(ch.startDate).toLocaleDateString('ru-RU')}</strong></span>}
                        {ch.endDate && <span>Окончание: <strong>{new Date(ch.endDate).toLocaleDateString('ru-RU')}</strong></span>}
                        <span>Мест: <strong>{ch.maxParticipants || '∞'}</strong></span>
                        <span>Взнос: <strong>{ch.entryFee || 0}₽</strong></span>
                        <span>{new Date(ch.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      {ch.requirements && (
                        <div className="mod-detail"><strong>Требования:</strong> {ch.requirements}</div>
                      )}
                    </div>
                  </div>
                  <div className="mod-steps">
                    <strong style={{ fontSize: 12, color: '#666' }}>Этапы ({ch.steps.length}):</strong>
                    {ch.steps.map((s, i) => (
                      <div key={i} className="mod-step-item">
                        <span className="mod-step-badge">{s.title}</span>
                        <span className="mod-step-type">{s.type}</span>
                        {s.description && <span className="mod-step-desc">{s.description}</span>}
                      </div>
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

        {tab === 'ads' && (
          <div className="tab-content">
            <div className="ads-layout">
              {/* Left: form */}
              <div className="ads-form-card">
                <h3><Megaphone size={18} /> Настройки рекламной модалки</h3>
                <p className="ads-desc">Эта форма управляет всплывающим баннером на главной странице. Заполните поля и нажмите «Сохранить».</p>

                <div className="ads-field">
                  <label className="ads-label">
                    <input
                      type="checkbox"
                      checked={!!adConfig.enabled}
                      onChange={e => setAdConfig({ ...adConfig, enabled: e.target.checked })}
                      className="ads-checkbox"
                    />
                    Показывать модалку
                  </label>
                  <span className="ads-hint">Если выключено — баннер не будет показываться никому</span>
                </div>

                <div className="ads-field">
                  <label className="ads-label">Бейдж (попап сверху)</label>
                  <input
                    type="text"
                    className="ads-input"
                    value={(adConfig.badge as string) || ''}
                    onChange={e => setAdConfig({ ...adConfig, badge: e.target.value })}
                    placeholder="ПАРТНЁР В ТАМБОВЕ"
                  />
                  <span className="ads-hint">Короткая надпись над заголовком. Например: «НОВИНКА», «ПАРТНЁР», «АКЦИЯ»</span>
                </div>

                <div className="ads-field">
                  <label className="ads-label">Заголовок</label>
                  <input
                    type="text"
                    className="ads-input"
                    value={(adConfig.title as string) || ''}
                    onChange={e => setAdConfig({ ...adConfig, title: e.target.value })}
                    placeholder="iStore68"
                  />
                  <span className="ads-hint">Название бренда или компании. Крупный жирный текст слева</span>
                </div>

                <div className="ads-field">
                  <label className="ads-label">Подзаголовок (акцент)</label>
                  <input
                    type="text"
                    className="ads-input"
                    value={(adConfig.titleAccent as string) || ''}
                    onChange={e => setAdConfig({ ...adConfig, titleAccent: e.target.value })}
                    placeholder="Ремонт Apple"
                  />
                  <span className="ads-hint">Вторая строка заголовка, отображается розовым градиентом</span>
                </div>

                <div className="ads-field">
                  <label className="ads-label">Описание под заголовком</label>
                  <textarea
                    className="ads-textarea"
                    value={(adConfig.subtitle as string) || ''}
                    onChange={e => setAdConfig({ ...adConfig, subtitle: e.target.value })}
                    placeholder="Оригинальные запчасти, гарантия 30 дней..."
                    rows={2}
                  />
                  <span className="ads-hint">Краткое описание под заголовком, серый текст</span>
                </div>

                <div className="ads-row">
                  <div className="ads-field">
                    <label className="ads-label">Скидка (крупно)</label>
                    <input
                      type="text"
                      className="ads-input"
                      value={(adConfig.discount as string) || ''}
                      onChange={e => setAdConfig({ ...adConfig, discount: e.target.value })}
                      placeholder="-20%"
                    />
                    <span className="ads-hint">Например: -20%, -500₽, БЕСПЛАТНО</span>
                  </div>
                  <div className="ads-field">
                    <label className="ads-label">Подпись к скидке</label>
                    <input
                      type="text"
                      className="ads-input"
                      value={(adConfig.discountLabel as string) || ''}
                      onChange={e => setAdConfig({ ...adConfig, discountLabel: e.target.value })}
                      placeholder="на первый ремонт"
                    />
                    <span className="ads-hint">Текст рядом с цифрой скидки</span>
                  </div>
                </div>

                <div className="ads-field">
                  <label className="ads-label">Промокод</label>
                  <input
                    type="text"
                    className="ads-input"
                    value={(adConfig.promoCode as string) || ''}
                    onChange={e => setAdConfig({ ...adConfig, promoCode: e.target.value })}
                    placeholder="САЙТ"
                  />
                  <span className="ads-hint">Код для копирования. Если пусто — блок промокода не показывается</span>
                </div>

                <div className="ads-field">
                  <label className="ads-label">Описание справа</label>
                  <textarea
                    className="ads-textarea"
                    value={(adConfig.description as string) || ''}
                    onChange={e => setAdConfig({ ...adConfig, description: e.target.value })}
                    placeholder="Ремонт iPhone, iPad, MacBook..."
                    rows={2}
                  />
                  <span className="ads-hint">Текст в правой белой части модалки</span>
                </div>

                <div className="ads-row">
                  <div className="ads-field">
                    <label className="ads-label">Текст кнопки CTA</label>
                    <input
                      type="text"
                      className="ads-input"
                      value={(adConfig.ctaText as string) || ''}
                      onChange={e => setAdConfig({ ...adConfig, ctaText: e.target.value })}
                      placeholder="Перейти на сайт"
                    />
                  </div>
                  <div className="ads-field">
                    <label className="ads-label">URL кнопки</label>
                    <input
                      type="url"
                      className="ads-input"
                      value={(adConfig.ctaUrl as string) || ''}
                      onChange={e => setAdConfig({ ...adConfig, ctaUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                    <span className="ads-hint">Куда ведёт кнопка. Откроется в новой вкладке</span>
                  </div>
                </div>

                <div className="ads-divider" />

                <h4 className="ads-section-title">Контакты</h4>

                <div className="ads-field">
                  <label className="ads-label">Адрес</label>
                  <input
                    type="text"
                    className="ads-input"
                    value={(adConfig.address as string) || ''}
                    onChange={e => setAdConfig({ ...adConfig, address: e.target.value })}
                    placeholder="г. Тамбов, ул. Чичерина, 17"
                  />
                </div>

                <div className="ads-row">
                  <div className="ads-field">
                    <label className="ads-label">Телефон</label>
                    <input
                      type="tel"
                      className="ads-input"
                      value={(adConfig.phone as string) || ''}
                      onChange={e => setAdConfig({ ...adConfig, phone: e.target.value })}
                      placeholder="+7 (962) 230-40-40"
                    />
                  </div>
                  <div className="ads-field">
                    <label className="ads-label">Часы работы</label>
                    <input
                      type="text"
                      className="ads-input"
                      value={(adConfig.workHours as string) || ''}
                      onChange={e => setAdConfig({ ...adConfig, workHours: e.target.value })}
                      placeholder="Каждый день 10:00–19:00"
                    />
                  </div>
                </div>

                <div className="ads-field">
                  <label className="ads-label">Услуги (через запятую)</label>
                  <input
                    type="text"
                    className="ads-input"
                    value={Array.isArray(adConfig.services) ? adConfig.services.join(', ') : ''}
                    onChange={e => setAdConfig({ ...adConfig, services: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                    placeholder="iPhone, iPad, MacBook, Android"
                  />
                  <span className="ads-hint">Список услуг через запятую. Отображаются иконками в правой части</span>
                </div>

                <div className="ads-actions">
                  <button
                    className="ads-save-btn"
                    onClick={async () => {
                      setAdSaving(true);
                      try {
                        const res = await fetch('/api/admin/ad-config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(adConfig),
                        });
                        const data = await res.json();
                        if (data.success) {
                          toast('success', 'Настройки рекламы сохранены');
                        } else {
                          toast('error', 'Ошибка сохранения');
                        }
                      } catch {
                        toast('error', 'Ошибка сети');
                      }
                      setAdSaving(false);
                    }}
                    disabled={adSaving}
                  >
                    <Save size={16} />
                    {adSaving ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                </div>
              </div>

              {/* Right: preview */}
              <div className="ads-preview-card">
                <h3><Eye size={18} /> Предпросмотр</h3>
                <div className="ads-preview">
                  <div className="ads-preview-hero">
                    <div className="ads-preview-badge">{String(adConfig.badge || 'БЕЙДЖ')}</div>
                    <div className="ads-preview-title">{String(adConfig.title || 'Заголовок')}</div>
                    <div className="ads-preview-accent">{String(adConfig.titleAccent || 'Подзаголовок')}</div>
                    <div className="ads-preview-subtitle">{String(adConfig.subtitle || 'Описание')}</div>
                    {adConfig.discount && (
                      <div className="ads-preview-discount">
                        <span className="ads-preview-discount-val">{String(adConfig.discount)}</span>
                        <span className="ads-preview-discount-label">{String(adConfig.discountLabel || '')}</span>
                      </div>
                    )}
                    {adConfig.promoCode && (
                      <div className="ads-preview-promo">
                        Промокод: <strong>{String(adConfig.promoCode)}</strong>
                      </div>
                    )}
                  </div>
                  <div className="ads-preview-body">
                    <div className="ads-preview-desc">{String(adConfig.description || 'Описание справа')}</div>
                    <div className="ads-preview-services">
                      {(Array.isArray(adConfig.services) ? adConfig.services : []).map((s: string, i: number) => (
                        <span key={i} className="ads-preview-service">{s}</span>
                      ))}
                    </div>
                    <div className="ads-preview-contacts">
                      {adConfig.address && <div>{String(adConfig.address)}</div>}
                      {adConfig.phone && <div>{String(adConfig.phone)}</div>}
                      {adConfig.workHours && <div>{String(adConfig.workHours)}</div>}
                    </div>
                    <div className="ads-preview-btn">{String(adConfig.ctaText || 'Кнопка')}</div>
                  </div>
                </div>
              </div>
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
          .mod-detail { font-size: 12px; color: #555; margin-top: 6px; padding: 8px 12px; background: #f9fafb; border-radius: 8px; line-height: 1.5; }
          .mod-detail strong { color: #333; }
          .mod-step-item { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 4px 0; }
          .mod-step-type { font-size: 10px; color: #999; font-weight: 600; text-transform: uppercase; }
          .mod-step-desc { font-size: 11px; color: #888; }
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

          /* Ads tab */
          .ads-layout { display: grid; grid-template-columns: 1fr 400px; gap: 20px; align-items: start; }
          .ads-form-card { background: white; border-radius: 16px; padding: 28px; border: 1px solid #f0f0f0; }
          .ads-form-card h3 { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 900; margin: 0 0 6px; color: #111; }
          .ads-desc { font-size: 13px; color: #888; margin: 0 0 24px; line-height: 1.5; }
          .ads-field { margin-bottom: 16px; }
          .ads-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #333; margin-bottom: 6px; cursor: pointer; }
          .ads-input, .ads-textarea {
            width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px;
            font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s;
            background: #fafafa;
          }
          .ads-input:focus, .ads-textarea:focus { border-color: #FF385C; background: white; }
          .ads-textarea { resize: vertical; min-height: 60px; }
          .ads-hint { display: block; font-size: 11px; color: #aaa; margin-top: 4px; line-height: 1.4; }
          .ads-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          .ads-checkbox { width: 16px; height: 16px; accent-color: #FF385C; }
          .ads-divider { height: 1px; background: #f0f0f0; margin: 20px 0; }
          .ads-section-title { font-size: 14px; font-weight: 800; color: #111; margin: 0 0 14px; }
          .ads-actions { padding-top: 8px; }
          .ads-save-btn {
            display: flex; align-items: center; gap: 8px; padding: 12px 28px;
            border-radius: 12px; border: none; background: linear-gradient(135deg, #FF385C, #E31C5F);
            color: white; font-size: 14px; font-weight: 800; cursor: pointer;
            transition: transform 0.15s, box-shadow 0.15s;
            box-shadow: 0 4px 16px rgba(255,56,92,0.3);
          }
          .ads-save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(255,56,92,0.4); }
          .ads-save-btn:disabled { opacity: 0.6; cursor: wait; }

          /* Preview */
          .ads-preview-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f0f0f0; position: sticky; top: 90px; }
          .ads-preview-card h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 800; margin: 0 0 14px; color: #111; }
          .ads-preview { border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); font-size: 12px; }
          .ads-preview-hero {
            background: linear-gradient(160deg, #0a0a0f, #1a1025);
            padding: 24px 20px; color: white;
          }
          .ads-preview-badge {
            display: inline-block; padding: 3px 10px; border-radius: 99px;
            background: rgba(255,56,92,0.9); color: white;
            font-size: 9px; font-weight: 800; letter-spacing: 0.1em;
            margin-bottom: 10px;
          }
          .ads-preview-title { font-size: 20px; font-weight: 900; margin-bottom: 2px; }
          .ads-preview-accent { font-size: 16px; font-weight: 800; color: #FF385C; margin-bottom: 6px; }
          .ads-preview-subtitle { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.4; margin-bottom: 12px; }
          .ads-preview-discount { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
          .ads-preview-discount-val { font-size: 28px; font-weight: 900; color: #FF385C; }
          .ads-preview-discount-label { font-size: 11px; color: rgba(255,255,255,0.7); }
          .ads-preview-promo { font-size: 11px; color: rgba(255,255,255,0.5); }
          .ads-preview-promo strong { color: white; letter-spacing: 0.1em; }
          .ads-preview-body { padding: 16px 20px; background: white; }
          .ads-preview-desc { font-size: 11px; color: #666; margin-bottom: 10px; line-height: 1.4; }
          .ads-preview-services { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
          .ads-preview-service { padding: 3px 8px; border-radius: 6px; background: #f3f4f6; font-size: 10px; font-weight: 600; color: #555; }
          .ads-preview-contacts { font-size: 10px; color: #999; margin-bottom: 10px; display: flex; flex-direction: column; gap: 2px; }
          .ads-preview-btn {
            padding: 8px; border-radius: 8px; background: #FF385C; color: white;
            font-size: 11px; font-weight: 800; text-align: center;
          }

          @media (max-width: 1100px) { .ads-layout { grid-template-columns: 1fr; } .ads-preview-card { position: static; } }

          /* Strict admin workspace: restrained surfaces and accessible density. */
          .admin-page { max-width: 1280px; padding-top: 40px; color: #18181b; }
          .admin-header h1 { font-size: 30px; font-weight: 750; letter-spacing: -0.03em; }
          .admin-tabs { gap: 2px; padding: 4px; width: fit-content; max-width: 100%; background: #f4f4f5; border-radius: 10px; }
          .admin-tab { min-height: 40px; padding: 8px 14px; border: 0; border-radius: 7px; background: transparent; color: #52525b; font-weight: 650; }
          .admin-tab.active { background: #fff; color: #18181b; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
          .stat-card, .detail-card, .list-card, .moderation-card, .ads-form-card, .ads-preview-card {
            border-color: #e4e4e7; border-radius: 12px; box-shadow: none;
          }
          .stat-label, .list-meta, .status-badge, .add-org-btn, .org-badge, .org-already,
          .mod-step-badge, .mod-step-type, .mod-step-desc, .ads-hint { font-size: 12px; }
          .list-name, .detail-row, .mod-info p, .mod-btn { font-size: 14px; }
          .pending-banner { width: 100%; text-align: left; font-family: inherit; }
          .empty-state { background: #fff; border: 1px dashed #d4d4d8; border-radius: 12px; }
          .mod-actions { border-color: #e4e4e7; }
          .mod-btn { min-height: 42px; border-radius: 8px; }
          .mod-btn.approve { background: #18181b; }
          .mod-btn.approve:hover:not(:disabled) { background: #3f3f46; }
          .mod-btn.reject { background: #fff; border: 1px solid #fca5a5; color: #b91c1c; }
          .reject-modal { border-radius: 12px; box-shadow: 0 24px 80px rgba(0,0,0,.22); }
          .ads-save-btn { min-height: 44px; border-radius: 8px; background: #18181b; box-shadow: none; }
          .ads-save-btn:hover { transform: none; box-shadow: none; background: #3f3f46; }
          .admin-page :is(button, a, input, textarea, select):focus-visible {
            outline: 3px solid rgba(225,29,72,.35); outline-offset: 2px;
          }
          .ads-input:focus-visible, .ads-textarea:focus-visible, .reject-modal textarea:focus-visible { border-color: #e11d48; }
          @media (prefers-reduced-motion: reduce) {
            .admin-page *, .reject-overlay *, .admin-page *::before, .admin-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
          }
        `}</style>
      </div>

      {rejectModal && (
        <div className="reject-overlay" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
          <div className="reject-modal" role="dialog" aria-modal="true" aria-labelledby="reject-title" aria-describedby="reject-description" onClick={e => e.stopPropagation()}>
            <h3 id="reject-title">Отклонить челлендж</h3>
            <p id="reject-description" className="reject-subtitle">Укажите причину возврата на доработку</p>
            <div className="reject-challenge">«{rejectModal.title}»</div>
            <textarea
              aria-label="Причина отклонения"
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
