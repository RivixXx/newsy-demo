import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    if (!session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { id } = await params;
    const { action, reason } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Действие: approve или reject' }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      return NextResponse.json({ error: 'Челлендж не найден' }, { status: 404 });
    }

    if (challenge.status !== 'PENDING_REVIEW') {
      return NextResponse.json({ error: 'Челлендж не на модерации' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'PUBLISHED' : 'DRAFT';
    await prisma.challenge.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      challengeId: id,
      status: newStatus,
      message: action === 'approve' ? 'Челлендж одобрен и опубликован' : 'Челлендж возвращён в черновик',
    });
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
