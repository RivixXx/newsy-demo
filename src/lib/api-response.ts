import { NextResponse } from 'next/server';

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json(
    { error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : message },
    { status: 500 }
  );
}
