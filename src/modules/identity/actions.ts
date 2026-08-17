'use server';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { clearAuthSession, createTemp2faToken, setAuthSession, setTemp2faCookie } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';

import { createAuthService, TwoFactorRequiredError } from './services';
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
  twoFactorToken?: string;
}

function publicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
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

  const rl = await rateLimit(`login:${credentialsResult.data.identifier}`, { windowMs: 300_000, max: 5 });
  if (!rl.allowed) {
    return { error: `Слишком много попыток. Попробуйте через ${Math.ceil(rl.retryAfterMs / 60_000)} мин.` };
  }

  try {
    const authService = createAuthService(prisma);
    const session = await authService.login(credentialsResult.data);
    await setAuthSession(session);
    redirect('/explore');
  } catch (error) {
    if (isRedirect(error)) throw error;

    // Handle 2FA requirement
    if (error instanceof TwoFactorRequiredError) {
      const token = createTemp2faToken(error.userId);
      await setTemp2faCookie(token);
      return { twoFactorToken: 'required' };
    }

    return { error: error instanceof Error ? error.message : 'Не удалось выполнить вход.' };
  }
}

export async function logoutAction(): Promise<void> {
  await clearAuthSession();
  redirect('/welcome');
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
  if (password.length > 128) {
    return { error: 'Пароль слишком длинный (максимум 128 символов)' };
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

  const rl = await rateLimit(`register:${email}`, { windowMs: 600_000, max: 3 });
  if (!rl.allowed) {
    return { error: `Слишком много регистраций. Попробуйте через ${Math.ceil(rl.retryAfterMs / 60_000)} мин.` };
  }

  try {
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

    const registration = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({ where: { email } });
      if (existing) {
        if (existing.status === 'PENDING') {
          return { user: existing, resumedPending: true };
        }
        throw new Error('Этот email уже зарегистрирован.');
      }

      const created = await tx.user.create({ data: userData as any });
      return { user: created, resumedPending: false };
    });
    const user = registration.user;

    // Если пользователь — организатор, создаём Organizer + OrganizerMember
    const userRole = (formData.get('userRole') as string) || 'participant';
    if (userRole === 'organizer' && !registration.resumedPending) {
      // Маппинг AccountType → OrganizerType
      const ORGANIZER_TYPE_MAP: Record<string, string> = {
        IP: 'BRAND', SELF_EMPLOYED: 'BRAND', OOO: 'BRAND', AO: 'BRAND',
      };
      const organizerType = ORGANIZER_TYPE_MAP[accountType] || 'OTHER';
      const organizerName = platformName || companyName || `${firstName} ${lastName}`;

      // Транзакция для целостности данных
      await prisma.$transaction(async (tx) => {
        const organizer = await tx.organizer.create({
          data: {
            name: organizerName,
            type: organizerType as any,
            inn,
            status: 'PENDING',
          },
        });

        await tx.organizerMember.create({
          data: {
            organizerId: organizer.id,
            userId: user.id,
            roleInOrganizer: 'OWNER',
          },
        });

        // Добавляем роль organizer
        const organizerRole = await tx.role.findUnique({ where: { key: 'organizer' } });
        if (organizerRole) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: organizerRole.id,
            },
          });
        }
      });
    }

    // Генерируем токен верификации и отправляем письмо
    try {
      const token = generateVerificationToken();
      await prisma.$transaction([
        prisma.emailVerificationToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.emailVerificationToken.create({
          data: {
            userId: user.id,
            token,
            email,
            expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
          },
        }),
      ]);

      const emailService = createEmailService();
      await emailService.sendVerificationEmail(email, token, publicAppUrl());
    } catch (emailErr) {
      console.error('[register] Failed to send verification email:', emailErr);
      return {
        error: 'Аккаунт создан, но письмо не отправилось. Попробуйте зарегистрироваться с тем же email ещё раз через несколько минут.',
      };
    }

    return { success: 'Регистрация прошла успешно! Проверьте почту для подтверждения аккаунта.' };
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: error instanceof Error ? error.message : 'Ошибка регистрации.' };
  }
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = readFormValue(formData, 'email').trim().toLowerCase();

  if (!email) {
    return { error: 'Введите email' };
  }

  const rl = await rateLimit(`password-reset:${email}`, { windowMs: 600_000, max: 3 });
  if (!rl.allowed) {
    return { error: `Слишком много запросов. Попробуйте через ${Math.ceil(rl.retryAfterMs / 60_000)} мин.` };
  }

  try {
    const authService = createAuthService(prisma);
    await authService.requestPasswordReset({ identifier: email, provider: 'email' });
    return { success: 'Если email зарегистрирован, мы отправили ссылку для сброса пароля.' };
  } catch (error) {
    console.error('[auth-reset] Failed to send reset email:', error);
    return { success: 'Если email зарегистрирован, мы отправили ссылку для сброса пароля.' };
  }
}
