import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { commonSchemas } from './validation';

export const registry = new OpenAPIRegistry();

// Security scheme
const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Bearer token авторизация через NextAuth session',
});

// Common schemas
const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  issues: z.array(z.object({
    path: z.string(),
    message: z.string(),
  })).optional(),
});

const SuccessResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data,
  });

const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int(),
  totalPages: z.number().int(),
});

// Challenge schema
const ChallengeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  organizer: z.string(),
  category: z.string().nullable(),
  imageUrl: z.string().nullable(),
  participantsCount: z.number().int(),
  isCooperative: z.boolean(),
  badges: z.array(z.string()),
  location: z.string(),
  region: z.string().nullable(),
  endDate: z.string().nullable(),
  startDate: z.string().nullable(),
  startTime: z.string().nullable(),
  description: z.string(),
  entryFee: z.number(),
  maxParticipants: z.number().int().nullable(),
});

registry.register('Challenge', ChallengeSchema);
registry.register('ErrorResponse', ErrorResponseSchema);
registry.register('Pagination', PaginationSchema);

// Register paths
registry.registerPath({
  method: 'get',
  path: '/api/challenges',
  tags: ['Challenges'],
  summary: 'Список челленджей с пагинацией и фильтрами',
  request: {
    query: commonSchemas.challengeQuery,
  },
  responses: {
    '200': {
      description: 'Список челленджей',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            data: z.array(ChallengeSchema),
            pagination: PaginationSchema,
          })),
        },
      },
    },
    '400': {
      description: 'Ошибка валидации',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/challenges/{id}',
  tags: ['Challenges'],
  summary: 'Детальная информация о челлендже',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    '200': {
      description: 'Детали челленджа',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            id: z.string().uuid(),
            title: z.string(),
            organizer: z.string(),
            category: z.string(),
            participantsCount: z.number().int(),
            isJoined: z.boolean(),
            stages: z.array(z.object({
              id: z.string().uuid(),
              title: z.string(),
              description: z.string(),
              type: z.string(),
              status: z.enum(['pending', 'active', 'completed']),
              rewardPoints: z.number().int(),
            })),
          })),
        },
      },
    },
    '404': {
      description: 'Челлендж не найден',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/payments/create',
  tags: ['Payments'],
  summary: 'Создание платежа за публикацию челленджа',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            challengeId: z.string().uuid(),
          }),
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'URL для оплаты',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            checkoutUrl: z.string(),
            isExisting: z.boolean().optional(),
          })),
        },
      },
    },
    '401': {
      description: 'Необходима авторизация',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
    '403': {
      description: 'Нет доступа',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
    '404': {
      description: 'Челлендж не найден',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/notifications/list',
  tags: ['Notifications'],
  summary: 'Список уведомлений пользователя',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
    }),
  },
  responses: {
    '200': {
      description: 'Список уведомлений',
      content: {
        'application/json': {
          schema: z.object({
            notifications: z.array(z.object({
              id: z.string().uuid(),
              type: z.string(),
              title: z.string(),
              body: z.string(),
              readAt: z.string().nullable(),
              createdAt: z.string(),
            })),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/notifications/unread-count',
  tags: ['Notifications'],
  summary: 'Количество непрочитанных уведомлений',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    '200': {
      description: 'Количество непрочитанных',
      content: {
        'application/json': {
          schema: z.object({ count: z.number().int() }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/notifications/mark-read',
  tags: ['Notifications'],
  summary: 'Отметить уведомление как прочитанное',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            notificationId: z.string().uuid(),
          }),
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Успешно отмечено',
      content: {
        'application/json': { schema: SuccessResponseSchema(z.null()) },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/stats',
  tags: ['Admin'],
  summary: 'Статистика для админ-панели',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    '200': {
      description: 'Статистика',
      content: {
        'application/json': {
          schema: z.object({
            users: z.object({
              total: z.number().int(),
              active: z.number().int(),
              pending: z.number().int(),
              suspended: z.number().int(),
            }),
            challenges: z.object({
              total: z.number().int(),
              published: z.number().int(),
              draft: z.number().int(),
              ongoing: z.number().int(),
              pendingReview: z.number().int(),
              completed: z.number().int(),
            }),
            payments: z.object({
              total: z.number().int(),
              succeeded: z.number().int(),
              pending: z.number().int(),
              failed: z.number().int(),
              revenue: z.number(),
            }),
          }),
        },
      },
    },
    '403': {
      description: 'Доступ запрещён',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/challenges/pending',
  tags: ['Admin'],
  summary: 'Челленджи на модерации',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    '200': {
      description: 'Список челленджей на модерации',
      content: {
        'application/json': {
          schema: z.object({
            challenges: z.array(z.object({
              id: z.string().uuid(),
              title: z.string(),
              status: z.string(),
              organizerName: z.string(),
              createdAt: z.string(),
              participantsCount: z.number().int(),
            })),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/challenges/{id}/review',
  tags: ['Admin'],
  summary: 'Модерация челленджа (одобрить/отклонить)',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            action: z.enum(['approve', 'reject']),
            reason: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Результат модерации',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            challengeId: z.string().uuid(),
            status: z.string(),
            message: z.string(),
            rejectionReason: z.string().optional(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/challenges',
  tags: ['Public API v1'],
  summary: 'Публичное API для интеграций — список челленджей',
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      category: z.string().optional(),
      format: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
      q: z.string().optional(),
    }),
  },
  responses: {
    '200': {
      description: 'Список челленджей',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(z.object({
              id: z.string().uuid(),
              title: z.string(),
              description: z.string().nullable(),
              category: z.string().nullable(),
              format: z.string(),
              organizer: z.object({
                id: z.string().uuid(),
                name: z.string(),
              }),
              participantsCount: z.number().int(),
              maxParticipants: z.number().int().nullable(),
              startDate: z.string().nullable(),
              endDate: z.string().nullable(),
              entryFee: z.number(),
            })),
            pagination: z.object({
              page: z.number().int(),
              limit: z.number().int(),
              total: z.number().int(),
              pages: z.number().int(),
            }),
          }),
        },
      },
    },
  },
});

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'ЧИ API',
      version: '1.0.0',
      description: 'API для платформы челленджей «Челлендж Индустрия»',
    },
    servers: [
      { url: 'https://chillenge-russia.ru', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Development' },
    ],
  });
}