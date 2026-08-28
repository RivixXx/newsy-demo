import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { DEFAULT_AD_CONFIG, readAdConfig, writeAdConfig } from '@/lib/ad-config';
import { buildAccessContext } from '@/modules/access-control/services';

async function requireAdmin() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const context = await buildAccessContext(prisma, session.user.id);
  if (!context.roleKeys.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const config = await readAdConfig();
  return NextResponse.json(config);
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const config = { ...DEFAULT_AD_CONFIG, ...body };
    await writeAdConfig(config);
    return NextResponse.json({ success: true, config });
  } catch (err) {
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }
}
