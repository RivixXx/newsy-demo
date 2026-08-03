import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 60;

function combineDateAndTime(date: Date, time?: string | null): Date {
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(':').map(Number);
    if (!isNaN(h)) d.setHours(h, m || 0, 0, 0);
  }
  return d;
}

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      include: {
        organizer: { select: { name: true } },
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { select: { rewardPoints: true } },
        _count: {
          select: {
            participations: {
              where: { status: { in: ['JOINED', 'IN_PROGRESS', 'COMPLETED'] } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

    const result = challenges.map((c) => {
      const isNew = now - new Date(c.createdAt).getTime() < NEW_THRESHOLD_MS;

      // Определяем статус по датам
      let isActive = false;
      if (c.startDate && c.endDate) {
        isActive = now >= new Date(c.startDate).getTime() && now <= new Date(c.endDate).getTime();
      }

      const badges: string[] = [];
      if (isNew) badges.push('new');
      if (isActive) badges.push('active');

      return {
        id: c.id,
        title: c.title,
        organizer: c.organizer.name,
        category: c.category ?? 'Другое',
        imageUrl:
          c.media[0]?.url ??
          null,
        participantsCount: c._count.participations,
        isCooperative: c.isCooperative,
        badges,
        isRecommended: false,
        achievement:
          c.steps[0]?.rewardPoints ? `${c.steps[0].rewardPoints} баллов` : 'Участие',
        location: c.address || 'Онлайн',
        region: c.region ?? null,
        endDate: c.endDate
          ? new Date(c.endDate).toLocaleDateString('ru-RU')
          : 'Бессрочно',
        startDate: c.startDate
          ? combineDateAndTime(c.startDate, c.startTime).toISOString()
          : null,
        startTime: c.startTime ?? null,
        description: c.description ?? '',
        entryFee: c.entryFee,
        maxParticipants: c.maxParticipants,
        isDemo: false,
      };
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('[challenges/GET] Error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
