import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const BASE_URL = 'https://chillenge-russia.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];

  try {
    const challenges = await prisma.challenge.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      select: { updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const challengePages: MetadataRoute.Sitemap = challenges.map(c => ({
      url: `${BASE_URL}/challenges/${c.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...challengePages];
  } catch {
    return staticPages;
  }
}
