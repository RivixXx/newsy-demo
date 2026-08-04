import { NextRequest, NextResponse } from 'next/server';
import { parseSessionCookieValue } from '@/lib/session';

const PROTECTED = ['/dashboard', '/admin'];
const AUTH_ONLY = ['/login', '/register'];
const SESSION_COOKIE = '__Host-newsy_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = Boolean(sessionCookie && (await parseSessionCookieValue(sessionCookie)) !== null);

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
