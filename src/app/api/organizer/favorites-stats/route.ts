import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

// GET /api/organizer/favorites-stats
// Возвращает статистику избранного для всех ЧИ организатора
export async function GET() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  // Находим организатора, к которому привязан пользователь
  const member = await prisma.organizerMember.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    select: { organizerId: true },
  });

  if (!member) {
    return NextResponse.json({
      isOrganizer: false,
      totalFavorites: 0,
      challenges: [],
    });
  }

  // Все ЧИ этого организатора
  const challenges = await prisma.challenge.findMany({
    where: { organizerId: member.organizerId, deletedAt: null },
    select: { id: true, title: true },
  });

  const challengeIds = challenges.map(c => c.id);

  // Считаем избранное для каждого ЧИ
  const favoritesCounts = await prisma.favorite.groupBy({
    by: ['challengeId'],
    where: { challengeId: { in: challengeIds } },
    _count: { id: true },
  });

  const countMap = new Map(favoritesCounts.map(f => [f.challengeId, f._count.id]));
  const totalFavorites = favoritesCounts.reduce((sum, f) => sum + f._count.id, 0);

  const result = challenges.map(c => ({
    id: c.id,
    title: c.title,
    favoritesCount: countMap.get(c.id) || 0,
  })).sort((a, b) => b.favoritesCount - a.favoritesCount);

  return NextResponse.json({
    isOrganizer: true,
    totalFavorites,
    challenges: result,
  });
}
