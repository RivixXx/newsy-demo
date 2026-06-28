import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ totalReferrals: 0, activeReferrals: 0, totalEarned: 0 });
    }

    let totalReferrals = 0;
    let activeReferrals = 0;

    try {
      totalReferrals = await prisma.user.count({
        where: { referredBy: session.user.id, deletedAt: null },
      });
      activeReferrals = await prisma.user.count({
        where: { referredBy: session.user.id, status: 'ACTIVE', deletedAt: null },
      });
    } catch { /* referredBy column may not exist */ }

    const totalEarned = activeReferrals * 100;

    return NextResponse.json({ totalReferrals, activeReferrals, totalEarned });
  } catch (error: any) {
    console.error('Referral stats error:', error);
    return NextResponse.json({ totalReferrals: 0, activeReferrals: 0, totalEarned: 0 });
  }
}
