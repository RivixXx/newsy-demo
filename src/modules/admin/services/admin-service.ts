import type { PrismaClient } from '@prisma/client';
import { sendNotification } from '@/lib/notification-bus';

export interface AdminStats {
  users: { total: number; active: number; pending: number; suspended: number };
  challenges: { total: number; published: number; draft: number; ongoing: number; pendingReview: number; completed: number };
  payments: { total: number; succeeded: number; pending: number; failed: number; revenue: number };
  subscriptions: { active: number; canceled: number; trialing: number };
  organizations: { total: number; active: number; pending: number };
}

export interface AdminChallengeListItem {
  id: string;
  title: string;
  status: string;
  organizerName: string;
  createdAt: string;
  participantsCount: number;
  rejectionReason: string | null;
}

export interface AdminUserListItem {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  status: string;
  createdAt: string;
  isOrganizer: boolean;
  roles: string[];
}

export type ModerationAction = 'approve' | 'reject';

export interface ModerationResult {
  challengeId: string;
  status: string;
  message: string;
  rejectionReason?: string;
}

export function createAdminService(prisma: PrismaClient) {
  return {
    async getStats(): Promise<AdminStats> {
      const [
        usersTotal, usersActive, usersPending, usersSuspended,
        challengesTotal, challengesPublished, challengesDraft, challengesOngoing, challengesPendingReview, challengesCompleted,
        paymentsTotal, paymentsSucceeded, paymentsPending, paymentsFailed,
        subsActive, subsCanceled, subsTrialing,
        orgsTotal, orgsActive, orgsPending,
      ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.user.count({ where: { status: 'PENDING', deletedAt: null } }),
        prisma.user.count({ where: { status: 'SUSPENDED', deletedAt: null } }),
        prisma.challenge.count({ where: { deletedAt: null } }),
        prisma.challenge.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
        prisma.challenge.count({ where: { status: 'DRAFT', deletedAt: null } }),
        prisma.challenge.count({ where: { status: 'ONGOING', deletedAt: null } }),
        prisma.challenge.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }),
        prisma.challenge.count({ where: { status: 'COMPLETED', deletedAt: null } }),
        prisma.paymentTransaction.count(),
        prisma.paymentTransaction.count({ where: { status: 'SUCCEEDED' } }),
        prisma.paymentTransaction.count({ where: { status: 'PENDING' } }),
        prisma.paymentTransaction.count({ where: { status: 'FAILED' } }),
        prisma.userSubscription.count({ where: { status: 'ACTIVE' } }),
        prisma.userSubscription.count({ where: { status: 'CANCELED' } }),
        prisma.userSubscription.count({ where: { status: 'TRIALING' } }),
        prisma.organizer.count({ where: { deletedAt: null } }),
        prisma.organizer.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.organizer.count({ where: { status: 'PENDING', deletedAt: null } }),
      ]);

      let revenue = 0;
      try {
        const rev = await prisma.paymentTransaction.aggregate({
          where: { status: 'SUCCEEDED' },
          _sum: { amount: true },
        });
        revenue = rev._sum.amount || 0;
      } catch { /* amount column may not exist */ }

      return {
        users: { total: usersTotal, active: usersActive, pending: usersPending, suspended: usersSuspended },
        challenges: { total: challengesTotal, published: challengesPublished, draft: challengesDraft, ongoing: challengesOngoing, pendingReview: challengesPendingReview, completed: challengesCompleted },
        payments: { total: paymentsTotal, succeeded: paymentsSucceeded, pending: paymentsPending, failed: paymentsFailed, revenue },
        subscriptions: { active: subsActive, canceled: subsCanceled, trialing: subsTrialing },
        organizations: { total: orgsTotal, active: orgsActive, pending: orgsPending },
      };
    },

    async getPendingChallenges(page = 1, limit = 20): Promise<{ data: AdminChallengeListItem[]; total: number; totalPages: number }> {
      const where = { status: 'PENDING_REVIEW' as const, deletedAt: null };
      const [challenges, total] = await Promise.all([
        prisma.challenge.findMany({
          where,
          include: {
            organizer: { select: { name: true } },
            _count: { select: { participations: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.challenge.count({ where }),
      ]);

      return {
        data: challenges.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          organizerName: c.organizer?.name ?? 'Неизвестный организатор',
          createdAt: c.createdAt.toISOString(),
          participantsCount: c._count.participations,
          rejectionReason: c.rejectionReason,
        })),
        total,
        totalPages: Math.ceil(total / limit),
      };
    },

    async reviewChallenge(
      challengeId: string,
      action: ModerationAction,
      reason?: string
    ): Promise<ModerationResult> {
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select: {
          id: true,
          title: true,
          status: true,
          rejectionReason: true,
          organizer: {
            select: {
              members: { select: { userId: true } },
            },
          },
        },
      });

      if (!challenge) {
        throw new Error('Челлендж не найден');
      }

      const memberIds = challenge.organizer?.members?.map(m => m.userId) || [];

      if (action === 'approve') {
        if (challenge.status !== 'PENDING_REVIEW') {
          throw new Error('Челлендж не на модерации');
        }
        await prisma.challenge.update({
          where: { id: challengeId },
          data: { status: 'PUBLISHED', rejectionReason: null },
        });

        for (const userId of memberIds) {
          await sendNotification(userId, 'CHALLENGE_UPDATED', 'Челлендж одобрен', `«${challenge.title}» опубликован и доступен в каталоге.`, { challengeId });
        }

        return { challengeId, status: 'PUBLISHED', message: 'Челлендж одобрен и опубликован' };
      }

      if (action === 'reject') {
        if (challenge.status !== 'PENDING_REVIEW') {
          throw new Error('Челлендж не на модерации');
        }
        const rejectionMessage = (reason && reason.trim()) || 'Челлендж не соответствует требованиям платформы. Пожалуйста, проверьте описание, этапы и категорию, затем повторите попытку.';
        await prisma.challenge.update({
          where: { id: challengeId },
          data: { status: 'DRAFT', rejectionReason: rejectionMessage },
        });

        for (const userId of memberIds) {
          await sendNotification(userId, 'CHALLENGE_UPDATED', 'Челлендж отклонён', `«${challenge.title}» возвращён на доработку. Причина: ${rejectionMessage}`, { challengeId, reason: rejectionMessage });
        }

        return { challengeId, status: 'DRAFT', message: 'Челлендж возвращён на доработку', rejectionReason: rejectionMessage };
      }

      throw new Error('Неизвестное действие модерации');
    },

    async getUsers(page = 1, limit = 20, search?: string, statusFilter?: string): Promise<{ data: AdminUserListItem[]; total: number; totalPages: number }> {
      const where: Record<string, unknown> = { deletedAt: null };
      if (statusFilter && statusFilter !== 'all') {
        where.status = statusFilter;
      }
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true, email: true, phone: true, firstName: true, lastName: true, status: true, createdAt: true,
            organizerMembership: { select: { id: true }, where: { deletedAt: null } },
            roles: { select: { role: { select: { key: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data: users.map(u => ({
          id: u.id,
          email: u.email,
          phone: u.phone,
          name: `${u.firstName} ${u.lastName}`.trim() || 'Без имени',
          status: u.status,
          createdAt: u.createdAt.toISOString(),
          isOrganizer: u.organizerMembership.length > 0,
          roles: u.roles.map(r => r.role.key),
        })),
        total,
        totalPages: Math.ceil(total / limit),
      };
    },

    async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING', adminId: string): Promise<void> {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, firstName: true, lastName: true } });
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      await prisma.user.update({
        where: { id: userId },
        data: { status },
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          actorUserId: adminId,
          action: `USER_STATUS_${status}`,
          entityType: 'User',
          entityId: userId,
          metadata: { email: user.email, name: `${user.firstName} ${user.lastName}`.trim() },
        },
      }).catch(() => { /* auditLog table may not exist */ });

      if (status === 'SUSPENDED') {
        await sendNotification(userId, 'SYSTEM', 'Аккаунт заблокирован', 'Ваш аккаунт был заблокирован администратором. Обратитесь в поддержку для уточнения причин.');
      } else if (status === 'ACTIVE') {
        await sendNotification(userId, 'SYSTEM', 'Аккаунт восстановлен', 'Ваш аккаунт снова активен. Добро пожаловать!');
      }
    },

    async getOrganizers(page = 1, limit = 20): Promise<{ data: unknown[]; total: number; totalPages: number }> {
      const where = { deletedAt: null };
      const [organizers, total] = await Promise.all([
        prisma.organizer.findMany({
          where,
          include: {
            _count: { select: { challenges: true, members: true } },
            members: { select: { userId: true, roleInOrganizer: true, status: true }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.organizer.count({ where }),
      ]);

      return {
        data: organizers.map(o => ({
          id: o.id,
          name: o.name,
          type: o.type,
          status: o.status,
          isVerified: o.isVerified,
          challengesCount: o._count.challenges,
          membersCount: o._count.members,
          createdAt: o.createdAt.toISOString(),
        })),
        total,
        totalPages: Math.ceil(total / limit),
      };
    },

    async verifyOrganizer(organizerId: string, adminId: string): Promise<void> {
      const org = await prisma.organizer.findUnique({ where: { id: organizerId } });
      if (!org) {
        throw new Error('Организация не найдена');
      }

      await prisma.organizer.update({
        where: { id: organizerId },
        data: { isVerified: true, status: 'ACTIVE' },
      });

      // Notify all members
      const members = await prisma.organizerMember.findMany({
        where: { organizerId, status: 'ACTIVE', deletedAt: null },
        select: { userId: true },
      });

      for (const member of members) {
        await sendNotification(member.userId, 'SYSTEM', 'Организация верифицирована', `«${org.name}» получила статус верифицированной организации.`, { organizerId });
      }

      await prisma.auditLog.create({
        data: {
          actorUserId: adminId,
          action: 'ORGANIZER_VERIFIED',
          entityType: 'Organizer',
          entityId: organizerId,
          metadata: { name: org.name },
        },
      }).catch(() => { /* auditLog table may not exist */ });
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;