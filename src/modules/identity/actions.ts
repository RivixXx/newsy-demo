'use server';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { clearAuthSession, setAuthSession } from '@/lib/session';

import { createAuthService } from './services';
import { hashPassword } from './services/password-hash';
import { loginCredentialsSchema } from './validators';


function isRedirect(err: unknown): boolean {
  return err instanceof Error && typeof (err as any).digest === 'string' && (err as any).digest.startsWith('NEXT_REDIRECT');
}

export interface AuthActionState {
  error?: string | null;
  success?: string | null;
}

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const credentialsResult = loginCredentialsSchema.safeParse({
    identifier: readFormValue(formData, 'identifier'),
    password: readFormValue(formData, 'password'),
    provider: readFormValue(formData, 'provider')
  });

  if (!credentialsResult.success) {
    return { error: 'Проверьте логин, пароль и способ входа.' };
  }

  try {
    const authService = createAuthService(prisma);
    const session = await authService.login(credentialsResult.data);
    await setAuthSession(session);
    redirect('/');
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: error instanceof Error ? error.message : 'Не удалось выполнить вход.' };
  }
}

export async function logoutAction(): Promise<void> {
  await clearAuthSession();
  redirect('/');
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const firstName = (formData.get('firstName') as string)?.trim();
  const lastName  = (formData.get('lastName')  as string)?.trim();
  const email     = (formData.get('email')     as string)?.trim().toLowerCase();
  const password  = (formData.get('password')  as string);
  const confirm   = (formData.get('confirm')   as string);
  const referralCode = (formData.get('referralCode') as string)?.trim() || null;

  if (!firstName || !lastName || !email || !password) {
    return { error: 'Заполните все поля.' };
  }
  if (password.length < 8) {
    return { error: 'Пароль должен быть не менее 8 символов.' };
  }
  if (password !== confirm) {
    return { error: 'Пароли не совпадают.' };
  }

  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return { error: 'Этот email уже зарегистрирован.' };
    }

    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: hashPassword(password),
        status: 'ACTIVE',
        referredBy: referralCode,
        roles: {
          create: {
            role: { connect: { key: 'user' } },
          },
        },
      }
    });

    const authService = createAuthService(prisma);
    const session = await authService.login({ identifier: email, password, provider: 'email' });
    await setAuthSession(session);
    redirect('/');
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: error instanceof Error ? error.message : 'Ошибка регистрации.' };
  }
}
