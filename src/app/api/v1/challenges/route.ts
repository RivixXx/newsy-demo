import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Публичное API для интеграций
// Документация: /api/v1/docs

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const category = searchParams.get('category');
    const format = searchParams.get('format');
    const search = searchParams.get('q');

    const where: any = {
      status: 'PUBLISHED',
      deletedAt: null,
    };

    if (category) where.category = category;
    if (format) where.format = format;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        include: {
          organizer: { select: { id: true, name: true } },
          _count: { select: { participations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.challenge.count({ where }),
    ]);

    return NextResponse.json({
      data: challenges.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        format: c.format,
        organizer: {
          id: c.organizer.id,
          name: c.organizer.name,
        },
        participantsCount: c._count.participations,
        maxParticipants: c.maxParticipants,
        startDate: c.startDate,
        endDate: c.endDate,
        entryFee: c.entryFee,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[api/v1/challenges] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
