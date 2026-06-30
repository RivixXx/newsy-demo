'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '@/shared/components/page-shell';
import { Settings, LogOut, CreditCard, Shield, Eye, Bell, Heart, Edit3 } from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';
import { useSession } from '@/shared/components/session-provider';
import { ProfileHero } from './components/profile-hero';
import { StatsGrid } from './components/stats-grid';
import { ActivityCalendar } from './components/activity-calendar';
import { AchievementShowcase } from './components/achievement-showcase';
import { ActivityFeed } from './components/activity-feed';
import { ProfileEditModal } from './components/profile-edit-modal';

interface ProfileData {
  name: string;
  email: string;
  points: number;
  level: { level: number; name: string; xp: number; color: string; xpInLevel: number; xpNeeded: number; progress: number };
  streak: number;
  activeChallenges: number;
  completedChallenges: number;
  achievements: number;
  rating: number;
  gender: string | null;
  birthDate: string | null;
  bio: string;
  avatarUrl: string;
  memberSince: string;
  activity: any[];
  calendar: { date: string; count: number }[];
}

export default function ProfilePage() {
  const session = useSession();
  const [tab, setTab] = useState<'overview' | 'settings'>('overview');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile-stats')
      .then(r => r.json())
      .then(d => { setProfileData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const refetchProfile = () => {
    fetch('/api/user/profile-stats')
      .then(r => r.json())
      .then(d => setProfileData(d))
      .catch(() => {});
  };

  const userName = session?.user ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'Пользователь' : 'Пользователь';
  const isOrganizer = (session?.user?.organizationIds?.length ?? 0) > 0;

  if (loading) {
    return (
      <PageShell>
        <div className="profile-page">
          <div className="profile-loading">
            <div className="profile-spinner" />
            <p>Загружаем профиль...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  const data = profileData || {
    name: userName, email: session?.user?.email || '', points: 0,
    level: { level: 1, name: 'Новичок', xp: 0, color: '#94a3b8', xpInLevel: 0, xpNeeded: 100, progress: 0 },
    streak: 0, activeChallenges: 0, completedChallenges: 0, achievements: 0, rating: 0,
    gender: null, birthDate: null, bio: '', avatarUrl: '',
    memberSince: '', activity: [], calendar: [],
  };

  const handleProfileSave = () => {
    refetchProfile();
  };

  return (
    <PageShell>
      <div className="profile-page">
        <ProfileHero
          name={data.name}
          email={data.email}
          level={data.level}
          points={data.points}
          streak={data.streak}
          isOrganizer={isOrganizer}
          gender={data.gender}
          birthDate={data.birthDate}
          avatarUrl={data.avatarUrl}
        />

        {/* Bio + Edit button */}
        <div className="bio-section">
          <div className="bio-content">
            {data.bio ? (
              <p className="bio-text">{data.bio}</p>
            ) : (
              <p className="bio-empty">Расскажите о себе — чего вы хотите достичь, какие у вас интересы</p>
            )}
          </div>
          <button className="bio-edit-btn" onClick={() => setEditOpen(true)}>
            <Edit3 size={14} /> Редактировать
          </button>
        </div>

        <StatsGrid
          activeChallenges={data.activeChallenges}
          completedChallenges={data.completedChallenges}
          achievements={data.achievements}
          points={data.points}
        />

        <div className="tabs-bar">
          <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Обзор</button>
          <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>Настройки</button>
        </div>

        {tab === 'overview' && (
          <div className="tab-content fade-in">
            <div className="content-grid">
              <div className="content-left">
                <ActivityCalendar days={data.calendar} />
                <AchievementShowcase count={data.achievements} />
              </div>
              <div className="content-right">
                <ActivityFeed activities={data.activity} />
              </div>
            </div>
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

      <ProfileEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{
          firstName: session?.user?.firstName || '',
          lastName: session?.user?.lastName || '',
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          gender: data.gender || '',
          birthDate: data.birthDate || '',
        }}
        onSave={handleProfileSave}
      />

      <style>{`
        .profile-page { max-width: 1100px; margin: 0 auto; padding: 20px clamp(12px, 3vw, 24px) 80px; display: flex; flex-direction: column; gap: 20px; }
        .bio-section { display: flex; align-items: center; justify-content: space-between; background: white; border-radius: 16px; padding: 16px 20px; border: 1px solid #f0f0f0; gap: 16px; }
        .bio-content { flex: 1; min-width: 0; }
        .bio-text { font-size: 14px; color: #333; line-height: 1.6; margin: 0; }
        .bio-empty { font-size: 13px; color: #aaa; font-style: italic; margin: 0; }
        .bio-edit-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 700; color: #555; cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .bio-edit-btn:hover { border-color: #FF385C; color: #FF385C; background: #fff5f7; }
        .profile-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
        .profile-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #f0f0f0; border-top-color: #FF385C; animation: spin 0.8s linear infinite; }
        .profile-loading p { font-size: 14px; color: #888; margin: 0; }
        .tabs-bar { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 4px 0; }
        .tab-btn { display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 12px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .tab-btn.active { background: #111; border-color: #111; color: white; }
        .tab-btn:not(.active):hover { border-color: #FF385C; color: #FF385C; }
        .tab-content { animation: fadeSlideUp 0.35s ease both; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .content-left, .content-right { display: flex; flex-direction: column; gap: 20px; }
        .settings-grid { display: flex; flex-direction: column; gap: 10px; }
        .settings-card { display: flex; align-items: center; gap: 14px; background: white; border-radius: 16px; padding: 18px 20px; border: 1.5px solid #f0f0f0; cursor: pointer; transition: all 0.2s; text-decoration: none; color: inherit; }
        .settings-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateX(4px); }
        .sc-icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
        .sc-body h4 { font-size: 14px; font-weight: 700; color: #111; margin: 0; }
        .sc-body p { font-size: 12px; color: #888; margin: 2px 0 0; }
        .settings-danger { margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
        .danger-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .danger-btn:hover { background: #fee2e2; border-color: #f87171; }
        @media (max-width: 768px) { .content-grid { grid-template-columns: 1fr; } }
      `}</style>
    </PageShell>
  );
}
