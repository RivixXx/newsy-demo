import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { withErrorHandler, withParamsValidation, successResponse, errorResponse } from '@/lib/api-response';
import { commonSchemas } from '@/lib/validation';
import { z } from 'zod';
import { combineDateAndTime, formatDateRu, formatDateTimeISO, computeOverallStatus } from '@/lib/date-utils';
import { getCached, setCache, cacheKeys, CACHE_TTL } from '@/lib/cache';
import { normalizeBrand } from '@/lib/brand';

const STEP_TYPES: Record<string, string> = {
  action: 'ДЕЙСТВИЕ',
  photo: 'ФОТО',
  geo: 'ГЕО',
  question: 'ВОПРОС',
  survey: 'ОПРОС',
};

const paramsSchema = z.object({
  id: commonSchemas.uuid,
});

async function handleGet(
  _req: NextRequest,
  params: z.infer<typeof paramsSchema>,
  context: { params: Promise<Record<string, string>> }
) {
  const { id } = params;

  const cacheKey = cacheKeys.challengeDetail(id);
  const cached = await getCached<ReturnType<typeof buildResponse>>(cacheKey);
  if (cached) {
    return successResponse(cached);
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id, deletedAt: null, status: 'PUBLISHED' },
    include: {
      organizer: { select: { name: true } },
      media: { orderBy: { sortOrder: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
      _count: { select: { participations: true } },
    },
  });

  if (!challenge) {
    return errorResponse('Челлендж не найден', 404);
  }

  const session = await getCurrentAuthSession();
  const userId = session?.user?.id;

  let isJoined = false;
  let userProgress: {
    id: string;
    stepProgress: { stepId: string; status: string; completedAt: Date | null }[];
  } | null = null;

  if (userId) {
    userProgress = await prisma.userProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId: id } },
      include: {
        stepProgress: { select: { stepId: true, status: true, completedAt: true } },
      },
    });
    isJoined = !!userProgress;
  }

  const now = new Date();
  const hasStarted = !challenge.startDate || now >= (combineDateAndTime(challenge.startDate, challenge.startTime) ?? new Date(0));

  const stages = challenge.steps.map((step, idx) => {
    const stepProg = userProgress?.stepProgress.find((sp) => sp.stepId === step.id);
    let status: 'pending' | 'active' | 'completed' = 'pending';

    if (stepProg?.status === 'COMPLETED') {
      status = 'completed';
    } else if (isJoined && hasStarted) {
      const prevDone = idx === 0 || userProgress?.stepProgress.some(
        (sp) => sp.stepId === challenge.steps[idx - 1]?.id && sp.status === 'COMPLETED'
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
      config: step.config ?? null,
    };
  });

  const startMoment = challenge.startDate ? combineDateAndTime(challenge.startDate, challenge.startTime) : null;
  const endMoment = challenge.endDate ? new Date(challenge.endDate) : null;
  const overallStatus = computeOverallStatus(challenge.startDate, challenge.endDate, challenge.startTime);

  const response = buildResponse(challenge, userProgress, isJoined, startMoment, endMoment, overallStatus, now);
  
  await setCache(cacheKey, response, CACHE_TTL.medium);

  return successResponse(response);
}

function buildResponse(
  challenge: {
    id: string;
    title: string;
    organizer: { name: string } | null;
    category: string | null;
    media: { id: string; url: string; type: string; altText: string | null }[];
    steps: { id: string; rewardPoints: number }[];
    _count: { participations: number };
    maxParticipants: number | null;
    endDate: Date | null;
    startDate: Date | null;
    startTime: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    description: string | null;
  },
  userProgress: { stepProgress: { stepId: string; status: string; completedAt: Date | null }[] } | null,
  isJoined: boolean,
  startMoment: Date | null,
  endMoment: Date | null,
  overallStatus: 'registration' | 'active' | 'completed',
  now: Date
) {
  return {
    id: challenge.id,
    title: challenge.title,
    organizer: normalizeBrand(challenge.organizer?.name ?? 'Неизвестный организатор'),
    category: challenge.category || 'Другое',
    imageUrl: challenge.media[0]?.url || '',
    participantsCount: challenge._count.participations,
    maxParticipants: challenge.maxParticipants ?? null,
    endDate: formatDateRu(challenge.endDate),
    startDate: formatDateTimeISO(startMoment),
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
    stages: [], // Will be populated by caller
    media: challenge.media.map(m => ({ id: m.id, url: m.url, type: m.type, altText: m.altText })),
    galleryPhotos: [],
  };
}

export const GET = withErrorHandler(
  withParamsValidation(paramsSchema, handleGet)
);
