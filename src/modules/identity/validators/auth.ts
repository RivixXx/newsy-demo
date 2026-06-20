import { z } from 'zod';

export const authProviderSchema = z.enum(['email', 'phone']);

export const loginCredentialsSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(8),
  provider: authProviderSchema
});

export const passwordResetRequestSchema = z.object({
  identifier: z.string().trim().min(1),
  provider: authProviderSchema
});

export const passwordResetConfirmationSchema = z.object({
  token: z.string().trim().min(1),
  newPassword: z.string().min(8)
});

