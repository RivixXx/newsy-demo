import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { buildAccessContext } from '@/modules/access-control/services/access-context';
import { isAdmin } from '@/modules/access-control/services/permission-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId, userId, reason, description } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: 'Укажите причину жалобы' }, { status: 400 });
    }

    if (!challengeId && !userId) {
      return NextResponse.json({ error: 'Укажите объект жалобы' }, { status: 400 });
    }

    // Проверяем, не было ли уже жалобы от этого пользователя
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        challengeId: challengeId || null,
        userId: userId || null,
        status: { not: 'DISMISSED' },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Вы уже жаловались на этот объект' }, { status: 409 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        challengeId: challengeId || null,
        userId: userId || null,
        reason,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, id: report.id });
  } catch (error) {
    console.error('[reports] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Только для админов
    const accessCtx = await buildAccessContext(prisma, session.user.id);
    if (!isAdmin(accessCtx.permissionSet)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('[reports] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
