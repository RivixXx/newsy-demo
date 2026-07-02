import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAuthSession } from '@/lib/session';
import { createStorageService } from '@/modules/media/services/storage-service';

const ALLOWED_BUCKETS = ['challenges', 'avatars', 'partners'] as const;

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { path, bucket } = await req.json();

    if (!path) {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
    }

    const bucketName = bucket || 'challenges';
    if (!(ALLOWED_BUCKETS as readonly string[]).includes(bucketName)) {
      return NextResponse.json({ error: 'Недопустимый bucket' }, { status: 400 });
    }

    // Ownership check: path must start with userId/ or userId_
    if (!path.startsWith(`${session.user.id}/`) && !path.startsWith(`${session.user.id}_`)) {
      return NextResponse.json({ error: 'Нет доступа к этому файлу' }, { status: 403 });
    }

    const storage = createStorageService();
    await storage.deleteFile(bucketName, path);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : message }, { status: 500 });
  }
}
