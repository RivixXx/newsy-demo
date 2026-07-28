import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getCurrentAuthSession } from '@/lib/session';
import { SessionProvider } from '@/shared/components/session-provider';
import { RegionProvider } from '@/shared/components/region-provider';
import { ToastProvider } from '@/shared/components/toast';
import './globals.css';
import { Geist, Unbounded } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const unbounded = Unbounded({subsets:['cyrillic','latin'],variable:'--font-display',display:'swap'});

export const viewport: Viewport = {
  themeColor: '#E11D48',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://chillenge-russia.ru'),
  applicationName: 'ЧИ',
  title: {
    default: 'ЧИ — Интерактивные челленджи с наградами',
    template: '%s | ЧИ',
  },
  description: 'ЧИ — платформа интерактивных челленджей. Участвуй в спортивных, образовательных и квестовых заданиях, получай достижения и реальные награды от лучших брендов.',
  keywords: ['челленджи', 'челлендж', 'достижения', 'награды', 'бренды', 'мероприятия', 'квесты', 'спорт', 'обучение', 'искусство', 'технологии', 'активности', 'геймификация', 'соревнования', 'задания'],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ЧИ',
    url: 'https://chillenge-russia.ru',
    title: 'ЧИ — Интерактивные челленджи с наградами',
    description: 'Платформа челленджей для бизнеса, блогеров и каждого. Участвуй, соревнуйся, побеждай.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ЧИ — Интерактивные челленджи',
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
    <html lang="ru" className={cn("font-sans", geist.variable, unbounded.variable)}>
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
