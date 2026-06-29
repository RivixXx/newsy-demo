import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, rating: true, createdAt: true },
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

    const participations = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        challenge: {
          select: { id: true, title: true, category: true, status: true },
        },
        stepProgress: {
          select: { status: true, pointsEarned: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const challengesList = participations.map(p => {
      const totalPoints = p.stepProgress.reduce((sum, sp) => sum + (sp.pointsEarned || 0), 0);
      const completedSteps = p.stepProgress.filter(sp => sp.status === 'COMPLETED').length;
      return {
        id: p.challenge.id,
        title: p.challenge.title,
        category: p.challenge.category || 'Другое',
        status: p.status,
        startedAt: p.startedAt.toISOString(),
        completedAt: p.completedAt?.toISOString() || null,
        points: totalPoints,
        completedSteps,
        totalSteps: p.stepProgress.length,
      };
    });

    return NextResponse.json({
      points: user?.points || 0,
      rating: user?.rating || 0,
      memberSince: user?.createdAt.toISOString() || new Date().toISOString(),
      activeChallenges: activeParticipations,
      completedChallenges: completedParticipations,
      achievements,
      challenges: challengesList,
    });
  } catch (error: any) {
    console.error('Profile stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
