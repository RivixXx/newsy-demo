import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

const LEVELS = [
  { level: 1, name: 'Новичок', xp: 0, color: '#94a3b8' },
  { level: 2, name: 'Участник', xp: 100, color: '#60a5fa' },
  { level: 3, name: 'Боец', xp: 300, color: '#34d399' },
  { level: 4, name: 'Герой', xp: 600, color: '#a78bfa' },
  { level: 5, name: 'Чемпион', xp: 1000, color: '#fbbf24' },
  { level: 6, name: 'Легенда', xp: 1500, color: '#f97316' },
  { level: 7, name: 'Мастер', xp: 2500, color: '#ef4444' },
  { level: 8, name: 'Элита', xp: 4000, color: '#ec4899' },
  { level: 9, name: 'Титан', xp: 6000, color: '#8b5cf6' },
  { level: 10, name: 'Бессмертный', xp: 9000, color: '#FF385C' },
];

function getLevel(points: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }
  const xpInLevel = points - current.xp;
  const xpNeeded = next.xp - current.xp;
  const progress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
  return { ...current, xpInLevel, xpNeeded, progress, nextLevel: next };
}

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, rating: true, createdAt: true, firstName: true, lastName: true, email: true },
    });

    const activeParticipations = await prisma.userProgress.count({
      where: { userId, status: 'IN_PROGRESS' },
    });

    const completedParticipations = await prisma.userProgress.count({
      where: { userId, status: 'COMPLETED' },
    });

    const achievements = await prisma.userAchievement.count({
      where: { userId },
    });

    const totalPoints = user?.points || 0;
    const levelInfo = getLevel(totalPoints);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const streak = await calculateStreak(userId);

    const recentActivity = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        challenge: { select: { id: true, title: true, category: true } },
        stepProgress: { select: { status: true, pointsEarned: true, completedAt: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const activity = recentActivity.map(p => {
      const completedSteps = p.stepProgress.filter(sp => sp.status === 'COMPLETED');
      const lastStep = completedSteps[completedSteps.length - 1];
      const points = completedSteps.reduce((sum, sp) => sum + (sp.pointsEarned || 0), 0);

      let action = 'Присоединился к челленджу';
      let icon = 'join';
      if (p.status === 'COMPLETED') {
        action = 'Завершил челлендж';
        icon = 'trophy';
      } else if (lastStep) {
        action = `Выполнил этап «${p.challenge.title}»`;
        icon = 'check';
      }

      return {
        id: p.id,
        challengeId: p.challenge.id,
        challengeTitle: p.challenge.title,
        category: p.challenge.category || 'Другое',
        action,
        icon,
        points,
        date: (lastStep?.completedAt || p.updatedAt).toISOString(),
      };
    });

    const calendarDays = await getActivityCalendar(userId);

    return NextResponse.json({
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Пользователь',
      email: user?.email || '',
      points: totalPoints,
      level: levelInfo,
      streak,
      activeChallenges: activeParticipations,
      completedChallenges: completedParticipations,
      achievements,
      rating: user?.rating || 0,
      memberSince: user?.createdAt.toISOString() || new Date().toISOString(),
      activity,
      calendar: calendarDays,
    });
  } catch (error: any) {
    console.error('Profile stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function calculateStreak(userId: string): Promise<number> {
  const completions = await prisma.stepProgress.findMany({
    where: { userProgress: { userId }, status: 'COMPLETED', completedAt: { not: null } },
    select: { completedAt: true },
    orderBy: { completedAt: 'desc' },
    take: 60,
  });

  if (completions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = completions.map(c => {
    const d = new Date(c.completedAt!);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    expected.setHours(0, 0, 0, 0);

    if (uniqueDates[i] === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function getActivityCalendar(userId: string): Promise<{ date: string; count: number }[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

  const completions = await prisma.stepProgress.findMany({
    where: {
      userProgress: { userId },
      status: 'COMPLETED',
      completedAt: { gte: thirtyDaysAgo },
    },
    select: { completedAt: true },
  });

  const counts: Record<string, number> = {};
  completions.forEach(c => {
    const date = new Date(c.completedAt!).toISOString().split('T')[0];
    counts[date] = (counts[date] || 0) + 1;
  });

  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({ date: dateStr, count: counts[dateStr] || 0 });
  }

  return days;
}
