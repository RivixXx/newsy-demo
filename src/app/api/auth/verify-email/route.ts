import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createReferralService } from '@/modules/identity/services/referral-service';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing-token', req.url));
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', req.url));
    }

    if (record.usedAt) {
      return NextResponse.redirect(new URL('/login?info=already-verified', req.url));
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/login?error=token-expired', req.url));
    }

    // Атомарно: помечаем токен как использованный + активируем пользователя
    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: { status: 'ACTIVE' },
      }),
    ]);

    // Трекаем реферальную регистрацию
    try {
      const user = await prisma.user.findUnique({
        where: { id: record.userId },
        select: { id: true, referredBy: true },
      });
      if (user?.referredBy) {
        const referralService = createReferralService(prisma);
        await referralService.trackRegistration(user.id, user.referredBy);
      }
    } catch (refErr) {
      console.error('[verify-email] Referral tracking failed:', refErr);
    }

    return NextResponse.redirect(new URL('/login?info=verified', req.url));
  } catch (error) {
    console.error('[verify-email] Error:', error);
    return NextResponse.redirect(new URL('/login?error=server-error', req.url));
  }
}
