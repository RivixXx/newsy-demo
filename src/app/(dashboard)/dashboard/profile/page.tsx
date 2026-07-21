'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '@/shared/components/page-shell';
import { PageSpinner } from '@/shared/components/spinner';
import { Settings, LogOut, CreditCard, Shield, Eye, Bell, Heart, Edit3, Crown, Trophy, Target } from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';
import { useSession } from '@/shared/components/session-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ProfileEditModal } from './components/profile-edit-modal';
import { ActivityCalendar } from './components/activity-calendar';
import { AchievementShowcase } from './components/achievement-showcase';
import { ActivityFeed } from './components/activity-feed';
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
        <div className="flex items-center justify-center min-h-[60vh]">
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

  const initials = data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <PageShell>
      {selectedChallenge && (
        <ChallengeModal challenge={selectedChallenge} onClose={() => setSelectedChallenge(null)} />
      )}

      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">

        {/* ═══════ PROFILE HEADER ═══════ */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* Mobile: stacked layout */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/20 mx-auto sm:mx-0">
                <AvatarImage src={data.avatarUrl} alt={data.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{data.name}</h1>
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Ур. {data.level.level}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{data.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  {data.gender && <span>{data.gender === 'male' ? 'Мужчина' : 'Женщина'}</span>}
                  {isOrganizer && <Badge variant="outline" className="text-xs">Организатор</Badge>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="self-start hidden sm:flex">
                <Edit3 className="h-4 w-4" />
                Редактировать
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="sm:hidden w-full">
                <Edit3 className="h-4 w-4" />
                Редактировать
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6">
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/30">
                <div className="text-xl sm:text-2xl font-bold">{data.points}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Очков</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/30">
                <div className="text-xl sm:text-2xl font-bold">{data.streak}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Серия дней</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/30">
                <div className="text-xl sm:text-2xl font-bold">{data.completedChallenges}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Завершено</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/30">
                <div className="text-xl sm:text-2xl font-bold">{data.achievements}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Достижений</div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-4 sm:mt-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{data.level.name}</span>
                <span className="font-medium">{data.level.xp}/{data.level.xpNeeded} XP</span>
              </div>
              <Progress value={data.level.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* ═══════ BIO ═══════ */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-2">О себе</h3>
            {data.bio ? (
              <p className="text-sm text-muted-foreground">{data.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Расскажите о себе — чего вы хотите достичь</p>
            )}
          </CardContent>
        </Card>

        {/* ═══════ ORGANIZER FAVORITES ═══════ */}
        {favStats?.isOrganizer && favStats.totalFavorites > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Избранное в ваших челленджах
                </h3>
                <Badge variant="secondary">{favStats.totalFavorites}</Badge>
              </div>
              <div className="space-y-2">
                {favStats.challenges.filter(c => c.favoritesCount > 0).slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium truncate">{c.title}</span>
                    <span className="text-sm font-bold text-primary flex items-center gap-1 flex-shrink-0">
                      <Heart className="h-3 w-3 fill-primary" />
                      {c.favoritesCount}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════ TABS ═══════ */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1 gap-1.5 text-xs sm:text-sm">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 gap-1.5 text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* ═══════ OVERVIEW TAB ═══════ */}
          <TabsContent value="overview" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-sm font-semibold mb-4">Активность</h3>
                    <ActivityCalendar days={data.calendar} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-sm font-semibold mb-4">Последняя активность</h3>
                    <ActivityFeed activities={data.activity} onChallengeClick={handleChallengeClick} />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-sm font-semibold mb-4">Достижения</h3>
                    <AchievementShowcase count={data.achievements} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═══════ SETTINGS TAB ═══════ */}
          <TabsContent value="settings" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-4 sm:p-6 space-y-2">
                  <SettingRow icon={<Bell className="h-5 w-5 text-primary" />} title="Уведомления" desc="Управление уведомлениями" />
                  <Separator />
                  <SettingRow icon={<Shield className="h-5 w-5 text-primary" />} title="Безопасность" desc="Пароль, двухфакторная аутентификация" />
                  <Separator />
                  <Link href="/dashboard/subscription" className="block">
                    <SettingRow icon={<CreditCard className="h-5 w-5 text-primary" />} title="Подписка" desc="Управление тарифом и оплатой" />
                  </Link>
                  <Separator />
                  <SettingRow icon={<Eye className="h-5 w-5 text-primary" />} title="Приватность" desc="Видимость профиля" />
                  <Separator />
                  <SettingRow icon={<Heart className="h-5 w-5 text-primary" />} title="Избранное" desc="Сохранённые челенджи" />
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardContent className="p-4 sm:p-6">
                  <form action={logoutAction}>
                    <Button type="submit" variant="destructive" className="w-full gap-2">
                      <LogOut className="h-4 w-4" />
                      Выйти из аккаунта
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
    </PageShell>
  );
}

function SettingRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
    </div>
  );
}
