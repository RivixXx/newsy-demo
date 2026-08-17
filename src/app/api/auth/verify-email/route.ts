import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createReferralService } from '@/modules/identity/services/referral-service';
import { createUserService } from '@/modules/identity/services/user-service';
import { createSessionPayload } from '@/modules/identity/services/session-service';
import { setAuthSession } from '@/lib/session';

async function verifyToken(token: string | null) {
  if (!token) {
    return null;
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return { error: 'invalid-token' };
  }

  if (record.usedAt) {
    return { error: 'already-verified' };
  }

  if (record.expiresAt < new Date()) {
    return { error: 'token-expired' };
  }

  return { record };
}

async function succeed(record: { id: string; userId: string }, redirectUrl: string) {
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

  try {
    const user = await prisma.user.findUnique({
      where: { id: record.userId },
      select: { referredBy: true },
    });
    if (user?.referredBy) {
      const referralService = createReferralService(prisma);
      await referralService.trackRegistration(record.userId, user.referredBy);
    }
  } catch (refErr) {
    console.error('[verify-email] Referral tracking failed:', refErr);
  }

  const userService = createUserService(prisma);
  const authenticated = await userService.getAuthenticatedUser(record.userId);
  if (!authenticated) {
    return NextResponse.redirect(new URL('/login?error=profile-unavailable', redirectUrl));
  }

  await setAuthSession(createSessionPayload({
    userId: authenticated.id,
    email: authenticated.email,
    phone: authenticated.phone,
    firstName: authenticated.firstName,
    lastName: authenticated.lastName,
    roles: authenticated.roles,
    organizationIds: authenticated.organizationIds,
  }));

  return NextResponse.redirect(new URL('/explore?info=verified', redirectUrl));
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const baseUrl = req.nextUrl.origin;

  try {
    const result = await verifyToken(token);

    if (result?.error) {
      return NextResponse.redirect(new URL(`/login?error=${result.error}`, baseUrl));
    }

    if (!result?.record) {
      return NextResponse.redirect(new URL('/login?error=missing-token', baseUrl));
    }

    return succeed({ id: result.record.id, userId: result.record.userId }, `${baseUrl}/login`);
  } catch (error) {
    console.error('[verify-email] Error:', error);
    return NextResponse.redirect(new URL('/login?error=server-error', baseUrl));
  }
}

export async function POST(req: NextRequest) {
  const baseUrl = req.nextUrl.origin;

  try {
    const { token }: { token: string } = await req.json();
    const result = await verifyToken(token);

    if (result?.error) {
      return NextResponse.json({ error: result.error === 'invalid-token' ? 'Недействительный токен' : result.error === 'token-expired' ? 'Токен истек' : 'Ошибка верификации' }, { status: 400 });
    }

    if (!result?.record) {
      return NextResponse.json({ error: 'Токен не указан' }, { status: 400 });
    }

    return succeed({ id: result.record.id, userId: result.record.userId }, `${baseUrl}/login`);
  } catch (error) {
    console.error('[verify-email] Error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
