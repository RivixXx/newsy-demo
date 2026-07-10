import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const organizations = await prisma.organizer.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { members: true, challenges: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = organizations.map(o => ({
      id: o.id,
      name: o.name,
      inn: o.inn,
      type: o.type,
      status: o.status,
      memberCount: o._count.members,
      challengeCount: o._count.challenges,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({ organizations: result });
  } catch {
    return NextResponse.json({ organizations: [] });
  }
}
