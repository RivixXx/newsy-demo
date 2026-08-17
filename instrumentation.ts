import * as Sentry from '@sentry/nextjs';

export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    environment: process.env.NODE_ENV,
    enabled: Boolean(process.env.SENTRY_DSN),
    ignoreErrors: ['NEXT_NOT_FOUND', 'NEXT_REDIRECT'],
  });
}

export const onRequestError = Sentry.captureRequestError;
