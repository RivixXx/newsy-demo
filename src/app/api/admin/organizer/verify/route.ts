import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем роль admin
    const isAdmin = session.user.roles?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { organizerId, verified } = await request.json();

    if (!organizerId || typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
    });

    if (!organizer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.organizer.update({
      where: { id: organizerId },
      data: {
        isVerified: verified,
        verifiedAt: verified ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/verify] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
