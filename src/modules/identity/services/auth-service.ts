import type { AuthSession, LoginCredentials, PasswordResetConfirmation, PasswordResetRequest } from '@/lib/auth';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(sessionId: string): Promise<void>;
  requestPasswordReset(payload: PasswordResetRequest): Promise<void>;
  confirmPasswordReset(payload: PasswordResetConfirmation): Promise<void>;
}

export class TwoFactorRequiredError extends Error {
  public readonly userId: string;

  constructor(userId: string) {
    super('Two-factor authentication is required');
    this.name = 'TwoFactorRequiredError';
    this.userId = userId;
  }
}

export function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

