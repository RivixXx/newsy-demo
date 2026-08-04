export interface CatalogChallenge {
  id: string;
  title: string;
  organizer: string;
  category: string;
  imageUrl: string;
  participantsCount: number;
  maxParticipants: number;
  isJoined: boolean;
  badges: string[];
  isRecommended: boolean;
  achievement: string;
  reward: string;
  location: string;
  region?: string | null;
  latitude?: number;
  longitude?: number;
  endDate: string;
  startDate?: string | null;
  startTime?: string | null;
  description: string;
  requirements: string;
  refundPolicy: string;
  isDemo?: boolean;
}

export function getChallengeById(id: string): CatalogChallenge | undefined {
  return undefined;
}

function combineDateAndTime(date: Date, time?: string | null): Date {
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(':').map(Number);
    if (!isNaN(h)) d.setHours(h, m || 0, 0, 0);
  }
  return d;
}

export function getChallengeById(id: string): CatalogChallenge | undefined {
  return MOCK_CHALLENGES.find(c => c.id === id);
}

export async function getChallengeFromDb(id: string): Promise<CatalogChallenge | null> {
  try {
    const [{ prisma }, { unstable_cache }] = await Promise.all([
      import('@/lib/db'),
      import('next/cache'),
    ]);

    const cachedFn = unstable_cache(
      async (challengeId: string) => {
        return prisma.challenge.findUnique({
          where: { id: challengeId, deletedAt: null },
          include: {
            organizer: { select: { name: true } },
            media: { orderBy: { sortOrder: 'asc' }, take: 1 },
            steps: { select: { title: true, description: true, type: true, rewardPoints: true, config: true, order: true }, orderBy: { order: 'asc' } },
            _count: { select: { participations: true } },
          },
        });
      },
      ['challenge-db'],
      { revalidate: 30 }
    );

    const challenge = await cachedFn(id);

    if (!challenge) return null;

    const CATEGORIES: Record<string, string> = {
      sport: 'Спорт', education: 'Обучение', quest: 'Квесты', art: 'Искусство', tech: 'Технологии',
    };

    return {
      id: challenge.id,
      title: challenge.title,
      organizer: challenge.organizer.name,
      category: challenge.category || 'Другое',
      imageUrl: challenge.media[0]?.url || '/images/challenge-placeholder.svg',
      participantsCount: challenge._count.participations,
      maxParticipants: 100,
      isJoined: false,
      badges: challenge.status === 'PUBLISHED' ? [] : ['draft'],
      isRecommended: false,
      achievement: challenge.steps[0]?.rewardPoints ? `${challenge.steps[0].rewardPoints} баллов` : 'Участие',
      reward: 'Награда',
      location: challenge.address || 'Онлайн',
      region: challenge.region || null,
      latitude: challenge.latitude ?? undefined,
      longitude: challenge.longitude ?? undefined,
      endDate: challenge.endDate ? new Date(challenge.endDate).toLocaleDateString('ru-RU') : 'Бессрочно',
      startDate: challenge.startDate ? combineDateAndTime(challenge.startDate, challenge.startTime).toISOString() : null,
      startTime: challenge.startTime ?? null,
      description: challenge.description || '',
      requirements: '',
      refundPolicy: '',
      isDemo: false,
    };
  } catch {
    return null;
  }
}
