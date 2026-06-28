import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

const DEFAULT_ACHIEVEMENTS = [
  { key: 'first_step', name: 'Первый шаг', description: 'Заверши первый челлендж', pointsRequired: 0 },
  { key: 'marathon', name: 'Марафонец', description: 'Заверши 10 челленджей', pointsRequired: 500 },
  { key: 'social', name: 'Социальная бабочка', description: 'Пригласи 5 друзей', pointsRequired: 300 },
  { key: 'collector', name: 'Коллекционер', description: 'Набери 1000 баллов', pointsRequired: 1000 },
  { key: 'mentor', name: 'Наставник', description: 'Проведи 3 мастер-класса', pointsRequired: 800 },
  { key: 'champion', name: 'Чемпион', description: 'Займи первое место в челлендже', pointsRequired: 2000 },
];

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    const userId = session?.user?.id;

    let earnedIds: string[] = [];
    let totalPoints = 0;

    if (userId) {
      try {
        const earned = await prisma.userAchievement.findMany({
          where: { userId },
          select: { achievementId: true, earnedAt: true },
        });
        earnedIds = earned.map(e => e.achievementId);

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
        totalPoints = user?.points || 0;
      } catch { /* tables may not exist */ }
    }

    let dbAchievements: any[] = [];
    try {
      dbAchievements = await prisma.achievement.findMany();
    } catch { /* Achievement table may not exist */ }

    const allKeys = new Set([...DEFAULT_ACHIEVEMENTS.map(a => a.key), ...dbAchievements.map(a => a.key)]);

    const achievements = Array.from(allKeys).map(key => {
      const db = dbAchievements.find(a => a.key === key);
      const def = DEFAULT_ACHIEVEMENTS.find(a => a.key === key);
      const name = db?.name || def?.name || key;
      const description = db?.description || def?.description || '';
      const pointsRequired = db?.pointsRequired ?? def?.pointsRequired ?? 0;
      const earned = earnedIds.includes(db?.id || '');

      return { id: db?.id || key, key, name, description, badgeUrl: db?.badgeUrl, pointsRequired, earned };
    });

    return NextResponse.json({ achievements, totalPoints });
  } catch (error: any) {
    console.error('Achievements error:', error);
    return NextResponse.json({ achievements: DEFAULT_ACHIEVEMENTS.map((a, i) => ({ ...a, id: String(i), badgeUrl: null, earned: false })), totalPoints: 0 });
  }
}
