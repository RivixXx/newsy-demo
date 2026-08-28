import { NextRequest, NextResponse } from 'next/server';
import { parseEdgeSessionCookie } from '@/lib/session-edge';

const PROTECTED = ['/dashboard', '/admin'];
const AUTH_ONLY = ['/login', '/register'];
const SESSION_COOKIE = '__Host-chi_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = Boolean(sessionCookie && (await parseEdgeSessionCookie(sessionCookie)) !== null);

  if (isLoggedIn && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/explore', request.url));
  }

  // Главная страница — публичный каталог. URL остаётся корневым, чтобы
  // посетитель из поиска сначала увидел продукт, а не экран регистрации.
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/explore', request.url));
  }

  if (!isLoggedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register', '/'],
};
