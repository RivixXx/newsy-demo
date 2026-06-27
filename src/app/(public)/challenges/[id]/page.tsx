import type { Metadata } from 'next';
import { PageShell } from '@/shared/components/page-shell';
import { JsonLd } from '@/shared/components/seo-jsonld';
import { getChallengeById } from '@/shared/data/challenges';
import ChallengeDetailContent from './challenge-detail-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    return {
      title: 'Челлендж не найден',
      robots: { index: false },
    };
  }

  return {
    title: `${challenge.title}`,
    description: challenge.description.slice(0, 160),
    keywords: [challenge.category, challenge.organizer, 'челлендж', 'достижение', challenge.achievement],
    openGraph: {
      title: challenge.title,
      description: challenge.description,
      url: `https://chillenge-russia.ru/challenges/${id}`,
      images: [{ url: challenge.imageUrl, width: 1200, height: 630 }],
      type: 'article',
    },
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallengeById(id);

  return (
    <PageShell variant="public">
      {challenge && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: challenge.title,
          description: challenge.description,
          organizer: { '@type': 'Organization', name: challenge.organizer },
          location: { '@type': 'Place', name: challenge.location },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'RUB',
            availability: 'https://schema.org/InStock',
          },
          image: challenge.imageUrl,
        }} />
      )}
      <ChallengeDetailContent challengeId={id} />
    </PageShell>
  );
}
