import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { normalizeBrand } from '@/lib/brand';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ recommendations: [] });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Получаем категории, в которых пользователь участвовал
    const userParticipations = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      include: { challenge: { select: { category: true } } },
    });

    const participatedCategories = [...new Set(
      userParticipations.map(p => p.challenge.category).filter((c): c is string => typeof c === 'string')
    )];

    // Получаем ID челленджей, в которых пользователь уже участвует
    const participatedChallengeIds = userParticipations.map(p => p.challengeId);

    // Рекомендации: челленджи из любимых категорий, в которых пользователь ещё не участвует
    let recommendations = await prisma.challenge.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        id: { notIn: participatedChallengeIds },
        ...(participatedCategories.length > 0 && {
          category: { in: participatedCategories },
        }),
      },
      include: {
        organizer: { select: { name: true } },
        _count: { select: { participations: true } },
        media: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Если рекомендаций мало, добавляем популярные
    if (recommendations.length < limit) {
      const popular = await prisma.challenge.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          id: { notIn: [...participatedChallengeIds, ...recommendations.map(r => r.id)] },
        },
        include: {
          organizer: { select: { name: true } },
          _count: { select: { participations: true } },
          media: { take: 1 },
        },
        orderBy: { participations: { _count: 'desc' } },
        take: limit - recommendations.length,
      });
      recommendations = [...recommendations, ...popular];
    }

    return NextResponse.json({
      recommendations: recommendations.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        organizer: normalizeBrand(c.organizer.name),
        participantsCount: c._count.participations,
        imageUrl: c.media?.[0]?.url || '/images/challenge-placeholder.svg',
      })),
    });
  } catch (error) {
    console.error('[recommendations] Error:', error);
    return NextResponse.json({ recommendations: [] });
  }
}
