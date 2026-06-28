'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export interface CreateChallengeInput {
  title: string;
  description: string;
  category: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  entryFee: number;
  isCooperative: boolean;
  rewardTitle: string;
  rewardDescription: string;
  steps: {
    type: string;
    title: string;
    description: string;
    points: number;
    options?: string[];
    correctIndex?: number;
    location?: string;
  }[];
}

function isRedirect(err: unknown): boolean {
  return err instanceof Error && typeof (err as any).digest === 'string' && (err as any).digest.startsWith('NEXT_REDIRECT');
}

export async function createChallengeAction(input: CreateChallengeInput) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return { error: 'Необходима авторизация' };
  }

  if (!input.title?.trim()) {
    return { error: 'Введите название челенджа' };
  }

  if (!input.steps || input.steps.length === 0) {
    return { error: 'Добавьте хотя бы один этап' };
  }

  try {
    // Get or create organizer for this user
    let organizer = await prisma.organizer.findFirst({
      where: { members: { some: { userId: session.user.id } } },
    });

    if (!organizer) {
      // Use default NEWSY organizer
      organizer = await prisma.organizer.findFirst({
        where: { name: 'NEWSY' },
      });
    }

    if (!organizer) {
      return { error: 'Организатор не найден' };
    }

    const challenge = await prisma.challenge.create({
      data: {
        organizerId: organizer.id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: input.category || null,
        isCooperative: input.isCooperative,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        publishPrice: 0,
        status: 'DRAFT',
        steps: {
          create: input.steps.map((s, i) => ({
            title: s.title || `Этап ${i + 1}`,
            description: s.description || null,
            order: i,
            type: s.type,
            rewardPoints: s.points || 0,
            ...(s.options ? { config: { options: s.options, correctIndex: s.correctIndex } } : s.location ? { config: { location: s.location } } : {}),
          })),
        },
        media: input.coverImage ? {
          create: {
            type: 'IMAGE',
            url: input.coverImage,
            sortOrder: 0,
          },
        } : undefined,
      },
      include: { steps: true },
    });

    return { success: true, challengeId: challenge.id };
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error('Create challenge error:', error);
    return { error: error instanceof Error ? error.message : 'Ошибка создания челенджа' };
  }
}
