import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ValidationError } from './validation';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: readonly { path: string; message: string }[];
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500, issues?: readonly { path: string; message: string }[]): NextResponse {
  return NextResponse.json(
    { success: false, error: message, issues },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400, error.issues.map(i => ({ path: i.path.join('.'), message: i.message })));
  }

  if (error instanceof ZodError) {
    return errorResponse(
      'Ошибка валидации',
      400,
      error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
    );
  }

  if (error instanceof Error) {
    if (error.message.includes('Неверный ID') || error.message.includes('не найден')) {
      return errorResponse(error.message, 404);
    }
    if (error.message.includes('Нет доступа') || error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return errorResponse(error.message, 403);
    }
    if (error.message.includes('уже существует') || error.message.includes('duplicate') || error.message.includes('P2002')) {
      return errorResponse(error.message, 409);
    }
  }

  const isProd = process.env.NODE_ENV === 'production';
  return errorResponse(
    isProd ? 'Внутренняя ошибка сервера' : error instanceof Error ? error.message : 'Неизвестная ошибка',
    500
  );
}

export function withErrorHandler<
  TContext extends { params?: Promise<Record<string, string>> } = { params?: Promise<Record<string, string>> }
>(
  handler: (request: NextRequest, context: TContext) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: TContext): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function withValidation<T>(
  schema: import('zod').ZodSchema<T>,
  handler: (request: NextRequest, data: T, context: { params?: Promise<Record<string, string>> }) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: NextRequest, context: { params?: Promise<Record<string, string>> }) => {
    let data: unknown;
    
    if (request.method === 'GET') {
      const url = new URL(request.url);
      data = Object.fromEntries(url.searchParams.entries());
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
      throw new ValidationError(
        result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
        result.error.issues
      );
    }

    return handler(request, result.data, context);
  });
}

export function withParamsValidation<T>(
  schema: import('zod').ZodSchema<T>,
  handler: (request: NextRequest, params: T, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const params = await context.params;
    const result = schema.safeParse(params);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
        result.error.issues
      );
    }
    return handler(request, result.data, context);
  });
}