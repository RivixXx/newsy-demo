import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      include: {
        organizer: { select: { name: true } },
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { select: { rewardPoints: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

    const result = challenges.map((c) => {
      const isNew = (now - new Date(c.createdAt).getTime()) < NEW_THRESHOLD_MS;
      return {
        id: c.id,
        title: c.title,
        organizer: c.organizer.name,
        category: c.category || 'Другое',
        imageUrl: c.media[0]?.url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
        participantsCount: 0,
        maxParticipants: 100,
        isJoined: false,
        badges: isNew ? ['new'] : [],
        isRecommended: false,
        achievement: c.steps[0]?.rewardPoints ? `${c.steps[0].rewardPoints} баллов` : 'Участие',
        reward: 'Награда',
        location: 'Онлайн',
        endDate: c.endDate ? new Date(c.endDate).toLocaleDateString('ru-RU') : 'Бессрочно',
        description: c.description || '',
        requirements: '',
        refundPolicy: '',
        isDemo: false,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
