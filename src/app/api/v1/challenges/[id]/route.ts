import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id, deletedAt: null },
      include: {
        organizer: { select: { id: true, name: true, isVerified: true } },
        steps: { orderBy: { order: 'asc' }, select: { id: true, title: true, description: true, type: true, order: true } },
        _count: { select: { participations: true } },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        format: challenge.format,
        organizer: {
          id: challenge.organizer.id,
          name: challenge.organizer.name,
          isVerified: challenge.organizer.isVerified,
        },
        steps: challenge.steps,
        participantsCount: challenge._count.participations,
        maxParticipants: challenge.maxParticipants,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        entryFee: challenge.entryFee,
        requirements: challenge.requirements,
        address: challenge.address,
        latitude: challenge.latitude,
        longitude: challenge.longitude,
      },
    });
  } catch (error) {
    console.error('[api/v1/challenges/:id] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
