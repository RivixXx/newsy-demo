import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getCurrentAuthSession } from '@/lib/session';
import { SessionProvider } from '@/shared/components/session-provider';
import { ToastProvider } from '@/shared/components/toast';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#ff385c',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://chillenge-russia.ru'),
  applicationName: 'NEWSY',
  title: {
    default: 'NEWSY — Платформа челленджей для маркетплейсов',
    template: '%s | NEWSY',
  },
  description: 'Интерактивная платформа челленджей NEWSY. Спорт, обучение, квесты, искусство и технологии. Верифицированные достижения и награды от лучших брендов России.',
  keywords: ['челленджи', 'челлендж', 'достижения', 'награды', 'бренды', 'мероприятия', 'квесты', 'спорт', 'обучение', 'искусство', 'технологии', 'активности', 'геймификация'],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'NEWSY',
    url: 'https://chillenge-russia.ru',
    title: 'NEWSY — Платформа челленджей для маркетплейсов',
    description: 'Превращаем любовь к брендам в достижения. Интерактивные челленджи для бизнеса, блогеров иeveryone.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEWSY — Платформа челленджей',
    description: 'Интерактивная платформа челленджей. Достижения, награды, геймификация.',
  },
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCurrentAuthSession();

  return (
    <html lang="ru">
      <body>
        <SessionProvider session={session}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
