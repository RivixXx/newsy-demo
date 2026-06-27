import type { Metadata } from 'next';
import { JsonLd } from '@/shared/components/seo-jsonld';

export const metadata: Metadata = {
  title: 'Каталог челленджей — Спорт, Обучение, Квесты, Искусство, Технологии',
  description: 'Найди челлендж для себя на NEWSY. Верифицированные достижения и награды от лучших брендов. Превращаем любовь к брендам в достижения.',
  openGraph: {
    title: 'NEWSY — Каталог челленджей',
    description: 'Платформа челленджей для маркетплейсов. Спорт, обучение, квесты, искусство и технологии.',
    url: 'https://chillenge-russia.ru',
    images: [{ url: '/og-home.png', width: 1200, height: 630 }],
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'NEWSY',
        url: 'https://chillenge-russia.ru',
        description: 'Интерактивная платформа челленджей для маркетплейсов',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://chillenge-russia.ru/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'NEWSY',
        url: 'https://chillenge-russia.ru',
        logo: 'https://chillenge-russia.ru/icon.png',
        description: 'Интерактивная платформа челленджей для маркетплейсов. Верифицированные достижения и награды.',
      }} />
      {children}
    </>
  );
}
