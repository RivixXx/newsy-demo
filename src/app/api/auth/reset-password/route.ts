import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createAuthService } from '@/modules/identity/services/auth-service.impl';
import { rateLimit } from '@/lib/rate-limit';

const authService = createAuthService(prisma);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Токен и новый пароль обязательны' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 8 символов' },
        { status: 400 }
      );
    }

    // Rate limit: 5 attempts per 15 minutes per token
    const rl = await rateLimit(`reset-password:${token}`, { windowMs: 15 * 60 * 1000, max: 5 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Слишком много попыток. Попробуйте позже.' },
        { status: 429 }
      );
    }

    await authService.confirmPasswordReset({ token, newPassword });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка сервера';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
