import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.organizerMember.findFirst({
      where: { userId: session.user.id },
      select: { organizerId: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify challenge belongs to organizer
    const challenge = await prisma.challenge.findFirst({
      where: { id, organizerId: member.organizerId, deletedAt: null },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const participants = await prisma.userProgress.findMany({
      where: { challengeId: id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return NextResponse.json({ participants });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
