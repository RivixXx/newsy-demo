'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '@/shared/components/page-shell';
import {
  Trophy, Flame, CheckCircle2, Zap, Settings, Bell, Shield,
  CreditCard, LogOut, TrendingUp, Edit3, Copy, Eye, Heart,
  Tag, Mail, ArrowUpRight, Crown, Clock, Target
} from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';
import { useSession } from '@/shared/components/session-provider';

interface ProfileData {
  points: number;
  rating: number;
  memberSince: string;
  activeChallenges: number;
  completedChallenges: number;
  achievements: number;
  challenges: {
    id: string;
    title: string;
    category: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    points: number;
    completedSteps: number;
    totalSteps: number;
  }[];
}

export default function ProfilePage() {
  const session = useSession();
  const [tab, setTab] = useState<'overview' | 'settings'>('overview');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch('/api/user/profile-stats')
      .then(r => r.json())
      .then(d => setProfileData(d))
      .catch(() => {});
  }, []);

  const userName = session?.user ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'Пользователь' : 'Пользователь';
  const userEmail = session?.user?.email || '';
  const isOrganizer = (session?.user?.organizationIds?.length ?? 0) > 0;

  const stats = profileData || { points: 0, rating: 0, activeChallenges: 0, completedChallenges: 0, achievements: 0, challenges: [], memberSince: '' };

  return (
    <PageShell>
      <div className="profile-page">
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <div className="hero-left">
              <div className="avatar-container">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=b6e3f4`}
                  alt="Avatar" className="avatar-img"
                />
                {isOrganizer && (
                  <div className="organizer-badge" title="Организатор">
                    <Crown size={12} />
                  </div>
                )}
                <button className="avatar-edit"><Edit3 size={14} /></button>
              </div>
              <div className="hero-info">
                <h1 className="hero-name">
                  {userName}
                  {isOrganizer && <span className="org-tag">Организатор</span>}
                </h1>
                <p className="hero-meta"><Mail size={13} /> {userEmail}</p>
                {profileData?.memberSince && (
                  <p className="hero-meta"><Clock size={13} /> Участник с {new Date(profileData.memberSince).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon"><Flame size={20} /></div><div className="stat-val">{stats.activeChallenges}</div><div className="stat-lbl">Активных</div></div>
          <div className="stat-card"><div className="stat-icon"><CheckCircle2 size={20} /></div><div className="stat-val">{stats.completedChallenges}</div><div className="stat-lbl">Завершено</div></div>
          <div className="stat-card"><div className="stat-icon"><Trophy size={20} /></div><div className="stat-val">{stats.achievements}</div><div className="stat-lbl">Достижений</div></div>
          <div className="stat-card"><div className="stat-icon"><Zap size={20} /></div><div className="stat-val">{stats.points}</div><div className="stat-lbl">Баллов</div></div>
        </div>

        <div className="tabs-bar">
          <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}><TrendingUp size={15} /> Обзор</button>
          <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}><Settings size={15} /> Настройки</button>
        </div>

        {tab === 'overview' && (
          <div className="tab-content fade-in">
            {stats.challenges.length === 0 ? (
              <div className="empty-state">
                <Trophy size={48} color="#ddd" />
                <h3>Пока пусто</h3>
                <p>Присоединяйтесь к челленджам и эта страница наполнится</p>
                <Link href="/" style={{ display: 'inline-block', marginTop: 16, padding: '12px 24px', borderRadius: 12, background: '#FF385C', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                  Найти челлендж
                </Link>
              </div>
            ) : (
              <div className="challenges-list">
                {stats.challenges.map(ch => (
                  <Link key={ch.id} href={`/challenges/${ch.id}`} className="challenge-row">
                    <div className="challenge-row-left">
                      <Target size={18} color="#FF385C" />
                      <div>
                        <span className="challenge-row-title">{ch.title}</span>
                        <span className="challenge-row-meta">{ch.category} · {new Date(ch.startedAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    <div className="challenge-row-right">
                      <span className="challenge-row-points">+{ch.points} б.</span>
                      <span className={`challenge-row-status ${ch.status === 'COMPLETED' ? 'done' : ch.status === 'IN_PROGRESS' ? 'active' : ''}`}>
                        {ch.status === 'COMPLETED' ? '✓ Завершён' : ch.status === 'IN_PROGRESS' ? `${ch.completedSteps}/${ch.totalSteps} этапов` : ch.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="tab-content fade-in">
            <div className="settings-grid">
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#FF385C18', color: '#FF385C' }}><Bell size={20} /></div>
                <div className="sc-body"><h4>Уведомления</h4><p>Управление уведомлениями</p></div>
              </div>
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#3b82f618', color: '#3b82f6' }}><Shield size={20} /></div>
                <div className="sc-body"><h4>Безопасность</h4><p>Пароль, двухфакторная аутентификация</p></div>
              </div>
              <Link href="/dashboard/subscription" className="settings-card">
                <div className="sc-icon" style={{ background: '#8b5cf618', color: '#8b5cf6' }}><CreditCard size={20} /></div>
                <div className="sc-body"><h4>Подписка</h4><p>Управление тарифом и оплатой</p></div>
              </Link>
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#f59e0b18', color: '#f59e0b' }}><Eye size={20} /></div>
                <div className="sc-body"><h4>Приватность</h4><p>Видимость профиля</p></div>
              </div>
              <div className="settings-card">
                <div className="sc-icon" style={{ background: '#22c55e18', color: '#22c55e' }}><Heart size={20} /></div>
                <div className="sc-body"><h4>Избранное</h4><p>Сохранённые челенджи</p></div>
              </div>
            </div>
            <div className="settings-danger">
              <form action={logoutAction}>
                <button type="submit" className="danger-btn"><LogOut size={16} /> Выйти из аккаунта</button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .profile-page { max-width: 1100px; margin: 0 auto; padding: 20px clamp(12px, 3vw, 24px) 80px; display: flex; flex-direction: column; gap: 24px; }
        .hero { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .hero-bg { height: 100px; background: linear-gradient(135deg, #fff5f7 0%, #ffe8ed 40%, #fff0f3 70%, #fef2f4 100%); }
        .hero-content { padding: 0 28px 24px; display: flex; align-items: flex-end; gap: 20px; }
        .hero-left { display: flex; align-items: flex-end; gap: 20px; margin-top: -32px; }
        .avatar-container { position: relative; flex-shrink: 0; }
        .avatar-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .organizer-badge { position: absolute; bottom: -2px; left: -2px; width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #15803d); color: white; border: 2px solid white; display: grid; place-items: center; box-shadow: 0 2px 8px rgba(22,163,74,0.4); }
        .avatar-edit { position: absolute; bottom: 4px; right: -4px; width: 28px; height: 28px; border-radius: 50%; background: #FF385C; color: white; border: 2px solid white; display: grid; place-items: center; cursor: pointer; }
        .hero-info { padding-bottom: 4px; }
        .hero-name { font-size: 24px; font-weight: 900; margin: 0; color: #111; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .org-tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 8px; background: linear-gradient(135deg, #16a34a, #15803d); color: white; font-size: 11px; font-weight: 700; }
        .hero-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #888; margin: 4px 0 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .stat-card { background: white; border-radius: 20px; padding: 20px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 8px; }
        .stat-icon { width: 40px; height: 40px; border-radius: 12px; background: #FF385C15; color: #FF385C; display: grid; place-items: center; }
        .stat-val { font-size: 28px; font-weight: 900; color: #111; line-height: 1; }
        .stat-lbl { font-size: 12px; color: #888; font-weight: 600; }
        .tabs-bar { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 4px 0; }
        .tab-btn { display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 12px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .tab-btn.active { background: #111; border-color: #111; color: white; }
        .tab-btn:not(.active):hover { border-color: #FF385C; color: #FF385C; }
        .tab-content { display: flex; flex-direction: column; gap: 20px; animation: fadeSlideUp 0.35s ease both; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 18px; font-weight: 800; color: #111; margin: 16px 0 8px; }
        .empty-state p { font-size: 14px; color: #888; margin: 0; }
        .settings-grid { display: flex; flex-direction: column; gap: 10px; }
        .settings-card { display: flex; align-items: center; gap: 14px; background: white; border-radius: 16px; padding: 18px 20px; border: 1.5px solid #f0f0f0; cursor: pointer; transition: all 0.2s; }
        .settings-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateX(4px); }
        .sc-icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
        .sc-body h4 { font-size: 14px; font-weight: 700; color: #111; margin: 0; }
        .sc-body p { font-size: 12px; color: #888; margin: 2px 0 0; }
        .settings-danger { margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
        .danger-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .danger-btn:hover { background: #fee2e2; border-color: #f87171; }
        .challenges-list { display: flex; flex-direction: column; gap: 8px; }
        .challenge-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: white; border-radius: 14px; border: 1.5px solid #f0f0f0; text-decoration: none; transition: all 0.2s; }
        .challenge-row:hover { border-color: #FF385C; box-shadow: 0 4px 12px rgba(255,56,92,0.08); }
        .challenge-row-left { display: flex; align-items: center; gap: 12px; }
        .challenge-row-title { display: block; font-size: 14px; font-weight: 700; color: #111; }
        .challenge-row-meta { display: block; font-size: 12px; color: #aaa; margin-top: 2px; }
        .challenge-row-right { display: flex; align-items: center; gap: 12px; }
        .challenge-row-points { font-size: 13px; font-weight: 800; color: #FF385C; }
        .challenge-row-status { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 8px; background: #f3f4f6; color: #666; }
        .challenge-row-status.done { background: #f0fdf4; color: #16a34a; }
        .challenge-row-status.active { background: #fff7ed; color: #d97706; }
        @media (max-width: 768px) {
          .hero-content { flex-direction: column; align-items: stretch; padding: 0 20px 20px; }
          .hero-left { gap: 14px; }
          .avatar-img { width: 64px; height: 64px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>
    </PageShell>
  );
}
