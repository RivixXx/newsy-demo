import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getCurrentAuthSession } from '@/lib/session';
import { SessionProvider } from '@/shared/components/session-provider';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#ff385c',
};

export const metadata: Metadata = {
  applicationName: 'NEWSY',
  title: 'NEWSY',
  description: 'Платформа интерактивных челенджей NEWSY',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.png'
  },
  openGraph: {
    title: 'NEWSY',
    description: 'Платформа интерактивных челенджей NEWSY'
  }
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
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
