'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <main style={{ padding: 32, fontFamily: 'sans-serif' }}>
          <h1>Что-то пошло не так</h1>
          <p>Обновите страницу или попробуйте ещё раз позднее.</p>
        </main>
      </body>
    </html>
  );
}
