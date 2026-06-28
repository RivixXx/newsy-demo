import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { deletedAt: null },
      include: {
        organizer: { select: { name: true } },
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { select: { rewardPoints: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = challenges.map((c) => ({
      id: c.id,
      title: c.title,
      organizer: c.organizer.name,
      category: c.category || 'Другое',
      imageUrl: c.media[0]?.url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
      participantsCount: 0,
      maxParticipants: 100,
      isJoined: false,
      badges: c.status === 'PUBLISHED' ? [] : ['draft'],
      isRecommended: false,
      achievement: c.steps[0]?.rewardPoints ? `${c.steps[0].rewardPoints} баллов` : 'Участие',
      reward: 'Награда',
      location: 'Онлайн',
      endDate: c.endDate ? new Date(c.endDate).toLocaleDateString('ru-RU') : 'Бессрочно',
      description: c.description || '',
      requirements: '',
      refundPolicy: '',
      isDemo: false,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
