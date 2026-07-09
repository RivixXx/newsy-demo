import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

// GET /api/favorites — список избранных
export async function GET() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [], favoritesCount: 0 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          endDate: true,
          entryFee: true,
          organizer: { select: { name: true } },
          media: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          _count: { select: { participations: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = favorites.map(f => ({
    id: f.challenge.id,
    title: f.challenge.title,
    category: f.challenge.category,
    organizer: f.challenge.organizer.name,
    imageUrl: f.challenge.media[0]?.url || null,
    participantsCount: f.challenge._count.participations,
    endDate: f.challenge.endDate ? new Date(f.challenge.endDate).toLocaleDateString('ru-RU') : null,
    addedAt: f.createdAt,
  }));

  return NextResponse.json({ favorites: result, favoritesCount: result.length });
}

// POST /api/favorites — добавить
export async function POST(req: Request) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Войдите, чтобы добавлять в избранное' }, { status: 401 });
  }

  const { challengeId } = await req.json();
  if (!challengeId) {
    return NextResponse.json({ error: 'challengeId обязателен' }, { status: 400 });
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_challengeId: { userId: session.user.id, challengeId } },
    });

    if (existing) {
      return NextResponse.json({ success: true, action: 'already_exists' });
    }

    await prisma.favorite.create({
      data: { userId: session.user.id, challengeId },
    });

    return NextResponse.json({ success: true, action: 'added' });
  } catch (err) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE /api/favorites — убрать
export async function DELETE(req: Request) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { challengeId } = await req.json();
  if (!challengeId) {
    return NextResponse.json({ error: 'challengeId обязателен' }, { status: 400 });
  }

  try {
    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, challengeId },
    });

    return NextResponse.json({ success: true, action: 'removed' });
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
