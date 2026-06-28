export type AuthProvider = 'email' | 'phone';

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roles: string[];
  organizationIds: string[];
}

export interface AuthSession {
  user: AuthenticatedUser;
  expiresAt: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  provider: AuthProvider;
}

export interface PasswordResetRequest {
  identifier: string;
  provider: AuthProvider;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}

export function isAuthenticated(session: AuthSession | null): session is AuthSession {
  return Boolean(session?.user?.id);
}

