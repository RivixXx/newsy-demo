import type { AuthSession } from '@/lib/auth';

export interface SessionService {
  createSession(userId: string): Promise<AuthSession>;
  revokeSession(sessionId: string): Promise<void>;
}

export function createSessionPayload(params: {
  userId: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roles: string[];
  organizationIds: string[];
}): AuthSession {
  return {
    user: {
      id: params.userId,
      email: params.email ?? null,
      phone: params.phone ?? null,
      firstName: params.firstName ?? null,
      lastName: params.lastName ?? null,
      roles: params.roles,
      organizationIds: params.organizationIds
    },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
  };
}
