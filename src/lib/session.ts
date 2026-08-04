import { createHash, createHmac } from 'crypto';
import { timingSafeEqual } from 'crypto';

import { cookies } from 'next/headers';

import type { AuthSession, TwoFactorTempSession, AuthenticatedUser } from './auth';

const SESSION_COOKIE_NAME = '__Host-newsy_session';
const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24 * 7;
const TEMP_TOKEN_LIFETIME_MS = 1000 * 60 * 5; // 5 minutes

function computeFingerprint(ua: string, ip: string): string {
  return createHash('sha256').update(`${ua}:${ip}`).digest('hex').slice(0, 16);
}

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return secret;
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

/**
 * Verifies the HMAC signature of a session payload.
 * Uses Web Crypto API so it works in both Node.js and Edge Runtime (middleware).
 */
export async function verifySessionHMAC(payload: string, signature: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const sig = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlToUint8Array(signature) as BufferSource,
      enc.encode(payload),
    );
    return sig;
  } catch {
    return false;
  }
}

function base64urlToUint8Array(s: string): Uint8Array {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Buffer.from(base64, 'base64');
  return bytes;
}

function createSessionPayload(session: AuthSession, fingerprintValue: string): string {
  const payload = encode(
    JSON.stringify({
      ...session,
      issuedAt: new Date().toISOString(),
      user: {
        ...session.user,
        fingerprint: fingerprintValue,
      },
    })
  );
  return payload;
}

export function createSessionCookieValue(session: AuthSession, fingerprintValue: string): string {
  const payload = createSessionPayload(session, fingerprintValue);
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

/**
 * Parses and verifies a session cookie value.
 * If currentFingerprint is provided, also verifies device fingerprint.
 * Works in both Node.js and Edge Runtime.
 */
export async function parseSessionCookieValue(value: string): Promise<AuthSession | null>;
export async function parseSessionCookieValue(value: string, currentFingerprint: string): Promise<(AuthSession & { fingerprintValid: boolean }) | null>;
export async function parseSessionCookieValue(value: string, currentFingerprint?: string): Promise<(AuthSession | (AuthSession & { fingerprintValid: boolean })) | null> {
  const [payload, signature] = value.split('.');

  if (!payload || !signature) {
    return null;
  }

  if (!await verifySessionHMAC(payload, signature)) {
    return null;
  }

  try {
    const decoded = decode(payload);
    const parsed = JSON.parse(decoded) as AuthenticatedUser & { expiresAt?: string; fingerprint?: string; issuedAt?: string };
    if (!parsed.user?.id || !parsed.expiresAt) {
      return null;
    }

    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return null;
    }

    if (currentFingerprint !== undefined) {
      if (!parsed.user.fingerprint) {
        return { user: parsed.user, expiresAt: parsed.expiresAt, fingerprintValid: false };
      }
      const storedFingerprint = parsed.user.fingerprint as string;
      if (storedFingerprint !== currentFingerprint) {
        return { user: parsed.user, expiresAt: parsed.expiresAt, fingerprintValid: false };
      }
      return { user: parsed.user, expiresAt: parsed.expiresAt, fingerprintValid: true };
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
  cookieStore.set(SESSION_COOKIE_NAME, createSessionCookieValue(session, ''), {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    expires: new Date(Date.now() + SESSION_LIFETIME_MS)
  });
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    expires: new Date(0)
  });
}

const TEMP_COOKIE_NAME = '__Host-newsy_2fa_temp';

export function createTemp2faToken(userId: string): string {
  const payload = encode(
    JSON.stringify({
      userId,
      expiresAt: new Date(Date.now() + TEMP_TOKEN_LIFETIME_MS).toISOString(),
      issuedAt: new Date().toISOString()
    })
  );
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function parseTemp2faToken(value: string): TwoFactorTempSession | null {
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

  if (!timingSafeEqual(expectedBuffer as Buffer, actualBuffer as Buffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as TwoFactorTempSession & { issuedAt?: string };
    if (!parsed.userId || !parsed.expiresAt) {
      return null;
    }

    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return null;
    }

    return {
      userId: parsed.userId,
      expiresAt: parsed.expiresAt
    };
  } catch {
    return null;
  }
}

export async function setTemp2faCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TEMP_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    expires: new Date(Date.now() + TEMP_TOKEN_LIFETIME_MS)
  });
}

export async function getTemp2faCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TEMP_COOKIE_NAME)?.value ?? null;
}

export async function clearTemp2faCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TEMP_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    expires: new Date(0)
  });
}
