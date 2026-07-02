import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  birthDate: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { bio, avatarUrl, firstName, lastName, gender, birthDate } = parsed.data;

    const data: Record<string, any> = {};

    if (bio !== undefined) {
      data.bio = bio;
    }

    if (avatarUrl !== undefined) {
      data.avatarUrl = avatarUrl;
    }

    if (firstName !== undefined) {
      data.firstName = firstName;
    }

    if (lastName !== undefined) {
      data.lastName = lastName;
    }

    if (gender !== undefined) {
      data.gender = gender;
    }

    if (birthDate !== undefined) {
      data.birthDate = birthDate ? new Date(birthDate) : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, firstName: true, lastName: true, bio: true, avatarUrl: true, gender: true, birthDate: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
