import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

const STEP_TYPES: Record<string, string> = {
  action: 'ДЕЙСТВИЕ',
  photo: 'ФОТО',
  geo: 'ГЕО',
  question: 'ВОПРОС',
};

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
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { orderBy: { order: 'asc' } },
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
      if (stepProg?.status === 'COMPLETED') status = 'completed';
      else if (isJoined && !stepProg) {
        const prevCompleted = idx === 0 || userProgress?.stepProgress.some(
          (sp: any, i: number) => sp.stepId === challenge.steps[idx - 1]?.id && sp.status === 'COMPLETED'
        );
        if (prevCompleted) status = 'active';
      } else if (isJoined && idx === 0 && !stepProg) {
        status = 'active';
      }

      return {
        id: step.id,
        title: step.title,
        description: step.description || '',
        type: STEP_TYPES[step.type] || step.type.toUpperCase(),
        status,
        rewardPoints: step.rewardPoints,
        config: step.config,
      };
    });

    return NextResponse.json({
      id: challenge.id,
      title: challenge.title,
      organizer: challenge.organizer.name,
      category: challenge.category || 'Другое',
      imageUrl: challenge.media[0]?.url || '',
      participantsCount: challenge._count.participations,
      maxParticipants: 100,
      endDate: challenge.endDate ? new Date(challenge.endDate).toLocaleDateString('ru-RU') : 'Бессрочно',
      location: 'Онлайн',
      achievement: challenge.steps[0]?.rewardPoints ? `${challenge.steps[0].rewardPoints} баллов` : 'Участие',
      reward: 'Награда',
      description: challenge.description || '',
      requirements: '',
      refundPolicy: '',
      isJoined,
      stages,
    });
  } catch (error: any) {
    console.error('Challenge detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
