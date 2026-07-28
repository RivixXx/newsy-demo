import type { Metadata } from 'next';
import { JsonLd } from '@/shared/components/seo-jsonld';

export const metadata: Metadata = {
  title: 'Челленджи с наградами — Спорт, Обучение, Квесты, Искусство, Технологии',
  description: 'Найди челлендж для себя на ЧИ. Участвуй в заданиях, получай достижения и реальные награды от лучших брендов России.',
  openGraph: {
    title: 'ЧИ — Интерактивные челленджи с наградами',
    description: 'Платформа челленджей для бизнеса и каждого. Спорт, обучение, квесты, искусство.',
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
        name: 'ЧИ',
        url: 'https://chillenge-russia.ru',
        description: 'Платформа интерактивных челленджей с достижениями и наградами',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://chillenge-russia.ru/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ЧИ',
        url: 'https://chillenge-russia.ru',
        logo: 'https://chillenge-russia.ru/icon.png',
        description: 'Платформа интерактивных челленджей для бизнеса, блогеров и каждого.',
      }} />
      {children}
    </>
  );
}
