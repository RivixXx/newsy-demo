import type { PrismaClient } from '@prisma/client';

import type { AuthenticatedUser } from '@/lib/auth';

import { normalizeIdentifier } from './auth-service';

export interface UserRecord {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  firstName: string;
  lastName: string;
  status: string;
}

export interface UserService {
  findByIdentifier(identifier: string): Promise<UserRecord | null>;
  getAuthenticatedUser(userId: string): Promise<AuthenticatedUser | null>;
}

export function createUserService(prisma: PrismaClient): UserService {
  return {
    async findByIdentifier(identifier: string) {
      const normalized = normalizeIdentifier(identifier);

      return prisma.user.findFirst({
        where: {
          OR: [{ email: normalized }, { phone: normalized }]
        },
        select: {
          id: true,
          email: true,
          phone: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          status: true
        }
      });
    },

    async getAuthenticatedUser(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          roles: {
            select: {
              role: {
                select: {
                  key: true
                }
              }
            }
          },
          organizerMembership: {
            select: {
              organizerId: true
            }
          }
        }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        roles: user.roles.map((role) => role.role.key),
        organizationIds: user.organizerMembership.map((membership) => membership.organizerId)
      };
    }
  };
}

