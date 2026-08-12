'use server';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { setAuthSession, getTemp2faCookie, clearTemp2faCookie } from '@/lib/session';
import { getCurrentAuthSession } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { verifyPassword } from '@/modules/identity/services/password-hash';

import {
  generateSecret,
  verifyTOTP,
  generateQRDataURL,
  generateBackupCodes,
  verifyBackupCode,
} from '@/modules/identity/services/totp-service';

export interface TwoFactorSetupState {
  qrDataUrl?: string;
  secret?: string;
  backupCodes?: string[];
  error?: string;
  success?: boolean;
}

export interface TwoFactorVerifyState {
  error?: string;
  success?: boolean;
}

/**
 * Step 1 of enabling 2FA: generate secret + QR code for the user to scan.
 * Requires the user to be logged in.
 */
export async function enable2faAction(): Promise<TwoFactorSetupState> {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт.' };
  }

  // Check if 2FA is already enabled
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  if (user?.totpEnabled) {
    return { error: 'Двухфакторная аутентификация уже включена.' };
  }

  const email = session.user.email || session.user.id;
  const secret = generateSecret();
  const qrDataUrl = await generateQRDataURL(secret, email);

  return { qrDataUrl, secret };
}

/**
 * Step 2 of enabling 2FA: verify the first TOTP code, save secret + backup codes.
 */
export async function verifyAndEnable2faAction(
  _prevState: TwoFactorSetupState,
  formData: FormData
): Promise<TwoFactorSetupState> {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт.' };
  }

  const secret = formData.get('secret') as string;
  const code = formData.get('code') as string;

  if (!secret || !code) {
    return { error: 'Отсутствуют данные для настройки 2FA.' };
  }

  if (!/^\d{6}$/.test(code)) {
    return { error: 'Код должен состоять из 6 цифр.' };
  }

  const rateKey = `2fa-setup:${session.user.id}`;
  const rl = await rateLimit(rateKey, { windowMs: 300_000, max: 5 });
  if (!rl.allowed) {
    return { error: 'Слишком много попыток. Попробуйте позже.' };
  }

  if (!(await verifyTOTP(code, secret))) {
    return { error: 'Неверный код. Попробуйте ещё раз.' };
  }

  // Generate and save backup codes
  const backupCodes = generateBackupCodes(8);
  const backupCodesJson = JSON.stringify(backupCodes.hashed);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totpSecret: secret,
      totpEnabled: true,
      totpBackupCodes: backupCodesJson,
      totpVerifiedAt: new Date(),
      totpLastUsedStep: null,
    },
  });

  // Return plain-text backup codes ONE TIME only
  return {
    backupCodes: backupCodes.plain,
    success: true,
  };
}

/**
 * Disable 2FA. Requires current password for security.
 */
export async function disable2faAction(
  _prevState: TwoFactorSetupState,
  formData: FormData
): Promise<TwoFactorSetupState> {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт.' };
  }

  const password = formData.get('password') as string;
  if (!password) {
    return { error: 'Введите пароль для подтверждения.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'Неверный пароль.' };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totpSecret: null,
      totpEnabled: false,
      totpBackupCodes: null,
      totpVerifiedAt: null,
      totpLastUsedStep: null,
    },
  });

  return { success: true };
}

/**
 * Check if 2FA is enabled for the current user.
 * Used by the profile page to show the correct UI state.
 */
export async function check2faStatusAction(): Promise<TwoFactorSetupState> {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return { error: 'Необходимо войти в аккаунт.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  return { success: user?.totpEnabled ?? false };
}

/**
 * Verify a TOTP code during login (after the temp cookie has been set).
 * Reads the temp cookie to identify the user and creates a full session.
 */
export async function verify2faLoginAction(
  _prevState: TwoFactorVerifyState,
  formData: FormData
): Promise<TwoFactorVerifyState> {
  const code = formData.get('code') as string;
  const isBackup = formData.get('isBackup') === 'true';

  if (!code) {
    return { error: 'Введите код.' };
  }

  // Get temp token from httpOnly cookie
  const tempToken = await getTemp2faCookie();
  if (!tempToken) {
    return { error: 'Сессия истекла. Войдите заново.' };
  }

  // Import and parse the temp token
  const { parseTemp2faToken } = await import('@/lib/session');
  const tempSession = parseTemp2faToken(tempToken);
  if (!tempSession) {
    await clearTemp2faCookie();
    return { error: 'Сессия истекла. Войдите заново.' };
  }

  // Rate limit TOTP attempts
  const rl = await rateLimit(`2fa-login:${tempSession.userId}`, { windowMs: 300_000, max: 5 });
  if (!rl.allowed) {
    return { error: 'Слишком много попыток. Попробуйте позже.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: tempSession.userId },
    select: {
      id: true,
      totpSecret: true,
      totpEnabled: true,
      totpBackupCodes: true,
      totpLastUsedStep: true,
    },
  });

  if (!user || !user.totpEnabled || !user.totpSecret) {
    await clearTemp2faCookie();
    return { error: '2FA не настроена для этого аккаунта.' };
  }

  let isValid = false;

  if (isBackup) {
    // Check backup code
    const hashedCodes: string[] = user.totpBackupCodes
      ? JSON.parse(user.totpBackupCodes)
      : [];
    const idx = verifyBackupCode(code, hashedCodes);
    if (idx !== -1) {
      // Remove the used backup code
      hashedCodes.splice(idx, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totpBackupCodes: hashedCodes.length > 0
            ? JSON.stringify(hashedCodes)
            : null,
        },
      });
      isValid = true;
    }
  } else {
    // Verify TOTP code with replay protection: codes from time steps already
    // used (or earlier) are rejected.
    const result = await verifyTOTP(
      code,
      user.totpSecret,
      user.totpLastUsedStep ?? undefined
    );
    if (result.valid) {
      isValid = true;
      if (result.verifiedStep !== undefined && result.verifiedStep !== user.totpLastUsedStep) {
        await prisma.user.update({
          where: { id: user.id },
          data: { totpLastUsedStep: result.verifiedStep },
        });
      }
    }
  }

  if (!isValid) {
    return { error: 'Неверный код. Попробуйте ещё раз.' };
  }

  // Success — create full session and clean up temp cookie
  await clearTemp2faCookie();

  // Get authenticated user data and create session
  const { createUserService } = await import('@/modules/identity/services/user-service');
  const { createSessionPayload } = await import('@/modules/identity/services/session-service');
  const userService = createUserService(prisma);
  const authenticated = await userService.getAuthenticatedUser(user.id);

  if (!authenticated) {
    return { error: 'Ошибка загрузки профиля.' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const session = createSessionPayload({
    userId: authenticated.id,
    email: authenticated.email,
    phone: authenticated.phone,
    firstName: authenticated.firstName,
    lastName: authenticated.lastName,
    roles: authenticated.roles,
    organizationIds: authenticated.organizationIds,
  });

  await setAuthSession(session);
  redirect('/explore');
}

/**
 * Check if there is a valid temp 2FA cookie (used on page load retry).
 */
export async function checkTemp2faSessionAction(): Promise<boolean> {
  const tempToken = await getTemp2faCookie();
  if (!tempToken) return false;
  const { parseTemp2faToken } = await import('@/lib/session');
  return parseTemp2faToken(tempToken) !== null;
}
