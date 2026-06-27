import type { MetadataRoute } from 'next';
import { MOCK_CHALLENGES } from '@/shared/data/challenges';

const BASE_URL = 'https://chillenge-russia.ru';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];

  const challengePages: MetadataRoute.Sitemap = MOCK_CHALLENGES.map(c => ({
    url: `${BASE_URL}/challenges/${c.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...challengePages];
}
