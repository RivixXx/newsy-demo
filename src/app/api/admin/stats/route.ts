import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api-response';
import { createAdminService } from '@/modules/admin/services/admin-service';
import { buildAccessContext } from '@/modules/access-control/services/access-context';
import { isAdmin } from '@/modules/access-control/services/permission-service';

async function handleGet() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return errorResponse('Необходима авторизация', 401);
  }

  const accessCtx = await buildAccessContext(prisma, session.user.id);
  if (!isAdmin(accessCtx.permissionSet)) {
    return errorResponse('Доступ запрещён', 403);
  }

  const adminService = createAdminService(prisma);
  const stats = await adminService.getStats();
  return successResponse(stats);
}

export const GET = withErrorHandler(handleGet);