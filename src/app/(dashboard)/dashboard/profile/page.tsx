'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '@/shared/components/page-shell';
import { PageSpinner } from '@/shared/components/spinner';
import { Settings, LogOut, CreditCard, Shield, Eye, Bell, Heart, Edit3, Trophy, Target, Flame } from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';
import { useSession } from '@/shared/components/session-provider';
import { ProfileHero } from './components/profile-hero';
import { StatsGrid } from './components/stats-grid';
import { ActivityCalendar } from './components/activity-calendar';
import { AchievementShowcase } from './components/achievement-showcase';
import { ActivityFeed } from './components/activity-feed';
import { ProfileEditModal } from './components/profile-edit-modal';
import { ChallengeModal, ModalChallenge } from '@/shared/components/challenge-modal';

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
  const [selectedChallenge, setSelectedChallenge] = useState<ModalChallenge | null>(null);
  const [favStats, setFavStats] = useState<{ isOrganizer: boolean; totalFavorites: number; challenges: { id: string; title: string; favoritesCount: number }[] } | null>(null);

  useEffect(() => {
    fetch('/api/user/profile-stats')
      .then(r => r.json())
      .then(d => {
        if (d.error || !d.level) { setLoading(false); return; }
        setProfileData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChallengeClick = (challengeId: string) => {
    fetch(`/api/challenges/${challengeId}`)
      .then(r => r.json())
      .then(d => {
        if (d.id) {
          setSelectedChallenge({
            id: d.id, title: d.title, organizer: d.organizer, category: d.category,
            imageUrl: d.imageUrl, participantsCount: d.participantsCount, maxParticipants: d.maxParticipants,
            endDate: d.endDate, location: d.location, achievement: d.achievement, reward: d.reward,
            description: d.description, requirements: d.requirements || '', refundPolicy: d.refundPolicy || '',
            stages: d.stages || [], isJoined: d.isJoined || false,
          });
        }
      })
      .catch(() => {});
  };

  const refetchProfile = () => {
    fetch('/api/user/profile-stats').then(r => r.json()).then(d => setProfileData(d)).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/organizer/favorites-stats').then(r => r.json()).then(d => setFavStats(d)).catch(() => {});
  }, []);

  const userName = session?.user ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'Пользователь' : 'Пользователь';
  const isOrganizer = (session?.user?.organizationIds?.length ?? 0) > 0;

  if (loading) {
    return (
      <PageShell>
        <div className="pf-page">
          <PageSpinner text="Загружаем профиль..." />
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

  return (
    <PageShell>
      {selectedChallenge && (
        <ChallengeModal challenge={selectedChallenge} onClose={() => setSelectedChallenge(null)} />
      )}

      <div className="pf-page">
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

        {/* Bio */}
        <div className="pf-card">
          <div className="pf-card-header">
            <h3 className="pf-card-title">О себе</h3>
            <button className="pf-btn pf-btn--ghost" onClick={() => setEditOpen(true)}>
              <Edit3 size={14} /> Редактировать
            </button>
          </div>
          {data.bio ? (
            <p className="pf-bio">{data.bio}</p>
          ) : (
            <p className="pf-bio pf-bio--empty">Расскажите о себе — чего вы хотите достичь, какие у вас интересы</p>
          )}
        </div>

        {/* Stats */}
        <StatsGrid
          activeChallenges={data.activeChallenges}
          completedChallenges={data.completedChallenges}
          achievements={data.achievements}
          points={data.points}
        />

        {/* Organizer favorites */}
        {favStats?.isOrganizer && favStats.totalFavorites > 0 && (
          <div className="pf-card">
            <div className="pf-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={16} style={{ color: 'var(--primary)' }} />
                <h3 className="pf-card-title" style={{ margin: 0 }}>Избранное в ваших челленджах</h3>
              </div>
              <span className="pf-badge">{favStats.totalFavorites} добавлений</span>
            </div>
            <div className="pf-fav-list">
              {favStats.challenges.filter(c => c.favoritesCount > 0).slice(0, 5).map(c => (
                <div key={c.id} className="pf-fav-item">
                  <span className="pf-fav-title">{c.title}</span>
                  <span className="pf-fav-count">
                    <Heart size={12} fill="var(--primary)" color="var(--primary)" />
                    {c.favoritesCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="pf-tabs">
          <button className={`pf-tab ${tab === 'overview' ? 'pf-tab--active' : ''}`} onClick={() => setTab('overview')}>
            <Target size={14} /> Обзор
          </button>
          <button className={`pf-tab ${tab === 'settings' ? 'pf-tab--active' : ''}`} onClick={() => setTab('settings')}>
            <Settings size={14} /> Настройки
          </button>
        </div>

        {tab === 'overview' && (
          <div className="pf-tab-content">
            <div className="pf-grid">
              <div className="pf-grid-col">
                <ActivityCalendar days={data.calendar} />
                <AchievementShowcase count={data.achievements} />
              </div>
              <div className="pf-grid-col">
                <ActivityFeed activities={data.activity} onChallengeClick={handleChallengeClick} />
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="pf-tab-content">
            <div className="pf-settings-list">
              <div className="pf-setting">
                <div className="pf-setting-icon" style={{ background: 'oklch(0.897 0.196 126.665 / 0.15)', color: 'oklch(0.453 0.124 130.933)' }}><Bell size={18} /></div>
                <div className="pf-setting-body"><h4>Уведомления</h4><p>Управление уведомлениями</p></div>
              </div>
              <div className="pf-setting">
                <div className="pf-setting-icon" style={{ background: 'oklch(0.525 0.223 3.958 / 0.1)', color: 'var(--primary)' }}><Shield size={18} /></div>
                <div className="pf-setting-body"><h4>Безопасность</h4><p>Пароль, двухфакторная аутентификация</p></div>
              </div>
              <Link href="/dashboard/subscription" className="pf-setting">
                <div className="pf-setting-icon" style={{ background: 'oklch(0.648 0.2 131.684 / 0.1)', color: 'oklch(0.648 0.2 131.684)' }}><CreditCard size={18} /></div>
                <div className="pf-setting-body"><h4>Подписка</h4><p>Управление тарифом и оплатой</p></div>
              </Link>
              <div className="pf-setting">
                <div className="pf-setting-icon" style={{ background: 'oklch(0.768 0.233 130.85 / 0.1)', color: 'oklch(0.768 0.233 130.85)' }}><Eye size={18} /></div>
                <div className="pf-setting-body"><h4>Приватность</h4><p>Видимость профиля</p></div>
              </div>
              <div className="pf-setting">
                <div className="pf-setting-icon" style={{ background: 'oklch(0.525 0.223 3.958 / 0.08)', color: 'var(--primary)' }}><Heart size={18} /></div>
                <div className="pf-setting-body"><h4>Избранное</h4><p>Сохранённые челенджи</p></div>
              </div>
            </div>
            <div className="pf-danger">
              <form action={logoutAction}>
                <button type="submit" className="pf-btn pf-btn--danger"><LogOut size={16} /> Выйти из аккаунта</button>
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
        onSave={refetchProfile}
      />

      <style>{css}</style>
    </PageShell>
  );
}

const css = `
  .pf-page {
    max-width: 900px; margin: 0 auto;
    padding: 20px clamp(12px, 3vw, 24px) 60px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* Card */
  .pf-card {
    background: var(--card, #fff); border: 1px solid var(--border, #e5e5e5);
    border-radius: var(--radius, 0); padding: 20px 24px;
  }
  .pf-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .pf-card-title {
    font-size: 15px; font-weight: 700; margin: 0;
    color: var(--foreground, #1c1917);
  }
  .pf-bio { font-size: 14px; color: var(--muted-foreground, #78716c); line-height: 1.6; margin: 0; }
  .pf-bio--empty { font-style: italic; color: var(--muted-foreground, #78716c); opacity: 0.6; }

  /* Badge */
  .pf-badge {
    padding: 3px 10px; border-radius: 99px;
    background: var(--primary, #e76f51); color: var(--primary-foreground, #fff);
    font-size: 11px; font-weight: 700;
  }

  /* Tabs */
  .pf-tabs { display: flex; gap: 6px; }
  .pf-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 18px; border-radius: var(--radius, 0);
    border: 1px solid var(--border, #e5e5e5);
    background: var(--card, #fff); color: var(--muted-foreground, #78716c);
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: all 0.15s;
  }
  .pf-tab:hover { border-color: var(--primary, #e76f51); color: var(--primary, #e76f51); }
  .pf-tab--active {
    background: var(--primary, #e76f51); border-color: var(--primary, #e76f51);
    color: var(--primary-foreground, #fff);
  }

  .pf-tab-content { animation: pfFade 0.3s ease; }
  @keyframes pfFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

  .pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pf-grid-col { display: flex; flex-direction: column; gap: 16px; }

  /* Settings */
  .pf-settings-list { display: flex; flex-direction: column; gap: 8px; }
  .pf-setting {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px; border-radius: var(--radius, 0);
    background: var(--card, #fff); border: 1px solid var(--border, #e5e5e5);
    cursor: pointer; transition: all 0.15s;
    text-decoration: none; color: inherit;
  }
  .pf-setting:hover { box-shadow: 0 2px 8px oklch(0 0 0 / 0.05); transform: translateX(4px); }
  .pf-setting-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
  }
  .pf-setting-body h4 { font-size: 14px; font-weight: 700; color: var(--foreground, #1c1917); margin: 0; }
  .pf-setting-body p { font-size: 12px; color: var(--muted-foreground, #78716c); margin: 2px 0 0; }

  .pf-danger { margin-top: 12px; padding-top: 16px; border-top: 1px solid var(--border, #e5e5e5); }

  /* Buttons */
  .pf-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius, 0);
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: all 0.15s; border: none;
  }
  .pf-btn--ghost {
    background: transparent; border: 1px solid var(--border, #e5e5e5);
    color: var(--muted-foreground, #78716c);
  }
  .pf-btn--ghost:hover { border-color: var(--primary, #e76f51); color: var(--primary, #e76f51); }
  .pf-btn--danger {
    background: oklch(0.577 0.245 27.325 / 0.08); border: 1px solid oklch(0.577 0.245 27.325 / 0.2);
    color: oklch(0.577 0.245 27.325);
  }
  .pf-btn--danger:hover { background: oklch(0.577 0.245 27.325 / 0.15); }

  /* Favorites */
  .pf-fav-list { display: flex; flex-direction: column; gap: 6px; }
  .pf-fav-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px; border-radius: var(--radius, 0);
    background: var(--muted, #f5f5f4); transition: background 0.15s;
  }
  .pf-fav-item:hover { background: var(--accent, #f5f5f4); }
  .pf-fav-title { font-size: 13px; font-weight: 600; color: var(--foreground, #1c1917); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pf-fav-count {
    display: flex; align-items: center; gap: 4px;
    font-size: 13px; font-weight: 800; color: var(--primary, #e76f51); flex-shrink: 0;
  }

  @media (max-width: 768px) { .pf-grid { grid-template-columns: 1fr; } }
`;
