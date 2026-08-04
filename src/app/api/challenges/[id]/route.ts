import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

const STEP_TYPES: Record<string, string> = {
  action: 'ДЕЙСТВИЕ',
  photo: 'ФОТО',
  geo: 'ГЕО',
  question: 'ВОПРОС',
  survey: 'ОПРОС',
};

function combineDateAndTime(date: Date, time?: string | null): Date {
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(':').map(Number);
    if (!isNaN(h)) d.setHours(h, m || 0, 0, 0);
  }
  return d;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id, deletedAt: null, status: 'PUBLISHED' },
      include: {
        organizer: { select: { name: true } },
        media: { orderBy: { sortOrder: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        participations: {
          where: {},
          take: 20,
          skip: 0,
          include: {
            stepProgress: {
              select: { submission: true, stepId: true, status: true },
            },
          },
        },
        _count: { select: { participations: true } },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Челлендж не найден' }, { status: 404 });
    }

    const session = await getCurrentAuthSession();
    const userId = session?.user?.id;

    let isJoined = false;
    let userProgress: any = null;

    if (userId) {
      userProgress = await prisma.userProgress.findUnique({
        where: { userId_challengeId: { userId, challengeId: id } },
        include: {
          stepProgress: { select: { stepId: true, status: true, completedAt: true } },
        },
      });
      isJoined = !!userProgress;
    }

    const stages = challenge.steps.map((step, idx) => {
      const stepProg = userProgress?.stepProgress.find((sp: any) => sp.stepId === step.id);
      let status: 'pending' | 'active' | 'completed' = 'pending';

      // Если ЧИ ещё не началось — все этапы заблокированы
      const now = new Date();
      const hasStarted = !challenge.startDate || now >= combineDateAndTime(challenge.startDate, challenge.startTime);

      if (stepProg?.status === 'COMPLETED') {
        status = 'completed';
      } else if (isJoined && hasStarted) {
        const prevDone = idx === 0 || userProgress?.stepProgress.some(
          (sp: any) => sp.stepId === challenge.steps[idx - 1]?.id && sp.status === 'COMPLETED'
        );
        if (prevDone) status = 'active';
      }

      return {
        id: step.id,
        title: step.title,
        description: step.description || '',
        type: STEP_TYPES[step.type] || step.type.toUpperCase(),
        status,
        rewardPoints: step.rewardPoints,
        config: step.config || null,
      };
    });

    // Собираем фото из submissions (ФОТО этапы)
    const galleryPhotos: string[] = [];
    for (const p of challenge.participations) {
      for (const sp of p.stepProgress) {
        if (sp.status === 'APPROVED' && sp.submission && typeof sp.submission === 'string' && sp.submission.startsWith('http')) {
          galleryPhotos.push(sp.submission);
        }
      }
    }

    // Compute overall status
    const now = new Date();
    const startMoment = challenge.startDate ? combineDateAndTime(challenge.startDate, challenge.startTime) : null;
    const endMoment = challenge.endDate ? new Date(challenge.endDate) : null;
    let overallStatus: 'registration' | 'active' | 'completed' = 'active';
    if (startMoment && now < startMoment) {
      overallStatus = 'registration';
    } else if (endMoment && now > endMoment) {
      overallStatus = 'completed';
    }

    return NextResponse.json({
      id: challenge.id,
      title: challenge.title,
      organizer: challenge.organizer.name,
      category: challenge.category || 'Другое',
      imageUrl: challenge.media[0]?.url || '',
      participantsCount: challenge._count.participations,
      maxParticipants: challenge.maxParticipants ?? null,
      endDate: challenge.endDate ? new Date(challenge.endDate).toLocaleDateString('ru-RU') : 'Бессрочно',
      startDate: startMoment ? startMoment.toISOString() : null,
      overallStatus,
      location: challenge.address || 'Онлайн',
      latitude: challenge.latitude,
      longitude: challenge.longitude,
      achievement: challenge.steps[0]?.rewardPoints ? `${challenge.steps[0].rewardPoints} баллов` : 'Участие',
      reward: challenge.steps[0]?.rewardPoints ? `${challenge.steps[0].rewardPoints} баллов` : 'Участие',
      description: challenge.description || '',
      requirements: challenge.description || '',
      refundPolicy: '',
      isJoined,
      stages,
      media: challenge.media.map(m => ({ id: m.id, url: m.url, type: m.type, altText: m.altText })),
      galleryPhotos,
    });
  } catch (error: any) {
    console.error('Challenge detail error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
