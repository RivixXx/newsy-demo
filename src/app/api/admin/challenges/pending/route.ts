import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { withErrorHandler, withValidation, successResponse, errorResponse } from '@/lib/api-response';
import { createAdminService } from '@/modules/admin/services/admin-service';
import { buildAccessContext } from '@/modules/access-control/services/access-context';
import { isAdmin } from '@/modules/access-control/services/permission-service';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function handleGet(_req: NextRequest, query: z.infer<typeof querySchema>) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return errorResponse('Необходима авторизация', 401);
  }

  const accessCtx = await buildAccessContext(prisma, session.user.id);
  if (!isAdmin(accessCtx.permissionSet)) {
    return errorResponse('Доступ запрещён', 403);
  }

  const adminService = createAdminService(prisma);
  const result = await adminService.getPendingChallenges(query.page, query.limit);
  return successResponse(result);
}

export const GET = withErrorHandler(withValidation(querySchema, handleGet));