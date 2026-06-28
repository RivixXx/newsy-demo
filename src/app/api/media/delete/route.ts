import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAuthSession } from '@/lib/session';
import { createStorageService } from '@/modules/media/services/storage-service';

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

    const storage = createStorageService();
    await storage.deleteFile(bucket || 'challenges', path);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
