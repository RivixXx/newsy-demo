import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function createValidator<T extends z.ZodTypeAny>(schema: T) {
  return async (request: NextRequest): Promise<z.infer<T>> => {
    let data: unknown;
    
    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url);
      data = Object.fromEntries(searchParams.entries());
    } else {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await request.json().catch(() => ({}));
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        data = {};
      }
    }

    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new ValidationError(errorMessage, result.error.issues);
    }

    return result.data;
  };
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleValidationError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, issues: error.issues },
      { status: 400 }
    );
  }
  throw error;
}

export const commonSchemas = {
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
  
  uuid: z.string().uuid('Неверный формат ID'),
  
  challengeId: z.object({
    id: z.string().uuid('Неверный ID челленджа'),
  }),
  
  challengeQuery: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    category: z.string().optional(),
    format: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
    status: z.enum(['PUBLISHED', 'DRAFT', 'ONGOING', 'COMPLETED', 'ARCHIVED']).optional(),
    region: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['newest', 'oldest', 'popular', 'ending-soon']).optional(),
  }),
};

export function validateParams<T extends z.ZodTypeAny>(
  schema: T,
  params: Record<string, string | string[] | undefined>
): z.infer<T> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  const result = schema.safeParse(normalized);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      result.error.issues
    );
  }
  return result.data;
}