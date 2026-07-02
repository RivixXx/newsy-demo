import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
