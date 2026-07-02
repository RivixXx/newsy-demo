import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 300;

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('Get plans error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
