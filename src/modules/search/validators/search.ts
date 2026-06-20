import { z } from 'zod';
import { ChallengeStatus } from '@prisma/client';

export const challengeStatusSchema = z.nativeEnum(ChallengeStatus);

export const searchFiltersSchema = z.object({
  category: z.string().trim().optional(),
  organizerId: z.string().uuid().optional(),
  status: challengeStatusSchema.optional()
});

export const searchStateSchema = z.object({
  sessionKey: z.string().min(1),
  query: z.string().trim().optional(),
  filters: searchFiltersSchema,
  sort: z.string().trim().optional(),
  page: z.number().int().nonnegative().optional(),
  scrollPosition: z.number().int().nonnegative().optional()
});
