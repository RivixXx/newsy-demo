import type { PrismaClient } from '@prisma/client';

import type { AuthSession, LoginCredentials, PasswordResetConfirmation, PasswordResetRequest } from '@/lib/auth';

import { createSessionPayload } from './session-service';
import { createUserService } from './user-service';
import { normalizeIdentifier } from './auth-service';
import { verifyPassword, hashPassword } from './password-hash';
import { createEmailService, generateVerificationToken } from './email-service';

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function createAuthService(prisma: PrismaClient) {
  const userService = createUserService(prisma);
  const emailService = createEmailService();

  return {
    async login(credentials: LoginCredentials): Promise<AuthSession> {
      const identifier = normalizeIdentifier(credentials.identifier);
      const user = await userService.findByIdentifier(identifier);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.status === 'SUSPENDED') {
        throw new Error('Аккаунт заблокирован. Обратитесь в поддержку.');
      }

      if (user.status === 'PENDING') {
        throw new Error('Аккаунт ожидает подтверждения email. Проверьте почту.');
      }

      if (!(await verifyPassword(credentials.password, user.passwordHash))) {
        throw new Error('Invalid credentials');
      }

      const authenticated = await userService.getAuthenticatedUser(user.id);
      if (!authenticated) {
        throw new Error('User profile is unavailable');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      return createSessionPayload({
        userId: authenticated.id,
        email: authenticated.email,
        phone: authenticated.phone,
        firstName: authenticated.firstName,
        lastName: authenticated.lastName,
        roles: authenticated.roles,
        organizationIds: authenticated.organizationIds
      });
    },

    async logout(_sessionId: string): Promise<void> {
      return;
    },

    async requestPasswordReset(payload: PasswordResetRequest): Promise<void> {
      const identifier = normalizeIdentifier(payload.identifier);
      const user = await userService.findByIdentifier(identifier);

      // Always return void to avoid leaking account existence
      if (!user || !user.email) {
        return;
      }

      // Invalidate any existing unused tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = generateVerificationToken();
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          email: user.email,
          expiresAt,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await emailService.sendPasswordResetEmail(user.email, token, baseUrl);
    },

    async confirmPasswordReset(payload: PasswordResetConfirmation): Promise<void> {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token: payload.token },
      });

      if (!resetToken) {
        throw new Error('Недействительный токен сброса пароля');
      }

      if (resetToken.usedAt) {
        throw new Error('Токен уже был использован');
      }

      if (resetToken.expiresAt < new Date()) {
        throw new Error('Срок действия токена истёк');
      }

      // Валидация длины пароля
      if (payload.newPassword.length < 8) {
        throw new Error('Пароль должен быть не менее 8 символов.');
      }

      const newHash = await hashPassword(payload.newPassword);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash: newHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        }),
      ]);
    }
  };
}
