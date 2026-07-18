import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/admin'];
const AUTH_ONLY = ['/login', '/register'];
const SESSION_COOKIE = '__Host-newsy_session';

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return secret;
}

function bufToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

/**
 * Верифицирует cookie сессии в Edge Runtime (Web Crypto API).
 * Логика зеркалирует session.ts: проверяем подпись + expiresAt (не issuedAt).
 */
async function verifySession(value: string): Promise<boolean> {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return false;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const expected = bufToBase64url(sig);

    // Timing-safe compare
    if (expected.length !== signature.length) return false;
    const a = enc.encode(expected);
    const b = enc.encode(signature);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    if (diff !== 0) return false;

    // Проверяем expiresAt (то же поле, что и в session.ts)
    try {
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (decoded.expiresAt) {
        const expiresAt = new Date(decoded.expiresAt).getTime();
        if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
      } else {
        // Нет expiresAt — невалидная сессия
        return false;
      }
    } catch {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = Boolean(sessionCookie && (await verifySession(sessionCookie)));

  if (isLoggedIn && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/explore', request.url));
  }

  // Залогиненные пользователи на "/" или "/welcome" → каталог
  if (isLoggedIn && (pathname === '/' || pathname === '/welcome')) {
    return NextResponse.redirect(new URL('/explore', request.url));
  }

  // Незарегестрированные на "/" → лендинг
  if (!isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  if (!isLoggedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register', '/', '/welcome'],
};
