'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export interface CreateChallengeInput {
  title: string;
  description: string;
  category: string;
  format?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  challengeType?: 'OPEN' | 'CLOSED';
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  startTime?: string;
  endTime?: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  maxParticipants?: number | null;
  entryFee: number;
  isCooperative: boolean;
  requirements?: string;
  minAge?: number | null;
  maxAge?: number | null;
  gender?: string | null;
  cancellationPolicy?: 'FULL_REFUND_24H' | 'FULL_REFUND_7D' | 'NO_REFUND';
  rewardTitle: string;
  rewardDescription: string;
  achievementName?: string;
  selectedAchievements?: string[];
  customAchievement?: { name: string; description: string; icon: string } | null;
  steps: {
    type: string;
    title: string;
    description: string;
    points: number;
    questionType?: string;
    options?: string[];
    correctIndex?: number;
    correctIndices?: number[];
    minLength?: number;
    maxLength?: number;
    ratingMin?: number;
    ratingMax?: number;
    ratingMinLabel?: string;
    ratingMaxLabel?: string;
    location?: string;
    criteria?: string;
    verification?: Record<string, unknown>;
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
    // Get organizer where user is a member
    let organizer = await prisma.organizer.findFirst({
      where: { members: { some: { userId: session.user.id } } },
    });

    if (!organizer) {
      return { error: 'Вы не являетесь участником организации. Обратитесь к администратору.' };
    }

    const challenge = await prisma.challenge.create({
      data: {
        organizerId: organizer.id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: input.category || null,
        format: input.format ?? 'ONLINE',
        challengeType: input.challengeType ?? 'OPEN',
        country: input.country?.trim() || null,
        region: input.region?.trim() || null,
        city: input.city?.trim() || null,
        address: input.address?.trim() || null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        maxParticipants: input.maxParticipants ?? null,
        isCooperative: input.isCooperative,
        entryFee: input.entryFee || 0,
        requirements: input.requirements?.trim() || null,
        minAge: input.minAge ?? null,
        maxAge: input.maxAge ?? null,
        gender: input.gender || null,
        cancellationPolicy: input.cancellationPolicy ?? 'FULL_REFUND_24H',
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        publishPrice: 0,
        status: 'DRAFT',
        steps: {
          create: input.steps.map((s, i) => {
            const config: Record<string, unknown> = {};
            if (s.questionType) { config.questionType = s.questionType; }
            if (s.options) {
              config.options = s.options;
              // Backward compat: без questionType сохраняем как было (single)
              if (!s.questionType || s.questionType === 'single') {
                if (s.correctIndex != null) config.correctIndex = s.correctIndex;
              }
            }
            if (s.questionType === 'multiple' && s.correctIndices) { config.correctIndices = s.correctIndices; }
            if (s.questionType === 'text') {
              if (s.minLength != null) config.minLength = s.minLength;
              if (s.maxLength != null) config.maxLength = s.maxLength;
            }
            if (s.questionType === 'rating') {
              if (s.ratingMin != null) config.ratingMin = s.ratingMin;
              if (s.ratingMax != null) config.ratingMax = s.ratingMax;
              if (s.ratingMinLabel) config.ratingMinLabel = s.ratingMinLabel;
              if (s.ratingMaxLabel) config.ratingMaxLabel = s.ratingMaxLabel;
            }
            if (s.questionType === 'yesno' && s.correctIndex != null) {
              config.correctIndex = s.correctIndex;
              config.options = ['Да', 'Нет'];
            }
            if (s.location) { config.location = s.location; }
            if (s.verification) Object.assign(config, s.verification);
            return {
              title: s.title || `Этап ${i + 1}`,
              description: s.description || null,
              order: i,
              type: s.type,
              criteria: s.criteria || null,
              rewardPoints: s.points || 0,
              config: Object.keys(config).length > 0 ? config as any : undefined,
            };
          }),
        },
        media: input.coverImage
          ? {
              create: {
                type: 'IMAGE',
                url: input.coverImage,
                sortOrder: 0,
              },
            }
          : undefined,
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
