import { describe, it, expect, vi } from 'vitest';
import { 
  successResponse, 
  errorResponse, 
  handleApiError, 
  withErrorHandler, 
  withValidation 
} from '@/lib/api-response';
import { ValidationError } from '@/lib/validation';
import { z } from 'zod';
import { NextResponse } from 'next/server';

describe('API Response utilities', () => {
  describe('successResponse', () => {
    it('should return success response with data', () => {
      const response = successResponse({ id: 1, name: 'Test' }, 201);
      expect(response.status).toBe(201);
      expect(response.json()).resolves.toEqual({ success: true, data: { id: 1, name: 'Test' } });
    });
  });

  describe('errorResponse', () => {
    it('should return error response', () => {
      const response = errorResponse('Something went wrong', 400, [{ path: 'field', message: 'Invalid' }]);
      expect(response.status).toBe(400);
      expect(response.json()).resolves.toEqual({ 
        success: false, 
        error: 'Something went wrong', 
        issues: [{ path: 'field', message: 'Invalid' }] 
      });
    });
  });

  describe('handleApiError', () => {
    it('should handle ValidationError', () => {
      const error = new ValidationError('Validation failed', [
        { code: 'custom', path: ['name'], message: 'Required' },
      ]);
      const response = handleApiError(error);
      expect(response.status).toBe(400);
      expect(response.json()).resolves.toEqual({
        success: false,
        error: 'Validation failed',
        issues: [{ path: 'name', message: 'Required' }],
      });
    });

    it('should handle ZodError', () => {
      const schema = z.object({ name: z.string().min(1) });
      const result = schema.safeParse({ name: '' });
      if (!result.success) {
        const response = handleApiError(result.error);
        expect(response.status).toBe(400);
      }
    });

    it('should handle not found errors', () => {
      const error = new Error('Челлендж не найден');
      const response = handleApiError(error);
      expect(response.status).toBe(404);
    });

    it('should handle authorization errors', () => {
      const error = new Error('Нет доступа');
      const response = handleApiError(error);
      expect(response.status).toBe(403);
    });

    it('should handle conflict errors', () => {
      const error = new Error('P2002: duplicate key');
      const response = handleApiError(error);
      expect(response.status).toBe(409);
    });

    it('should return 500 for unknown errors in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const error = new Error('Internal server error');
      const response = handleApiError(error);
      expect(response.status).toBe(500);
      expect(response.json()).resolves.toEqual({
        success: false,
        error: 'Внутренняя ошибка сервера',
      });
      vi.unstubAllEnvs();
    });

    it('should return error message in development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const error = new Error('Dev error details');
      const response = handleApiError(error);
      expect(response.status).toBe(500);
      expect(response.json()).resolves.toEqual({
        success: false,
        error: 'Dev error details',
      });
      vi.unstubAllEnvs();
    });
  });

  describe('withErrorHandler', () => {
    it('should catch errors and return formatted response', async () => {
      const handler = withErrorHandler(async () => {
        throw new Error('Челлендж не найден');
      });

      const mockRequest = {} as any;
      const response = await handler(mockRequest, { params: Promise.resolve({}) });
      expect(response.status).toBe(404);
    });

    it('should pass through successful responses', async () => {
      const handler = withErrorHandler(async () => {
        return NextResponse.json({ success: true, data: 'ok' });
      });

      const mockRequest = {} as any;
      const response = await handler(mockRequest, { params: Promise.resolve({}) });
      expect(response.status).toBe(200);
      expect(response.json()).resolves.toEqual({ success: true, data: 'ok' });
    });
  });

  describe('withValidation', () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    it('should validate request body and call handler', async () => {
      const handler = withValidation(schema, async (req, data) => {
        return NextResponse.json({ success: true, data });
      });

      const mockRequest = {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ name: 'Valid Name' }),
      } as any;

      const response = await handler(mockRequest, { params: Promise.resolve({}) });
      expect(response.status).toBe(200);
      expect(response.json()).resolves.toEqual({ success: true, data: { name: 'Valid Name' } });
    });

    it('should return 400 for invalid body', async () => {
      const handler = withValidation(schema, async (req, data) => {
        return NextResponse.json({ success: true, data });
      });

      const mockRequest = {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ name: '' }),
      } as any;

      const response = await handler(mockRequest, { params: Promise.resolve({}) });
      expect(response.status).toBe(400);
    });
  });
});