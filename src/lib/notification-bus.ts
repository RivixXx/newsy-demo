// In-memory event bus for real-time notifications via SSE
// Works in single-server deployment. For multi-server: use Redis Pub/Sub.

type Listener = (event: string, data: unknown) => void;

class NotificationBus {
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();

  // Subscribe to events for a specific user
  subscribe(userId: string, listener: Listener): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(listener);

    return () => {
      this.listeners.get(userId)?.delete(listener);
      if (this.listeners.get(userId)?.size === 0) {
        this.listeners.delete(userId);
      }
    };
  }

  // Subscribe to all events (for admin dashboard)
  subscribeAll(listener: Listener): () => void {
    this.globalListeners.add(listener);
    return () => { this.globalListeners.delete(listener); };
  }

  // Emit event to specific user
  emit(userId: string, event: string, data: unknown) {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      for (const listener of userListeners) {
        try { listener(event, data); } catch {}
      }
    }
    // Also notify global listeners (admins)
    for (const listener of this.globalListeners) {
      try { listener(event, { ...data as object, targetUserId: userId }); } catch {}
    }
  }

  // Emit event to all connected clients
  broadcast(event: string, data: unknown) {
    for (const listener of this.globalListeners) {
      try { listener(event, data); } catch {}
    }
    for (const [, userListeners] of this.listeners) {
      for (const listener of userListeners) {
        try { listener(event, data); } catch {}
      }
    }
  }

  getConnectedCount(): number {
    return this.globalListeners.size + this.listeners.size;
  }
}

// Singleton
const globalForBus = globalThis as unknown as { __notificationBus?: NotificationBus };
export const notificationBus = globalForBus.__notificationBus || new NotificationBus();
if (process.env.NODE_ENV !== 'production') {
  globalForBus.__notificationBus = notificationBus;
}

// Helper: send notification to user + store in DB
export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  payload?: Record<string, unknown>
) {
  // Store in DB
  try {
    const { prisma } = await import('@/lib/db');
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        body,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
      },
    });

    // Push via SSE
    notificationBus.emit(userId, 'notification', {
      id: notification.id,
      type,
      title,
      body,
      payload,
      createdAt: notification.createdAt.toISOString(),
    });

    // Also push unread count update
    const count = await prisma.notification.count({
      where: { userId, readAt: null, deletedAt: null },
    });
    notificationBus.emit(userId, 'unread_count', { count });
  } catch (err) {
    console.error('[sendNotification]', err);
  }
}

// Helper: notify admins about new challenge for moderation
export async function notifyAdminsNewChallenge(challengeId: string, title: string, organizerName: string) {
  try {
    const { prisma } = await import('@/lib/db');
    const admins = await prisma.userRole.findMany({
      where: { role: { key: 'admin' } },
      select: { userId: true },
    });

    for (const admin of admins) {
      notificationBus.emit(admin.userId, 'moderation_needed', {
        challengeId,
        title,
        organizerName,
      });
      // Push unread count
      const count = await prisma.notification.count({
        where: { userId: admin.userId, readAt: null, deletedAt: null },
      });
      notificationBus.emit(admin.userId, 'unread_count', { count });
    }
  } catch (err) {
    console.error('[notifyAdminsNewChallenge]', err);
  }
}
