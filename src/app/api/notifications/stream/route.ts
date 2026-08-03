import { NextRequest } from 'next/server';
import { getCurrentAuthSession } from '@/lib/session';
import { notificationBus } from '@/lib/notification-bus';
import { prisma } from '@/lib/db';
import { buildAccessContext } from '@/modules/access-control/services/access-context';
import { isAdmin } from '@/modules/access-control/services/permission-service';

export async function GET(req: NextRequest) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      // Send initial connection confirmation
      send('connected', { userId, timestamp: Date.now() });

      // Subscribe to user-specific events
      const unsubUser = notificationBus.subscribe(userId, (event, data) => {
        send(event, data);
      });

      // If admin, also subscribe to global events
      const accessCtx = await buildAccessContext(prisma, session.user.id);
      const adminCheck = isAdmin(accessCtx.permissionSet);
      let unsubGlobal: (() => void) | null = null;
      if (adminCheck) {
        unsubGlobal = notificationBus.subscribeAll((event, data) => {
          // Only forward events meant for admins or targeting this user
          if (event === 'moderation_needed' || event === 'admin_broadcast') {
            send(event, data);
          }
        });
      }

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        send('heartbeat', { timestamp: Date.now() });
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubUser();
        unsubGlobal?.();
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
