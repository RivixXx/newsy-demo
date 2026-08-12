import { describe, it, expect, vi } from 'vitest';
import { createValidator, ValidationError, commonSchemas, validateParams } from '@/lib/validation';
import { z } from 'zod';

describe('Validation utilities', () => {
  describe('createValidator', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().int().min(0),
    });

    it('should validate valid data', async () => {
      const validator = createValidator(schema);
      
      const mockRequest = {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ name: 'John', age: 30 }),
      } as any;

      const result = await validator(mockRequest);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should throw ValidationError for invalid data', async () => {
      const validator = createValidator(schema);
      
      const mockRequest = {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ name: '', age: -1 }),
      } as any;

      await expect(validator(mockRequest)).rejects.toThrow(ValidationError);
    });

    it('should parse query params for GET', async () => {
      const validator = createValidator(z.object({
        page: z.coerce.number().int().min(1).default(1),
      }));
      
      const mockRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api?page=2',
        headers: new Headers(),
      } as any;

      const result = await validator(mockRequest);
      expect(result.page).toBe(2);
    });
  });

  describe('validateParams', () => {
    const schema = z.object({
      id: z.string().uuid(),
      slug: z.string().optional(),
    });

    it('should validate valid params', () => {
      const result = validateParams(schema, { id: '123e4567-e89b-12d3-a456-426614174000', slug: 'test' });
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.slug).toBe('test');
    });

    it('should throw ValidationError for invalid uuid', () => {
      expect(() => validateParams(schema, { id: 'invalid' })).toThrow(ValidationError);
    });

    it('should handle array values', () => {
      const result = validateParams(schema, { id: ['123e4567-e89b-12d3-a456-426614174000'] });
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('commonSchemas', () => {
    it('should validate pagination', () => {
      const result = commonSchemas.pagination.safeParse({ page: '2', limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should validate uuid', () => {
      const result = commonSchemas.uuid.safeParse('123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid uuid', () => {
      const result = commonSchemas.uuid.safeParse('not-a-uuid');
      expect(result.success).toBe(false);
    });

    it('should validate challenge query', () => {
      const result = commonSchemas.challengeQuery.safeParse({
        page: '1',
        limit: '20',
        category: 'sport',
        format: 'ONLINE',
        sort: 'popular',
      });
      expect(result.success).toBe(true);
    });
  });
});