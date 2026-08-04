import { NextResponse } from 'next/server';

export function success<T>(data: T | null, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized(message = 'Необходима авторизация'): NextResponse {
  return error(message, 401);
}

export function forbidden(message = 'Доступ запрещен'): NextResponse {
  return error(message, 403);
}

export function conflict(message: string): NextResponse {
  return error(message, 409);
}

export function tooManyRequests(message = 'Слишком много запросов. Подождите.'): NextResponse {
  return error(message, 429);
}

export function serverError(context?: string): NextResponse {
  const message = process.env.NODE_ENV === 'production'
    ? 'Внутренняя ошибка сервера'
    : (context || 'Внутренняя ошибка сервера');
  return error(message, 500);
}

export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);
  return serverError();
}
