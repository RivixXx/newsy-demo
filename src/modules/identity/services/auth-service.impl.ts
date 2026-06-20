import type { PrismaClient } from '@prisma/client';

import type { AuthSession, LoginCredentials, PasswordResetConfirmation, PasswordResetRequest } from '@/lib/auth';

import { createSessionPayload } from './session-service';
import { createUserService } from './user-service';
import { normalizeIdentifier } from './auth-service';
import { verifyPassword } from './password-hash';

export function createAuthService(prisma: PrismaClient) {
  const userService = createUserService(prisma);

  return {
    async login(credentials: LoginCredentials): Promise<AuthSession> {
      const identifier = normalizeIdentifier(credentials.identifier);
      const user = await userService.findByIdentifier(identifier);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!verifyPassword(credentials.password, user.passwordHash)) {
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
        roles: authenticated.roles,
        organizationIds: authenticated.organizationIds
      });
    },

    async logout(_sessionId: string): Promise<void> {
      return;
    },

    async requestPasswordReset(_payload: PasswordResetRequest): Promise<void> {
      return;
    },

    async confirmPasswordReset(_payload: PasswordResetConfirmation): Promise<void> {
      return;
    }
  };
}
