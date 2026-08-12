import { NextRequest } from 'next/server';
import { getCurrentAuthSession } from './session';
import { prisma } from './db';
import { OrganizerMemberRole, OrganizerMemberStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roles: string[];
  organizationIds: string[];
}

export interface AuthContext {
  user: AuthenticatedUser;
  session: Awaited<ReturnType<typeof getCurrentAuthSession>>;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      status: true,
      roles: { select: { role: { select: { key: true } } } },
      organizerMembership: {
        where: { status: 'ACTIVE', deletedAt: null },
        select: { organizerId: true },
      },
    },
  });

  if (!user || user.status !== 'ACTIVE') return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(r => r.role.key),
      organizationIds: user.organizerMembership.map(m => m.organizerId),
    },
    session,
  };
}

export function requireAuth(context: AuthContext | null): AuthContext {
  if (!context) {
    throw new AuthError('Необходима авторизация', 401);
  }
  return context;
}

export function requireRole(context: AuthContext, ...roles: string[]): AuthContext {
  if (!context.user.roles.some(r => roles.includes(r))) {
    throw new AuthError('Недостаточно прав доступа', 403);
  }
  return context;
}

export async function requireOrganizerAccess(
  context: AuthContext,
  organizerId: string,
  requiredRoles: OrganizerMemberRole[] = ['OWNER', 'ADMIN']
): Promise<{ membership: { roleInOrganizer: OrganizerMemberRole } }> {
  const membership = await prisma.organizerMember.findUnique({
    where: { organizerId_userId: { organizerId, userId: context.user.id } },
    select: { roleInOrganizer: true, status: true, deletedAt: true },
  });

  if (!membership || membership.deletedAt || membership.status !== OrganizerMemberStatus.ACTIVE) {
    throw new AuthError('Вы не являетесь активным участником этой организации', 403);
  }

  if (!requiredRoles.includes(membership.roleInOrganizer)) {
    throw new AuthError(`Требуется роль: ${requiredRoles.join(' или ')}`, 403);
  }

  return { membership };
}

export async function requireChallengeOrganizerAccess(
  context: AuthContext,
  challengeId: string,
  requiredRoles: OrganizerMemberRole[] = ['OWNER', 'ADMIN']
) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { organizerId: true },
  });

  if (!challenge) {
    throw new AuthError('Челлендж не найден', 404);
  }

  return requireOrganizerAccess(context, challenge.organizerId, requiredRoles);
}

export class AuthError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export function handleAuthError(error: unknown): Response | null {
  if (error instanceof AuthError) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

export function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<Response>,
  options?: { requiredRoles?: string[] }
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const context = await getAuthContext();
      const authContext = requireAuth(context);
      
      if (options?.requiredRoles?.length) {
        requireRole(authContext, ...options.requiredRoles);
      }
      
      return handler(request, authContext);
    } catch (error) {
      const authResponse = handleAuthError(error);
      if (authResponse) return authResponse;
      throw error;
    }
  };
}

export function withOrganizerAuth(
  handler: (request: NextRequest, context: AuthContext, organizerId: string) => Promise<Response>,
  options?: { requiredRoles?: OrganizerMemberRole[]; paramName?: string }
) {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }): Promise<Response> => {
    try {
      const authContext = await getAuthContext();
      const userContext = requireAuth(authContext);
      
      const params = await context.params;
      const organizerId = params[options?.paramName || 'organizerId'];
      
      if (!organizerId) {
        return new Response(JSON.stringify({ success: false, error: 'Organizer ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      await requireOrganizerAccess(userContext, organizerId, options?.requiredRoles || ['OWNER', 'ADMIN']);
      
      return handler(request, userContext, organizerId);
    } catch (error) {
      const authResponse = handleAuthError(error);
      if (authResponse) return authResponse;
      throw error;
    }
  };
}

export function withChallengeAuth(
  handler: (request: NextRequest, context: AuthContext, challengeId: string) => Promise<Response>,
  options?: { requiredRoles?: OrganizerMemberRole[] }
) {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }): Promise<Response> => {
    try {
      const authContext = await getAuthContext();
      const userContext = requireAuth(authContext);
      
      const params = await context.params;
      const challengeId = params.challengeId || params.id;
      
      if (!challengeId) {
        return new Response(JSON.stringify({ success: false, error: 'Challenge ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      await requireChallengeOrganizerAccess(userContext, challengeId, options?.requiredRoles || ['OWNER', 'ADMIN']);
      
      return handler(request, userContext, challengeId);
    } catch (error) {
      const authResponse = handleAuthError(error);
      if (authResponse) return authResponse;
      throw error;
    }
  };
}