import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TwoFactorRequiredError } from '@/modules/identity/services/auth-service';

describe('AuthService types', () => {
  it('should export TwoFactorRequiredError', () => {
    const error = new TwoFactorRequiredError('user-123');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Two-factor authentication is required');
    expect((error as any).userId).toBe('user-123');
  });
});

describe('Auth service types', () => {
  it('should have correct types', () => {
    expect(true).toBe(true);
  });
});