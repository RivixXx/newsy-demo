import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getCurrentAuthSession } from '@/lib/session';
import { SessionProvider } from '@/shared/components/session-provider';
import { RegionProvider } from '@/shared/components/region-provider';
import { ToastProvider } from '@/shared/components/toast';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: '#ff385c',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://chillenge-russia.ru'),
  applicationName: 'NEWSY',
  title: {
    default: 'NEWSY — Интерактивные челленджи с наградами',
    template: '%s | NEWSY',
  },
  description: 'NEWSY — платформа интерактивных челленджей. Участвуй в спортивных, образовательных и квестовых заданиях, получай достижения и реальные награды от лучших брендов.',
  keywords: ['челленджи', 'челлендж', 'достижения', 'награды', 'бренды', 'мероприятия', 'квесты', 'спорт', 'обучение', 'искусство', 'технологии', 'активности', 'геймификация', 'соревнования', 'задания'],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'NEWSY',
    url: 'https://chillenge-russia.ru',
    title: 'NEWSY — Интерактивные челленджи с наградами',
    description: 'Платформа челленджей для бизнеса, блогеров и каждого. Участвуй, соревнуйся, побеждай.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEWSY — Интерактивные челленджи',
    description: 'Челленджи с достижениями и реальными наградами. Спорт, обучение, квесты, искусство.',
  },
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCurrentAuthSession();

  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body>
        <a href="#main-content" className="skip-link">Перейти к основному содержимому</a>
        <SessionProvider session={session}>
          <RegionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </RegionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
