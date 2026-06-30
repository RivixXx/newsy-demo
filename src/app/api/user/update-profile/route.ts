import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { bio, avatarUrl, firstName, lastName, gender, birthDate } = body;

    const data: Record<string, any> = {};

    if (bio !== undefined) {
      if (bio.length > 500) {
        return NextResponse.json({ error: 'Био не может превышать 500 символов' }, { status: 400 });
      }
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
