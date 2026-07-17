import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const organizer = await prisma.organizer.findUnique({
      where: { id },
      include: {
        challenges: {
          where: { deletedAt: null, status: 'PUBLISHED' },
          include: {
            _count: { select: { participations: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { challenges: true } },
      },
    });

    if (!organizer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const totalParticipants = organizer.challenges.reduce(
      (acc, c) => acc + c._count.participations, 0
    );

    return NextResponse.json({
      id: organizer.id,
      name: organizer.name,
      type: organizer.type,
      challengeCount: organizer._count.challenges,
      totalParticipants,
      challenges: organizer.challenges.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        participantsCount: c._count.participations,
        endDate: c.endDate,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
