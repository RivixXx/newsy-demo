import type { PrismaClient } from '@prisma/client';

import type { PermissionSet } from '@/lib/permissions';

export interface AccessContext {
  userId: string;
  permissionSet: PermissionSet;
  roleKeys: string[];
}

export async function buildAccessContext(prisma: PrismaClient, userId: string): Promise<AccessContext> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          key: true,
          permissions: {
            select: {
              permission: {
                select: {
                  key: true
                }
              }
            }
          }
        }
      }
    }
  });

  const roleKeys = userRoles.map((entry) => entry.role.key);
  const keys = new Set<string>();

  for (const entry of userRoles) {
    for (const permission of entry.role.permissions) {
      keys.add(permission.permission.key);
    }
  }

  return {
    userId,
    roleKeys,
    permissionSet: { keys }
  };
}

