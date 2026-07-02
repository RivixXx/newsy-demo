import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { z } from 'zod';

const completeStepSchema = z.object({
  stepId: z.string().uuid('stepId должен быть UUID'),
  submission: z.any().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const parsed = completeStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { stepId, submission } = parsed.data;

    if (!stepId) {
      return NextResponse.json({ error: 'stepId обязателен' }, { status: 400 });
    }

    const progress = await prisma.userProgress.findUnique({
      where: { userId_challengeId: { userId: session.user.id, challengeId: id } },
    });

    if (!progress) {
      return NextResponse.json({ error: 'Вы не участвуете в этом челлендже' }, { status: 400 });
    }

    const step = await prisma.step.findUnique({ where: { id: stepId } });
    if (!step) {
      return NextResponse.json({ error: 'Этап не найден' }, { status: 404 });
    }

    const existingProgress = await prisma.stepProgress.findUnique({
      where: { userProgressId_stepId: { userProgressId: progress.id, stepId } },
    });

    if (existingProgress && existingProgress.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Этап уже завершён' });
    }

    await prisma.stepProgress.upsert({
      where: { userProgressId_stepId: { userProgressId: progress.id, stepId } },
      update: { status: 'COMPLETED', completedAt: new Date(), submission, pointsEarned: step.rewardPoints },
      create: { userProgressId: progress.id, stepId, status: 'COMPLETED', completedAt: new Date(), submission, pointsEarned: step.rewardPoints },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: step.rewardPoints } },
    });

    const allSteps = await prisma.step.findMany({ where: { challengeId: id }, orderBy: { order: 'asc' } });
    const completedSteps = await prisma.stepProgress.count({
      where: { userProgressId: progress.id, status: 'COMPLETED' },
    });

    if (completedSteps >= allSteps.length) {
      await prisma.userProgress.update({
        where: { id: progress.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'REWARD_EARNED',
          title: 'Челлендж завершён!',
          body: `Вы завершили все этапы челленджа и заработали ${step.rewardPoints} баллов.`,
        },
      });
    }

    return NextResponse.json({ success: true, pointsEarned: step.rewardPoints, completedSteps, totalSteps: allSteps.length });
  } catch (error: any) {
    console.error('Complete step error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
