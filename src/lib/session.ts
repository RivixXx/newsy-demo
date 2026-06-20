import { createHmac, timingSafeEqual } from 'node:crypto';

import { cookies } from 'next/headers';

import type { AuthSession } from './auth';

const SESSION_COOKIE_NAME = 'newsy_session';
const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24 * 7;

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET?.trim() || 'newsy-development-secret';
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionCookieValue(session: AuthSession): string {
  const payload = encode(
    JSON.stringify({
      ...session,
      issuedAt: new Date().toISOString()
    })
  );
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function parseSessionCookieValue(value: string): AuthSession | null {
  const [payload, signature] = value.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as AuthSession & { issuedAt?: string };
    if (!parsed.user?.id || !parsed.expiresAt) {
      return null;
    }

    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return null;
    }

    return {
      user: parsed.user,
      expiresAt: parsed.expiresAt
    };
  } catch {
    return null;
  }
}

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  return parseSessionCookieValue(raw);
}

export async function setAuthSession(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionCookieValue(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(Date.now() + SESSION_LIFETIME_MS)
  });
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0)
  });
}
