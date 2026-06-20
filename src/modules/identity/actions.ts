'use server';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { clearAuthSession, setAuthSession } from '@/lib/session';

import { createAuthService } from './services';
import { loginCredentialsSchema } from './validators';

export interface AuthActionState {
  error?: string | null;
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
    return { error: error instanceof Error ? error.message : 'Не удалось выполнить вход.' };
  }
}

export async function logoutAction(): Promise<void> {
  await clearAuthSession();
  redirect('/');
}
