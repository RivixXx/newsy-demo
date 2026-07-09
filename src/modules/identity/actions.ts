'use server';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { clearAuthSession, setAuthSession } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';

import { createAuthService } from './services';
import { hashPassword } from './services/password-hash';
import { loginCredentialsSchema } from './validators';
import { createEmailService, generateVerificationToken, TOKEN_EXPIRY_MS } from './services/email-service';
import { randomBytes } from 'node:crypto';


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

  const rl = rateLimit(`login:${credentialsResult.data.identifier}`, { windowMs: 300_000, max: 5 });
  if (!rl.allowed) {
    return { error: `Слишком много попыток. Попробуйте через ${Math.ceil(rl.retryAfterMs / 60_000)} мин.` };
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
  const gender    = (formData.get('gender') as string) || null;
  const birthDate = (formData.get('birthDate') as string) || null;

  // Business fields
  const accountTypeRaw = (formData.get('accountType') as string) || 'individual';
  const ACCOUNT_TYPE_MAP: Record<string, string> = {
    individual: 'INDIVIDUAL', ip: 'IP', ooo: 'OOO', ao: 'AO', self_employed: 'SELF_EMPLOYED',
  };
  const accountType = ACCOUNT_TYPE_MAP[accountTypeRaw] || 'INDIVIDUAL';
  const companyName    = (formData.get('companyName') as string)?.trim() || null;
  const inn            = (formData.get('inn') as string)?.trim() || null;
  const companySize    = (formData.get('companySize') as string) || null;
  const employeeCountRaw = (formData.get('employeeCount') as string);
  const employeeCount  = employeeCountRaw ? parseInt(employeeCountRaw, 10) : null;
  const companyAddress = (formData.get('companyAddress') as string)?.trim() || null;
  const platformName   = (formData.get('platformName') as string)?.trim() || null;

  if (!firstName || !lastName || !email || !password) {
    return { error: 'Заполните все поля.' };
  }
  if (firstName.length > 100 || lastName.length > 100) {
    return { error: 'Имя или фамилия слишком длинные.' };
  }
  if (password.length < 8) {
    return { error: 'Пароль должен быть не менее 8 символов.' };
  }
  if (password !== confirm) {
    return { error: 'Пароли не совпадают.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Введите корректный email-адрес.' };
  }

  // Validate birthDate if provided
  if (birthDate) {
    const parsed = new Date(birthDate);
    if (isNaN(parsed.getTime())) {
      return { error: 'Некорректная дата рождения.' };
    }
    if (parsed > new Date()) {
      return { error: 'Дата рождения не может быть в будущем.' };
    }
    if (parsed.getFullYear() < 1900) {
      return { error: 'Дата рождения некорректна.' };
    }
  }

  // Business validation
  if (accountType !== 'INDIVIDUAL') {
    if (!companyName) {
      return { error: 'Введите наименование компании.' };
    }
    if (inn && !/^\d{10,12}$/.test(inn)) {
      return { error: 'ИНН должен содержать 10 или 12 цифр.' };
    }
    if (employeeCount !== null && (isNaN(employeeCount) || employeeCount < 0)) {
      return { error: 'Некорректное число работников.' };
    }
  }

  const rl = rateLimit(`register:${email}`, { windowMs: 600_000, max: 3 });
  if (!rl.allowed) {
    return { error: `Слишком много регистраций. Попробуйте через ${Math.ceil(rl.retryAfterMs / 60_000)} мин.` };
  }

  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return { error: 'Этот email уже зарегистрирован.' };
    }

    const userData: Record<string, unknown> = {
      email,
      firstName,
      lastName,
      passwordHash: await hashPassword(password),
      status: 'PENDING',
      referredBy: referralCode,
      referralCode: randomBytes(4).toString('hex'),
      gender,
      birthDate: birthDate ? new Date(birthDate) : null,
      accountType: accountType as 'INDIVIDUAL' | 'IP' | 'OOO' | 'AO' | 'SELF_EMPLOYED',
      roles: {
        create: {
          role: { connect: { key: 'user' } },
        },
      },
    };

    // Attach business fields only for non-individual accounts
    if (accountType !== 'INDIVIDUAL') {
      userData.companyName = companyName;
      userData.inn = inn;
      userData.companySize = companySize;
      userData.employeeCount = employeeCount;
      userData.companyAddress = companyAddress;
      userData.platformName = platformName;
    }

    const user = await prisma.user.create({ data: userData as any });

    // Генерируем токен верификации и отправляем письмо
    try {
      const token = generateVerificationToken();
      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          token,
          email,
          expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
        },
      });

      const emailService = createEmailService();
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await emailService.sendVerificationEmail(email, token, baseUrl);
    } catch (emailErr) {
      console.error('[register] Failed to send verification email:', emailErr);
    }

    return { success: 'Регистрация прошла успешно! Проверьте почту для подтверждения аккаунта.' };
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: error instanceof Error ? error.message : 'Ошибка регистрации.' };
  }
}
