import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAuthSession } from '@/lib/session';
import { createStorageService } from '@/modules/media/services/storage-service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'challenges';
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Неподдерживаемый формат файла' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой (макс. 10 МБ)' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${session.user.id}/${folder}/${Date.now()}.${ext}`;

    const storage = createStorageService();
    const { url, path } = await storage.uploadFile(bucket, fileName, file);

    return NextResponse.json({ url, path, fileName });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
