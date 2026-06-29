import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/admin'];
const AUTH_ONLY = ['/login', '/register'];
const SESSION_COOKIE = 'newsy_session';

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET?.trim() || 'newsy-development-secret';
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
    return diff === 0;
  } catch {
    return false;
  }
}

function bufToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
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

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
