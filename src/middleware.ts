import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/admin'];
const AUTH_ONLY = ['/login', '/register'];
const SESSION_COOKIE = '__Host-newsy_session';
const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24 * 7;

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
    if (expected.length !== signature.length) return false;
    const a = enc.encode(expected);
    const b = enc.encode(signature);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    if (diff !== 0) return false;

    try {
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (decoded.issuedAt) {
        const issuedAt = new Date(decoded.issuedAt).getTime();
        const age = Date.now() - issuedAt;
        if (age > SESSION_LIFETIME_MS) return false;
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
  const isLoggedIn = Boolean(sessionCookie && await verifySession(sessionCookie));

  if (isLoggedIn && AUTH_ONLY.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isLoggedIn && PROTECTED.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (isLoggedIn && sessionCookie) {
    try {
      const decoded = JSON.parse(atob(sessionCookie.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
      if (decoded.issuedAt) {
        const age = Date.now() - new Date(decoded.issuedAt).getTime();
        if (age > SESSION_LIFETIME_MS * 0.5) {
          response.cookies.set(SESSION_COOKIE, sessionCookie, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            path: '/',
            maxAge: SESSION_LIFETIME_MS / 1000,
          });
        }
      }
    } catch {
      // ignore — invalid cookie format, will be caught on next verification
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
