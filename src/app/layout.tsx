import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
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

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
