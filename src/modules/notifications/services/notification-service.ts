import type { PrismaClient, NotificationType } from '@prisma/client';
import { notificationBus } from '@/lib/notification-bus';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  payload: unknown;
  createdAt: string;
}

export interface NotificationListResult {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export function createNotificationService(prisma: PrismaClient) {
  return {
    async list(userId: string, page = 1, limit = 20): Promise<NotificationListResult> {
      const where = { userId, deletedAt: null };
      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { ...where, readAt: null } }),
      ]);

      return {
        data: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          readAt: n.readAt?.toISOString() ?? null,
          payload: n.payload,
          createdAt: n.createdAt.toISOString(),
        })),
        total,
        unreadCount,
        hasMore: total > page * limit,
      };
    },

    async getUnreadCount(userId: string): Promise<number> {
      return prisma.notification.count({
        where: { userId, readAt: null, deletedAt: null },
      });
    },

    async markRead(userId: string, notificationId: string): Promise<void> {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { userId: true, readAt: true },
      });

      if (!notification) {
        throw new Error('Уведомление не найдено');
      }

      if (notification.userId !== userId) {
        throw new Error('Нет доступа');
      }

      if (notification.readAt) return;

      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });

      const count = await this.getUnreadCount(userId);
      notificationBus.emit(userId, 'unread_count', { count });
    },

    async markAllRead(userId: string): Promise<void> {
      await prisma.notification.updateMany({
        where: { userId, readAt: null, deletedAt: null },
        data: { readAt: new Date() },
      });

      notificationBus.emit(userId, 'unread_count', { count: 0 });
    },

    async deleteNotification(userId: string, notificationId: string): Promise<void> {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { userId: true },
      });

      if (!notification) {
        throw new Error('Уведомление не найдено');
      }

      if (notification.userId !== userId) {
        throw new Error('Нет доступа');
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { deletedAt: new Date() },
      });

      const count = await this.getUnreadCount(userId);
      notificationBus.emit(userId, 'unread_count', { count });
    },

    async sendToUser(
      userId: string,
      type: NotificationType,
      title: string,
      body: string,
      payload?: Record<string, unknown>
    ): Promise<void> {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          body,
          payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
        },
      });

      notificationBus.emit(userId, 'notification', {
        id: notification.id,
        type,
        title,
        body,
        payload,
        createdAt: notification.createdAt.toISOString(),
      });

      const count = await this.getUnreadCount(userId);
      notificationBus.emit(userId, 'unread_count', { count });
    },

    async sendToMultipleUsers(
      userIds: string[],
      type: NotificationType,
      title: string,
      body: string,
      payload?: Record<string, unknown>
    ): Promise<void> {
      if (userIds.length === 0) return;

      await prisma.notification.createMany({
        data: userIds.map(userId => ({
          userId,
          type,
          title,
          body,
          payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
        })),
      });

      for (const userId of userIds) {
        const count = await this.getUnreadCount(userId);
        notificationBus.emit(userId, 'notification', { type, title, body, payload });
        notificationBus.emit(userId, 'unread_count', { count });
      }
    },

    async sendToAdmins(
      type: NotificationType,
      title: string,
      body: string,
      payload?: Record<string, unknown>
    ): Promise<void> {
      const admins = await prisma.userRole.findMany({
        where: { role: { key: 'admin' } },
        select: { userId: true },
      });

      const adminIds = admins.map(a => a.userId);
      await this.sendToMultipleUsers(adminIds, type, title, body, payload);
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;