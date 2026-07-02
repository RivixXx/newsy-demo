import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    if (!session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId обязателен' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const organizer = await prisma.organizer.findFirst({ where: { name: 'NEWSY' } });
    if (!organizer) {
      return NextResponse.json({ error: 'Организатор NEWSY не найден' }, { status: 404 });
    }

    const existing = await prisma.organizerMember.findUnique({
      where: { organizerId_userId: { organizerId: organizer.id, userId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Пользователь уже является участником организации' }, { status: 400 });
    }

    await prisma.organizerMember.create({
      data: {
        organizerId: organizer.id,
        userId,
        roleInOrganizer: 'member',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: `${user.firstName} ${user.lastName} добавлен в организацию NEWSY`,
    });
  } catch (error: any) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
